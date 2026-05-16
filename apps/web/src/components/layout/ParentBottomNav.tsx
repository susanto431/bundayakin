"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  {
    href: "/dashboard/parent",
    label: "Beranda",
    exact: true,
    icon: "⊙",
  },
  {
    href: "/dashboard/parent/cari-nanny",
    label: "Cari Nanny",
    exact: false,
    icon: "⊕",
  },
  {
    href: "/dashboard/parent/children",
    label: "Catatan Anak",
    exact: false,
    icon: "⊞",
  },
  {
    href: "/dashboard/parent/settings",
    label: "Akun",
    exact: false,
    icon: "⊛",
  },
]

export default function ParentBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-[1.5px] border-[#E0D0F0]">
      <div className="max-w-[480px] mx-auto flex items-center pt-2 pb-1">
        {navItems.map(item => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 min-h-[56px] justify-center transition-colors ${
                isActive ? "text-[#5BBFB0]" : "text-[#999AAA] hover:text-[#5A3A7A]"
              }`}
            >
              <span className="text-[18px] leading-none">{item.icon}</span>
              <span className={`text-[10px] font-semibold leading-tight ${isActive ? "text-[#5BBFB0] font-bold" : "text-[#999AAA]"}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
