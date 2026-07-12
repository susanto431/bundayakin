export const dynamic = "force-dynamic"

// GET /api/matching/detail?nannyProfileId=...
// Ambil MatchResult lengkap untuk pasangan parent (session) + nanny tertentu.

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getPsikotesInfo } from "@/lib/psikotes"
import { getKomparasiPreferensi } from "@/lib/preference-comparison"
import { isMatchResultStale } from "@/lib/matching-cache"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "PARENT") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const nannyProfileId = searchParams.get("nannyProfileId")
    if (!nannyProfileId) {
      return NextResponse.json({ success: false, error: "nannyProfileId diperlukan" }, { status: 400 })
    }

    const parentProfile = await prisma.parentProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!parentProfile) {
      return NextResponse.json({ success: false, error: "Profil orang tua tidak ditemukan" }, { status: 404 })
    }

    const matchResult = await prisma.matchResult.findUnique({
      where: { parentProfileId_nannyProfileId: { parentProfileId: parentProfile.id, nannyProfileId } },
      include: {
        nannyProfile: {
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
            user: { select: { phone: true } },
            bio: true,
          },
        },
      },
    })

    if (!matchResult) {
      return NextResponse.json({ success: false, error: "Hasil matching tidak ditemukan" }, { status: 404 })
    }

    const [psikotes, komparasiPreferensi] = await Promise.all([
      getPsikotesInfo(nannyProfileId, parentProfile.id, matchResult.psikotesUnlocked),
      getKomparasiPreferensi(parentProfile.id, nannyProfileId),
    ])

    // Nomor telepon hanya boleh sampai ke client kalau kontak sudah dibuka (kuota/pembayaran) —
    // jangan bocorkan lewat payload walau UI menyembunyikannya di balik gate.
    const { user, ...nannyRest } = matchResult.nannyProfile
    const phone = matchResult.kontakTerbuka ? user?.phone ?? null : null

    return NextResponse.json({
      success: true,
      data: {
        ...matchResult,
        nannyProfile: { ...nannyRest, phone },
        psikotes,
        komparasiPreferensi,
        isStale: isMatchResultStale(matchResult.generatedAt),
      },
    })
  } catch (error) {
    console.error("[MATCHING_DETAIL]", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
