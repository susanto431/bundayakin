"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ADMIN_MENU } from "@/constants/admin-menu"

const NAV_ITEMS = [{ href: "/dashboard/admin", label: "Menu" }, ...ADMIN_MENU]

export default function AdminNav() {
  const pathname = usePathname() ?? ""

  return (
    <nav className="border-b overflow-x-auto" style={{ borderColor: "#E0D0F0" }}>
      <div className="flex gap-1 px-4 py-2 min-w-max">
        {NAV_ITEMS.map(item => {
          const isActive = item.href === "/dashboard/admin" ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all"
              style={
                isActive
                  ? { backgroundColor: "#5A3A7A", color: "#FFFFFF" }
                  : { backgroundColor: "transparent", color: "#5A3A7A", border: "1px solid #E0D0F0" }
              }
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
