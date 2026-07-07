import { cachedAuth } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { d } from "@/lib/date"
import { kpspRoundedAgeMonths, applyPrematureCorrection, selectKpspAgeBand } from "@/lib/kpsp-scoring"
import { KPSP_QUESTIONNAIRES } from "@/lib/kpsp-instrument"
import ScreeningClient from "./ScreeningClient"

export async function generateMetadata() {
  return { title: "Skrining Perkembangan — BundaYakin" }
}

export default async function ChildScreeningPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await cachedAuth()
  if (!session?.user?.id) notFound()

  const child = await prisma.childProfile.findFirst({
    where: { id, parentProfile: { userId: session.user.id } },
    select: {
      id: true,
      name: true,
      dateOfBirth: true,
      gestationalWeeksAtBirth: true,
      parentProfile: { select: { subscription: { select: { status: true, endDate: true } } } },
      developmentScreenings: {
        orderBy: { screeningDate: "desc" },
        select: { id: true, screeningDate: true, ageBand: true, yaCount: true, category: true },
      },
    },
  })

  if (!child) notFound()

  const sub = child.parentProfile.subscription
  const isPaid = sub?.status === "ACTIVE" && sub?.endDate != null && d(sub.endDate)! > new Date()

  const now = new Date()
  const rawAge = kpspRoundedAgeMonths(child.dateOfBirth, now)
  const correctedAge = applyPrematureCorrection(rawAge, child.gestationalWeeksAtBirth)
  const ageBand = selectKpspAgeBand(correctedAge)

  return (
    <ScreeningClient
      childId={child.id}
      childName={child.name}
      isPaid={isPaid}
      ageBand={ageBand}
      currentAgeMonths={correctedAge}
      questions={ageBand ? KPSP_QUESTIONNAIRES[ageBand] : []}
      history={child.developmentScreenings.map(s => ({
        id: s.id,
        screeningDateISO: s.screeningDate.toISOString(),
        ageBand: s.ageBand,
        yaCount: s.yaCount,
        category: s.category as "SESUAI" | "MERAGUKAN" | "PENYIMPANGAN",
      }))}
    />
  )
}
