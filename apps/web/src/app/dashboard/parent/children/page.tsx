export const dynamic = "force-dynamic"

import { cachedAuth } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { d } from "@/lib/date"
import Link from "next/link"
import ChildrenListClient from "./ChildrenListClient"

export const metadata = { title: "Anak Saya — BundaYakin" }

export default async function ChildrenPage() {
  const session = await cachedAuth()

  if (!session?.user?.id) return null

  const profile = await prisma.parentProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      subscription: { select: { status: true, endDate: true } },
      children: {
        orderBy: [{ sortOrder: "asc" }, { dateOfBirth: "asc" }],
        select: {
          id: true, name: true, ageGroup: true, gender: true,
          allergies: true, medicalNotes: true, pantangan: true,
        },
      },
    },
  })

  const sub = profile?.subscription
  const isPaid = sub?.status === "ACTIVE" && sub?.endDate != null && d(sub.endDate)! > new Date()
  const children = profile?.children ?? []

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-28">

      {/* Header */}
      <div className="border-b border-[#E0D0F0] pb-3 mb-4">
        <h1 className="text-[16px] font-bold text-[#5A3A7A]">Anak Saya</h1>
        <p className="text-[12px] text-[#999AAA] mt-0.5">
          {children.length === 0
            ? "Belum ada profil anak"
            : `${children.length} anak · klik nama anak untuk isi detail`}
        </p>
      </div>

      {/* Upsell lembut untuk akun free */}
      {!isPaid && (
        <div className="bg-[#F3EEF8] border border-[#C8B8DC] rounded-[16px] p-4 mb-4">
          <p className="text-[13px] font-bold text-[#5A3A7A] mb-2">Isi sekarang, bagikan ke nanny nanti</p>
          <ul className="text-[12px] text-[#666666] space-y-1.5 pl-4 list-disc leading-relaxed mb-3">
            <li>Catatan yang Bunda isi hari ini langsung bisa dibagikan ke nanny setelah berlangganan</li>
            <li>Nanny baru langsung paham si Kecil — tanpa penjelasan ulang dari awal</li>
            <li>Alergi, rutinitas, dan aturan rumah tersimpan aman, tidak hilang walau ganti nanny</li>
          </ul>
          <Link
            href="/dashboard/parent/subscription"
            className="inline-flex items-center justify-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[12px] px-4 py-2 rounded-[8px] min-h-[36px] transition-all"
          >
            Aktifkan Langganan — Rp 500.000/tahun
          </Link>
        </div>
      )}

      {/* Info tip untuk pelanggan aktif */}
      {isPaid && (
        <div className="bg-[#E5F6F4] border border-[#A8DDD8] rounded-[12px] px-3.5 py-2.5 mb-4 flex items-start gap-2">
          <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2C5F5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
          </svg>
          <p className="text-[12px] text-[#2C5F5A] leading-relaxed">
            Tiap anak punya catatan sendiri — profil, perkembangan, dan aturan rumah. Nanny aktif bisa melihat dan mengisi catatan dari sisi mereka.
          </p>
        </div>
      )}

      <ChildrenListClient initialChildren={children} />
    </div>
  )
}
