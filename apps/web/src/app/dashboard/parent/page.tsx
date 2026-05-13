import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { CopyButton } from "@/components/settings/CopyButton"
import LinkedInModeSection from "@/components/matching/LinkedInModeSection"

export const metadata = { title: "Beranda — BundaYakin" }

export default async function ParentDashboardPage() {
  const session = await auth()
  const firstName = session?.user?.name?.split(" ")[0] ?? "Bunda"

  const profile = session?.user?.id
    ? await prisma.parentProfile.findUnique({
        where: { userId: session.user.id },
        select: {
          id: true,
          city: true,
          surveyCompletedAt: true,
          matchingUsedCount: true,
          matchingResetAt: true,
          createdAt: true,
          subscription: { select: { status: true, startDate: true, endDate: true } },
          children: { orderBy: { createdAt: "asc" }, take: 1, select: { id: true, name: true } },
          matchingRequests: {
            orderBy: { updatedAt: "desc" },
            take: 1,
            select: {
              id: true, status: true, updatedAt: true,
              nannyProfile: { select: { fullName: true, city: true } },
              matchingResult: { select: { scoreOverall: true } },
            },
          },
          evaluations: {
            select: { timing: true, status: true, parentDoneAt: true },
          },
          nannyAssignments: {
            where: { isActive: true },
            take: 1,
            select: { id: true },
          },
          unlockedNannies: { select: { nannyId: true } },
        },
      })
    : null

  const subscription = profile?.subscription
  const isPaid =
    subscription?.status === "ACTIVE" &&
    subscription?.endDate != null &&
    subscription.endDate > new Date()
  const matchingLimit = isPaid ? 10 : 3

  // Cek apakah counter masih dalam window yang berlaku
  const now = new Date()
  const windowActive = profile?.matchingResetAt && profile.matchingResetAt > now
  const matchingUsed = windowActive ? (profile?.matchingUsedCount ?? 0) : 0
  const matchingRemaining = Math.max(0, matchingLimit - matchingUsed)

  const activeMatch = profile?.matchingRequests?.[0]
  const nannyName = activeMatch?.nannyProfile?.fullName ?? null
  const score = activeMatch?.matchingResult?.scoreOverall ? Math.round(activeMatch.matchingResult.scoreOverall) : null
  const hasPendingMonitoring = !!activeMatch && activeMatch.status === "COMPLETED"

  const referralCode = `BY-REF-${session?.user?.id?.slice(-4).toUpperCase() ?? "4829"}`

  const evals = profile?.evaluations ?? []
  const hasActiveAssignment = (profile?.nannyAssignments?.length ?? 0) > 0

  const isDone = (timing: string) =>
    evals.some(e => e.timing === timing && !!e.parentDoneAt)

  const TIMINGS = ["WEEK_1", "WEEK_2", "MONTH_1", "MONTH_3"] as const
  const nextPending = hasActiveAssignment ? TIMINGS.find(t => !isDone(t)) ?? null : null

  const timelineItems = [
    {
      timing: "WEEK_1",
      label: isDone("WEEK_1") ? "Kabar minggu ke-1 ✓" : "Kabar minggu ke-1",
      sub: isDone("WEEK_1") ? "Sudah diisi kedua pihak" : "5 pertanyaan singkat",
    },
    {
      timing: "WEEK_2",
      label: isDone("WEEK_2") ? "Kabar minggu ke-2 ✓" : "Kabar minggu ke-2",
      sub: isDone("WEEK_2") ? "Sudah diisi kedua pihak" : "5 pertanyaan singkat",
    },
    {
      timing: "MONTH_1",
      label: nextPending === "MONTH_1" ? "Pemantauan bulan ke-1 → isi sekarang" : isDone("MONTH_1") ? "Pemantauan bulan ke-1 ✓" : "Pemantauan bulan ke-1",
      sub: isDone("MONTH_1") ? "Sudah diisi kedua pihak" : "10 pertanyaan · hasil untuk kedua pihak",
    },
    {
      timing: "MONTH_3",
      label: nextPending === "MONTH_3" ? "Pemantauan bulan ke-3 → isi sekarang" : isDone("MONTH_3") ? "Pemantauan bulan ke-3 ✓" : "Pemantauan bulan ke-3",
      sub: isDone("MONTH_3") ? "Sudah diisi kedua pihak" : "Momen keputusan: lanjut atau ganti nanny",
    },
  ]

  // Nanny openToJob untuk LinkedIn mode (sama kota jika ada, maks 5)
  const unlockedIds = (profile?.unlockedNannies ?? []).map(u => u.nannyId)
  const openToJobNannies = profile
    ? await prisma.nannyProfile.findMany({
        where: {
          openToJob: true,
          isAvailable: true,
          ...(profile.city ? { city: profile.city } : {}),
        },
        select: {
          id: true,
          city: true,
          yearsOfExperience: true,
          nannyType: true,
          preferredAgeGroup: true,
        },
        take: 5,
        orderBy: { updatedAt: "desc" },
      })
    : []

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-28">

      {/* Greeting */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-[11px] text-[#999AAA]">Selamat datang,</p>
          <p className="font-[var(--font-dm-serif)] text-[20px] text-[#5A3A7A]"><em>Bunda</em> {firstName}</p>
        </div>
        {isPaid && (
          <span className="text-[11px] font-semibold bg-[#E5F6F4] text-[#2C5F5A] border border-[#A8DDD8] px-2.5 py-1 rounded-full">
            Aktif
          </span>
        )}
      </div>

      {/* Alert pending monitoring */}
      {hasPendingMonitoring && nannyName && (
        <div className="bg-[#FAEAEA] border-l-4 border-[#C75D5D] rounded-r-[12px] px-3.5 py-3 mb-4">
          <p className="text-[13px] font-bold text-[#C75D5D]">Perlu perhatian segera</p>
          <p className="text-[12px] text-[#A04040] mt-1 leading-relaxed">
            Pemantauan bulan ke-1 belum diisi. {nannyName} sudah mengisi dari sisinya.
          </p>
          <Link
            href="/dashboard/parent/monitoring"
            className="mt-2 inline-flex items-center bg-[#FAEAEA] border border-[#C75D5D] text-[#C75D5D] font-semibold text-[12px] px-3.5 py-1.5 rounded-[8px] min-h-[36px] hover:bg-[#C75D5D] hover:text-white transition-all"
          >
            Isi sekarang
          </Link>
        </div>
      )}

      {/* Subscription banner (if not active) */}
      {!isPaid && (
        <div className="bg-[#5A3A7A] rounded-[20px] p-4 mb-4 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#A97CC4]/20 rounded-full" />
          <div className="relative z-10">
            <p className="text-[10px] font-bold tracking-[2px] uppercase text-[#A8DDD8] mb-1">Langganan BundaYakin</p>
            <p className="text-white font-semibold text-[15px] mb-0.5">Aktifkan akses penuh</p>
            <p className="text-white/60 text-[12px] mb-3">Matching 10×/bln, evaluasi, monitoring &amp; data anak</p>
            <Link
              href="/dashboard/parent/subscription"
              className="inline-flex items-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white text-[13px] font-semibold px-4 py-2 rounded-[10px] min-h-[40px] transition-all"
            >
              Mulai — Rp 500.000/tahun
            </Link>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 bg-white border border-[#E0D0F0] rounded-[14px] p-3.5">
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-1.5">Kecocokan</p>
          <p className="font-[var(--font-dm-serif)] text-[26px] text-[#5A3A7A] leading-none mb-1">
            {score !== null ? `${score}%` : "—"}
          </p>
          <p className="text-[11px] text-[#999AAA]">
            {score !== null ? <span className="text-[#5BBFB0] font-semibold">Cocok</span> : "Belum ada matching"}
            {score !== null && " berdasarkan preferensi"}
          </p>
        </div>
        <div className="flex-1 bg-white border border-[#E0D0F0] rounded-[14px] p-3.5">
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-1.5">Sisa matching</p>
          <p className="font-[var(--font-dm-serif)] text-[26px] text-[#5A3A7A] leading-none mb-1">
            {matchingRemaining}×
          </p>
          <p className="text-[11px] text-[#999AAA]">
            {isPaid ? "dari 10×/30 hari" : "gratis / 30 hari"}
          </p>
        </div>
      </div>

      {/* LinkedIn mode — nanny tersedia */}
      {openToJobNannies.length > 0 && (
        <LinkedInModeSection
          nannies={openToJobNannies.map(n => ({
            id: n.id,
            city: n.city ?? "",
            yearsOfExperience: n.yearsOfExperience ?? 0,
            nannyType: n.nannyType,
            isUnlocked: unlockedIds.includes(n.id),
          }))}
          isPaid={isPaid}
        />
      )}

      {/* Active nanny card */}
      {nannyName && score !== null && (
        <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-3.5 mb-4 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-2.5">
            <div className="w-11 h-11 rounded-full bg-[#F3EEF8] border-2 border-[#E0D0F0] flex items-center justify-center font-bold text-[16px] text-[#5A3A7A] flex-shrink-0">
              {nannyName.split(" ").map(w => w[0]).slice(0, 2).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[14px] font-bold text-[#5A3A7A]">{nannyName}</p>
                  <p className="text-[12px] text-[#999AAA] mt-0.5">
                    {activeMatch?.nannyProfile?.city ?? "Jakarta"} · Menginap
                  </p>
                </div>
                <span className="text-[11px] font-semibold bg-[#E5F6F4] text-[#2C5F5A] border border-[#A8DDD8] px-2 py-0.5 rounded-full">Cocok {score}%</span>
              </div>
              <div className="bg-[#F3EEF8] rounded-full h-[7px] overflow-hidden mt-2">
                <div className="h-full rounded-full bg-[#5BBFB0] transition-all" style={{ width: `${score}%` }} />
              </div>
              <p className="text-[11px] text-[#999AAA] mt-1">Kecocokan berdasarkan preferensi kedua pihak</p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline pemantauan */}
      {isPaid && (
        <>
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-3">Pemantauan berkala</p>
          <div className="relative pl-5 mb-4">
            <div className="absolute left-[7px] top-1 bottom-1 w-[2px] bg-[#E0D0F0]" />
            {timelineItems.map((item) => {
              const done = isDone(item.timing)
              const active = nextPending === item.timing
              const href = done
                ? `/dashboard/parent/monitoring/summary?timing=${item.timing}`
                : active
                ? `/dashboard/parent/monitoring?timing=${item.timing}`
                : null

              const inner = (
                <>
                  <div className={`absolute -left-[17px] top-[3px] w-[10px] h-[10px] rounded-full border-2 border-[#FDFBFF] ${done ? "bg-[#5BBFB0]" : active ? "bg-[#E07B39]" : "bg-[#C8B8DC]"}`} />
                  <p className={`text-[13px] font-semibold ${active ? "text-[#E07B39]" : done ? "text-[#5A3A7A]" : "text-[#999AAA]"}`}>{item.label}</p>
                  <p className="text-[11px] text-[#999AAA] mt-0.5">{item.sub}</p>
                </>
              )

              return href ? (
                <Link key={item.timing} href={href} className="relative mb-3.5 block hover:opacity-80 transition-opacity">
                  {inner}
                </Link>
              ) : (
                <div key={item.timing} className="relative mb-3.5">
                  {inner}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Referral code */}
      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Kode rekomendasimu</p>
      <div className="bg-[#F3EEF8] border-2 border-dashed border-[#C8B8DC] rounded-[16px] p-4 mb-4 text-center">
        <p className="text-[11px] text-[#999AAA] mb-1">Bagikan ke teman atau penyalur nanny</p>
        <p className="font-[var(--font-dm-serif)] text-[24px] tracking-[4px] text-[#5A3A7A] my-1.5">{referralCode}</p>
        <p className="text-[11px] text-[#999AAA] mb-3 leading-relaxed">Dapat Rp 100rb saat terjadi penempatan nanny via kode ini</p>
        <div className="flex gap-2 justify-center">
          <a
            href={`https://api.whatsapp.com/send?text=Gunakan%20kode%20${referralCode}%20di%20BundaYakin%20untuk%20menemukan%20nanny%20terpercaya%20%F0%9F%91%B6`}
            target="_blank" rel="noreferrer"
            className="inline-flex items-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[12px] px-3.5 py-1.5 rounded-[8px] min-h-[36px] transition-all"
          >
            Kirim via WA
          </a>
          <CopyButton text={referralCode} />
        </div>
      </div>

      {/* Add-on upsell */}
      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Ingin tahu lebih dalam?</p>
      {nannyName ? (
        <div className="bg-[#FEF0E7] border border-[#F5C4A0] rounded-[16px] p-3.5">
          <div className="flex justify-between items-start">
            <div className="flex-1 mr-3">
              <p className="text-[13px] font-bold text-[#A35320]">Tes kepribadian &amp; sikap kerja {nannyName.split(" ")[0]}</p>
              <p className="text-[12px] text-[#7A4018] mt-1">Gambaran lebih lengkap tentang nanny</p>
            </div>
            <button className="flex-shrink-0 bg-[#E07B39] hover:bg-[#CC6B2A] text-white font-semibold text-[12px] px-3.5 py-1.5 rounded-[8px] min-h-[36px] transition-all">
              Rp 300rb
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-3.5 text-center">
          <p className="text-[13px] text-[#999AAA]">Undang nanny untuk mulai matching</p>
          <Link
            href="/dashboard/parent/matching"
            className="mt-2.5 inline-flex items-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[13px] px-4 py-2 rounded-[10px] min-h-[40px] transition-all"
          >
            Cari Nanny →
          </Link>
        </div>
      )}

    </div>
  )
}
