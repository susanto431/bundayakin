import { cachedAuth } from "@/lib/auth-server"
import { getNannyMedia } from "@/lib/queries/nanny"
import { redirect } from "next/navigation"
import { cfStream, r2 } from "@/lib/cloudflare"
import Image from "next/image"
import Link from "next/link"

export const metadata = { title: "Preview Profil — BundaYakin" }

const MONTHS = [
  "Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des",
]

function formatPeriod(startMonth: number, startYear: number, endMonth: number | null, endYear: number | null, isOngoing: boolean) {
  const start = `${MONTHS[startMonth - 1]} ${startYear}`
  if (isOngoing) return `${start} – Sekarang`
  if (endMonth && endYear) return `${start} – ${MONTHS[endMonth - 1]} ${endYear}`
  return start
}

export default async function NannyProfilePreviewPage() {
  const session = await cachedAuth()
  if (!session?.user?.id || session.user.role !== "NANNY") {
    redirect("/auth/login")
  }

  const nannyProfile = await getNannyMedia(session.user.id)
  if (!nannyProfile) redirect("/auth/login")

  const media = nannyProfile.media

  const introRaw = media.find((m) => m.type === "INTRO_VIDEO")
  const skillVideos = media.filter((m) => m.type === "SKILL_VIDEO")
  const portfolioPhotos = media.filter((m) => m.type === "PORTFOLIO_PHOTO").slice(0, 6)
  const portfolioEntries = nannyProfile.portfolios ?? []

  return (
    <div className="min-h-screen bg-[#F3EEF8] pb-12">
      {/* Header */}
      <div className="bg-white border-b border-[#E0D0F0] px-4 py-4 flex items-center gap-3">
        <Link href="/dashboard/nanny/media" className="text-[#5A3A7A] font-bold text-xl leading-none">←</Link>
        <div>
          <h1 className="font-bold text-[#5A3A7A] text-[16px]">Preview Profil</h1>
          <p className="text-[11px] text-[#999AAA]">Begini tampilan profilmu di mata parent</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto">

        {/* Profile header */}
        <div className="bg-white px-4 py-5 flex items-center gap-4 border-b border-[#E0D0F0]">
          {nannyProfile.profilePhotoUrl ? (
            <Image src={nannyProfile.profilePhotoUrl} alt="Foto" width={72} height={72}
              className="w-[72px] h-[72px] rounded-full object-cover flex-shrink-0" unoptimized />
          ) : (
            <div className="w-[72px] h-[72px] rounded-full bg-[#E0D0F0] flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">👤</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#5A3A7A] text-[16px]">{nannyProfile.fullName || "Nama Nanny"}</p>
            <p className="text-[12px] text-[#999AAA]">
              {nannyProfile.city ? `${nannyProfile.city} · ` : ""}{nannyProfile.yearsOfExperience ?? 0} thn pengalaman
            </p>
            {nannyProfile.bio && (
              <p className="text-[12px] text-[#666666] mt-1 line-clamp-2">{nannyProfile.bio}</p>
            )}
          </div>
        </div>

        {/* Video Perkenalan */}
        {introRaw ? (
          <div className="bg-white mt-3 px-4 py-4">
            <p className="text-[13px] font-bold text-[#5A3A7A] mb-3">Video Perkenalan</p>
            <div className="rounded-[12px] overflow-hidden bg-black aspect-video">
              <iframe
                src={cfStream.embedUrl(introRaw.storageKey)}
                className="w-full h-full"
                allow="autoplay"
                title="Video Perkenalan"
              />
            </div>
          </div>
        ) : (
          <div className="bg-white mt-3 px-4 py-4">
            <p className="text-[13px] font-bold text-[#5A3A7A] mb-2">Video Perkenalan</p>
            <div className="border-2 border-dashed border-[#E0D0F0] rounded-[12px] p-5 text-center">
              <p className="text-[12px] text-[#999AAA]">Belum ada video perkenalan</p>
              <Link href="/dashboard/nanny/media" className="text-[12px] text-[#5BBFB0] font-semibold mt-1 inline-block">
                + Tambah sekarang
              </Link>
            </div>
          </div>
        )}

        {/* Video Keahlian */}
        {skillVideos.length > 0 && (
          <div className="bg-white mt-3 px-4 py-4">
            <p className="text-[13px] font-bold text-[#5A3A7A] mb-3">Keahlian</p>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
              {skillVideos.map((v) => (
                <div key={v.id} className="flex-shrink-0 w-40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cfStream.thumbnailUrl(v.storageKey)}
                    alt={v.slug ?? "skill"}
                    className="w-full h-24 object-cover rounded-[10px] bg-[#E0D0F0]"
                  />
                  <p className="text-[12px] text-[#5A3A7A] font-medium mt-1.5 truncate capitalize px-0.5">
                    {v.slug ?? "Video Keahlian"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Portofolio Pengalaman */}
        {portfolioEntries.length > 0 && (
          <div className="bg-white mt-3 px-4 py-4">
            <p className="text-[13px] font-bold text-[#5A3A7A] mb-3">Pengalaman</p>
            <div className="space-y-4">
              {portfolioEntries.map((entry) => (
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

        {/* Foto Portfolio */}
        {portfolioPhotos.length > 0 && (
          <div className="bg-white mt-3 px-4 py-4">
            <p className="text-[13px] font-bold text-[#5A3A7A] mb-3">Galeri Foto</p>
            <div className="grid grid-cols-3 gap-2">
              {portfolioPhotos.map((m) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={m.id} src={r2.publicUrl(m.storageKey)} alt="foto" className="w-full aspect-square object-cover rounded-[8px]" />
              ))}
            </div>
          </div>
        )}

        {/* CTA edit */}
        <div className="px-4 mt-6">
          <Link href="/dashboard/nanny/media"
            className="w-full min-h-[48px] bg-[#5BBFB0] text-white font-semibold text-[14px] rounded-[14px] flex items-center justify-center"
          >
            Edit Media Profil
          </Link>
        </div>

      </div>
    </div>
  )
}
