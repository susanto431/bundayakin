import { cachedAuth } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getPsikologWeeklySchedule, listPsikologCuti } from "@/lib/consultation"
import JadwalClient from "./JadwalClient"

export const metadata = { title: "Atur Jadwal — Portal Psikolog BundaYakin" }
export const dynamic = "force-dynamic"

export default async function JadwalPsikologPage() {
  const session = await cachedAuth()
  if (!session?.user?.id) redirect("/auth/login")

  const psikologProfile = await prisma.psikologProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!psikologProfile) redirect("/auth/login")

  const [weeklySchedule, cutiDates] = await Promise.all([
    getPsikologWeeklySchedule(psikologProfile.id),
    listPsikologCuti(psikologProfile.id),
  ])

  return (
    <JadwalClient
      weeklySchedule={weeklySchedule}
      cutiDates={cutiDates.map((c) => ({ id: c.id, cutiDateISO: c.cutiDate.toISOString(), reason: c.reason }))}
    />
  )
}
