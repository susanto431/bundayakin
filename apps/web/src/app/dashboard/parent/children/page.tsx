export const dynamic = "force-dynamic"

import { cachedAuth } from "@/lib/auth-server"
import { getParentSubscription } from "@/lib/queries/parent"
import { prisma } from "@/lib/prisma"
import { d } from "@/lib/date"
import Link from "next/link"
import ChildrenListClient from "./ChildrenListClient"

export const metadata = { title: "Catatan Anak — BundaYakin" }

export default async function ChildrenPage() {
  const session = await cachedAuth()

  if (!session?.user?.id) return null

  const subData = await getParentSubscription(session.user.id)
  const sub = subData?.subscription
  const isPaid = sub?.status === "ACTIVE" && sub?.endDate != null && d(sub.endDate)! > new Date()

  if (!isPaid) {
    return (
      <div className="max-w-[480px] mx-auto px-4 pt-5 pb-28">
        <div className="border-b border-[#E0D0F0] pb-3 mb-4">
          <h1 className="text-[16px] font-bold text-[#5A3A7A]">Catatan &amp; Knowledge Transfer Anak</h1>
          <p className="text-[12px] text-[#999AAA] mt-0.5">Tersimpan · bisa dibagikan ke nanny kapan saja</p>
        </div>
        <div className="bg-[#F3EEF8] border border-[#C8B8DC] rounded-[16px] p-4 mb-4">
          <p className="text-[13px] font-bold text-[#5A3A7A] mb-2">Apa manfaat fitur ini untuk Bunda?</p>
          <ul className="text-[12px] text-[#666666] space-y-1.5 pl-4 list-disc leading-relaxed">
            <li>Nanny baru langsung paham si Kecil tanpa perlu Bunda jelaskan dari awal</li>
            <li>Catatan alergi, rutinitas, dan aturan rumah tidak pernah hilang walau ganti nanny</li>
            <li>Nanny bisa tambahkan catatan perkembangan dari sisi mereka — Bunda bisa pantau</li>
            <li>Data tersimpan aman dan hanya bisa dilihat oleh nanny aktif yang Bunda percaya</li>
          </ul>
        </div>
        <div className="bg-[#5A3A7A] rounded-[16px] p-5 text-center">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <p className="text-[14px] font-bold text-white mb-1">Fitur Berlangganan</p>
          <p className="text-[12px] text-white/70 mb-4 leading-relaxed">Aktifkan langganan untuk mulai mengisi catatan anak</p>
          <Link
            href="/dashboard/parent/subscription"
            className="inline-flex items-center justify-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[13px] px-6 py-2.5 rounded-[10px] min-h-[44px] transition-all"
          >
            Aktifkan Langganan — Rp 500.000/tahun
          </Link>
        </div>
      </div>
    )
  }

  const profile = await prisma.parentProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      children: {
        orderBy: [{ sortOrder: "asc" }, { dateOfBirth: "asc" }],
        select: {
          id: true, name: true, ageGroup: true, gender: true,
          allergies: true, medicalNotes: true, pantangan: true,
        },
      },
    },
  })

  const children = profile?.children ?? []

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-28">

      {/* Header */}
      <div className="border-b border-[#E0D0F0] pb-3 mb-4">
        <h1 className="text-[16px] font-bold text-[#5A3A7A]">Catatan Anak</h1>
        <p className="text-[12px] text-[#999AAA] mt-0.5">
          {children.length === 0
            ? "Belum ada profil anak"
            : `${children.length} anak · klik nama anak untuk isi detail`}
        </p>
      </div>

      {/* Info tip */}
      <div className="bg-[#E5F6F4] border border-[#A8DDD8] rounded-[12px] px-3.5 py-2.5 mb-4 flex items-start gap-2">
        <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2C5F5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
        </svg>
        <p className="text-[12px] text-[#2C5F5A] leading-relaxed">
          Tiap anak punya catatan sendiri — profil, perkembangan, dan aturan rumah. Nanny aktif bisa melihat dan mengisi catatan dari sisi mereka.
        </p>
      </div>

      <ChildrenListClient initialChildren={children} />
    </div>
  )
}
