import { cachedAuth } from "@/lib/auth-server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LogoutButton } from "@/components/settings/LogoutButton"

export default async function PsikologDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await cachedAuth()

  if (!session?.user?.canSwitchRoles && session?.user?.role !== "PSIKOLOG") {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-[#FDFBFF]">
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "#E0D0F0", backgroundColor: "#F3EEF8" }}>
        <div>
          <span className="text-xs font-bold text-[#5A3A7A] tracking-wider uppercase">Portal Psikolog</span>
          <span className="ml-2 text-xs text-[#999AAA]">{session?.user?.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/psikolog/settings/password" className="text-xs font-semibold text-[#A97CC4] hover:text-[#5A3A7A] transition-colors">
            Ganti kata sandi
          </Link>
          <LogoutButton />
        </div>
      </div>
      <div className="pb-16">{children}</div>
    </div>
  )
}
