import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import ParentBottomNav from "@/components/layout/ParentBottomNav"
import { InstallPrompt } from "@/components/layout/InstallPrompt"

export default async function ParentDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.canSwitchRoles && session?.user?.role !== "PARENT") {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-[#FDFBFF]">
      <div className="pb-24">{children}</div>
      <ParentBottomNav />
      <InstallPrompt />
    </div>
  )
}
