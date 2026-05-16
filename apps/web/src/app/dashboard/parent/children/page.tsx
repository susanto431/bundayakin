import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ShareChildButton } from "@/components/children/ShareChildButton"
import { getSubscriptionStatus } from "@/lib/subscription"

export const metadata = { title: "Catatan Anak — BundaYakin" }

export default async function ChildrenPage() {
  const session = await auth()

  if (session?.user?.id) {
    const { isPaid } = await getSubscriptionStatus(session.user.id)
    if (!isPaid) {
      return (
        <div className="max-w-[480px] mx-auto px-4 pt-5 pb-28">

          {/* Header */}
          <div className="border-b border-[#E0D0F0] pb-3 mb-4">
            <h1 className="text-[16px] font-bold text-[#5A3A7A]">Catatan & Knowledge Transfer Anak</h1>
            <p className="text-[12px] text-[#999AAA] mt-0.5">Tersimpan · bisa dibagikan ke nanny kapan saja</p>
          </div>

          {/* Benefit banner */}
          <div className="bg-[#F3EEF8] border border-[#C8B8DC] rounded-[16px] p-4 mb-4">
            <p className="text-[13px] font-bold text-[#5A3A7A] mb-2">Apa manfaat fitur ini untuk Bunda?</p>
            <ul className="text-[12px] text-[#666666] space-y-1.5 pl-4 list-disc leading-relaxed">
              <li>Nanny baru langsung paham si Kecil tanpa perlu Bunda jelaskan dari awal</li>
              <li>Catatan alergi, rutinitas, dan aturan rumah tidak pernah hilang walau ganti nanny</li>
              <li>Nanny bisa tambahkan catatan perkembangan dari sisi mereka — Bunda bisa pantau</li>
              <li>Data tersimpan aman dan hanya bisa dilihat oleh nanny aktif yang Bunda percaya</li>
            </ul>
          </div>

          {/* Preview dummy data */}
          <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-4 mb-4">
            <p className="text-[11px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-3">Contoh catatan yang sudah terisi</p>
            <div className="space-y-3">
              <div className="bg-[#E5F6F4] rounded-[10px] p-3">
                <p className="text-[11px] font-bold text-[#2C5F5A] mb-1">👶 Profil Anak</p>
                <p className="text-[12px] text-[#2C5F5A]">Aisyah, 2 tahun · Perempuan · Balita aktif</p>
                <p className="text-[11px] text-[#2C5F5A]/70 mt-0.5">Alergi: susu sapi, kacang tanah</p>
              </div>
              <div className="bg-[#FEF0E7] rounded-[10px] p-3">
                <p className="text-[11px] font-bold text-[#A35320] mb-1">📈 Perkembangan</p>
                <p className="text-[12px] text-[#7A4018]">Sudah bisa berlari, suka main puzzle. Sedang toilet training sejak Maret 2026.</p>
                <p className="text-[11px] text-[#7A4018]/70 mt-0.5">Sekolah: Play Group Mutiara · Selasa & Kamis, 08.00–10.00</p>
              </div>
              <div className="bg-[#EEF2FC] rounded-[10px] p-3">
                <p className="text-[11px] font-bold text-[#5B7EC9] mb-1">🏠 Aturan Rumah</p>
                <p className="text-[12px] text-[#3A5A9A]">Pantangan: tidak boleh makan permen sebelum makan siang. Tidur siang 12.30–14.00. Tidak boleh nonton layar lebih dari 30 menit/hari.</p>
              </div>
              <div className="bg-[#F3EEF8] rounded-[10px] p-3">
                <p className="text-[11px] font-bold text-[#5A3A7A] mb-1">📋 Catatan dari Nanny (diisi Sus)</p>
                <p className="text-[12px] text-[#5A3A7A]">"Aisyah mulai lancar bilang kalimat 3 kata. Suka lagu anak-anak sebelum tidur. Sering rewel saat tumbuh gigi."</p>
                <p className="text-[11px] text-[#999AAA] mt-0.5">Ditambahkan oleh nanny · 2 Mei 2026</p>
              </div>
            </div>
          </div>

          {/* Lock gate */}
          <div className="bg-[#5A3A7A] rounded-[16px] p-5 text-center">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <p className="text-[14px] font-bold text-white mb-1">Fitur Berlangganan</p>
            <p className="text-[12px] text-white/70 mb-4 leading-relaxed">Aktifkan langganan untuk mulai mengisi catatan anak dan membagikannya ke nanny</p>
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
  }

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
              pantangan: true,
              schedule: true,
              schoolName: true,
              schoolSchedule: true,
              additionalNotes: true,
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
  const hasDevelopment = !!(child?.medicalNotes || child?.schoolName || child?.schoolSchedule)
  const hasRules = !!(child?.pantangan || child?.schedule || child?.additionalNotes)

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
      icon: "📈",
      bg: "bg-[#FEF0E7]",
      title: "Perkembangan " + childName,
      sub: "Milestone · catatan tumbuh kembang · sekolah",
      status: hasDevelopment ? "Lengkap" : "Belum lengkap",
      statusColor: hasDevelopment ? "bg-[#E5F6F4] text-[#2C5F5A] border-[#A8DDD8]" : "bg-[#FEF0E7] text-[#A35320] border-[#F5C4A0]",
      href: "/dashboard/parent/children/development",
      isEditable: true,
    },
    {
      icon: "🏠",
      bg: "bg-[#FEF0E7]",
      title: "Aturan rumah",
      sub: "Pantangan · rutinitas harian · aturan tamu",
      status: hasRules ? "Lengkap" : "Belum lengkap",
      statusColor: hasRules ? "bg-[#E5F6F4] text-[#2C5F5A] border-[#A8DDD8]" : "bg-[#FEF0E7] text-[#A35320] border-[#F5C4A0]",
      href: "/dashboard/parent/children/rules",
      isEditable: true,
    },
    {
      icon: "📋",
      bg: "bg-[#EEF2FC]",
      title: "Catatan dari nanny",
      sub: "Diisi oleh Sus dari sisi pengamatannya · otomatis tersimpan",
      status: "Otomatis",
      statusColor: "bg-[#EEF2FC] text-[#5B7EC9] border-[#B5C8EF]",
      href: null,
      isEditable: false,
    },
  ]

  const shareChild = child ? {
    name: child.name,
    ageGroup: child.ageGroup,
    allergies: child.allergies,
    medicalNotes: child.medicalNotes,
    pantangan: child.pantangan,
    schedule: child.schedule,
    additionalNotes: child.additionalNotes,
    schoolName: child.schoolName,
    schoolSchedule: child.schoolSchedule,
  } : null

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-28">

      {/* Header */}
      <div className="border-b border-[#E0D0F0] pb-3 mb-4">
        <h1 className="text-[16px] font-bold text-[#5A3A7A]">Catatan tentang {childName}</h1>
        <p className="text-[12px] text-[#999AAA] mt-0.5">Tersimpan · bisa dibagikan ke nanny baru kapan saja</p>
      </div>

      {/* Benefit box */}
      <div className="bg-[#E5F6F4] border border-[#A8DDD8] rounded-[16px] p-3.5 mb-4">
        <p className="text-[12px] font-bold text-[#1E4A45] mb-1.5">Manfaat fitur ini untuk Bunda</p>
        <ul className="text-[12px] text-[#2C5F5A] space-y-1 pl-4 list-disc leading-relaxed">
          <li>Nanny baru langsung paham si Kecil — tidak mulai dari nol</li>
          <li>Catatan alergi, rutinitas &amp; aturan tersimpan permanen</li>
          <li>Bunda <strong>dan nanny</strong> bisa menambahkan catatan perkembangan</li>
          <li>Identitas nanny lama tidak ditampilkan saat ganti nanny</li>
        </ul>
      </div>

      {/* Who can fill */}
      <div className="bg-[#F3EEF8] border border-[#C8B8DC] rounded-[12px] px-3.5 py-2.5 mb-4 flex items-start gap-2">
        <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A97CC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
        </svg>
        <p className="text-[12px] text-[#5A3A7A] leading-relaxed">
          Catatan ini bisa diisi oleh <strong>Bunda maupun nanny</strong>. Bunda cukup kirim link akses ke nanny — nanny akan login dan mengisi dari sisi mereka.
        </p>
      </div>

      {/* Update notice */}
      {child && (
        <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-3 mb-4 flex items-center justify-between">
          <div>
            <p className="text-[12px] font-bold text-[#5A3A7A]">Terakhir diperbarui</p>
            <p className="text-[11px] text-[#999AAA] mt-0.5">{lastUpdated} · Pengingat tiap 3 bulan</p>
          </div>
          <span className="text-[11px] font-semibold bg-[#E5F6F4] text-[#2C5F5A] border border-[#A8DDD8] px-2.5 py-0.5 rounded-full">Aktif</span>
        </div>
      )}

      {/* Modules */}
      <div className="bg-white border border-[#E0D0F0] rounded-[16px] overflow-hidden mb-4">
        {modules.map((mod, i) => {
          const inner = (
            <>
              <div className={`w-9 h-9 rounded-[10px] ${mod.bg} flex items-center justify-center text-[18px] flex-shrink-0 border border-[#E0D0F0]`}>
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

      {/* Nanny note */}
      <div className="bg-[#EEF2FC] border border-[#B5C8EF] rounded-[12px] px-3.5 py-3 mb-4">
        <p className="text-[12px] font-bold text-[#5B7EC9] mb-1">Cara berbagi ke nanny</p>
        <p className="text-[12px] text-[#3A5A9A] leading-relaxed">
          Kirim link <strong>bundayakin.com/dashboard/nanny/children</strong> ke nanny melalui WhatsApp. Nanny login dengan akun mereka dan bisa langsung melihat serta mengisi catatan {childName}.
        </p>
      </div>

      {/* Notice */}
      <div className="bg-[#F3EEF8] rounded-[10px] px-3 py-2.5 mb-4">
        <p className="text-[12px] text-[#999AAA] leading-relaxed">
          Saat ganti nanny, catatan ini otomatis dikompilasi dan dibagikan ke nanny baru. Identitas nanny lama tidak ditampilkan.
        </p>
      </div>

      {/* CTAs */}
      {shareChild ? (
        <ShareChildButton child={shareChild} />
      ) : (
        <div className="space-y-2">
          <Link
            href="/onboarding/parent"
            className="w-full flex items-center justify-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] transition-all"
          >
            Mulai isi catatan anak
          </Link>
        </div>
      )}

    </div>
  )
}
