import { cachedAuth } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { cfStream } from "@/lib/cloudflare"
import { getEffectiveValue } from "@/lib/pricing-config"
import { scoreColor, scoreTextColor, verdictLabel } from "@/lib/score-display"
import { getKomparasiPreferensi } from "@/lib/preference-comparison"
import Image from "next/image"
import { notFound } from "next/navigation"
import UnlockContactButton from "@/components/matching/UnlockContactButton"
import ScoreRing from "@/components/matching/ScoreRing"
import KomparasiPreferensi from "@/components/matching/KomparasiPreferensi"
import SkillVideoFeed from "./SkillVideoFeed"

export const metadata = { title: "Profil Nanny — BundaYakin" }

const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"]

function formatPeriod(
  startMonth: number,
  startYear: number,
  endMonth: number | null,
  endYear: number | null,
  isOngoing: boolean,
) {
  const start = `${MONTHS[startMonth - 1]} ${startYear}`
  if (isOngoing) return `${start} – Sekarang`
  if (endMonth && endYear) return `${start} – ${MONTHS[endMonth - 1]} ${endYear}`
  return start
}

function formatSalary(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}jt`
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`
  return `Rp ${n.toLocaleString("id-ID")}`
}

const NANNY_TYPE_LABEL: Record<string, string> = {
  LIVE_IN: "Live-in",
  LIVE_OUT: "Live-out",
  INFAL: "Infal",
  TEMPORARY: "Sementara",
}

export default async function NannyProfilePage({ params }: { params: { nannyId: string } }) {
  const session = await cachedAuth()
  if (!session?.user?.id) notFound()

  const parentProfile = await prisma.parentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!parentProfile) notFound()

  const now = new Date()
  const [nanny, matchResult, quota] = await Promise.all([
    prisma.nannyProfile.findUnique({
      where: { id: params.nannyId },
      select: {
        fullName: true,
        bio: true,
        city: true,
        profilePhotoUrl: true,
        nannyType: true,
        yearsOfExperience: true,
        educationLevel: true,
        expectedSalaryMin: true,
        expectedSalaryMax: true,
        religion: true,
        skills: true,
        languages: true,
        media: {
          where: { isActive: true },
          select: { id: true, type: true, storageKey: true, slug: true, sortOrder: true },
          orderBy: { sortOrder: "asc" },
        },
        portfolios: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            title: true,
            description: true,
            startMonth: true,
            startYear: true,
            endMonth: true,
            endYear: true,
            isOngoing: true,
            media: {
              orderBy: { sortOrder: "asc" },
              select: { id: true, url: true },
            },
          },
        },
      },
    }),
    prisma.matchResult.findUnique({
      where: {
        parentProfileId_nannyProfileId: {
          parentProfileId: parentProfile.id,
          nannyProfileId: params.nannyId,
        },
      },
      select: {
        skorKeseluruhan: true,
        skorDomainA: true,
        skorDomainB: true,
        skorDomainC: true,
        kontakTerbuka: true,
      },
    }),
    prisma.connectionQuota.findFirst({
      where: { parentProfileId: parentProfile.id, periodEnd: { gt: now } },
      orderBy: { periodEnd: "desc" },
      select: { talentPoolUsed: true, talentPoolLimit: true },
    }),
  ])

  const guaranteeRow = await prisma.matchGuarantee.findFirst({
    where: { parentProfileId: parentProfile.id, status: "AVAILABLE" },
    select: { id: true },
  })
  const hasGuarantee = guaranteeRow != null
  const connectionAddonFeeIDR = await getEffectiveValue("CONNECTION_ADDON_FEE_IDR")
  // Komparasi Preferensi — dihitung deterministik dari SurveyResponse mentah, terpisah dari
  // skor AI di atas (bisa sesekali tidak sinkron dengan skorDomainA/B/C, lihat ADR-015).
  // Gratis, tidak dikunci Kuota Koneksi.
  const komparasiPreferensi = await getKomparasiPreferensi(parentProfile.id, params.nannyId)

  if (!nanny) notFound()

  const introVideo = nanny.media.find((m) => m.type === "INTRO_VIDEO")
  const skillVideoMedia = nanny.media.filter((m) => m.type === "SKILL_VIDEO")
  const portfolioPhotos = nanny.media.filter((m) => m.type === "PORTFOLIO_PHOTO")

  // Pre-compute thumbnail and embed URLs server-side (uses env vars)
  const skillVideos = skillVideoMedia.map((v) => ({
    id: v.id,
    slug: v.slug,
    thumbnailUrl: cfStream.thumbnailUrl(v.storageKey),
    embedUrl: cfStream.embedUrl(v.storageKey),
  }))

  const score = matchResult ? matchResult.skorKeseluruhan : null
  const domainA = matchResult?.skorDomainA ?? null
  const domainB = matchResult?.skorDomainB ?? null
  const domainC = matchResult?.skorDomainC ?? null
  const kontakTerbuka = matchResult?.kontakTerbuka ?? false

  const talentPoolRemaining = Math.max(
    0,
    (quota?.talentPoolLimit ?? 0) - (quota?.talentPoolUsed ?? 0)
  )

  const initials = nanny.fullName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-28">

      {/* Header */}
      <div className="flex items-center gap-4 mb-5">
        <div className="relative flex-shrink-0 w-[72px] h-[72px] rounded-full overflow-hidden bg-[#C8B8DC] flex items-center justify-center">
          {nanny.profilePhotoUrl ? (
            <Image
              src={nanny.profilePhotoUrl}
              alt={nanny.fullName}
              fill
              className="object-cover"
              sizes="72px"
            />
          ) : (
            <span className="text-[22px] font-bold text-white">{initials}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-[18px] font-bold text-[#5A3A7A] leading-tight truncate">
            {nanny.fullName}
          </h1>
          {nanny.city && (
            <p className="text-[13px] text-[#999AAA] mt-0.5">{nanny.city}</p>
          )}
          {nanny.nannyType.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {nanny.nannyType.map((t) => (
                <span
                  key={t}
                  className="text-[11px] font-semibold bg-[#E5F6F4] text-[#2C5F5A] border border-[#A8DDD8] px-2.5 py-0.5 rounded-full"
                >
                  {NANNY_TYPE_LABEL[t] ?? t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Score card */}
      {score !== null && (
        <div
          className="bg-white border border-[#E0D0F0] rounded-[16px] p-4 mb-4"
          style={{ boxShadow: "0 4px 16px rgba(90,58,122,0.07)" }}
        >
          <div className="flex flex-col items-center mb-4">
            <div className="relative" style={{ width: 132, height: 132 }}>
              <ScoreRing score={score} color={scoreColor(score)} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div
                  className="font-[var(--font-dm-serif)] leading-none"
                  style={{ fontSize: "40px", color: scoreColor(score) }}
                >
                  {score}<span style={{ fontSize: "20px" }}>%</span>
                </div>
              </div>
            </div>
            <span className="inline-flex items-center text-[12px] font-semibold bg-[#E5F6F4] text-[#2C5F5A] border border-[#A8DDD8] px-3 py-0.5 rounded-full mt-2">
              {verdictLabel(score)}
            </span>
          </div>
          <div className="space-y-2">
            {[
              { label: "Kondisi kerja & ekspektasi", s: domainA },
              { label: "Nilai & gaya hidup", s: domainB },
              { label: "Pengalaman & kemampuan", s: domainC },
            ].map(({ label, s }) => s !== null && (
              <div key={label} className="flex items-center gap-2.5">
                <p className="text-[11px] text-[#666666] w-[110px] flex-shrink-0 leading-tight">{label}</p>
                <div className="flex-1 bg-[#F3EEF8] rounded-full h-[6px]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${s}%`, background: scoreColor(s) }}
                  />
                </div>
                <span className={`text-[11px] font-bold w-8 text-right flex-shrink-0 ${scoreTextColor(s)}`}>
                  {s}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Komparasi Preferensi — perbandingan deterministik jawaban Bunda vs Nanny,
          terpisah & bisa sesekali tidak sinkron dengan skor AI di atas (lihat ADR-015). */}
      <KomparasiPreferensi aspects={komparasiPreferensi} />

      {/* Video Perkenalan — portrait aspect ratio */}
      {introVideo ? (
        <div className="mb-5">
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">
            Video Perkenalan
          </p>
          <div className="flex justify-center">
            <div className="w-full max-w-[260px] rounded-[14px] overflow-hidden border border-[#E0D0F0] bg-black"
              style={{ aspectRatio: "9/16" }}>
              <iframe
                src={cfStream.embedUrl(introVideo.storageKey)}
                className="w-full h-full"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                title="Video Perkenalan"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-5 border-2 border-dashed border-[#E0D0F0] rounded-[14px] p-5 text-center">
          <p className="text-[12px] text-[#999AAA]">Belum ada video perkenalan</p>
        </div>
      )}

      {/* Video Keahlian — horizontal card feed + fullscreen Swiper */}
      {skillVideos.length > 0 ? (
        <div className="mb-5">
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-3">
            Video Keahlian · {skillVideos.length} video
          </p>
          <SkillVideoFeed videos={skillVideos} />
        </div>
      ) : (
        <div className="mb-5">
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">
            Video Keahlian
          </p>
          <div className="border-2 border-dashed border-[#E0D0F0] rounded-[14px] p-5 text-center">
            <p className="text-[12px] text-[#999AAA]">Belum ada video keahlian</p>
          </div>
        </div>
      )}

      {/* Pengalaman / Portfolio Entries */}
      {nanny.portfolios.length > 0 && (
        <div className="mb-5">
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-3">
            Pengalaman
          </p>
          <div className="space-y-4">
            {nanny.portfolios.map((entry) => (
              <div key={entry.id} className="border-l-2 border-[#5BBFB0] pl-3">
                <p className="text-[13px] font-semibold text-[#5A3A7A]">{entry.title}</p>
                <p className="text-[11px] text-[#999AAA] mt-0.5">
                  {formatPeriod(entry.startMonth, entry.startYear, entry.endMonth, entry.endYear, entry.isOngoing)}
                </p>
                {entry.description && (
                  <p className="text-[12px] text-[#666666] mt-1 leading-relaxed">{entry.description}</p>
                )}
                {entry.media.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {entry.media.map((m) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={m.id} src={m.url} alt="foto" className="w-14 h-14 object-cover rounded-[8px]" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Galeri Foto Portfolio */}
      {portfolioPhotos.length > 0 && (
        <div className="mb-5">
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">
            Galeri Foto
          </p>
          <div className="grid grid-cols-3 gap-2">
            {portfolioPhotos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square rounded-[10px] overflow-hidden bg-[#F3EEF8]"
              >
                <Image
                  src={`${process.env.R2_PUBLIC_URL ?? "https://media.bundayakin.com"}/${photo.storageKey}`}
                  alt={photo.slug ?? "Foto"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 480px) 33vw, 160px"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bio & Detail Profil */}
      <div className="mb-5 space-y-4">
        {nanny.bio && (
          <div>
            <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-1.5">
              Tentang
            </p>
            <p className="text-[13px] text-[#666666] leading-relaxed">{nanny.bio}</p>
          </div>
        )}

        <div>
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">
            Detail Profil
          </p>
          <div className="bg-white border border-[#E0D0F0] rounded-[14px] divide-y divide-[#F3EEF8]">
            {nanny.yearsOfExperience !== null && nanny.yearsOfExperience !== undefined && (
              <div className="flex justify-between items-center px-4 py-2.5">
                <span className="text-[12px] text-[#999AAA]">Pengalaman</span>
                <span className="text-[13px] font-semibold text-[#5A3A7A]">
                  {nanny.yearsOfExperience} tahun
                </span>
              </div>
            )}
            {nanny.educationLevel && (
              <div className="flex justify-between items-center px-4 py-2.5">
                <span className="text-[12px] text-[#999AAA]">Pendidikan</span>
                <span className="text-[13px] font-semibold text-[#5A3A7A]">{nanny.educationLevel}</span>
              </div>
            )}
            {(nanny.expectedSalaryMin || nanny.expectedSalaryMax) && (
              <div className="flex justify-between items-center px-4 py-2.5">
                <span className="text-[12px] text-[#999AAA]">Ekspektasi gaji</span>
                <span className="text-[13px] font-semibold text-[#5A3A7A]">
                  {nanny.expectedSalaryMin && nanny.expectedSalaryMax
                    ? `${formatSalary(nanny.expectedSalaryMin)} – ${formatSalary(nanny.expectedSalaryMax)}`
                    : nanny.expectedSalaryMin
                    ? `mulai ${formatSalary(nanny.expectedSalaryMin)}`
                    : `s/d ${formatSalary(nanny.expectedSalaryMax!)}`}
                </span>
              </div>
            )}
            {nanny.religion && (
              <div className="flex justify-between items-center px-4 py-2.5">
                <span className="text-[12px] text-[#999AAA]">Agama</span>
                <span className="text-[13px] font-semibold text-[#5A3A7A]">{nanny.religion}</span>
              </div>
            )}
          </div>
        </div>

        {nanny.skills.length > 0 && (
          <div>
            <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">
              Keahlian
            </p>
            <div className="flex flex-wrap gap-1.5">
              {nanny.skills.map((skill) => (
                <span
                  key={skill}
                  className="text-[12px] bg-[#F3EEF8] text-[#5A3A7A] border border-[#E0D0F0] px-3 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {nanny.languages.length > 0 && (
          <div>
            <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">
              Bahasa
            </p>
            <div className="flex flex-wrap gap-1.5">
              {nanny.languages.map((lang) => (
                <span
                  key={lang}
                  className="text-[12px] bg-[#E5F6F4] text-[#2C5F5A] border border-[#A8DDD8] px-3 py-1 rounded-full"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Kontak */}
      <div className="mt-2">
        <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">
          Hubungi Nanny
        </p>
        <UnlockContactButton
          nannyProfileId={params.nannyId}
          contactApiPath={`/api/nanny/${params.nannyId}/contact`}
          flowType="TALENT_POOL"
          remainingQuota={talentPoolRemaining}
          alreadyUnlocked={kontakTerbuka}
          hasGuarantee={hasGuarantee}
          connectionAddonFeeIDR={connectionAddonFeeIDR}
        />
      </div>

    </div>
  )
}
