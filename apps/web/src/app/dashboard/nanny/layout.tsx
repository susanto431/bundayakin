import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import NannyBottomNav from "@/components/layout/NannyBottomNav"

export default async function NannyDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.canSwitchRoles && session?.user?.role !== "NANNY") {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-[#FDFBFF]">
      <div className="pb-24">{children}</div>
      <NannyBottomNav />
    </div>
  )
}
