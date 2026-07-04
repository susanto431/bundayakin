import { cachedAuth } from "@/lib/auth-server"
import { getParentSubscription, getParentMonitoring, getParentPostAssignmentInfo } from "@/lib/queries/parent"
import { d } from "@/lib/date"
import { redirect } from "next/navigation"
import Link from "next/link"
import MonitoringForm from "@/components/monitoring/MonitoringForm"
import EndAssignmentCard from "@/components/monitoring/EndAssignmentCard"
import TrackRecordCard from "@/components/monitoring/TrackRecordCard"
import { PaidOnlyGate } from "@/components/layout/PaidOnlyGate"

export const metadata = { title: "Pemantauan — BundaYakin" }

type Timing = "WEEK_1" | "WEEK_2" | "MONTH_1" | "MONTH_3"
const TIMING_ORDER: Timing[] = ["WEEK_1", "WEEK_2", "MONTH_1", "MONTH_3"]

export default async function MonitoringPage({
  searchParams,
}: {
  searchParams: Promise<{ timing?: string }>
}) {
  const session = await cachedAuth()
  if (!session?.user?.id) redirect("/auth/login")

  const [subData, profile] = await Promise.all([
    getParentSubscription(session.user.id),
    getParentMonitoring(session.user.id),
  ])

  const sub = subData?.subscription
  const isPaid = sub?.status === "ACTIVE" && sub?.endDate != null && d(sub.endDate)! > new Date()

  const { timing: timingParam } = await searchParams

  const assignment = profile?.nannyAssignments?.[0]

  if (!isPaid) {
    return (
      <PaidOnlyGate featureName="Pemantauan Nanny" isPaid={false}>
        {null}
      </PaidOnlyGate>
    )
  }

  if (!assignment) {
    // Tidak ada nanny aktif — cek jaminan aktif & penugasan terakhir yang belum direview
    const postInfo = await getParentPostAssignmentInfo(session.user.id)
    const guarantee = postInfo?.guarantee ?? null
    const ended = postInfo?.endedAssignment ?? null
    const needsReview = ended != null && !postInfo?.reviewed

    if (guarantee || needsReview) {
      const endedFirstName = ended?.nannyProfile.fullName.split(" ")[0] ?? "Nanny"
      return (
        <div className="max-w-[480px] mx-auto px-4 pt-6 pb-28 space-y-4">
          <div className="border-b border-[#E0D0F0] pb-3">
            <h1 className="text-[16px] font-bold text-[#5A3A7A]">Pemantauan</h1>
            <p className="text-[13px] text-[#999AAA] mt-0.5">Belum ada nanny aktif saat ini</p>
          </div>

          {guarantee && (
            <div className="bg-[#5A3A7A] rounded-[16px] p-4">
              <p className="text-[10px] font-bold tracking-[2px] uppercase text-[#A8DDD8] mb-1">
                Jaminan Kecocokan aktif
              </p>
              <p className="text-[14px] font-bold text-white mb-1">
                Pencarian & penempatan nanny berikutnya gratis penuh
              </p>
              <p className="text-[12px] leading-relaxed mb-3" style={{ color: "rgba(255,255,255,0.7)" }}>
                Tanpa memotong kuota koneksi, tanpa biaya penempatan — karena penugasan sebelumnya berakhir dalam 30 hari pertama.
              </p>
              <Link
                href="/dashboard/parent/cari-nanny"
                className="inline-flex items-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[13px] px-5 py-2.5 rounded-[10px] min-h-[44px] transition-all"
              >
                Cari nanny lagi — gratis →
              </Link>
            </div>
          )}

          {needsReview && ended && (
            <TrackRecordCard assignmentId={ended.id} nannyFirstName={endedFirstName} />
          )}
        </div>
      )
    }

    return (
      <div className="max-w-[480px] mx-auto px-4 pt-16 text-center">
        <p className="text-[16px] font-bold text-[#5A3A7A] mb-2">Belum ada nanny aktif</p>
        <p className="text-[13px] text-[#999AAA] mb-6">Pemantauan dimulai setelah nanny ditempatkan.</p>
        <Link
          href="/dashboard/parent/matching"
          className="inline-flex items-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[13px] px-5 py-2.5 rounded-[10px] min-h-[44px] transition-all"
        >
          Cari nanny →
        </Link>
      </div>
    )
  }

  const nannyFirstName = assignment.nannyProfile.fullName.split(" ")[0]

  const isParentDone = (timing: Timing): boolean => {
    if (timing === "WEEK_1" || timing === "WEEK_2") {
      return assignment.checkins.some(c => c.timing === timing && !!c.parentDoneAt)
    }
    return assignment.evaluations.some(e => e.timing === timing && !!e.parentDoneAt)
  }

  const nextPending = TIMING_ORDER.find(t => !isParentDone(t)) ?? "WEEK_1"
  const activeTiming: Timing =
    timingParam && (TIMING_ORDER as string[]).includes(timingParam)
      ? (timingParam as Timing)
      : nextPending

  return (
    <div className="min-h-screen bg-[#FDFBFF]">
      <MonitoringForm
        timing={activeTiming}
        nannyFirstName={nannyFirstName}
        assignmentId={assignment.id}
        alreadyDone={isParentDone(activeTiming)}
      />
      <div className="max-w-[480px] mx-auto px-4 pb-28">
        <EndAssignmentCard
          assignmentId={assignment.id}
          nannyFirstName={nannyFirstName}
          startDateISO={d(assignment.startDate)!.toISOString()}
        />
      </div>
    </div>
  )
}
