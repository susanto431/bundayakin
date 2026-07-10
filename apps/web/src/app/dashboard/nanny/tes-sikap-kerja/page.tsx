import { cachedAuth } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { CAPTURE_WORK_STYLE_ITEMS } from "@/lib/capture-work-style-instrument"
import TesSikapKerjaClient from "./TesSikapKerjaClient"

export const metadata = { title: "Tes Sikap Kerja — BundaYakin" }
export const dynamic = "force-dynamic"

export default async function TesSikapKerjaPage() {
  const session = await cachedAuth()
  if (!session?.user?.id) notFound()

  const nannyProfile = await prisma.nannyProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      assessmentResults: {
        where: { layer: "LAYER_2", testType: "Capture Work Style" },
        orderBy: { issuedAt: "desc" },
        take: 1,
        select: { id: true, issuedAt: true },
      },
    },
  })
  if (!nannyProfile) notFound()

  const alreadyDone = nannyProfile.assessmentResults[0] ?? null

  return (
    <TesSikapKerjaClient
      items={CAPTURE_WORK_STYLE_ITEMS}
      alreadyDoneAtISO={alreadyDone?.issuedAt.toISOString() ?? null}
    />
  )
}
