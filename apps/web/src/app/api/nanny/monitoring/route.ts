export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

type Timing = "WEEK_1" | "WEEK_2" | "MONTH_1" | "MONTH_3" | "QUARTERLY"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json() as {
      assignmentId: string
      timing: Timing
      answers: Record<string, string>
      nannyContinue?: boolean | null
      notes?: string
    }
    const { assignmentId, timing, answers, nannyContinue, notes } = body

    if (!assignmentId || !timing || !answers) {
      return NextResponse.json({ success: false, error: "Data tidak lengkap" }, { status: 400 })
    }

    const profile = await prisma.nannyProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!profile) {
      return NextResponse.json({ success: false, error: "Profil tidak ditemukan" }, { status: 404 })
    }

    const assignment = await prisma.nannyAssignment.findFirst({
      where: { id: assignmentId, nannyProfileId: profile.id },
      select: { id: true, parentProfileId: true },
    })
    if (!assignment) {
      return NextResponse.json({ success: false, error: "Assignment tidak ditemukan" }, { status: 404 })
    }

    const now = new Date()

    if (timing === "WEEK_1" || timing === "WEEK_2") {
      const existing = await prisma.checkin.findFirst({
        where: { assignmentId, timing },
        select: { id: true, parentDoneAt: true },
      })

      const checkinData = {
        nannyConditionRating: answers.q1 ?? null,
        nannyComfortRating: answers.q2 ?? null,
        nannyCommsRating: answers.q3 ?? null,
        nannyConcernFlag: answers.q4 ?? null,
        nannyFreeText: notes ?? null,
        nannyDoneAt: now,
        status: existing?.parentDoneAt ? "COMPLETED" as const : "PENDING" as const,
      }

      if (existing) {
        await prisma.checkin.update({ where: { id: existing.id }, data: checkinData })
      } else {
        await prisma.checkin.create({
          data: { assignmentId, timing, scheduledAt: now, ...checkinData },
        })
      }
    } else {
      const existing = await prisma.evaluation.findFirst({
        where: { assignmentId, timing },
        select: { id: true, parentDoneAt: true },
      })

      const newStatus = existing?.parentDoneAt ? "COMPLETED" as const : "NANNY_DONE" as const

      if (existing) {
        await prisma.evaluation.update({
          where: { id: existing.id },
          data: {
            nannyScores: answers,
            nannyNarrative: notes ?? null,
            nannyContinue: nannyContinue ?? null,
            nannyDoneAt: now,
            status: newStatus,
          },
        })
      } else {
        await prisma.evaluation.create({
          data: {
            assignmentId,
            parentProfileId: assignment.parentProfileId,
            nannyProfileId: profile.id,
            timing,
            status: "NANNY_DONE",
            nannyScores: answers,
            nannyNarrative: notes ?? null,
            nannyContinue: nannyContinue ?? null,
            nannyDoneAt: now,
            scheduledAt: now,
          },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[NANNY_MONITORING]", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
