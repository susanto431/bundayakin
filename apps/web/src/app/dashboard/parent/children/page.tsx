import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const metadata = { title: "Catatan Anak — BundaYakin" }

export default async function ChildrenPage() {
  const session = await auth()

  const profile = session?.user?.id
    ? await prisma.parentProfile.findUnique({
        where: { userId: session.user.id },
        select: {
          children: {
            orderBy: { createdAt: "asc" },
            take: 1,
            select: {
              id: true,
              name: true,
              ageGroup: true,
              gender: true,
              allergies: true,
              medicalNotes: true,
              updatedAt: true,
            },
          },
        },
      })
    : null

  const child = profile?.children?.[0]
  const childName = child?.name ?? "si Kecil"
  const lastUpdated = child?.updatedAt.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) ?? "-"

  const hasProfile = !!child?.name

  // Derive module completion — in production these would be real fields
  const modules = [
    {
      icon: "👶",
      bg: "bg-white",
      title: "Profil " + childName,
      sub: "Nama · usia · alergi · dokter & kontak darurat",
      status: hasProfile ? "Lengkap" : "Belum lengkap",
      statusColor: hasProfile ? "bg-[#E5F6F4] text-[#2C5F5A] border-[#A8DDD8]" : "bg-[#FEF0E7] text-[#A35320] border-[#F5C4A0]",
      href: "/onboarding/parent",
      isEditable: true,
    },
    {
      icon: "❤️",
      bg: "bg-[#F3EEF8]",
      title: "Kesukaan & kebiasaan",
      sub: "Mainan · cara menenangkan · pola tidur",
      status: "Lengkap",
      statusColor: "bg-[#E5F6F4] text-[#2C5F5A] border-[#A8DDD8]",
      href: "/onboarding/parent?section=habits",
      isEditable: true,
    },
    {
      icon: "📈",
      bg: "bg-[#FEF0E7]",
      title: "Perkembangan " + childName,
      sub: "Milestone · catatan tumbuh kembang",
      status: "Perlu update",
      statusColor: "bg-[#FEF0E7] text-[#A35320] border-[#F5C4A0]",
      href: "/onboarding/parent?section=development",
      isEditable: true,
    },
    {
      icon: "📝",
      bg: "bg-white",
      title: "Catatan kejadian penting",
      sub: "Insiden · pola perilaku",
      status: "Lengkap",
      statusColor: "bg-[#E5F6F4] text-[#2C5F5A] border-[#A8DDD8]",
      href: "/onboarding/parent?section=incidents",
      isEditable: true,
    },
    {
      icon: "🏠",
      bg: "bg-[#FEF0E7]",
      title: "Aturan rumah",
      sub: "Area akses · SOP darurat · aturan tamu",
      status: "Belum lengkap",
      statusColor: "bg-[#FEF0E7] text-[#A35320] border-[#F5C4A0]",
      href: "/onboarding/parent?section=rules",
      isEditable: true,
    },
    {
      icon: "📋",
      bg: "bg-[#EEF2FC]",
      title: "Catatan dari nanny sebelumnya",
      sub: "Dari pemantauan · otomatis",
      status: "Otomatis",
      statusColor: "bg-[#EEF2FC] text-[#5B7EC9] border-[#B5C8EF]",
      href: null,
      isEditable: false,
    },
  ]

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-28">

      {/* Header */}
      <div className="border-b border-[#E0D0F0] pb-3 mb-4">
        <h1 className="text-[16px] font-bold text-[#5A3A7A]">Catatan tentang {childName}</h1>
        <p className="text-[12px] text-[#999AAA] mt-0.5">Tersimpan · bisa dibagikan ke nanny baru kapan saja</p>
      </div>

      {/* Update notice */}
      {child && (
        <div className="bg-[#E5F6F4] border border-[#A8DDD8] rounded-[16px] p-3.5 mb-4">
          <p className="text-[12px] font-bold text-[#1E4A45]">Terakhir diperbarui: {lastUpdated}</p>
          <p className="text-[12px] text-[#2C5F5A] mt-0.5">Pengingat pembaruan berikutnya setiap 3 bulan</p>
        </div>
      )}

      {/* Modules */}
      <div className="bg-white border border-[#E0D0F0] rounded-[16px] overflow-hidden mb-4">
        {modules.map((mod, i) => {
          const inner = (
            <>
              <div className={`w-9 h-9 rounded-[10px] ${mod.bg} flex items-center justify-center text-[18px] flex-shrink-0`}>
                {mod.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#5A3A7A]">{mod.title}</p>
                <p className="text-[11px] text-[#999AAA] mt-0.5">{mod.sub}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className={`text-[11px] font-semibold border px-2.5 py-0.5 rounded-full ${mod.statusColor}`}>
                  {mod.status}
                </span>
                {mod.isEditable && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8B8DC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                )}
              </div>
            </>
          )

          const cls = `flex items-center gap-3 p-3.5 ${i < modules.length - 1 ? "border-b border-[#E0D0F0]" : ""} ${mod.isEditable ? "hover:bg-[#FDFBFF] transition-colors cursor-pointer" : ""}`

          return mod.href ? (
            <Link key={i} href={mod.href} className={cls}>
              {inner}
            </Link>
          ) : (
            <div key={i} className={cls}>
              {inner}
            </div>
          )
        })}
      </div>

      {/* Notice */}
      <div className="bg-[#F3EEF8] rounded-[10px] px-3 py-2.5 mb-4">
        <p className="text-[12px] text-[#999AAA] leading-relaxed">
          Saat ganti nanny, catatan ini otomatis dikompilasi dan dibagikan ke nanny baru. Identitas nanny lama tidak ditampilkan.
        </p>
      </div>

      {/* CTAs */}
      <div className="space-y-2">
        <button className="w-full flex items-center justify-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] transition-all">
          Bagikan ke nanny baru
        </button>
        <Link
          href="/onboarding/parent"
          className="w-full flex items-center justify-center bg-transparent border-[1.5px] border-[#C8B8DC] text-[#666666] font-semibold text-[13px] min-h-[48px] rounded-[10px] hover:bg-[#F3EEF8] transition-all"
        >
          Lengkapi catatan
        </Link>
      </div>

    </div>
  )
}
