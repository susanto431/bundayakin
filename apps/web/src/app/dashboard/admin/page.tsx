import Link from "next/link"
import { ADMIN_MENU } from "@/constants/admin-menu"

export const metadata = { title: "Admin — BundaYakin" }

export default function AdminPage() {
  return (
    <div className="max-w-[640px] mx-auto px-4 pt-6 pb-16">
      <h1 className="text-[18px] font-bold text-[#5A3A7A] mb-4">Menu Admin</h1>
      <div className="space-y-2">
        {ADMIN_MENU.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="block bg-white border border-[#E0D0F0] rounded-[14px] p-4 hover:border-[#A97CC4] transition-all"
          >
            <p className="text-[14px] font-bold text-[#5A3A7A]">{item.label}</p>
            <p className="text-[12px] text-[#999AAA] mt-0.5">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
