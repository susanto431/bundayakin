export const dynamic = "force-dynamic"

// GET /api/matching/results
// Ambil semua MatchResult untuk parent yang sedang login, termasuk data nanny dasar.

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
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
      return NextResponse.json({ success: true, data: [] })
    }

    const results = await prisma.matchResult.findMany({
      where: { parentProfileId: parentProfile.id },
      include: {
        nannyProfile: {
          select: {
            id: true,
            fullName: true,
            city: true,
            educationLevel: true,
            yearsOfExperience: true,
            nannyType: true,
            profilePhotoUrl: true,
            dateOfBirth: true,
          },
        },
      },
      orderBy: { skorKeseluruhan: "desc" },
    })

    return NextResponse.json({ success: true, data: results })
  } catch (error) {
    console.error("[MATCHING_RESULTS]", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
