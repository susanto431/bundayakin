import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { r2, cfStream } from "@/lib/cloudflare"
import MediaClient from "./MediaClient"

export const metadata = { title: "Kelola Media — BundaYakin" }

export default async function NannyMediaPage() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "NANNY") {
    redirect("/auth/login")
  }

  const nannyProfile = await prisma.nannyProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      profilePhotoUrl: true,
      media: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: { id: true, type: true, storageKey: true, slug: true, sortOrder: true },
      },
    },
  })

  if (!nannyProfile) redirect("/auth/login")

  const media = nannyProfile.media

  // Intro video — single, derive embed/thumbnail server-side
  const introRaw = media.find(m => m.type === "INTRO_VIDEO") ?? null
  const initialIntroVideo = introRaw
    ? {
        id: introRaw.id,
        embedUrl: cfStream.embedUrl(introRaw.storageKey),
        thumbnailUrl: cfStream.thumbnailUrl(introRaw.storageKey),
        slug: introRaw.slug ?? undefined,
      }
    : null

  // Skill videos — 3 slots, fill by sortOrder as index
  const initialSkillVideos: ({ id: string; embedUrl: string; thumbnailUrl: string; slug?: string } | null)[] =
    [null, null, null]
  for (const m of media.filter(m => m.type === "SKILL_VIDEO")) {
    const idx = Math.min(m.sortOrder, 2)
    if (initialSkillVideos[idx] === null) {
      initialSkillVideos[idx] = {
        id: m.id,
        embedUrl: cfStream.embedUrl(m.storageKey),
        thumbnailUrl: cfStream.thumbnailUrl(m.storageKey),
        slug: m.slug ?? undefined,
      }
    }
  }

  // Portfolio photos — 6 slots, fill in order
  const initialPortfolioPhotos: ({ id: string; url: string; slug?: string } | null)[] =
    [null, null, null, null, null, null]
  media
    .filter(m => m.type === "PORTFOLIO_PHOTO")
    .slice(0, 6)
    .forEach((m, i) => {
      initialPortfolioPhotos[i] = {
        id: m.id,
        url: r2.publicUrl(m.storageKey),
        slug: m.slug ?? undefined,
      }
    })

  return (
    <MediaClient
      initialProfilePhotoUrl={nannyProfile.profilePhotoUrl}
      initialIntroVideo={initialIntroVideo}
      initialSkillVideos={initialSkillVideos}
      initialPortfolioPhotos={initialPortfolioPhotos}
    />
  )
}
