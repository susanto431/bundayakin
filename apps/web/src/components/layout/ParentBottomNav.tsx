"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconHome,
  IconUserSearch,
  IconNotebook,
  IconSettings,
} from "@tabler/icons-react"

const navItems = [
  {
    href: "/dashboard/parent",
    label: "Beranda",
    exact: true,
    Icon: IconHome,
    activePaths: [] as string[],
  },
  {
    href: "/dashboard/parent/matching",
    label: "Cari Nanny",
    exact: false,
    Icon: IconUserSearch,
    activePaths: ["/dashboard/parent/cari-nanny"],
  },
  {
    href: "/dashboard/parent/children",
    label: "Catatan",
    exact: false,
    Icon: IconNotebook,
    activePaths: [] as string[],
  },
  {
    href: "/dashboard/parent/settings",
    label: "Akun",
    exact: false,
    Icon: IconSettings,
    activePaths: [] as string[],
  },
]

export default function ParentBottomNav() {
  const pathname = usePathname() ?? ""

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-[1.5px] border-[#E0D0F0]">
      <div className="max-w-[480px] mx-auto flex items-center pt-2 pb-1">
        {navItems.map(item => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href) || item.activePaths.some(p => pathname.startsWith(p))
          const { Icon } = item

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center gap-0.5 py-1.5 min-h-[56px] justify-center"
            >
              <span
                className={`flex items-center justify-center w-10 h-7 rounded-full transition-colors ${
                  isActive ? "bg-[#EBF8F6]" : ""
                }`}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2}
                  color={isActive ? "#5BBFB0" : "#9CA3AF"}
                />
              </span>
              <span
                className={`text-[10px] leading-tight transition-colors ${
                  isActive ? "font-bold text-[#5BBFB0]" : "font-medium text-[#6B7280]"
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
