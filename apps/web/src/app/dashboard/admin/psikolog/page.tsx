import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import PsikologAdminClient from "./PsikologAdminClient"

export const metadata = { title: "Kelola Psikolog — Admin BundaYakin" }
export const dynamic = "force-dynamic"

export default async function AdminPsikologPage() {
  const session = await auth()
  if (!session?.user?.canSwitchRoles && session?.user?.role !== "ADMIN") {
    redirect("/auth/login")
  }

  const psikologs = await prisma.psikologProfile.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      level: true,
      isActive: true,
      dailyCapacity: true,
      createdAt: true,
      user: { select: { email: true, phone: true } },
    },
  })

  return (
    <PsikologAdminClient
      initialPsikologs={psikologs.map(p => ({
        id: p.id,
        fullName: p.fullName,
        level: p.level,
        isActive: p.isActive,
        dailyCapacity: p.dailyCapacity,
        email: p.user.email,
        phone: p.user.phone,
        createdAtISO: p.createdAt.toISOString(),
      }))}
    />
  )
}
