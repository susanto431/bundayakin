import { prisma } from "@/lib/prisma"
import { logActivity } from "@/lib/activity"
import { Prisma } from "@prisma/client"
import type { SurveyAnswers } from "@/types/survey"

type SaveSurveyParams = {
  userId: string
  role: "PARENT" | "NANNY"
  answers: SurveyAnswers
  isDraft?: boolean
}

type SaveSurveyResult = {
  profileId: string
  answeredCount: number
  dealbreakerCount: number
  savedAt: Date
}

export async function saveSurveyToDB(params: SaveSurveyParams): Promise<SaveSurveyResult> {
  const { userId, role, answers, isDraft = false } = params

  const answeredCount = Object.keys(answers).length
  const dealbreakerCount = Object.values(answers).filter(a => a.isDealbreaker).length
  const now = new Date()

  // ── 1. Resolve profile ID + update JSON snapshot ──────────────────────────

  let profileId: string

  if (role === "NANNY") {
    const profile = await prisma.nannyProfile.findUniqueOrThrow({
      where: { userId },
      select: { id: true },
    })
    profileId = profile.id
    await prisma.nannyProfile.update({
      where: { id: profileId },
      data: {
        surveyAnswers: answers as Prisma.InputJsonValue,
        ...(!isDraft && { surveyCompletedAt: now }),
      },
    })
  } else {
    let profile = await prisma.parentProfile.findUnique({
      where: { userId },
      select: { id: true },
    })
    if (!profile) {
      const user = await prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: { name: true },
      })
      profile = await prisma.parentProfile.create({
        data: { userId, fullName: user.name ?? "Pengguna" },
        select: { id: true },
      })
    }
    profileId = profile.id
    await prisma.parentProfile.update({
      where: { id: profileId },
      data: {
        surveyAnswers: answers as Prisma.InputJsonValue,
        ...(!isDraft && { surveyCompletedAt: now }),
      },
    })
  }

  // ── 2. Upsert per-question SurveyResponse rows ────────────────────────────

  const codes = Object.keys(answers)
  if (codes.length > 0) {
    const questions = await prisma.surveyQuestion.findMany({
      where: { code: { in: codes } },
      select: { id: true, code: true },
    })
    const codeToId = Object.fromEntries(questions.map(q => [q.code, q.id]))

    await Promise.all(
      Object.entries(answers).map(async ([code, answer]) => {
        const questionId = codeToId[code]
        if (!questionId) return

        const base = {
          questionId,
          questionCode: code,
          respondentRole: role,
          answerValue: answer.value,
          answerText: answer.freeText ?? null,
          popupAnswers: answer.popupAnswers
            ? (answer.popupAnswers as Prisma.InputJsonValue)
            : Prisma.DbNull,
          isDealbreaker: answer.isDealbreaker,
        }

        if (role === "NANNY") {
          await prisma.surveyResponse.upsert({
            where: {
              questionId_respondentRole_nannyProfileId: {
                questionId,
                respondentRole: role,
                nannyProfileId: profileId,
              },
            },
            update: base,
            create: { ...base, nannyProfileId: profileId },
          })
        } else {
          await prisma.surveyResponse.upsert({
            where: {
              questionId_respondentRole_parentProfileId: {
                questionId,
                respondentRole: role,
                parentProfileId: profileId,
              },
            },
            update: base,
            create: { ...base, parentProfileId: profileId },
          })
        }
      })
    )
  }

  // ── 3. Activity log on final submit ───────────────────────────────────────

  if (!isDraft) {
    await logActivity({
      userId,
      action: "SURVEY_SUBMITTED",
      entity: role === "NANNY" ? "NannyProfile" : "ParentProfile",
      entityId: profileId,
      metadata: { role, answeredCount, dealbreakerCount },
    })
  }

  return { profileId, answeredCount, dealbreakerCount, savedAt: now }
}
