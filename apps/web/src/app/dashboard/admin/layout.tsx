import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import RoleSwitcher from "@/components/settings/RoleSwitcher"

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user?.canSwitchRoles && session?.user?.role !== "ADMIN") {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FDFBFF" }}>
      {/* Admin top bar */}
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "#E0D0F0", backgroundColor: "#F3EEF8" }}>
        <div>
          <span className="text-xs font-bold text-[#5A3A7A] tracking-wider uppercase">Admin Mode</span>
          <span className="ml-2 text-xs text-[#999AAA]">{session.user.name}</span>
        </div>
        <RoleSwitcher compact />
      </div>
      <div className="pb-8">{children}</div>
    </div>
  )
}
