import { cachedAuth } from "@/lib/auth-server"
import { getNannyDashboard } from "@/lib/queries/nanny"
import { d } from "@/lib/date"
import Link from "next/link"
import { CopyButton } from "@/components/settings/CopyButton"

export const metadata = { title: "Dashboard Nanny — BundaYakin" }

const TIMING_LABEL: Record<string, string> = {
  WEEK_1: "Minggu ke-1",
  WEEK_2: "Minggu ke-2",
  MONTH_1: "Bulan ke-1",
  MONTH_3: "Bulan ke-3",
  QUARTERLY: "Evaluasi berkala",
}

export default async function NannyDashboardPage() {
  const session = await cachedAuth()

  const profile = session?.user?.id
    ? await getNannyDashboard(session.user.id)
    : null

  const fullName = profile?.fullName ?? session?.user?.name ?? ""
  const honorific = profile?.gender === "Laki-laki" ? "Kak" : "Sus"
  const referralCode = `BY-REF-${session?.user?.id?.slice(-4).toUpperCase() ?? "?????"}`

  const activeMatch = profile?.matchingRequests?.[0]
  const score = activeMatch?.matchingResult?.scoreOverall
    ? Math.round(activeMatch.matchingResult.scoreOverall)
    : null

  const assignment = profile?.nannyAssignments?.[0] ?? null
  const isWorking = !!assignment
  const now = new Date()

  const daysWorking = assignment
    ? Math.floor((now.getTime() - d(assignment.startDate)!.getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const BONUS_DAYS = 90
  const bonusDaysLeft = assignment ? Math.max(0, BONUS_DAYS - daysWorking) : 0
  const bonusEarned = daysWorking >= BONUS_DAYS

  const targetDate = assignment
    ? new Date(d(assignment.startDate)!.getTime() + BONUS_DAYS * 24 * 60 * 60 * 1000)
        .toLocaleDateString("id-ID", { day: "numeric", month: "long" })
    : null

  const startDateStr = assignment
    ? d(assignment.startDate)!.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
    : null

  const familyName = assignment?.parentProfile?.fullName
    ? assignment.parentProfile.fullName.split(" ")[0]
    : null
  const childName = assignment?.parentProfile?.children?.[0]?.name ?? "si Kecil"
  const childAge = assignment?.parentProfile?.children?.[0]?.ageGroup ?? ""

  const bonusPending = (profile?.referralsGiven ?? []).reduce(
    (sum, r) => sum + (!r.bonusPaidAt && r.bonusReferrerIDR ? r.bonusReferrerIDR : 0),
    0
  )

  const pendingEval = profile?.evaluations?.[0] ?? null
  const pendingCheckin = assignment?.checkins?.[0] ?? null
  const pendingTiming = pendingCheckin?.timing ?? pendingEval?.timing ?? null
  const pendingMonitoringAssignmentId = pendingCheckin
    ? (assignment?.id ?? null)
    : (pendingEval?.assignmentId ?? null)
  const hasPendingMonitoring = !!(pendingTiming && pendingMonitoringAssignmentId)
  const evalLabel = pendingTiming ? (TIMING_LABEL[pendingTiming] ?? pendingTiming) : null
  const evalFamilyName = pendingEval?.parentProfile?.fullName?.split(" ")[0] ?? familyName ?? "keluarga"

  function formatRupiah(amount: number) {
    return `Rp ${Math.round(amount / 1000)}rb`
  }

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-28">

      {/* Greeting */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-[11px] text-[#999AAA]">Halo,</p>
          <p className="font-[var(--font-dm-serif)] text-[20px] text-[#5A3A7A]">{honorific} {fullName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/nanny/notifications"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F3EEF8] border border-[#E0D0F0] text-[16px] hover:border-[#A97CC4] transition-colors"
            aria-label="Notifikasi"
          >
            🔔
          </Link>
          {isWorking && (
            <span className="text-[11px] font-semibold bg-[#E5F6F4] text-[#2C5F5A] border border-[#A8DDD8] px-2.5 py-1 rounded-full">
              Aktif bekerja
            </span>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 bg-white border border-[#E0D0F0] rounded-[14px] p-3.5">
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-1.5">Kecocokan</p>
          <p className="font-[var(--font-dm-serif)] text-[20px] leading-none text-[#5A3A7A]">
            {score !== null ? `${score}%` : "—"}
          </p>
        </div>
        <div className="flex-1 bg-white border border-[#E0D0F0] rounded-[14px] p-3.5">
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-1.5">Hari bekerja</p>
          <p className="font-[var(--font-dm-serif)] text-[20px] leading-none text-[#5A3A7A]">
            {isWorking ? daysWorking : "—"}
          </p>
        </div>
        <div className="flex-1 bg-white border border-[#E0D0F0] rounded-[14px] p-3.5">
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-1.5">Bonus menunggu</p>
          <p className="font-[var(--font-dm-serif)] text-[16px] leading-none text-[#E07B39]">
            {bonusPending > 0 ? formatRupiah(bonusPending) : "—"}
          </p>
        </div>
      </div>

      {/* Active family card */}
      {isWorking && (
        <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-3.5 mb-3">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[14px] font-bold text-[#5A3A7A]">
                {familyName ? `Keluarga ${familyName}` : "Penempatan aktif"}
              </p>
              <p className="text-[12px] text-[#999AAA] mt-0.5">
                {startDateStr ? `Mulai ${startDateStr} · ` : ""}
                {childName}{childAge ? ` (${childAge})` : ""}
                {profile?.city ? ` · ${profile.city}` : ""}
              </p>
            </div>
            <span className="text-[11px] font-semibold bg-[#E5F6F4] text-[#2C5F5A] border border-[#A8DDD8] px-2 py-0.5 rounded-full">
              Aktif
            </span>
          </div>
          {score !== null && (
            <div className="bg-[#F3EEF8] rounded-full h-[7px] overflow-hidden">
              <div className="h-full rounded-full bg-[#A97CC4] transition-all" style={{ width: `${score}%` }} />
            </div>
          )}
        </div>
      )}

      {/* Bonus countdown */}
      {isWorking && !bonusEarned && (
        <div className="bg-[#FEF0E7] border border-[#F5C4A0] rounded-[16px] p-3.5 mb-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[13px] font-bold text-[#A35320]">Bonus bertahan 3 bulan</p>
              <p className="text-[12px] text-[#7A4018] mt-0.5">
                {targetDate ? `Bertahan sampai ${targetDate} → Rp 150.000` : "Bertahan 90 hari → Rp 150.000"}
              </p>
            </div>
            <span className="text-[11px] font-semibold bg-[#FEF0E7] text-[#A35320] border border-[#F5C4A0] px-2.5 py-0.5 rounded-full flex-shrink-0 ml-2">
              {bonusDaysLeft} hari lagi
            </span>
          </div>
        </div>
      )}

      {isWorking && bonusEarned && (
        <div className="bg-[#E5F6F4] border border-[#A8DDD8] rounded-[16px] p-3.5 mb-3">
          <p className="text-[13px] font-bold text-[#1E4A45]">Bonus bertahan Rp 150.000 sudah bisa dicairkan 🎉</p>
          <p className="text-[12px] text-[#2C5F5A] mt-0.5">Hubungi tim BundaYakin untuk pencairan bonus.</p>
        </div>
      )}

      {/* Pending monitoring */}
      {hasPendingMonitoring && (
        <>
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Pemantauan perlu diisi</p>
          <div className="bg-[#F3EEF8] border border-[#E0D0F0] rounded-[16px] p-3.5 mb-3">
            <p className="text-[13px] font-bold text-[#5A3A7A]">{evalLabel} — dari sisi {honorific}</p>
            <p className="text-[12px] text-[#5A3A7A] mt-0.5 leading-relaxed">
              Keluarga {evalFamilyName} juga sedang mengisi. Hasilnya kami kompilasikan.
            </p>
            <Link
              href={`/dashboard/nanny/monitoring?assignmentId=${pendingMonitoringAssignmentId}&timing=${pendingTiming}`}
              className="mt-2.5 inline-flex items-center bg-[#A97CC4] hover:bg-[#5A3A7A] text-white font-semibold text-[12px] px-3.5 py-1.5 rounded-[8px] min-h-[36px] transition-all"
            >
              Isi sekarang
            </Link>
          </div>
        </>
      )}

      {/* Psikotes nudge */}
      {!profile?.surveyCompletedAt && (
        <>
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">
            Tes Kecocokan — belum diisi
          </p>
          <div className="bg-[#F3EEF8] border-[1.5px] border-[#E0D0F0] rounded-[14px] p-3.5 mb-3">
            <p className="text-[13px] font-bold text-[#5A3A7A] mb-1.5">Tingkatkan peluang dapat keluarga yang cocok</p>
            <ul className="text-[12px] text-[#666666] pl-4 leading-[1.8] list-disc mb-2.5">
              <li>{honorific} 2× lebih mudah dicocokkan setelah mengisi Tes Kecocokan</li>
              <li>Dapat tips personal cara kerja sesuai karakter {honorific}</li>
              <li>Badge &ldquo;Sudah Tes Kecocokan&rdquo; di profil {honorific}</li>
            </ul>
            <Link
              href="/dashboard/nanny/survey"
              className="inline-flex items-center bg-[#A97CC4] hover:bg-[#5A3A7A] text-white font-semibold text-[12px] px-3.5 py-1.5 rounded-[8px] min-h-[36px] transition-all"
            >
              Isi Tes Kecocokan →
            </Link>
          </div>
        </>
      )}

      {/* Referral code */}
      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Kode rekomendasimu</p>
      <div className="bg-[#F3EEF8] border-2 border-dashed border-[#C8B8DC] rounded-[16px] p-4 text-center">
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
          <CopyButton text={referralCode} />
        </div>
      </div>

    </div>
  )
}
