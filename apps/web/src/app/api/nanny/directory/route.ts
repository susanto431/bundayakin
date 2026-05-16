export const dynamic = "force-dynamic"

// GET /api/nanny/directory
// Query params: ?kota=&tipe=&page=1&limit=12
// Auth: parent yang login
// Mengembalikan daftar nanny openToJob dengan skor kecocokan jika sudah dihitung.

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { type NannyType, type Prisma } from "@prisma/client"

export type NannyDirectoryItem = {
  id: string
  userId: string
  nama: string
  usia: number | null
  kotaDomisili: string | null
  pendidikan: string | null
  pengalamanTahun: number
  tipeKerja: string[]
  fotoUrl: string | null
  skorKeseluruhan: number | null
  skorDomainA: number | null
  skorDomainB: number | null
  skorDomainC: number | null
  adaDealbreaker: boolean
  kontakTerbuka: boolean
  matchResultId: string | null
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "PARENT") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const parentProfile = await prisma.parentProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!parentProfile) {
      return NextResponse.json({ success: false, error: "Profil orang tua tidak ditemukan" }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const kota = searchParams.get("kota") || ""
    const tipe = searchParams.get("tipe") || ""
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
    const limit = Math.min(24, Math.max(1, parseInt(searchParams.get("limit") ?? "12")))
    const skip = (page - 1) * limit

    const where: Prisma.NannyProfileWhereInput = {
      openToJob: true,
      isAvailable: true,
      ...(kota ? { city: { contains: kota, mode: "insensitive" } } : {}),
      ...(tipe ? { nannyType: { has: tipe as NannyType } } : {}),
    }

    const [total, nannies] = await Promise.all([
      prisma.nannyProfile.count({ where }),
      prisma.nannyProfile.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          userId: true,
          fullName: true,
          dateOfBirth: true,
          city: true,
          educationLevel: true,
          yearsOfExperience: true,
          nannyType: true,
          profilePhotoUrl: true,
        },
        orderBy: { fullName: "asc" },
      }),
    ])

    // Fetch MatchResults separately to avoid Prisma select/include conflict
    const nannyIds = nannies.map(n => n.id)
    const matchResults = await prisma.matchResult.findMany({
      where: {
        parentProfileId: parentProfile.id,
        nannyProfileId: { in: nannyIds },
      },
      select: {
        id: true,
        nannyProfileId: true,
        skorKeseluruhan: true,
        skorDomainA: true,
        skorDomainB: true,
        skorDomainC: true,
        adaDealbreaker: true,
        kontakTerbuka: true,
      },
    })
    const matchByNannyId = Object.fromEntries(matchResults.map(m => [m.nannyProfileId, m]))

    const items: NannyDirectoryItem[] = nannies.map(n => {
      const match = matchByNannyId[n.id] ?? null
      const usia = n.dateOfBirth
        ? Math.floor((Date.now() - new Date(n.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null

      return {
        id: n.id,
        userId: n.userId,
        nama: n.fullName,
        usia,
        kotaDomisili: n.city,
        pendidikan: n.educationLevel,
        pengalamanTahun: n.yearsOfExperience ?? 0,
        tipeKerja: n.nannyType as string[],
        fotoUrl: n.profilePhotoUrl,
        skorKeseluruhan: match?.skorKeseluruhan ?? null,
        skorDomainA: match?.skorDomainA ?? null,
        skorDomainB: match?.skorDomainB ?? null,
        skorDomainC: match?.skorDomainC ?? null,
        adaDealbreaker: match?.adaDealbreaker ?? false,
        kontakTerbuka: match?.kontakTerbuka ?? false,
        matchResultId: match?.id ?? null,
      }
    })

    // Sort: ada skor dulu (desc), belum ada skor belakangan
    items.sort((a, b) => {
      if (a.skorKeseluruhan !== null && b.skorKeseluruhan !== null) {
        return b.skorKeseluruhan - a.skorKeseluruhan
      }
      if (a.skorKeseluruhan !== null) return -1
      if (b.skorKeseluruhan !== null) return 1
      return 0
    })

    return NextResponse.json({
      success: true,
      data: {
        nannies: items,
        total,
        page,
        hasMore: skip + items.length < total,
      },
    })
  } catch (error) {
    console.error("[NANNY_DIRECTORY]", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
