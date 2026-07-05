import Link from "next/link"

export const metadata = { title: "Admin — BundaYakin" }

const MENU = [
  { href: "/dashboard/admin/matching-overview", label: "Matching Overview", desc: "Semua sesi matching, skor, dan status" },
  { href: "/dashboard/admin/pricing-config", label: "Konfigurasi Harga & Kuota", desc: "Atur harga langganan, biaya, dan kuota koneksi" },
]

export default function AdminPage() {
  return (
    <div className="max-w-[640px] mx-auto px-4 pt-6 pb-16">
      <h1 className="text-[18px] font-bold text-[#5A3A7A] mb-4">Menu Admin</h1>
      <div className="space-y-2">
        {MENU.map(item => (
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
