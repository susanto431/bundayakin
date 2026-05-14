import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const metadata = { title: "Bonus & Referral — BundaYakin" }

export default async function NannyReferralPage() {
  const session = await auth()

  const nannyProfile = session?.user?.id
    ? await prisma.nannyProfile.findUnique({
        where: { userId: session.user.id },
        select: {
          id: true,
          referralsGiven: {
            select: {
              id: true,
              status: true,
              bonusReferrerIDR: true,
              bonusPaidAt: true,
              hiredAt: true,
              month3At: true,
            },
          },
          nannyAssignments: {
            where: { isActive: true },
            orderBy: { startDate: "desc" },
            take: 1,
            select: {
              startDate: true,
              parentProfile: { select: { fullName: true } },
            },
          },
        },
      })
    : null

  const referralCode = `BY-REF-${session?.user?.id?.slice(-4).toUpperCase() ?? "?????"}`

  const referrals = nannyProfile?.referralsGiven ?? []
  const successfulReferrals = referrals.filter(r => r.status === "HIRED" || r.status === "MONTH_1" || r.status === "MONTH_3")
  const totalEarned = referrals.reduce((sum, r) => sum + (r.bonusPaidAt ? (r.bonusReferrerIDR ?? 0) : 0), 0)
  const pendingBonus = referrals.reduce((sum, r) => sum + (!r.bonusPaidAt ? (r.bonusReferrerIDR ?? 0) : 0), 0)

  const activeAssignment = nannyProfile?.nannyAssignments?.[0] ?? null
  const now = new Date()

  let daysWorked = 0
  let daysLeft = 0
  let progressPct = 0
  let targetDate: string | null = null
  let employerName: string | null = null

  if (activeAssignment) {
    const start = activeAssignment.startDate
    daysWorked = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const BONUS_DAYS = 90
    daysLeft = Math.max(0, BONUS_DAYS - daysWorked)
    progressPct = Math.min(100, Math.round((daysWorked / BONUS_DAYS) * 100))
    const target = new Date(start.getTime() + BONUS_DAYS * 24 * 60 * 60 * 1000)
    targetDate = target.toLocaleDateString("id-ID", { day: "numeric", month: "long" })
    employerName = activeAssignment.parentProfile?.fullName ?? null
  }

  const bonusEarned3Month = daysWorked >= 90

  function formatRupiah(amount: number) {
    if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)}jt`
    if (amount >= 1_000) return `Rp ${Math.round(amount / 1000)}rb`
    return `Rp ${amount}`
  }

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-28">

      <div className="border-b border-[#E0D0F0] pb-3 mb-4">
        <h1 className="text-[16px] font-bold text-[#5A3A7A]">Bonus &amp; referral</h1>
        <p className="text-[12px] text-[#999AAA] mt-0.5">Pantau bonus dan teman yang bergabung lewat kodemu</p>
      </div>

      {/* Stat cards */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 bg-white border border-[#E0D0F0] rounded-[14px] p-3.5">
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-1.5">Total diterima</p>
          <p className="font-[var(--font-dm-serif)] text-[20px] leading-none mb-1 text-[#5A3A7A]">
            {totalEarned > 0 ? formatRupiah(totalEarned) : "—"}
          </p>
          <p className="text-[11px] text-[#999AAA]">
            {successfulReferrals.length > 0
              ? <><span className="text-[#5BBFB0] font-semibold">{successfulReferrals.length} referral</span> berhasil</>
              : "Belum ada referral"}
          </p>
        </div>
        <div className="flex-1 bg-white border border-[#E0D0F0] rounded-[14px] p-3.5">
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-1.5">Bonus bertahan</p>
          <p className="font-[var(--font-dm-serif)] text-[20px] leading-none mb-1 text-[#E07B39]">Rp 150rb</p>
          <p className="text-[11px] text-[#999AAA]">
            {bonusEarned3Month ? "Sudah bisa dicairkan" : "Cair di bulan ke-3"}
          </p>
        </div>
      </div>

      {/* Pending bonus */}
      {pendingBonus > 0 && (
        <div className="bg-[#EEF2FC] border border-[#B5C8EF] rounded-[14px] p-3.5 mb-4">
          <p className="text-[13px] font-bold text-[#5B7EC9]">Bonus belum cair: {formatRupiah(pendingBonus)}</p>
          <p className="text-[12px] text-[#3A5A9A] mt-0.5 leading-relaxed">
            Menunggu konfirmasi tim BundaYakin. Akan ditransfer ke rekening terdaftar.
          </p>
        </div>
      )}

      {/* Bonus countdown */}
      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Bonus bertahan 3 bulan</p>
      {activeAssignment ? (
        <div className="bg-[#FEF0E7] border border-[#F5C4A0] rounded-[16px] p-3.5 mb-4">
          {bonusEarned3Month ? (
            <p className="text-[13px] font-bold text-[#A35320] mb-2">
              Selamat! Bonus Rp 150.000 sudah bisa dicairkan 🎉
            </p>
          ) : (
            <>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-[13px] font-bold text-[#A35320]">
                    Bertahan sampai {targetDate} → Rp 150.000
                  </p>
                  {employerName && (
                    <p className="text-[12px] text-[#7A4018] mt-0.5">Masih aktif bekerja di Keluarga {employerName.split(" ")[0]}</p>
                  )}
                </div>
                <span className="text-[11px] font-semibold bg-[#FEF0E7] text-[#A35320] border border-[#F5C4A0] px-2.5 py-0.5 rounded-full flex-shrink-0 ml-2">
                  {daysLeft} hari lagi
                </span>
              </div>
              <div className="bg-white rounded-full h-[7px] overflow-hidden">
                <div className="h-full rounded-full bg-[#E07B39]" style={{ width: `${progressPct}%` }} />
              </div>
              <p className="text-[11px] text-[#999AAA] mt-1">{daysWorked} dari 90 hari</p>
            </>
          )}
        </div>
      ) : (
        <div className="bg-[#F3EEF8] border border-[#C8B8DC] rounded-[16px] p-3.5 mb-4">
          <p className="text-[13px] font-semibold text-[#5A3A7A] mb-1">Belum ada penempatan aktif</p>
          <p className="text-[12px] text-[#999AAA] leading-relaxed">
            Bonus Rp 150.000 akan aktif saat kamu mulai bekerja di keluarga melalui BundaYakin dan bertahan 3 bulan.
          </p>
        </div>
      )}

      {/* Referral list */}
      {referrals.length > 0 && (
        <>
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Riwayat referral</p>
          <div className="space-y-2 mb-4">
            {referrals.map(r => {
              const statusLabel =
                r.status === "MONTH_3" ? "Bonus penuh cair" :
                r.status === "MONTH_1" ? "Bertahan 1 bulan" :
                r.status === "HIRED" ? "Sudah deal" :
                "Menunggu"
              const statusColor =
                r.status === "MONTH_3" ? "bg-[#E5F6F4] text-[#2C5F5A] border-[#A8DDD8]" :
                r.status === "HIRED" || r.status === "MONTH_1" ? "bg-[#EEF2FC] text-[#5B7EC9] border-[#B5C8EF]" :
                "bg-[#FEF0E7] text-[#A35320] border-[#F5C4A0]"
              return (
                <div key={r.id} className="flex items-center justify-between bg-white border border-[#E0D0F0] rounded-[14px] px-3.5 py-2.5">
                  <div>
                    <p className="text-[12px] font-semibold text-[#5A3A7A]">
                      {r.hiredAt ? r.hiredAt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </p>
                    {r.bonusReferrerIDR ? (
                      <p className="text-[11px] text-[#999AAA]">{formatRupiah(r.bonusReferrerIDR)}</p>
                    ) : null}
                  </div>
                  <span className={`text-[11px] font-semibold border px-2.5 py-0.5 rounded-full ${statusColor}`}>
                    {statusLabel}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Referral code */}
      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Kode rekomendasimu</p>
      <div className="bg-[#F3EEF8] border-2 border-dashed border-[#C8B8DC] rounded-[16px] p-4 mb-3 text-center">
        <p className="text-[11px] text-[#999AAA] mb-1">Ajak teman bergabung ke BundaYakin</p>
        <p className="font-[var(--font-dm-serif)] text-[24px] tracking-[4px] text-[#5A3A7A] my-1.5">{referralCode}</p>
        <p className="text-[11px] text-[#999AAA] mb-3 leading-relaxed">
          Orang tua: Rp 100rb/75rb · Nanny: Rp 75rb + Rp 125rb jika bertahan 3 bln
        </p>
        <div className="flex gap-2 justify-center">
          <a
            href={`https://wa.me/?text=Gunakan%20kode%20${referralCode}%20saat%20daftar%20di%20BundaYakin`}
            target="_blank" rel="noreferrer"
            className="inline-flex items-center bg-[#A97CC4] hover:bg-[#5A3A7A] text-white font-semibold text-[12px] px-3.5 py-1.5 rounded-[8px] min-h-[36px] transition-all"
          >
            Kirim via WA
          </a>
          <Link
            href="/dashboard/nanny/referral"
            className="inline-flex items-center bg-transparent border-[1.5px] border-[#C8B8DC] text-[#666666] font-semibold text-[12px] px-3.5 py-1.5 rounded-[8px] min-h-[36px] hover:bg-[#F3EEF8] transition-all"
          >
            Salin
          </Link>
        </div>
      </div>

    </div>
  )
}
