import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import MonitoringForm from "./MonitoringForm"

export const metadata = { title: "Pemantauan — BundaYakin" }

const TIMING_LABEL: Record<string, string> = {
  WEEK_1: "Check-in Minggu ke-1",
  WEEK_2: "Check-in Minggu ke-2",
  MONTH_1: "Pemantauan Bulan ke-1",
  MONTH_3: "Pemantauan Bulan ke-3",
  QUARTERLY: "Evaluasi Berkala",
}

export default async function NannyMonitoringPage({
  searchParams,
}: {
  searchParams: { assignmentId?: string; timing?: string }
}) {
  const { assignmentId, timing } = searchParams

  if (!assignmentId || !timing) notFound()

  const session = await auth()
  if (!session?.user?.id) notFound()

  const profile = await prisma.nannyProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!profile) notFound()

  const assignment = await prisma.nannyAssignment.findFirst({
    where: { id: assignmentId, nannyProfileId: profile.id },
    select: { parentProfile: { select: { fullName: true } } },
  })
  if (!assignment) notFound()

  const familyName = assignment.parentProfile?.fullName?.split(" ")[0] ?? "keluarga"
  const timingLabel = TIMING_LABEL[timing] ?? timing
  const isCheckin = timing === "WEEK_1" || timing === "WEEK_2"

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-28">

      <div className="border-b border-[#E0D0F0] pb-3 mb-4">
        <h1 className="text-[16px] font-bold text-[#5A3A7A]">{timingLabel}</h1>
        <p className="text-[12px] text-[#999AAA] mt-0.5">Dari sisi Sus · keluarga juga sedang mengisi</p>
      </div>

      <div className="bg-[#F3EEF8] border border-[#E0D0F0] rounded-[16px] p-3.5 mb-4">
        <p className="text-[12px] font-bold text-[#5A3A7A] mb-1">Untuk apa pemantauan ini?</p>
        <p className="text-[12px] text-[#666666] leading-relaxed">
          Untuk menjaga kenyamanan kedua belah pihak. Hasil dikompilasi dan dikirim lewat WA setelah keduanya selesai.
        </p>
      </div>

      <MonitoringForm
        assignmentId={assignmentId}
        timing={timing}
        familyName={familyName}
        isCheckin={isCheckin}
      />

    </div>
  )
}
