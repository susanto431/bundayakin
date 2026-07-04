import { cachedAuth } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import JournalClient from "./JournalClient"

export async function generateMetadata() {
  return { title: "Jurnal Momen — BundaYakin" }
}

export default async function ChildJournalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await cachedAuth()
  if (!session?.user?.id) notFound()

  const child = await prisma.childProfile.findFirst({
    where: { id, parentProfile: { userId: session.user.id } },
    select: {
      id: true,
      name: true,
      journalEntries: {
        orderBy: { momentDate: "desc" },
        select: { id: true, caption: true, photoUrl: true, momentDate: true, authorRole: true },
      },
    },
  })

  if (!child) notFound()

  return (
    <JournalClient
      childId={child.id}
      childName={child.name}
      entries={child.journalEntries.map(e => ({
        id: e.id,
        caption: e.caption,
        photoUrl: e.photoUrl,
        momentDateISO: e.momentDate.toISOString(),
        authorRole: e.authorRole,
      }))}
    />
  )
}
