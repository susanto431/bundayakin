import { cachedAuth } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { PLACEMENT_FEE_IDR } from "@/constants/pricing"
import PlacementClient from "./PlacementClient"

export const metadata = { title: "Konfirmasi Penempatan Nanny — BundaYakin" }

export default async function PlacementFeePage({ params }: { params: { id: string } }) {
  const session = await cachedAuth()
  if (!session?.user?.id) redirect("/auth/login")

  const parentProfile = await prisma.parentProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      children: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, name: true, ageGroup: true },
      },
    },
  })
  if (!parentProfile) notFound()

  const request = await prisma.matchingRequest.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      parentProfileId: true,
      status: true,
      nannyTypeRequested: true,
      nannyProfile: {
        select: {
          fullName: true,
          city: true,
        },
      },
      matchingResult: {
        select: { scoreOverall: true },
      },
    },
  })

  // Ownership + valid status check
  if (!request || request.parentProfileId !== parentProfile.id) notFound()
  if (!["COMPLETED", "NEGOTIATING"].includes(request.status)) {
    redirect(`/dashboard/parent/matching/${params.id}`)
  }

  const nannyName = request.nannyProfile?.fullName ?? "Nanny"
  const nannyCity = request.nannyProfile?.city ?? null
  const nannyType: string = request.nannyTypeRequested ?? "LIVE_IN"
  const score = request.matchingResult?.scoreOverall
    ? Math.round(request.matchingResult.scoreOverall)
    : null

  return (
    <PlacementClient
      matchingId={params.id}
      nannyName={nannyName}
      nannyCity={nannyCity}
      nannyType={nannyType}
      score={score}
      children={parentProfile.children.map(c => ({
        id: c.id,
        name: c.name,
        ageGroup: c.ageGroup,
      }))}
      placementFeeIDR={PLACEMENT_FEE_IDR}
    />
  )
}
