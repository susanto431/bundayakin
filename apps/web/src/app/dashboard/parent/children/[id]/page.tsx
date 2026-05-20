import { cachedAuth } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ChildDetailClient from "./ChildDetailClient"

export async function generateMetadata({ params }: { params: { id: string } }) {
  return { title: "Detail Anak — BundaYakin" }
}

export default async function ChildDetailPage({ params }: { params: { id: string } }) {
  const session = await cachedAuth()
  if (!session?.user?.id) notFound()

  const child = await prisma.childProfile.findFirst({
    where: { id: params.id, parentProfile: { userId: session.user.id } },
    select: {
      id: true,
      name: true,
      dateOfBirth: true,
      ageGroup: true,
      gender: true,
      allergies: true,
      medicalNotes: true,
      pantangan: true,
      schedule: true,
      schoolName: true,
      schoolSchedule: true,
      additionalNotes: true,
      nannyNotes: true,
      caraMenenangkan: true,
      updatedAt: true,
    },
  })

  if (!child) notFound()

  return (
    <ChildDetailClient
      child={{
        id: child.id,
        name: child.name,
        ageGroup: child.ageGroup,
        gender: child.gender,
        allergies: child.allergies,
        medicalNotes: child.medicalNotes,
        pantangan: child.pantangan,
        schedule: child.schedule,
        schoolName: child.schoolName,
        schoolSchedule: child.schoolSchedule,
        additionalNotes: child.additionalNotes,
        nannyNotes: child.nannyNotes,
        caraMenenangkan: child.caraMenenangkan,
        updatedAt: child.updatedAt.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      }}
    />
  )
}
