import { prisma } from "@/lib/prisma"

export async function getSubscriptionStatus(userId: string): Promise<{
  isPaid: boolean
  endDate: Date | null
}> {
  const profile = await prisma.parentProfile.findUnique({
    where: { userId },
    select: {
      subscription: { select: { status: true, endDate: true } },
    },
  })

  const sub = profile?.subscription
  const isPaid =
    sub?.status === "ACTIVE" &&
    sub?.endDate != null &&
    sub.endDate > new Date()

  return { isPaid, endDate: sub?.endDate ?? null }
}
