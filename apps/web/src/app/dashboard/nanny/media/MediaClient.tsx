"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"

type PhotoItem = { id: string; url: string; slug?: string }
type VideoItem = { id: string; embedUrl: string; thumbnailUrl?: string; slug?: string }
type VideoPhase = "prepare" | "upload" | "confirm"

type Props = {
  initialProfilePhotoUrl: string | null
  initialIntroVideo: VideoItem | null
  initialSkillVideos: (VideoItem | null)[]
  initialPortfolioPhotos: (PhotoItem | null)[]
}

function VideoPhaseIndicator({ phase, progress }: { phase: VideoPhase; progress: number }) {
  if (phase === "upload") {
    return (
      <div className="w-full">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-[#5BBFB0] rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-[#666666] text-center">Mengunggah… {progress}%</p>
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-6 h-6 border-2 border-[#5BBFB0] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-[#666666]">
        {phase === "prepare" ? "Mempersiapkan upload…" : "Menyelesaikan…"}
      </p>
    </div>
  )
}

export default function MediaClient({
  initialProfilePhotoUrl,
  initialIntroVideo,
  initialSkillVideos,
  initialPortfolioPhotos,
}: Props) {
  // Foto profil
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(initialProfilePhotoUrl)
  const [profilePhotoUploading, setProfilePhotoUploading] = useState(false)
  const profilePhotoRef = useRef<HTMLInputElement>(null)

  // Video perkenalan
  const [introVideo, setIntroVideo] = useState<VideoItem | null>(initialIntroVideo)
  const [introUploading, setIntroUploading] = useState(false)
  const [introPhase, setIntroPhase] = useState<VideoPhase | null>(null)
  const [introProgress, setIntroProgress] = useState(0)
  const introVideoRef = useRef<HTMLInputElement>(null)

  // Video keahlian
  const [skillVideos, setSkillVideos] = useState<(VideoItem | null)[]>(initialSkillVideos)
  const [activeSkillSlot, setActiveSkillSlot] = useState<number | null>(null)
  const [skillUploading, setSkillUploading] = useState(false)
  const [skillPhase, setSkillPhase] = useState<VideoPhase | null>(null)
  const [skillProgress, setSkillProgress] = useState(0)
  const skillVideoRef = useRef<HTMLInputElement>(null)

  // Foto portfolio
  const [portfolioPhotos, setPortfolioPhotos] = useState<(PhotoItem | null)[]>(initialPortfolioPhotos)
  const [activePhotoSlot, setActivePhotoSlot] = useState<number | null>(null)
  const [portfolioUploading, setPortfolioUploading] = useState<number | null>(null)
  const portfolioPhotoRef = useRef<HTMLInputElement>(null)

  const [error, setError] = useState<string | null>(null)

  async function handleProfilePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setProfilePhotoUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("type", "AVATAR")
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setProfilePhotoUrl(json.url)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal upload foto profil")
    } finally {
      setProfilePhotoUploading(false)
      if (profilePhotoRef.current) profilePhotoRef.current.value = ""
    }
  }

  async function handleVideoUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    type: "INTRO_VIDEO" | "SKILL_VIDEO",
    slot?: number
  ) {
    const file = e.target.files?.[0]
    if (!file) return
    const isIntro = type === "INTRO_VIDEO"
    const slug = isIntro ? "perkenalan" : `keahlian-${(slot ?? 0) + 1}`
    setError(null)

    if (isIntro) {
      setIntroUploading(true)
      setIntroPhase("prepare")
      setIntroProgress(0)
    } else {
      setSkillUploading(true)
      setSkillPhase("prepare")
      setSkillProgress(0)
    }

    try {
      // Step 1: Prepare upload URL
      const res1 = await fetch("/api/upload/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, slug }),
      })
      const j1 = await res1.json()
      if (!j1.success) throw new Error(j1.error)
      const { uploadUrl, uid } = j1.data

      // Step 2: XHR PUT — tracks progress
      if (isIntro) setIntroPhase("upload")
      else setSkillPhase("upload")

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            const pct = Math.round((ev.loaded / ev.total) * 100)
            if (isIntro) setIntroProgress(pct)
            else setSkillProgress(pct)
          }
        }
        xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`Upload gagal: ${xhr.status}`)))
        xhr.onerror = () => reject(new Error("Upload gagal"))
        xhr.open("PUT", uploadUrl)
        xhr.send(file)
      })

      // Step 3: Confirm
      if (isIntro) setIntroPhase("confirm")
      else setSkillPhase("confirm")

      const res3 = await fetch("/api/upload/video/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, type, slug }),
      })
      const j3 = await res3.json()
      if (!j3.success) throw new Error(j3.error)
      const { mediaId, embedUrl, thumbnailUrl } = j3.data

      const item: VideoItem = { id: mediaId, embedUrl, thumbnailUrl, slug }
      if (isIntro) {
        setIntroVideo(item)
      } else if (slot !== undefined) {
        setSkillVideos(prev => {
          const next = [...prev]
          next[slot] = item
          return next
        })
        setActiveSkillSlot(null)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal upload video")
    } finally {
      if (isIntro) {
        setIntroUploading(false)
        setIntroPhase(null)
        setIntroProgress(0)
        if (introVideoRef.current) introVideoRef.current.value = ""
      } else {
        setSkillUploading(false)
        setSkillPhase(null)
        setSkillProgress(0)
        if (skillVideoRef.current) skillVideoRef.current.value = ""
      }
    }
  }

  async function handleDeleteMedia(
    id: string,
    mediaType: "intro" | "skill" | "photo",
    slot?: number
  ) {
    setError(null)
    try {
      const res = await fetch(`/api/upload/media/${id}`, { method: "DELETE" })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      if (mediaType === "intro") {
        setIntroVideo(null)
      } else if (mediaType === "skill" && slot !== undefined) {
        setSkillVideos(prev => { const next = [...prev]; next[slot] = null; return next })
      } else if (mediaType === "photo" && slot !== undefined) {
        setPortfolioPhotos(prev => { const next = [...prev]; next[slot] = null; return next })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghapus media")
    }
  }

  async function handlePortfolioPhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (activePhotoSlot === null || !file) return
    const slot = activePhotoSlot
    setPortfolioUploading(slot)
    setError(null)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("type", "PORTFOLIO_PHOTO")
      fd.append("slug", `foto-${slot + 1}`)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setPortfolioPhotos(prev => {
        const next = [...prev]
        next[slot] = { id: json.mediaId, url: json.url, slug: `foto-${slot + 1}` }
        return next
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal upload foto portfolio")
    } finally {
      setPortfolioUploading(null)
      setActivePhotoSlot(null)
      if (portfolioPhotoRef.current) portfolioPhotoRef.current.value = ""
    }
  }

  const filledPhotoCount = portfolioPhotos.filter(Boolean).length

  return (
    <div className="min-h-screen bg-[#F3EEF8]">
      {/* Header */}
      <div className="bg-white border-b border-[#E0D0F0] px-4 py-4 flex items-center gap-3">
        <Link href="/dashboard/nanny" className="text-[#5A3A7A] font-bold text-xl leading-none">←</Link>
        <h1 className="font-bold text-[#5A3A7A] text-[16px]">Kelola Media</h1>
      </div>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-8">

        {/* Error banner */}
        {error && (
          <div className="bg-[#FAEAEA] border border-[#F5C4A0] rounded-[12px] px-4 py-3">
            <p className="text-sm text-[#C75D5D]">{error}</p>
          </div>
        )}

        {/* ── Foto Profil ─────────────────────────────── */}
        <section>
          <p className="text-[13px] font-bold text-[#5A3A7A] mb-3">Foto Profil</p>
          <div className="flex items-center gap-4">
            {profilePhotoUploading ? (
              <div className="w-24 h-24 rounded-full bg-[#F3EEF8] flex items-center justify-center flex-shrink-0">
                <div className="w-6 h-6 border-2 border-[#5BBFB0] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : profilePhotoUrl ? (
              <Image
                src={profilePhotoUrl}
                alt="Foto Profil"
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover flex-shrink-0"
                unoptimized
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#E0D0F0] flex items-center justify-center flex-shrink-0">
                <span className="text-[#999AAA] text-2xl">📷</span>
              </div>
            )}
            <button
              onClick={() => profilePhotoRef.current?.click()}
              disabled={profilePhotoUploading}
              className="min-h-[48px] px-5 rounded-[12px] border-2 border-[#5BBFB0] text-[#5BBFB0] font-semibold text-[13px] hover:bg-[#E5F6F4] transition-colors disabled:opacity-50"
            >
              {profilePhotoUrl ? "Ganti Foto" : "Upload Foto"}
            </button>
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            ref={profilePhotoRef}
            onChange={handleProfilePhotoUpload}
          />
        </section>

        {/* ── Video Perkenalan ─────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-[13px] font-bold text-[#5A3A7A]">Video Perkenalan</p>
            <span className="text-[11px] text-[#999AAA] bg-white border border-[#E0D0F0] px-2 py-0.5 rounded-full">
              Opsional · Maks 3 menit
            </span>
          </div>

          {introUploading && introPhase ? (
            <div className="border-2 border-dashed border-[#A8DDD8] rounded-[12px] p-6 flex flex-col items-center">
              <VideoPhaseIndicator phase={introPhase} progress={introProgress} />
            </div>
          ) : introVideo ? (
            <div>
              <iframe
                src={introVideo.embedUrl}
                className="w-full aspect-video rounded-[12px]"
                allow="autoplay"
                title="Video Perkenalan"
              />
              <button
                onClick={() => handleDeleteMedia(introVideo.id, "intro")}
                className="mt-2 min-h-[40px] px-4 rounded-[10px] border border-[#C75D5D] text-[#C75D5D] text-[12px] font-semibold hover:bg-[#FAEAEA] transition-colors"
              >
                Hapus Video
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-[#A8DDD8] rounded-[12px] p-6 flex flex-col items-center gap-3">
              <span className="text-4xl">🎬</span>
              <button
                onClick={() => introVideoRef.current?.click()}
                className="min-h-[48px] px-5 bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[13px] rounded-[12px] transition-colors"
              >
                Upload Video Perkenalan
              </button>
            </div>
          )}
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            hidden
            ref={introVideoRef}
            onChange={(e) => handleVideoUpload(e, "INTRO_VIDEO")}
          />
        </section>

        {/* ── Video Keahlian ─────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-[13px] font-bold text-[#5A3A7A]">Video Keahlian</p>
            <span className="text-[11px] text-[#999AAA] bg-white border border-[#E0D0F0] px-2 py-0.5 rounded-full">
              Maks 3 video · 3 menit/video
            </span>
          </div>
          <div className="space-y-3">
            {skillVideos.map((video, i) => (
              <div key={i}>
                {skillUploading && activeSkillSlot === i && skillPhase ? (
                  <div className="border-2 border-dashed border-[#A8DDD8] rounded-[12px] p-4 flex flex-col items-center">
                    <VideoPhaseIndicator phase={skillPhase} progress={skillProgress} />
                  </div>
                ) : video ? (
                  <div className="flex items-center gap-3 bg-white border border-[#E0D0F0] rounded-[12px] p-3">
                    {video.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={video.thumbnailUrl}
                        alt={video.slug ?? `Video ${i + 1}`}
                        className="w-20 h-14 object-cover rounded-[8px] flex-shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-14 rounded-[8px] bg-[#F3EEF8] flex-shrink-0 flex items-center justify-center">
                        <span className="text-xl">🎬</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#5A3A7A] truncate">
                        {video.slug ?? `Video Keahlian ${i + 1}`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteMedia(video.id, "skill", i)}
                      className="text-[#C75D5D] text-[11px] font-semibold hover:underline flex-shrink-0 min-h-[40px] px-2"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setActiveSkillSlot(i)
                      skillVideoRef.current?.click()
                    }}
                    disabled={skillUploading}
                    className="w-full h-[80px] border-2 border-dashed border-[#C8B8DC] rounded-[12px] flex items-center justify-center gap-2 text-[#999AAA] text-[13px] hover:border-[#A97CC4] hover:text-[#5A3A7A] transition-colors disabled:opacity-50"
                  >
                    <span className="text-lg">+</span> Tambah video keahlian
                  </button>
                )}
              </div>
            ))}
          </div>
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            hidden
            ref={skillVideoRef}
            onChange={(e) => handleVideoUpload(e, "SKILL_VIDEO", activeSkillSlot ?? 0)}
          />
        </section>

        {/* ── Foto Portfolio ─────────────────────────── */}
        <section className="pb-8">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-[13px] font-bold text-[#5A3A7A]">Foto Portfolio</p>
            <span className="text-[11px] text-[#999AAA] bg-white border border-[#E0D0F0] px-2 py-0.5 rounded-full">
              Maks 6 foto
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {portfolioPhotos.map((photo, i) => (
              <div key={i} className="relative aspect-square">
                {portfolioUploading === i ? (
                  <div className="w-full h-full rounded-[12px] bg-[#F3EEF8] flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-[#5BBFB0] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : photo ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={photo.slug ?? `Foto ${i + 1}`}
                      className="w-full h-full object-cover rounded-[12px]"
                    />
                    <button
                      onClick={() => handleDeleteMedia(photo.id, "photo", i)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-[#C75D5D] font-bold text-base shadow-sm"
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      if (filledPhotoCount >= 6) return
                      setActivePhotoSlot(i)
                      portfolioPhotoRef.current?.click()
                    }}
                    disabled={portfolioUploading !== null || filledPhotoCount >= 6}
                    className="w-full h-full border-2 border-dashed border-[#C8B8DC] rounded-[12px] flex items-center justify-center text-[#999AAA] text-2xl hover:border-[#A97CC4] hover:text-[#5A3A7A] transition-colors disabled:opacity-50"
                  >
                    +
                  </button>
                )}
              </div>
            ))}
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            ref={portfolioPhotoRef}
            onChange={handlePortfolioPhotoUpload}
          />
        </section>

      </main>
    </div>
  )
}
