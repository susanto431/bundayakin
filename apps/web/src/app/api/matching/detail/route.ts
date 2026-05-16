// GET /api/matching/detail?nannyProfileId=...
// Ambil MatchResult lengkap untuk pasangan parent (session) + nanny tertentu.

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
            phone: true,
            bio: true,
          },
        },
      },
    })

    if (!matchResult) {
      return NextResponse.json({ success: false, error: "Hasil matching tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: matchResult })
  } catch (error) {
    console.error("[MATCHING_DETAIL]", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
