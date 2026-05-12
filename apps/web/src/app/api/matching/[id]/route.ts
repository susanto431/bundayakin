import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET /api/matching/[id]
// Returns matching request + result for authorized parent or nanny.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const matchingRequest = await prisma.matchingRequest.findUnique({
      where: { id: params.id },
      include: {
        matchingResult: {
          select: {
            scoreOverall: true,
            scoreDomainA: true,
            scoreDomainB: true,
            scoreDomainC: true,
            aspectBreakdown: true,
            matchHighlights: true,
            mismatchAreas: true,
            negotiationPoints: true,
            tipsForParent: true,
            tipsForNanny: true,
            generatedAt: true,
          },
        },
        parentProfile: { select: { userId: true } },
        nannyProfile: { select: { userId: true, fullName: true, profilePhotoUrl: true } },
      },
    })

    if (!matchingRequest) {
      return NextResponse.json({ success: false, error: "Matching tidak ditemukan" }, { status: 404 })
    }

    // Only allow the parent or nanny involved to view
    const isParty =
      matchingRequest.parentProfile.userId === session.user.id ||
      matchingRequest.nannyProfile?.userId === session.user.id
    if (!isParty) {
      return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 })
    }

    return NextResponse.json({ success: true, data: matchingRequest })
  } catch (error) {
    console.error("[MATCHING_GET]", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
