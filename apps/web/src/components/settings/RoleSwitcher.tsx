"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

type Role = "PARENT" | "NANNY" | "ADMIN"

const ROLE_OPTIONS: { role: Role; label: string; desc: string; href: string }[] = [
  {
    role: "PARENT",
    label: "Orang Tua",
    desc: "Dashboard bunda — direktori nanny, matching",
    href: "/dashboard/parent",
  },
  {
    role: "NANNY",
    label: "Nanny",
    desc: "Dashboard nanny — profil, survey, monitoring",
    href: "/dashboard/nanny",
  },
  {
    role: "ADMIN",
    label: "Admin",
    desc: "Lihat semua data matching — overview lengkap",
    href: "/dashboard/admin",
  },
]

type Props = { compact?: boolean }

export default function RoleSwitcher({ compact = false }: Props) {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState<Role | null>(null)

  if (!session?.user?.canSwitchRoles) return null

  const currentRole = session.user.role as Role

  async function handleSwitch(role: Role) {
    if (role === currentRole || loading) return
    setLoading(role)
    try {
      const res = await fetch("/api/user/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)

      // Update JWT token dengan role baru via NextAuth update()
      await update({ switchToRole: role })

      // Redirect ke dashboard yang sesuai
      const target = ROLE_OPTIONS.find(o => o.role === role)?.href ?? "/dashboard/parent"
      router.push(target)
      router.refresh()
    } catch (e) {
      console.error("[SWITCH_ROLE]", e)
    } finally {
      setLoading(null)
    }
  }

  if (compact) {
    return (
      <div className="flex gap-1">
        {ROLE_OPTIONS.map(opt => {
          const isActive = currentRole === opt.role
          return (
            <button
              key={opt.role}
              onClick={() => handleSwitch(opt.role)}
              disabled={isActive || !!loading}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-[#5BBFB0] text-white"
                  : "bg-white border border-[#E0D0F0] text-[#5A3A7A] hover:bg-[#F3EEF8]"
              }`}
            >
              {loading === opt.role ? "..." : opt.label}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="mt-4">
      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">
        Mode Tampilan
      </p>
      <div
        className="rounded-[14px] border overflow-hidden"
        style={{ borderColor: "#E0D0F0" }}
      >
        {ROLE_OPTIONS.map((opt, i) => {
          const isActive = currentRole === opt.role
          const isLoading = loading === opt.role

          return (
            <button
              key={opt.role}
              onClick={() => handleSwitch(opt.role)}
              disabled={isActive || !!loading}
              className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors disabled:opacity-60 ${
                i > 0 ? "border-t" : ""
              } ${isActive ? "bg-[#E5F6F4]" : "bg-white hover:bg-[#F3EEF8]"}`}
              style={{ borderColor: "#E0D0F0" }}
            >
              <div>
                <p className={`text-[13px] font-semibold ${isActive ? "text-[#2C5F5A]" : "text-[#5A3A7A]"}`}>
                  {opt.label}
                  {isActive && (
                    <span className="ml-2 text-[10px] font-bold text-[#5BBFB0]">Aktif</span>
                  )}
                </p>
                <p className="text-[11px] text-[#999AAA]">{opt.desc}</p>
              </div>
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-[#5BBFB0] border-t-transparent rounded-full animate-spin" />
              ) : isActive ? (
                <span className="text-[#5BBFB0] text-lg">✓</span>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8B8DC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              )}
            </button>
          )
        })}
      </div>
      <p className="text-[10px] text-[#999AAA] mt-1.5 px-1">
        Fitur khusus akun developer — tidak mempengaruhi data.
      </p>
    </div>
  )
}
