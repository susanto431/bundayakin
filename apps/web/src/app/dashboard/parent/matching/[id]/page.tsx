import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import { StartMatchingButton } from "@/components/matching/StartMatchingButton"

export const metadata = { title: "Laporan Kecocokan — BundaYakin" }

export default async function MatchingResultPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) notFound()

  const request = await prisma.matchingRequest.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      status: true,
      parentProfile: { select: { userId: true, surveyCompletedAt: true } },
      nannyProfile: {
        select: {
          userId: true,
          fullName: true,
          city: true,
          surveyCompletedAt: true,
        },
      },
      matchingResult: {
        select: {
          scoreOverall: true,
          scoreDomainA: true,
          scoreDomainB: true,
          scoreDomainC: true,
          negotiationPoints: true,
          mismatchAreas: true,
          matchHighlights: true,
          tipsForParent: true,
        },
      },
      updatedAt: true,
    },
  })

  if (!request || request.parentProfile?.userId !== session.user.id) notFound()

  const result = request.matchingResult
  const nannyName = request.nannyProfile?.fullName ?? "Nanny"
  const nannyUserId = request.nannyProfile?.userId ?? ""
  const score = result ? Math.round(result.scoreOverall) : null

  const domainA = result?.scoreDomainA ? Math.round(result.scoreDomainA) : null
  const domainB = result?.scoreDomainB ? Math.round(result.scoreDomainB) : null
  const domainC = result?.scoreDomainC ? Math.round(result.scoreDomainC) : null

  const dateStr = request.updatedAt.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })

  const bothSurveyDone =
    !!request.parentProfile?.surveyCompletedAt &&
    !!request.nannyProfile?.surveyCompletedAt

  const isProcessable =
    (request.status === "PENDING" || request.status === "PROCESSING") && bothSurveyDone

  function scoreColor(s: number | null) {
    if (s === null) return "#5BBFB0"
    return s >= 70 ? "#5BBFB0" : "#E07B39"
  }

  function scoreTextColor(s: number | null) {
    if (s === null) return "text-[#5A3A7A]"
    return s >= 70 ? "text-[#5A3A7A]" : "text-[#E07B39]"
  }

  const verdictLabel = score !== null
    ? score >= 80 ? "Sangat Cocok" : score >= 65 ? "Cocok" : "Cukup Cocok"
    : "Menunggu"

  const negotiationPoints: string[] = result?.negotiationPoints ?? []
  const mismatchAreas: string[] = result?.mismatchAreas ?? []
  const matchHighlights: string[] = result?.matchHighlights ?? []
  const tipsForParent: string[] = result?.tipsForParent ?? []

  const discussPoints = negotiationPoints.length > 0 ? negotiationPoints : mismatchAreas

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-28">

      {/* Header */}
      <div className="border-b border-[#E0D0F0] pb-3 mb-4">
        <h1 className="text-[16px] font-bold text-[#5A3A7A]">Laporan kecocokan</h1>
        <p className="text-[12px] text-[#999AAA] mt-0.5">{nannyName} × Keluarga {session.user.name?.split(" ")[0]}</p>
      </div>

      {/* Pending state — waiting for nanny survey */}
      {!result && !isProcessable && (
        <div className="bg-[#FEF0E7] border border-[#F5C4A0] rounded-[16px] p-4 mb-4">
          <p className="text-[13px] font-bold text-[#A35320] mb-1">Menunggu nanny isi preferensi</p>
          <p className="text-[12px] text-[#7A4018] leading-relaxed">
            {nannyName} belum menyelesaikan survey. Laporan akan tersedia setelah keduanya selesai mengisi.
          </p>
        </div>
      )}

      {/* Ready to run — both surveys done but no result yet */}
      {isProcessable && (
        <div className="mb-4">
          <div className="bg-[#E5F6F4] border border-[#A8DDD8] rounded-[16px] p-4 mb-3">
            <p className="text-[13px] font-bold text-[#1E4A45] mb-1">Kedua pihak sudah isi preferensi</p>
            <p className="text-[12px] text-[#2C5F5A] leading-relaxed">
              Klik tombol di bawah untuk menjalankan AI dan mendapatkan laporan kecocokan.
            </p>
          </div>
          <StartMatchingButton nannyUserId={nannyUserId} />
        </div>
      )}

      {/* Big score */}
      {score !== null && (
        <div className="text-center py-4 mb-2">
          <div className="font-[var(--font-dm-serif)] leading-none" style={{ fontSize: "52px", color: "#2C5F5A" }}>
            {score}<span style={{ fontSize: "28px" }}>%</span>
          </div>
          <span className="inline-flex items-center text-[13px] font-semibold bg-[#E5F6F4] text-[#2C5F5A] border border-[#A8DDD8] px-3.5 py-1 rounded-full mt-2">
            {verdictLabel}
          </span>
          <p className="text-[11px] text-[#999AAA] mt-2">
            Berdasarkan preferensi kedua pihak · {dateStr}
          </p>
        </div>
      )}

      {/* Match highlights */}
      {matchHighlights.length > 0 && (
        <>
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Kesamaan & kekuatan</p>
          <div className="space-y-2 mb-4">
            {matchHighlights.map((point, i) => (
              <div key={i} className="bg-[#E5F6F4] border border-[#A8DDD8] rounded-[14px] px-3.5 py-2.5 flex items-start gap-2">
                <span className="text-[#5BBFB0] text-[14px] leading-none mt-0.5">✓</span>
                <p className="text-[13px] text-[#1E4A45] leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Score bars per domain */}
      {(domainA !== null || domainB !== null || domainC !== null) && (
        <>
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-3">Kecocokan per area</p>
          <div className="space-y-2.5 mb-4">
            {[
              { label: "Kondisi kerja & ekspektasi", score: domainA },
              { label: "Nilai & gaya hidup", score: domainB },
              { label: "Pengalaman & kemampuan", score: domainC },
            ].map(({ label, score: s }) => s !== null && (
              <div key={label} className="flex items-center gap-2.5">
                <p className="text-[12px] text-[#666666] w-[110px] flex-shrink-0 leading-tight">{label}</p>
                <div className="flex-1 bg-[#F3EEF8] rounded-full h-[7px]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${s}%`, background: scoreColor(s) }}
                  />
                </div>
                <span className={`text-[12px] font-bold w-9 text-right flex-shrink-0 ${scoreTextColor(s)}`}>
                  {s}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Discuss points */}
      {discussPoints.length > 0 && (
        <>
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2 mt-4">Perlu dibicarakan dulu</p>
          <div className="space-y-2 mb-4">
            {discussPoints.map((point, i) => {
              const [title, ...rest] = point.split(":")
              return (
                <div key={i} className="bg-[#FEF0E7] border border-[#F5C4A0] rounded-[16px] p-3.5">
                  <p className="text-[13px] font-bold text-[#A35320]">{title.trim()}</p>
                  {rest.length > 0 && (
                    <p className="text-[12px] text-[#7A4018] mt-1 leading-relaxed">{rest.join(":").trim()}</p>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Tips for parent */}
      {tipsForParent.length > 0 && (
        <>
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2 mt-4">Saran untuk Bunda</p>
          <div className="bg-[#F3EEF8] border border-[#C8B8DC] rounded-[16px] p-3.5 mb-4 space-y-2">
            {tipsForParent.map((tip, i) => (
              <p key={i} className="text-[12px] text-[#5A3A7A] leading-relaxed">• {tip}</p>
            ))}
          </div>
        </>
      )}

      {/* Upsell — only show if result exists */}
      {result && (
        <>
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2 mt-4">Ingin hasil yang lebih lengkap?</p>
          <div className="space-y-2 mb-4">
            <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-3.5 flex justify-between items-start">
              <div className="flex-1 mr-3">
                <p className="text-[13px] font-bold text-[#5A3A7A]">Tes kepribadian &amp; sikap kerja</p>
                <p className="text-[12px] text-[#999AAA] mt-1">Gambaran detail nanny</p>
              </div>
              <button className="flex-shrink-0 bg-[#E07B39] hover:bg-[#CC6B2A] text-white font-semibold text-[12px] px-3.5 py-1.5 rounded-[8px] min-h-[36px] transition-all">
                Rp 300rb
              </button>
            </div>
            <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-3.5 flex justify-between items-start">
              <div className="flex-1 mr-3">
                <p className="text-[13px] font-bold text-[#5A3A7A]">Penilaian langsung psikolog</p>
                <p className="text-[12px] text-[#999AAA] mt-1">Wawancara privat · saran kedua pihak</p>
              </div>
              <button className="flex-shrink-0 bg-[#E07B39] hover:bg-[#CC6B2A] text-white font-semibold text-[12px] px-3.5 py-1.5 rounded-[8px] min-h-[36px] transition-all">
                Rp 1jt
              </button>
            </div>
          </div>
        </>
      )}

      {/* CTAs */}
      {result && (
        <div className="space-y-2">
          <Link
            href={`/dashboard/parent/matching/${params.id}/placement`}
            className="w-full flex items-center justify-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] transition-all"
          >
            Terima nanny ini →
          </Link>
          <Link
            href="/dashboard/parent/matching"
            className="w-full flex items-center justify-center bg-transparent border-[1.5px] border-[#C8B8DC] text-[#666666] font-semibold text-[13px] min-h-[48px] rounded-[10px] hover:bg-[#F3EEF8] transition-all"
          >
            Cari kandidat lain
          </Link>
        </div>
      )}

    </div>
  )
}
