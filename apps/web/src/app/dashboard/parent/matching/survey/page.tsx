import { auth } from "@/lib/auth"
import { saveSurveyToDB } from "@/lib/survey-save"
import type { SurveyAnswers } from "@/types/survey"
import SurveyForm from "@/components/matching/SurveyForm"

export const metadata = { title: "Survey Matching — BundaYakin" }

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
  await auth()

  return (
    <div className="min-h-screen bg-[#FDFBFF]">
      <SurveyForm
        role="PARENT"
        storageKey="survey_parent_v1"
        onSubmit={saveSurvey}
        onProgress={saveDraft}
      />
    </div>
  )
}
