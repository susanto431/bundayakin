import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import MonitoringForm from "@/components/monitoring/MonitoringForm"

export const metadata = { title: "Pemantauan — BundaYakin" }

type Timing = "WEEK_1" | "WEEK_2" | "MONTH_1" | "MONTH_3"
const TIMING_ORDER: Timing[] = ["WEEK_1", "WEEK_2", "MONTH_1", "MONTH_3"]

export default async function MonitoringPage({
  searchParams,
}: {
  searchParams: Promise<{ timing?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")

  const { timing: timingParam } = await searchParams

  const profile = await prisma.parentProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      nannyAssignments: {
        where: { isActive: true },
        take: 1,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          nannyProfile: { select: { fullName: true } },
          checkins: { select: { timing: true, status: true, parentDoneAt: true } },
          evaluations: { select: { timing: true, status: true, parentDoneAt: true } },
        },
      },
    },
  })

  const assignment = profile?.nannyAssignments?.[0]

  if (!assignment) {
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
    </div>
  )
}
