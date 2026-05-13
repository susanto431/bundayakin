import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { CopyButton } from "@/components/settings/CopyButton"

export const metadata = { title: "Referral — BundaYakin" }

export default async function ReferralPage() {
  const session = await auth()

  const referralCode = `BY-REF-${session?.user?.id?.slice(-4).toUpperCase() ?? "0000"}`

  const profile = session?.user?.id
    ? await prisma.parentProfile.findUnique({
        where: { userId: session.user.id },
        select: {
          referralsGiven: {
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              refereeType: true,
              refereeName: true,
              status: true,
              bonusIDR: true,
              bonusPaidAt: true,
              dealAt: true,
              createdAt: true,
              updatedAt: true,
              notes: true,
            },
          },
        },
      })
    : null

  const referrals = profile?.referralsGiven ?? []
  const parentReferrals = referrals.filter(r => r.refereeType === "PARENT")
  const nannyReferrals = referrals.filter(r => r.refereeType === "NANNY")

  const totalEarned = referrals
    .filter(r => r.status === "PAID" && r.bonusIDR)
    .reduce((sum, r) => sum + (r.bonusIDR ?? 0), 0)

  const totalPending = referrals
    .filter(r => r.status === "DEAL" && r.bonusIDR)
    .reduce((sum, r) => sum + (r.bonusIDR ?? 0), 0)

  const successCount = referrals.filter(r => r.status === "PAID").length

  function statusBadge(status: string) {
    if (status === "PAID") return { label: "Fee masuk", color: "bg-[#E5F6F4] text-[#2C5F5A] border-[#A8DDD8]" }
    if (status === "DEAL") return { label: "Menunggu konfirmasi", color: "bg-[#FEF0E7] text-[#A35320] border-[#F5C4A0]" }
    if (status === "REGISTERED") return { label: "Sudah daftar", color: "bg-[#EEF2FC] text-[#5B7EC9] border-[#B5C8EF]" }
    return { label: "Menunggu", color: "bg-white text-[#999AAA] border-[#E0D0F0]" }
  }

  function initials(name?: string | null) {
    if (!name) return "?"
    return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
  }

  function formatDate(d: Date) {
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
  }

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-28">

      {/* Header */}
      <div className="border-b border-[#E0D0F0] pb-3 mb-4">
        <h1 className="text-[16px] font-bold text-[#5A3A7A]">Referral saya</h1>
        <p className="text-[12px] text-[#999AAA] mt-0.5">Pantau siapa yang bergabung lewat kode rekomendasimu</p>
      </div>

      {/* Stat cards */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 bg-white border border-[#E0D0F0] rounded-[14px] p-3.5">
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-1.5">Total diterima</p>
          <p className="font-[var(--font-dm-serif)] text-[20px] leading-none mb-1" style={{ color: "#2C5F5A" }}>
            {totalEarned > 0 ? `Rp ${(totalEarned / 1000).toFixed(0)}rb` : "Rp 0"}
          </p>
          <p className="text-[11px] text-[#999AAA]">
            {successCount > 0
              ? <><span className="text-[#5BBFB0] font-semibold">{successCount} referral</span> berhasil</>
              : "Belum ada referral"}
          </p>
        </div>
        <div className="flex-1 bg-white border border-[#E0D0F0] rounded-[14px] p-3.5">
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-1.5">Diproses</p>
          <p className="font-[var(--font-dm-serif)] text-[20px] leading-none mb-1 text-[#E07B39]">
            {totalPending > 0 ? `Rp ${(totalPending / 1000).toFixed(0)}rb` : "Rp 0"}
          </p>
          <p className="text-[11px] text-[#999AAA]">
            {totalPending > 0 ? "Menunggu konfirmasi" : "Tidak ada yang pending"}
          </p>
        </div>
      </div>

      {/* Referred parents */}
      {parentReferrals.length > 0 && (
        <>
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Merekomendasikan orang tua</p>
          <div className="space-y-2 mb-4">
            {parentReferrals.map(r => {
              const badge = statusBadge(r.status)
              return (
                <div key={r.id} className="bg-white border border-[#E0D0F0] rounded-[16px] p-3.5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-[#E5F6F4] border-2 border-[#A8DDD8] flex items-center justify-center font-semibold text-[12px] text-[#2C5F5A]">
                        {initials(r.refereeName)}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#5A3A7A]">{r.refereeName ?? "Orang tua"}</p>
                        <p className="text-[11px] text-[#999AAA]">
                          Daftar lewat kodemu · {formatDate(r.createdAt)}
                          {r.dealAt && ` · deal ${formatDate(r.dealAt)}`}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[11px] font-semibold border px-2.5 py-0.5 rounded-full ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                  {r.status === "PAID" && r.bonusIDR && (
                    <p className="text-[12px] font-bold text-[#2C5F5A] mt-2.5">
                      + Rp {r.bonusIDR.toLocaleString("id-ID")} sudah ditransfer ke rekeningmu
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Referred nannies */}
      {nannyReferrals.length > 0 && (
        <>
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Merekomendasikan nanny</p>
          <div className="space-y-2 mb-4">
            {nannyReferrals.map(r => {
              const badge = statusBadge(r.status)
              return (
                <div key={r.id} className="bg-white border border-[#E0D0F0] rounded-[16px] p-3.5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-[#F3EEF8] border-2 border-[#E0D0F0] flex items-center justify-center font-semibold text-[12px] text-[#5A3A7A]">
                        {initials(r.refereeName)}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#5A3A7A]">{r.refereeName ?? "Nanny"}</p>
                        <p className="text-[11px] text-[#999AAA]">Dapat kerja via BY · {formatDate(r.createdAt)}</p>
                      </div>
                    </div>
                    <span className={`text-[11px] font-semibold border px-2.5 py-0.5 rounded-full ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                  {r.notes && (
                    <p className="text-[12px] text-[#999AAA] mt-2">{r.notes}</p>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Empty state */}
      {referrals.length === 0 && (
        <div className="bg-[#F3EEF8] border border-[#C8B8DC] rounded-[16px] p-4 text-center mb-4">
          <p className="text-[13px] font-semibold text-[#5A3A7A] mb-1">Belum ada referral</p>
          <p className="text-[12px] text-[#999AAA] leading-relaxed">
            Bagikan kode di bawah ke teman atau nanny kenalan Bunda. Setiap referral yang berhasil dapat bonus.
          </p>
        </div>
      )}

      {/* Referral code */}
      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Kode rekomendasimu</p>
      <div className="bg-[#F3EEF8] border-2 border-dashed border-[#C8B8DC] rounded-[16px] p-4 mb-3 text-center">
        <p className="text-[11px] text-[#999AAA] mb-1">Bagikan ke siapa saja — untuk orang tua maupun nanny</p>
        <p className="font-[var(--font-dm-serif)] text-[24px] tracking-[4px] text-[#5A3A7A] my-1.5">{referralCode}</p>
        <p className="text-[11px] text-[#999AAA] mb-3 leading-relaxed">
          OT: Rp 100rb (jangka panjang) / Rp 75rb (temporer)<br />
          Nanny: Rp 75rb saat deal + Rp 125rb jika bertahan 3 bln
        </p>
        <div className="flex gap-2 justify-center">
          <a
            href={`https://wa.me/?text=Gunakan%20kode%20${referralCode}%20saat%20daftar%20di%20BundaYakin`}
            target="_blank" rel="noreferrer"
            className="inline-flex items-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[12px] px-3.5 py-1.5 rounded-[8px] min-h-[36px] transition-all"
          >
            Kirim via WA
          </a>
          <CopyButton text={referralCode} />
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/dashboard/parent/terms"
          className="text-[12px] text-[#5B7EC9] font-semibold hover:underline"
        >
          Lihat syarat &amp; ketentuan referral →
        </Link>
      </div>

    </div>
  )
}
