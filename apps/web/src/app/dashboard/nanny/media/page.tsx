import { cachedAuth } from "@/lib/auth-server"
import { getNannyMedia } from "@/lib/queries/nanny"
import { redirect } from "next/navigation"
import { cfStream, r2 } from "@/lib/cloudflare"
import MediaClient from "./MediaClient"

export const metadata = { title: "Kelola Media — BundaYakin" }

export default async function NannyMediaPage() {
  const session = await cachedAuth()
  if (!session?.user?.id || session.user.role !== "NANNY") {
    redirect("/auth/login")
  }

  const nannyProfile = await getNannyMedia(session.user.id)
  if (!nannyProfile) redirect("/auth/login")

  const media = nannyProfile.media

  // Intro video
  const introRaw = media.find((m) => m.type === "INTRO_VIDEO") ?? null
  const initialIntroVideo = introRaw
    ? {
        id: introRaw.id,
        embedUrl: cfStream.embedUrl(introRaw.storageKey),
        thumbnailUrl: cfStream.thumbnailUrl(introRaw.storageKey),
        slug: introRaw.slug ?? undefined,
      }
    : null

  // Skill videos — dynamic list ordered by sortOrder
  const initialSkillVideos = media
    .filter((m) => m.type === "SKILL_VIDEO")
    .map((m) => ({
      id: m.id,
      embedUrl: cfStream.embedUrl(m.storageKey),
      thumbnailUrl: cfStream.thumbnailUrl(m.storageKey),
      slug: m.slug ?? undefined,
    }))

  // Portfolio photos (simple grid — existing feature)
  const initialPortfolioPhotos: ({ id: string; url: string; slug?: string } | null)[] =
    [null, null, null, null, null, null]
  media
    .filter((m) => m.type === "PORTFOLIO_PHOTO")
    .slice(0, 6)
    .forEach((m, i) => {
      initialPortfolioPhotos[i] = { id: m.id, url: r2.publicUrl(m.storageKey), slug: m.slug ?? undefined }
    })

  // Portfolio entries (structured experience)
  const initialPortfolioEntries = (nannyProfile.portfolios ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    startMonth: p.startMonth,
    startYear: p.startYear,
    endMonth: p.endMonth,
    endYear: p.endYear,
    isOngoing: p.isOngoing,
    sortOrder: p.sortOrder,
    media: p.media,
  }))

  return (
    <MediaClient
      initialProfilePhotoUrl={nannyProfile.profilePhotoUrl}
      initialIntroVideo={initialIntroVideo}
      initialSkillVideos={initialSkillVideos}
      initialPortfolioPhotos={initialPortfolioPhotos}
      initialPortfolioEntries={initialPortfolioEntries}
    />
  )
}
