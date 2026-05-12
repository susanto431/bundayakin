import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generatePdfReport } from "@/lib/pdf"
import { NextResponse } from "next/server"

// GET /api/report/[id]/pdf
// id = matchingRequestId
// Returns PDF binary for the requesting parent or nanny.
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const matchingRequest = await prisma.matchingRequest.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        parentProfile: { select: { userId: true, fullName: true } },
        nannyProfile: {
          select: {
            userId: true,
            fullName: true,
            city: true,
            yearsOfExperience: true,
            skills: true,
            educationLevel: true,
            religion: true,
          },
        },
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
      },
    })

    if (!matchingRequest) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 })
    }

    // Only the parent or nanny involved may download
    const isParent = matchingRequest.parentProfile?.userId === session.user.id
    const isNanny = matchingRequest.nannyProfile?.userId === session.user.id
    if (!isParent && !isNanny) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const result = matchingRequest.matchingResult
    if (!result) {
      return NextResponse.json({ success: false, error: "Hasil matching belum tersedia" }, { status: 400 })
    }

    const nanny = matchingRequest.nannyProfile
    const parent = matchingRequest.parentProfile

    const pdfBuffer = await generatePdfReport({
      matching_request_id: matchingRequest.id,
      nanny: {
        name: nanny?.fullName ?? "Nanny",
        city: nanny?.city,
        years_of_experience: nanny?.yearsOfExperience,
        skills: nanny?.skills ?? [],
        education_level: nanny?.educationLevel,
        religion: nanny?.religion,
      },
      parent: {
        full_name: parent?.fullName ?? "Orang tua",
      },
      scores: {
        overall: result.scoreOverall,
        domain_a: result.scoreDomainA,
        domain_b: result.scoreDomainB,
        domain_c: result.scoreDomainC,
        aspect_breakdown: (result.aspectBreakdown as Record<string, number> | null) ?? {},
      },
      match_highlights: result.matchHighlights,
      mismatch_areas: result.mismatchAreas,
      negotiation_points: result.negotiationPoints,
      tips_for_parent: result.tipsForParent,
      tips_for_nanny: result.tipsForNanny,
      generated_at: result.generatedAt.toISOString().slice(0, 10),
    })

    const filename = `laporan-kecocokan-${params.id.slice(-8)}.pdf`
    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, max-age=3600",
      },
    })
  } catch (error) {
    console.error("[REPORT_PDF]", error)
    return NextResponse.json({ success: false, error: "Gagal membuat laporan PDF" }, { status: 500 })
  }
}
