import { cachedAuth } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ConsultationBookingClient from "./ConsultationBookingClient"

export async function generateMetadata() {
  return { title: "Konsultasi Psikolog Anak — BundaYakin" }
}

export default async function ChildConsultationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await cachedAuth()
  if (!session?.user?.id) notFound()

  const child = await prisma.childProfile.findFirst({
    where: { id, parentProfile: { userId: session.user.id } },
    select: {
      id: true,
      name: true,
      consultationBookings: {
        where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
        orderBy: { bookingDate: "desc" },
        select: {
          id: true,
          bookingDate: true,
          slotTime: true,
          status: true,
          psychologistNotes: true,
        },
      },
    },
  })

  if (!child) notFound()

  return (
    <ConsultationBookingClient
      childId={child.id}
      childName={child.name}
      history={child.consultationBookings.map(b => ({
        id: b.id,
        bookingDateISO: b.bookingDate.toISOString(),
        slotTime: b.slotTime,
        status: b.status as "CONFIRMED" | "COMPLETED",
        psychologistNotes: b.psychologistNotes,
      }))}
    />
  )
}
