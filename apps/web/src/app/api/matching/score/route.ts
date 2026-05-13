import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { scoreSurveyMatch } from "@/lib/claude"
import { NextResponse } from "next/server"
import type { SurveyAnswers } from "@/types/survey"

const MATCHING_LIMIT_FREE = 3
const MATCHING_LIMIT_PAID = 10
const WINDOW_MS = 30 * 24 * 60 * 60 * 1000  // 30 hari

// POST /api/matching/score
// Body: { nannyUserId: string }
// Creates a MatchingRequest and triggers AI scoring.
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "PARENT") {
      return NextResponse.json({ success: false, error: "Hanya orang tua yang bisa meminta matching" }, { status: 403 })
    }

    const { nannyUserId } = (await request.json()) as { nannyUserId: string }
    if (!nannyUserId) {
      return NextResponse.json({ success: false, error: "nannyUserId diperlukan" }, { status: 400 })
    }

    // Load parent profile + survey + subscription + counter
    const parentProfile = await prisma.parentProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        surveyAnswers: true,
        surveyCompletedAt: true,
        matchingUsedCount: true,
        matchingResetAt: true,
        createdAt: true,
        subscription: { select: { status: true, endDate: true } },
      },
    })
    if (!parentProfile?.surveyCompletedAt) {
      return NextResponse.json({ success: false, error: "Orang tua belum mengisi survey" }, { status: 400 })
    }

    // Determine tier
    const sub = parentProfile.subscription
    const isPaid =
      sub?.status === "ACTIVE" &&
      sub?.endDate != null &&
      sub.endDate > new Date()
    const limit = isPaid ? MATCHING_LIMIT_PAID : MATCHING_LIMIT_FREE

    // Check/reset 30-day window
    const now = new Date()
    let usedCount = parentProfile.matchingUsedCount
    const resetAt = parentProfile.matchingResetAt

    if (!resetAt || resetAt <= now) {
      // Window expired — reset. First reset anchors to registration date + 30d.
      const nextReset = new Date(now.getTime() + WINDOW_MS)
      await prisma.parentProfile.update({
        where: { id: parentProfile.id },
        data: { matchingUsedCount: 0, matchingResetAt: nextReset },
      })
      usedCount = 0
    }

    if (usedCount >= limit) {
      return NextResponse.json(
        {
          success: false,
          error: isPaid
            ? `Batas ${MATCHING_LIMIT_PAID} matching per 30 hari tercapai. Reset otomatis bulan depan.`
            : `Batas ${MATCHING_LIMIT_FREE} matching gratis per 30 hari tercapai. Upgrade ke langganan tahunan untuk lebih banyak matching.`,
          data: { limitReached: true, isPaid, limit, usedCount },
        },
        { status: 429 }
      )
    }

    // Load nanny profile + survey
    const nannyProfile = await prisma.nannyProfile.findUnique({
      where: { userId: nannyUserId },
      select: { id: true, surveyAnswers: true, surveyCompletedAt: true, fullName: true },
    })
    if (!nannyProfile) {
      return NextResponse.json({ success: false, error: "Profil nanny tidak ditemukan" }, { status: 404 })
    }
    if (!nannyProfile.surveyCompletedAt) {
      return NextResponse.json({ success: false, error: "Nanny belum mengisi survey" }, { status: 400 })
    }

    // Check for existing active matching request
    const existing = await prisma.matchingRequest.findFirst({
      where: {
        parentProfileId: parentProfile.id,
        nannyProfileId: nannyProfile.id,
        status: { in: ["PENDING", "PROCESSING", "COMPLETED"] },
      },
      select: { id: true, status: true },
    })
    if (existing?.status === "COMPLETED") {
      return NextResponse.json({ success: true, data: { matchingRequestId: existing.id, status: "COMPLETED" } })
    }

    // Create matching request (or reuse pending one)
    let matchingRequestId = existing?.id
    if (!matchingRequestId) {
      const req = await prisma.matchingRequest.create({
        data: {
          parentProfileId: parentProfile.id,
          nannyProfileId: nannyProfile.id,
          parentSurveyDone: true,
          nannySurveyDone: true,
          status: "PROCESSING",
        },
      })
      matchingRequestId = req.id
    } else {
      await prisma.matchingRequest.update({
        where: { id: matchingRequestId },
        data: { status: "PROCESSING", parentSurveyDone: true, nannySurveyDone: true },
      })
    }

    // Run AI scoring
    const parentAnswers = parentProfile.surveyAnswers as SurveyAnswers
    const nannyAnswers = nannyProfile.surveyAnswers as SurveyAnswers
    const score = await scoreSurveyMatch(parentAnswers, nannyAnswers)

    const hasDealbreakerMismatch = score.negotiationPoints.length > 0

    // Save result
    await prisma.matchingResult.upsert({
      where: { matchingRequestId },
      create: {
        matchingRequestId,
        nannyProfileId: nannyProfile.id,
        scoreOverall: score.scoreOverall,
        scoreDomainA: score.scoreDomainA,
        scoreDomainB: score.scoreDomainB,
        scoreDomainC: score.scoreDomainC,
        aspectBreakdown: score.aspectBreakdown,
        matchHighlights: score.matchHighlights,
        mismatchAreas: score.mismatchAreas,
        negotiationPoints: score.negotiationPoints,
        tipsForParent: score.tipsForParent,
        tipsForNanny: score.tipsForNanny,
        aiRawOutput: score,
        aiModel: "claude-sonnet-4-20250514",
      },
      update: {
        scoreOverall: score.scoreOverall,
        scoreDomainA: score.scoreDomainA,
        scoreDomainB: score.scoreDomainB,
        scoreDomainC: score.scoreDomainC,
        aspectBreakdown: score.aspectBreakdown,
        matchHighlights: score.matchHighlights,
        mismatchAreas: score.mismatchAreas,
        negotiationPoints: score.negotiationPoints,
        tipsForParent: score.tipsForParent,
        tipsForNanny: score.tipsForNanny,
        aiRawOutput: score,
        generatedAt: new Date(),
      },
    })

    // Update status
    await prisma.matchingRequest.update({
      where: { id: matchingRequestId },
      data: { status: hasDealbreakerMismatch ? "NEGOTIATING" : "COMPLETED" },
    })

    // Increment counter
    await prisma.parentProfile.update({
      where: { id: parentProfile.id },
      data: { matchingUsedCount: { increment: 1 } },
    })

    console.info("[MATCHING_SCORE]", matchingRequestId, `score=${score.scoreOverall}`, `counter=${usedCount + 1}/${limit}`)

    return NextResponse.json({
      success: true,
      data: {
        matchingRequestId,
        scoreOverall: score.scoreOverall,
        matchingUsed: usedCount + 1,
        matchingLimit: limit,
      },
    })
  } catch (error) {
    console.error("[MATCHING_SCORE]", error)
    return NextResponse.json({ success: false, error: "Scoring gagal" }, { status: 500 })
  }
}
