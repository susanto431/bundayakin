import { cachedAuth } from "@/lib/auth-server"
import { getParentMatchingData } from "@/lib/queries/parent"
import { getEffectivePricing } from "@/lib/pricing-config"
import { prisma } from "@/lib/prisma"
import { d } from "@/lib/date"
import Link from "next/link"
import NannyInviteForm from "@/components/matching/NannyInviteForm"
import DirectInviteCard from "@/components/matching/DirectInviteCard"
import PsikotesInviteForm from "@/components/matching/PsikotesInviteForm"

export const metadata = { title: "Cari Nanny — BundaYakin" }

type InvitedNanny = {
  id: string
  nannyName: string
  status: string
  updatedAt: Date | string
}

export default async function ParentMatchingPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>
}) {
  const session = await cachedAuth()
  const now = new Date()
  const { invite: inviteNannyId } = await searchParams

  const profile = session?.user?.id
    ? await getParentMatchingData(session.user.id)
    : null

  const sub = profile?.subscription
  const isPaid = sub?.status === "ACTIVE" && sub?.endDate != null && d(sub.endDate)! > now
  const quota = profile?.connectionQuotas?.[0]
  const defaultQuota = await getEffectivePricing()
  const referralRemaining = Math.max(0, (quota?.referralLimit ?? defaultQuota.REFERRAL_QUOTA) - (quota?.referralUsed ?? 0))
  const talentPoolRemaining = isPaid ? Math.max(0, (quota?.talentPoolLimit ?? defaultQuota.TALENT_POOL_QUOTA) - (quota?.talentPoolUsed ?? 0)) : 0
  const matchingRemaining = referralRemaining + talentPoolRemaining
  const isLimitReached = matchingRemaining === 0

  const surveyDone = !!profile?.surveyCompletedAt
  const invitedNannies: InvitedNanny[] = (profile?.matchingRequests ?? []).map(r => ({
    id: r.id,
    nannyName: r.nannyProfile?.fullName ?? "Nanny",
    status: r.status,
    updatedAt: r.updatedAt,
  }))

  const inviteCode = `BY-${session?.user?.id?.slice(-4).toUpperCase() ?? "4829"}`

  const inviteNanny = inviteNannyId
    ? await prisma.nannyProfile.findUnique({
        where: { id: inviteNannyId },
        select: { id: true, city: true, yearsOfExperience: true },
      })
    : null

  const statusLabel = (s: string) => {
    if (s === "COMPLETED" || s === "NEGOTIATING") return { label: "Sudah isi", color: "bg-[#E5F6F4] text-[#2C5F5A] border-[#A8DDD8]" }
    if (s === "PROCESSING") return { label: "Diproses", color: "bg-[#EEF2FC] text-[#5B7EC9] border-[#B5C8EF]" }
    return { label: "Menunggu", color: "bg-[#FEF0E7] text-[#A35320] border-[#F5C4A0]" }
  }

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-28">

      {/* Header */}
      <div className="border-b border-[#E0D0F0] pb-3 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-[16px] font-bold text-[#5A3A7A]">Cocokkan dengan nanny</h1>
            <p className="text-[12px] text-[#999AAA] mt-0.5">Undang nanny yang sudah dikenal, atau cari lewat AI Talent Pool</p>
          </div>
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
            isLimitReached
              ? "bg-[#FAEAEA] text-[#C75D5D] border-[#F5C4A0]"
              : matchingRemaining <= 1
              ? "bg-[#FEF0E7] text-[#A35320] border-[#F5C4A0]"
              : "bg-[#E5F6F4] text-[#2C5F5A] border-[#A8DDD8]"
          }`}>
            {isLimitReached ? "Habis" : `Sisa ${matchingRemaining}×`}
          </span>
        </div>
      </div>

      {/* Direct invite banner — dari LinkedIn mode unlock */}
      {inviteNanny && (
        <DirectInviteCard
          nannyProfileId={inviteNanny.id}
          nannyCity={inviteNanny.city ?? ""}
          nannyExperience={inviteNanny.yearsOfExperience ?? 0}
        />
      )}

      {/* Survey status — prasyarat sebelum jalur A/B bisa keluar skor kecocokan */}
      {!surveyDone && (
        <div className="bg-[#5A3A7A] rounded-[20px] p-4 mb-4 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#A97CC4]/20 rounded-full" />
          <div className="relative z-10">
            <p className="text-[10px] font-bold tracking-[2px] uppercase text-[#A8DDD8] mb-1">Langkah pertama</p>
            <p className="text-white font-semibold text-[14px] mb-0.5">Isi preferensi Bunda dulu</p>
            <p className="text-white/60 text-[12px] mb-3">Agar sistem bisa mencocokkan jawaban kedua pihak, di jalur mana pun yang Bunda pilih</p>
            <Link
              href="/dashboard/parent/matching/survey"
              className="inline-flex items-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white text-[13px] font-semibold px-4 py-2.5 rounded-[10px] min-h-[48px] transition-all"
            >
              Isi preferensi →
            </Link>
          </div>
        </div>
      )}

      {/* Limit warning / upgrade nudge */}
      {isLimitReached && !isPaid && (
        <div className="bg-[#FEF0E7] border border-[#F5C4A0] rounded-[16px] p-3.5 mb-4">
          <p className="text-[10px] font-bold tracking-[2px] uppercase text-[#A35320] mb-1">Jatah habis</p>
          <p className="text-[#5A3A7A] font-semibold text-[14px] mb-0.5">3 matching gratis bulan ini sudah dipakai</p>
          <p className="text-[#8A6A4A] text-[12px] mb-3">Upgrade ke langganan tahunan untuk 10× matching per bulan + evaluasi + data anak</p>
          <a
            href="/dashboard/parent/subscription"
            className="inline-flex items-center bg-[#5A3A7A] hover:bg-[#3D2558] text-white text-[13px] font-semibold px-4 py-2.5 rounded-[10px] min-h-[48px] transition-all"
          >
            Langganan — Rp 500rb/tahun
          </a>
        </div>
      )}

      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2 mt-1">Pilih jalur mencari nanny</p>

      {/* Jalur A — undang nanny yang sudah dikenal */}
      <div className="mb-3">
        <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#5A3A7A] mb-1">Jalur A · Gratis</p>
        <p className="text-[13px] font-bold text-[#5A3A7A] mb-0.5">Undang nanny yang sudah dikenal</p>
        <p className="text-[12px] text-[#999AAA] leading-relaxed">Sudah kenal calon nanny dari saudara, tetangga, atau agen? Undang dia isi Tes Kecocokan.</p>
      </div>

      {/* Disclaimer — konteks langsung untuk Jalur A */}
      <div className="bg-[#EEF2FC] border-l-4 border-[#5B7EC9] rounded-r-[12px] px-3.5 py-3 mb-3">
        <p className="text-[12px] font-bold text-[#5B7EC9]">Dapat nanny dari penyalur / kenalan? Tetap bisa pakai BY gratis</p>
        <p className="text-[11px] text-[#3A5A9A] mt-1 leading-relaxed">
          Gunakan fitur pencocokan dan pemantauan secara gratis tanpa kewajiban bayar ke BY. Biaya penempatan BY hanya berlaku jika deal terjadi lewat platform kami.
        </p>
        <Link
          href="/dashboard/parent/terms"
          className="inline-flex items-center mt-1.5 text-[11px] font-semibold text-[#5B7EC9] hover:underline"
        >
          Selengkapnya →
        </Link>
      </div>

      {/* Cara kerja Jalur A */}
      <div className="bg-[#E5F6F4] border border-[#A8DDD8] rounded-[16px] p-3.5 mb-4">
        <p className="text-[12px] font-bold text-[#1E4A45] mb-1">Cara kerja</p>
        <p className="text-[12px] text-[#2C5F5A] leading-relaxed">
          Nanny terima link → isi preferensi → sistem cocokkan dua jawaban → laporan untuk keduanya.
        </p>
      </div>

      <NannyInviteForm inviteCode={inviteCode} />

      {/* Undangan Psikotes (ADR-014) — sengaja bukan bagian dari Jalur A/B di atas:
          tujuannya beda (assessment mandiri, bukan mencocokkan dengan Bunda ini). */}
      <div className="mt-5 mb-4">
        <PsikotesInviteForm priceIDR={defaultQuota.ADDON_PSIKOTES_FEE_IDR} />
      </div>

      {/* Jalur B — AI Talent Pool */}
      <div className="mb-2 mt-2">
        <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#1E4A45] mb-1">
          Jalur B · {isPaid ? `Sisa ${talentPoolRemaining}× koneksi` : "Khusus pelanggan"}
        </p>
      </div>
      {isPaid ? (
        <a
          href="/dashboard/parent/cari-nanny"
          aria-label={`Buka AI Talent Pool, sisa ${talentPoolRemaining} koneksi`}
          className="flex items-center justify-between bg-[#E5F6F4] border border-[#A8DDD8] rounded-[16px] p-3.5 mb-4 hover:bg-[#D0EEE9] transition-colors"
        >
          <div>
            <p className="text-[12px] font-bold text-[#1E4A45]">AI Talent Pool</p>
            <p className="text-[11px] text-[#2C5F5A] mt-0.5">Browse nanny terverifikasi · Sisa {talentPoolRemaining}× koneksi</p>
          </div>
          <span aria-hidden="true" className="text-[#5BBFB0] font-bold text-[14px] flex-shrink-0 ml-3">→</span>
        </a>
      ) : (
        <div className="flex items-center justify-between bg-white border border-[#E0D0F0] rounded-[16px] p-3.5 mb-4">
          <div>
            <p className="text-[12px] font-bold text-[#5A3A7A]">AI Talent Pool</p>
            <p className="text-[11px] text-[#999AAA] mt-0.5">Browse 100+ nanny terverifikasi — khusus pelanggan</p>
          </div>
          <a
            href="/dashboard/parent/subscription"
            className="flex-shrink-0 ml-3 inline-flex items-center text-[11px] font-semibold bg-[#F3EEF8] text-[#5A3A7A] border border-[#C8B8DC] px-2.5 py-1.5 rounded-[8px] whitespace-nowrap hover:bg-[#E8DEF5] transition-colors min-h-[48px]"
          >
            Upgrade →
          </a>
        </div>
      )}

      {/* Invited nannies */}
      {invitedNannies.length > 0 && (
        <>
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Nanny yang sudah diundang</p>
          <div className="space-y-2">
            {invitedNannies.map(n => {
              const st = statusLabel(n.status)
              return (
                <Link key={n.id} href={`/dashboard/parent/matching/${n.id}`}>
                  <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-3.5 flex justify-between items-center hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#F3EEF8] border-2 border-[#E0D0F0] flex items-center justify-center font-semibold text-[13px] text-[#5A3A7A]">
                        {n.nannyName.split(" ").map(w => w[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#5A3A7A]">{n.nannyName}</p>
                        <p className="text-[11px] text-[#999AAA]">
                          {d(n.updatedAt)!.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[11px] font-semibold border px-2.5 py-0.5 rounded-full ${st.color}`}>
                      {st.label}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}

    </div>
  )
}
