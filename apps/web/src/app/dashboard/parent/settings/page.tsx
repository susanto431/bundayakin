import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { CopyButton } from "@/components/settings/CopyButton"
import { DeleteAccountButton } from "@/components/settings/DeleteAccountButton"

export const metadata = { title: "Akun & Pengaturan — BundaYakin" }

const WA_CONTACT = "https://wa.me/6281234567890?text=Halo%20tim%20BundaYakin%2C%20saya%20butuh%20bantuan"

export default async function ParentSettingsPage() {
  const session = await auth()

  const profile = session?.user?.id
    ? await prisma.parentProfile.findUnique({
        where: { userId: session.user.id },
        select: {
          subscription: { select: { status: true, startDate: true, endDate: true } },
          children: {
            orderBy: { createdAt: "asc" },
            select: { id: true, name: true, ageGroup: true, gender: true },
          },
        },
      })
    : null

  const sub = profile?.subscription
  const isActive = sub?.status === "ACTIVE"
  const endDate = sub?.endDate?.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) ?? "-"
  const startDate = sub?.startDate?.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) ?? "-"
  const daysLeft = sub?.endDate
    ? Math.max(0, Math.ceil((sub.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  const referralCode = `BY-REF-${session?.user?.id?.slice(-4).toUpperCase() ?? "4829"}`
  const userName = session?.user?.name ?? "Pengguna"

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-28">

      {/* Header */}
      <div className="border-b border-[#E0D0F0] pb-3 mb-4">
        <h1 className="text-[16px] font-bold text-[#5A3A7A]">Akun &amp; pengaturan</h1>
        <p className="text-[12px] text-[#999AAA] mt-0.5">{userName}</p>
      </div>

      {/* Subscription */}
      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Langganan</p>
      {isActive ? (
        <div className="bg-[#E5F6F4] border border-[#A8DDD8] rounded-[16px] p-3.5 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[14px] font-bold text-[#1E4A45]">Langganan aktif</p>
              <p className="text-[12px] text-[#2C5F5A] mt-0.5">Berlaku {startDate} – {endDate}</p>
            </div>
            <span className="text-[11px] font-semibold bg-[#E5F6F4] text-[#2C5F5A] border border-[#A8DDD8] px-2.5 py-0.5 rounded-full">
              {daysLeft} hari tersisa
            </span>
          </div>
          <Link
            href="/dashboard/parent/subscription"
            className="mt-2.5 inline-flex items-center bg-[#E5F6F4] hover:bg-[#A8DDD8] text-[#1E4A45] font-semibold text-[12px] px-3.5 py-1.5 rounded-[8px] min-h-[36px] border border-[#A8DDD8] transition-all"
          >
            Perpanjang
          </Link>
        </div>
      ) : (
        <div className="bg-[#5A3A7A] rounded-[20px] p-4 mb-4 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#A97CC4]/20 rounded-full" />
          <div className="relative z-10">
            <p className="text-[10px] font-bold tracking-[2px] uppercase text-[#A8DDD8] mb-1">Belum berlangganan</p>
            <p className="text-white font-semibold text-[14px] mb-0.5">Aktifkan akses penuh</p>
            <p className="text-white/60 text-[12px] mb-3">Matching, evaluasi, & monitoring nanny</p>
            <Link
              href="/dashboard/parent/subscription"
              className="inline-flex items-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white text-[13px] font-semibold px-4 py-2 rounded-[10px] min-h-[40px] transition-all"
            >
              Mulai — Rp 500.000/tahun
            </Link>
          </div>
        </div>
      )}

      {/* Referral code */}
      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Kode rekomendasimu</p>
      <div className="bg-[#F3EEF8] border-2 border-dashed border-[#C8B8DC] rounded-[16px] p-4 mb-4 text-center">
        <p className="font-[var(--font-dm-serif)] text-[24px] tracking-[4px] text-[#5A3A7A] my-1">{referralCode}</p>
        <p className="text-[11px] text-[#999AAA] mb-2.5 leading-relaxed">
          Dapat Rp 100rb (jangka panjang) / Rp 75rb (temporer) saat terjadi penempatan via kode ini
        </p>
        <div className="flex gap-2 justify-center">
          <a
            href={`https://wa.me/?text=Gunakan%20kode%20${referralCode}%20di%20BundaYakin`}
            target="_blank" rel="noreferrer"
            className="inline-flex items-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[12px] px-3.5 py-1.5 rounded-[8px] min-h-[36px] transition-all"
          >
            Bagikan via WA
          </a>
          <CopyButton text={referralCode} />
        </div>
      </div>

      {/* Notifications */}
      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-3">Notifikasi</p>
      <div className="space-y-2 mb-4">
        {[
          "Notifikasi pemantauan berkala via WA",
          "Notifikasi saat nanny selesai isi preferensi",
          "Situasi yang perlu perhatian segera",
          "Pengingat perbarui catatan anak tiap 3 bulan",
        ].map(label => (
          <label key={label} className="flex items-center gap-3 cursor-pointer">
            <div className="w-5 h-5 rounded-[6px] bg-[#5BBFB0] border-[#5BBFB0] border-[1.5px] flex items-center justify-center flex-shrink-0">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[13px] text-[#666666]">{label}</span>
          </label>
        ))}
      </div>

      {/* Children profiles */}
      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Profil anak</p>
      <div className="mb-3">
        {(profile?.children ?? []).map(c => (
          <div key={c.id} className="flex justify-between items-center py-2.5 border-b border-[#E0D0F0]">
            <span className="text-[13px] text-[#5A3A7A]">
              {c.name} · {c.ageGroup} · {c.gender === "FEMALE" ? "Perempuan" : "Laki-laki"}
            </span>
            <Link
              href="/onboarding/parent"
              className="inline-flex items-center bg-transparent border-[1.5px] border-[#C8B8DC] text-[#666666] font-semibold text-[12px] px-3.5 py-1 rounded-[8px] min-h-[36px] hover:bg-[#F3EEF8] transition-all"
            >
              Edit
            </Link>
          </div>
        ))}
      </div>
      <Link
        href="/onboarding/parent"
        className="inline-flex items-center bg-[#E5F6F4] hover:bg-[#A8DDD8] text-[#1E4A45] font-semibold text-[12px] px-3.5 py-1.5 rounded-[8px] min-h-[36px] border border-[#A8DDD8] transition-all mb-4"
      >
        + Tambah profil anak
      </Link>

      {/* Privacy & security */}
      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Privasi &amp; keamanan</p>
      <div className="space-y-2 mb-4 text-[13px]">
        <Link href="/dashboard/parent/settings/password" className="block text-[#5BBFB0] font-semibold min-h-[40px] flex items-center">
          Ganti kata sandi
        </Link>
        <a
          href="/api/parent/export"
          download="data-bundayakin.json"
          className="block text-[#5BBFB0] font-semibold min-h-[40px] flex items-center"
        >
          Unduh data saya
        </a>
        <DeleteAccountButton />
      </div>

      {/* About */}
      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Tentang</p>
      <div className="space-y-0 text-[13px] text-[#999AAA]">
        <Link href="/dashboard/parent/terms" className="py-2.5 border-b border-[#F3EEF8] flex items-center hover:text-[#5A3A7A] transition-colors">
          Syarat &amp; Ketentuan
        </Link>
        <div className="py-2.5 border-b border-[#F3EEF8]">Kebijakan Privasi (PDP)</div>
        <a
          href={WA_CONTACT}
          target="_blank" rel="noreferrer"
          className="py-2.5 flex items-center text-[#5BBFB0] font-semibold min-h-[40px] hover:underline"
        >
          Hubungi tim BundaYakin
        </a>
        <div className="py-2.5">Versi 1.0.0</div>
      </div>

    </div>
  )
}
