import { cachedAuth } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { d } from "@/lib/date"
import GrowthClient from "./GrowthClient"

export async function generateMetadata() {
  return { title: "Tumbuh Kembang — BundaYakin" }
}

export default async function ChildGrowthPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await cachedAuth()
  if (!session?.user?.id) notFound()

  const child = await prisma.childProfile.findFirst({
    where: { id, parentProfile: { userId: session.user.id } },
    select: {
      id: true,
      name: true,
      gender: true,
      dateOfBirth: true,
      parentProfile: { select: { subscription: { select: { status: true, endDate: true } } } },
      growthRecords: {
        orderBy: { measuredAt: "asc" },
        select: { id: true, measuredAt: true, weightKg: true, heightCm: true, headCircumferenceCm: true, notes: true },
      },
    },
  })

  if (!child) notFound()

  const sub = child.parentProfile.subscription
  const isPaid = sub?.status === "ACTIVE" && sub?.endDate != null && d(sub.endDate)! > new Date()

  return (
    <GrowthClient
      childId={child.id}
      childName={child.name}
      gender={child.gender}
      dateOfBirthISO={child.dateOfBirth.toISOString()}
      isPaid={isPaid}
      records={child.growthRecords.map(r => ({
        id: r.id,
        measuredAtISO: r.measuredAt.toISOString(),
        weightKg: r.weightKg,
        heightCm: r.heightCm,
        headCircumferenceCm: r.headCircumferenceCm,
        notes: r.notes,
      }))}
    />
  )
}
