import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { saveSurveyToDB } from "@/lib/survey-save"
import type { SurveyAnswers } from "@/types/survey"
import SurveyForm from "@/components/matching/SurveyForm"

export const metadata = { title: "Tes Kecocokan — BundaYakin" }

async function saveSurvey(answers: SurveyAnswers) {
  "use server"
  const { auth: getAuth } = await import("@/lib/auth")
  const session = await getAuth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  await saveSurveyToDB({ userId: session.user.id, role: "PARENT", answers, isDraft: false })
}

async function saveDraft(answers: SurveyAnswers) {
  "use server"
  const { auth: getAuth } = await import("@/lib/auth")
  const session = await getAuth()
  if (!session?.user?.id) return
  try {
    await saveSurveyToDB({ userId: session.user.id, role: "PARENT", answers, isDraft: true })
  } catch {
    // draft failures are silent
  }
}

export default async function ParentMatchingSurveyPage() {
  const session = await auth()

  const profile = session?.user?.id
    ? await prisma.parentProfile.findUnique({
        where: { userId: session.user.id },
        select: { surveyCompletedAt: true },
      })
    : null

  return (
    <div className="min-h-screen bg-[#FDFBFF]">
      <SurveyForm
        role="PARENT"
        storageKey="survey_parent_v1"
        onSubmit={saveSurvey}
        onProgress={saveDraft}
        alreadyCompleted={!!profile?.surveyCompletedAt}
      />
    </div>
  )
}
