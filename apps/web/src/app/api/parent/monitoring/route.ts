export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

type Timing = "WEEK_1" | "WEEK_2" | "MONTH_1" | "MONTH_3"

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
      notes?: string
    }
    const { assignmentId, timing, answers, notes } = body

    if (!assignmentId || !timing || !answers) {
      return NextResponse.json({ success: false, error: "Data tidak lengkap" }, { status: 400 })
    }

    // Verify this assignment belongs to the current user's parent profile
    const profile = await prisma.parentProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!profile) {
      return NextResponse.json({ success: false, error: "Profil tidak ditemukan" }, { status: 404 })
    }

    const assignment = await prisma.nannyAssignment.findFirst({
      where: { id: assignmentId, parentProfileId: profile.id },
      select: { id: true, nannyProfileId: true },
    })
    if (!assignment) {
      return NextResponse.json({ success: false, error: "Assignment tidak ditemukan" }, { status: 404 })
    }

    const now = new Date()

    if (timing === "WEEK_1" || timing === "WEEK_2") {
      const existingCheckin = await prisma.checkin.findFirst({
        where: { assignmentId, timing },
        select: { id: true },
      })
      const checkinData = {
        status: "COMPLETED" as const,
        parentConditionRating: answers.q1 ?? null,
        parentConcernFlag: answers.q2 ?? null,
        parentAdaptRating: answers.q3 ?? null,
        parentFreeText: notes ?? null,
        parentDoneAt: now,
      }
      if (existingCheckin) {
        await prisma.checkin.update({ where: { id: existingCheckin.id }, data: checkinData })
      } else {
        await prisma.checkin.create({ data: { assignmentId, timing, scheduledAt: now, ...checkinData } })
      }
    } else {
      const parentContinue = answers.m3
        ? ["Ya pasti", "Ya tapi ada catatan"].includes(answers.m3)
        : null

      const existing = await prisma.evaluation.findFirst({
        where: { assignmentId, timing },
        select: { id: true, status: true, nannyDoneAt: true },
      })

      const newStatus = existing?.nannyDoneAt ? "COMPLETED" : "PARENT_DONE"

      if (existing) {
        await prisma.evaluation.update({
          where: { id: existing.id },
          data: {
            parentScores: answers,
            parentNarrative: notes ?? null,
            parentContinue,
            parentDoneAt: now,
            status: newStatus,
          },
        })
      } else {
        await prisma.evaluation.create({
          data: {
            assignmentId,
            parentProfileId: profile.id,
            nannyProfileId: assignment.nannyProfileId,
            timing,
            status: "PARENT_DONE",
            parentScores: answers,
            parentNarrative: notes ?? null,
            parentContinue,
            parentDoneAt: now,
            scheduledAt: now,
          },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[PARENT_MONITORING]", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
