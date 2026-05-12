import { auth } from "@/lib/auth"
import { saveSurveyToDB } from "@/lib/survey-save"
import type { SurveyAnswers } from "@/types/survey"
import SurveyForm from "@/components/matching/SurveyForm"

export const metadata = { title: "Psikotes Kepribadian — BundaYakin" }

async function saveSurvey(answers: SurveyAnswers) {
  "use server"
  const { auth: getAuth } = await import("@/lib/auth")
  const session = await getAuth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  await saveSurveyToDB({ userId: session.user.id, role: "NANNY", answers, isDraft: false })
}

async function saveDraft(answers: SurveyAnswers) {
  "use server"
  const { auth: getAuth } = await import("@/lib/auth")
  const session = await getAuth()
  if (!session?.user?.id) return
  try {
    await saveSurveyToDB({ userId: session.user.id, role: "NANNY", answers, isDraft: true })
  } catch {
    // draft failures are silent
  }
}

export default async function NannySurveyPage() {
  await auth()

  return (
    <div className="min-h-screen bg-[#FDFBFF]">
      {/* Intro — shown before the SurveyForm sticky header takes over */}
      <div className="max-w-[480px] mx-auto px-4 pt-5">
        <div className="border-b border-[#E0D0F0] pb-3 mb-4">
          <h1 className="text-[16px] font-bold text-[#5A3A7A]">Psikotes kepribadian — gratis</h1>
          <p className="text-[12px] text-[#999AAA] mt-0.5">~15–20 menit · hasil langsung keluar setelah selesai</p>
        </div>

        {/* Benefits card */}
        <div className="bg-[#FEF0E7] border border-[#F5C4A0] rounded-[16px] p-3.5 mb-4">
          <p className="text-[12px] font-bold text-[#A35320] mb-1.5">Sus dapat apa setelah selesai?</p>
          <ul className="text-[12px] text-[#7A4018] pl-4 leading-[1.8] list-disc">
            <li>Gambaran kepribadian dan gaya kerja Sus</li>
            <li>Tips praktis cara kerja sesuai karakter Sus</li>
            <li>Profil lebih menarik di mata keluarga</li>
            <li>Badge &ldquo;Terverifikasi Psikotes&rdquo; di profil</li>
          </ul>
        </div>
      </div>

      <SurveyForm
        role="NANNY"
        storageKey="survey_nanny_v1"
        onSubmit={saveSurvey}
        onProgress={saveDraft}
      />
    </div>
  )
}
