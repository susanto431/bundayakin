import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

export const metadata = { title: "Hasil Pemantauan — BundaYakin" }

type Timing = "WEEK_1" | "WEEK_2" | "MONTH_1" | "MONTH_3"

const TIMING_LABEL: Record<Timing, string> = {
  WEEK_1: "Kabar minggu ke-1",
  WEEK_2: "Kabar minggu ke-2",
  MONTH_1: "Pemantauan bulan ke-1",
  MONTH_3: "Pemantauan bulan ke-3",
}

const WEEKLY_LABELS: Record<string, string> = {
  q1: "Kondisi nanny minggu ini",
  q2: "Ada yang perlu diperhatikan",
  q3: "Nanny terlihat nyaman & beradaptasi",
}

const MONTHLY_LABELS: Record<string, string> = {
  m1: "Penilaian keseluruhan kinerja",
  m2: "Nanny aktif mengajak si kecil",
  m3: "Rencana lanjut kerja sama",
}

export default async function MonitoringSummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ timing?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")

  const { timing: timingParam } = await searchParams
  const timing = timingParam as Timing | undefined
  if (!timing) redirect("/dashboard/parent")
  const isWeekly = timing === "WEEK_1" || timing === "WEEK_2"

  const profile = await prisma.parentProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      nannyAssignments: {
        where: { isActive: true },
        take: 1,
        orderBy: { createdAt: "desc" },
        select: {
          nannyProfile: { select: { fullName: true } },
          checkins: { where: { timing }, select: { timing: true, status: true, parentConditionRating: true, parentConcernFlag: true, parentAdaptRating: true, parentFreeText: true, parentDoneAt: true } },
          evaluations: { where: { timing }, select: { timing: true, status: true, parentScores: true, parentNarrative: true, parentDoneAt: true, nannyDoneAt: true, aiSummary: true } },
        },
      },
    },
  })

  const assignment = profile?.nannyAssignments?.[0]
  if (!assignment) {
    redirect("/dashboard/parent")
  }

  const nannyName = assignment.nannyProfile.fullName
  const checkin = assignment.checkins[0]
  const evaluation = assignment.evaluations[0]

  const record = isWeekly ? checkin : evaluation
  if (!record) redirect("/dashboard/parent")

  const parentDone = !!record.parentDoneAt
  const nannyDone = isWeekly ? true : !!(evaluation as typeof evaluation & { nannyDoneAt?: Date | null })?.nannyDoneAt
  const bothDone = parentDone && nannyDone

  const weeklyAnswers = isWeekly && checkin ? {
    [WEEKLY_LABELS.q1]: checkin.parentConditionRating,
    [WEEKLY_LABELS.q2]: checkin.parentConcernFlag,
    [WEEKLY_LABELS.q3]: checkin.parentAdaptRating,
  } : null

  const monthlyAnswers = !isWeekly && evaluation && typeof evaluation.parentScores === "object" && evaluation.parentScores
    ? Object.entries(evaluation.parentScores as Record<string, string>).map(([key, val]) => ({
        label: MONTHLY_LABELS[key] ?? key,
        value: val,
      }))
    : null

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-28">

      {/* Header */}
      <div className="border-b border-[#E0D0F0] pb-3 mb-5">
        <Link href="/dashboard/parent" className="inline-flex items-center text-[12px] text-[#999AAA] hover:text-[#5A3A7A] mb-2 transition-colors">
          ← Kembali ke beranda
        </Link>
        <h1 className="text-[16px] font-bold text-[#5A3A7A]">{TIMING_LABEL[timing]}</h1>
        <p className="text-[12px] text-[#999AAA] mt-0.5">{nannyName}</p>
      </div>

      {/* Status bar */}
      <div className="flex gap-2 mb-5">
        <div className={`flex-1 rounded-[12px] p-3 border ${parentDone ? "bg-[#E5F6F4] border-[#A8DDD8]" : "bg-white border-[#E0D0F0]"}`}>
          <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#999AAA] mb-0.5">Kamu</p>
          <p className={`text-[12px] font-semibold ${parentDone ? "text-[#2C5F5A]" : "text-[#999AAA]"}`}>
            {parentDone ? "Sudah mengisi ✓" : "Belum mengisi"}
          </p>
        </div>
        <div className={`flex-1 rounded-[12px] p-3 border ${nannyDone ? "bg-[#E5F6F4] border-[#A8DDD8]" : "bg-white border-[#E0D0F0]"}`}>
          <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#999AAA] mb-0.5">{nannyName.split(" ")[0]}</p>
          <p className={`text-[12px] font-semibold ${nannyDone ? "text-[#2C5F5A]" : "text-[#999AAA]"}`}>
            {nannyDone ? "Sudah mengisi ✓" : "Belum mengisi"}
          </p>
        </div>
      </div>

      {/* Jawaban kamu */}
      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Jawabanmu</p>
      <div className="space-y-2 mb-5">
        {weeklyAnswers && Object.entries(weeklyAnswers).map(([label, value]) => value && (
          <div key={label} className="bg-white border border-[#E0D0F0] rounded-[12px] px-3.5 py-3">
            <p className="text-[11px] text-[#999AAA] mb-0.5">{label}</p>
            <p className="text-[13px] font-semibold text-[#5A3A7A]">{value}</p>
          </div>
        ))}
        {monthlyAnswers && monthlyAnswers.map(({ label, value }) => (
          <div key={label} className="bg-white border border-[#E0D0F0] rounded-[12px] px-3.5 py-3">
            <p className="text-[11px] text-[#999AAA] mb-0.5">{label}</p>
            <p className="text-[13px] font-semibold text-[#5A3A7A]">{value}</p>
          </div>
        ))}
        {(isWeekly ? checkin?.parentFreeText : evaluation?.parentNarrative) && (
          <div className="bg-white border border-[#E0D0F0] rounded-[12px] px-3.5 py-3">
            <p className="text-[11px] text-[#999AAA] mb-0.5">Pesan ke tim BY</p>
            <p className="text-[13px] text-[#5A3A7A]">{isWeekly ? checkin?.parentFreeText : evaluation?.parentNarrative}</p>
          </div>
        )}
      </div>

      {/* Hasil gabungan */}
      {bothDone && evaluation?.aiSummary ? (
        <>
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Ringkasan tim BundaYakin</p>
          <div className="bg-[#F3EEF8] border border-[#E0D0F0] rounded-[16px] p-4 mb-4">
            <p className="text-[13px] text-[#5A3A7A] leading-relaxed">{evaluation.aiSummary}</p>
          </div>
        </>
      ) : !bothDone ? (
        <div className="bg-[#FEF0E7] border border-[#F5C4A0] rounded-[16px] p-4 text-center">
          <p className="text-[13px] font-semibold text-[#A35320] mb-1">Menunggu {nannyName.split(" ")[0]} mengisi</p>
          <p className="text-[12px] text-[#7A4018]">Ringkasan akan tersedia setelah kedua pihak mengisi.</p>
        </div>
      ) : null}

    </div>
  )
}
