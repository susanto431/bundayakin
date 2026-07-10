import { cachedAuth } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import PsikologQueueClient from "./PsikologQueueClient"

export const metadata = { title: "Portal Psikolog — BundaYakin" }
export const dynamic = "force-dynamic"

export default async function PsikologDashboardPage() {
  const session = await cachedAuth()
  if (!session?.user?.id) redirect("/auth/login")

  const psikologProfile = await prisma.psikologProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, fullName: true, level: true, dailyCapacity: true },
  })
  if (!psikologProfile) redirect("/auth/login")

  const bookings = await prisma.consultationBooking.findMany({
    where: { psikologId: psikologProfile.id, status: { in: ["CONFIRMED", "COMPLETED"] } },
    orderBy: [{ bookingDate: "asc" }, { slotTime: "asc" }],
    select: {
      id: true,
      bookingDate: true,
      slotTime: true,
      status: true,
      psychologistNotes: true,
      completedAt: true,
      childProfile: { select: { name: true, dateOfBirth: true } },
      parentProfile: { select: { fullName: true } },
    },
  })

  return (
    <PsikologQueueClient
      psikologName={psikologProfile.fullName}
      level={psikologProfile.level}
      dailyCapacity={psikologProfile.dailyCapacity}
      bookings={bookings.map(b => ({
        id: b.id,
        bookingDateISO: b.bookingDate.toISOString(),
        slotTime: b.slotTime,
        status: b.status as "CONFIRMED" | "COMPLETED",
        psychologistNotes: b.psychologistNotes,
        childName: b.childProfile.name,
        parentName: b.parentProfile.fullName,
      }))}
    />
  )
}
