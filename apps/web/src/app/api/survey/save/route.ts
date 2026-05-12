import { auth } from "@/lib/auth"
import { saveSurveyToDB } from "@/lib/survey-save"
import { NextResponse } from "next/server"
import type { SurveyAnswers } from "@/types/survey"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { role, answers, isDraft = false } = body as {
      role: "PARENT" | "NANNY"
      answers: SurveyAnswers
      isDraft?: boolean
    }

    if (!role || !answers || typeof answers !== "object") {
      return NextResponse.json({ success: false, error: "Data tidak lengkap" }, { status: 400 })
    }

    const result = await saveSurveyToDB({ userId: session.user.id, role, answers, isDraft })

    console.info(
      "[SURVEY_SAVE]",
      session.user.id,
      role,
      isDraft ? "draft" : "final",
      `${result.answeredCount} answers`
    )

    return NextResponse.json({
      success: true,
      data: {
        answeredCount: result.answeredCount,
        dealbreakerCount: result.dealbreakerCount,
        savedAt: result.savedAt.toISOString(),
        isDraft,
      },
    })
  } catch (error) {
    console.error("[SURVEY_SAVE]", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
