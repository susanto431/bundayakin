import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import ParentBottomNav from "@/components/layout/ParentBottomNav"

export default async function ParentDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session || session.user.role !== "PARENT") {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-[#FDFBFF]">
      <div className="pb-24">{children}</div>
      <ParentBottomNav />
    </div>
  )
}
