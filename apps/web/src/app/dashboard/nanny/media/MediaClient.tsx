"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"

const VideoRecorder = dynamic(() => import("./VideoRecorder"), { ssr: false })
const AddPortfolioModal = dynamic(() => import("./AddPortfolioModal"), { ssr: false })
import SkillVideoItem from "./SkillVideoItem"

// ─── Types ───────────────────────────────────────────────────────────────────

type PhotoItem = { id: string; url: string; slug?: string }
// isReady === false berarti video baru diupload, masih diproses CF Stream
// isReady === undefined berarti video dari DB (treat as ready — show iframe)
type VideoItem = { id: string; embedUrl: string; thumbnailUrl?: string; slug?: string; isReady?: boolean }
type VideoPhase = "prepare" | "upload" | "confirm"
type UploadSource = "camera" | "gallery"

type PortfolioEntry = {
  id: string
  title: string
  description: string | null
  startMonth: number
  startYear: number
  endMonth: number | null
  endYear: number | null
  isOngoing: boolean
  sortOrder: number
  media: { id: string; url: string; storageKey: string }[]
}

type Props = {
  initialProfilePhotoUrl: string | null
  initialIntroVideo: VideoItem | null
  initialSkillVideos: VideoItem[]
  initialPortfolioPhotos: (PhotoItem | null)[]
  initialPortfolioEntries: PortfolioEntry[]
}

// ─── Skill categories ─────────────────────────────────────────────────────────

const SKILL_CATEGORIES = [
  { id: "susu-formula",        label: "Membuat Susu Formula" },
  { id: "gendong-bayi",        label: "Menggendong Bayi" },
  { id: "mandi-bayi",          label: "Memandikan Bayi" },
  { id: "mpasi",               label: "Membuat MPASI" },
  { id: "tumbuh-kembang",      label: "Stimulasi Tumbuh Kembang" },
  { id: "tenangkan-bayi",      label: "Menenangkan Bayi" },
  { id: "pertolongan-pertama", label: "Pertolongan Pertama" },
  { id: "bermain-edukasi",     label: "Bermain & Edukasi" },
  { id: "lainnya",             label: "Lainnya…" },
] as const

const MONTHS = [
  "Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des",
]

const MAX_DURATION_SEC = 180
const MAX_SKILL_VIDEOS = 10

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement("video")
    video.preload = "metadata"
    video.onloadedmetadata = () => { URL.revokeObjectURL(video.src); resolve(video.duration) }
    video.onerror = () => resolve(Infinity)
    video.src = URL.createObjectURL(file)
  })
}

async function uploadToCloudflare(
  file: File, uploadUrl: string, onProgress: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    })
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error(`Upload gagal: ${xhr.status}`))
    })
    xhr.addEventListener("error", () => reject(new Error("Upload gagal: network error")))
    xhr.addEventListener("abort", () => reject(new Error("Upload dibatalkan")))
    xhr.open("POST", uploadUrl)
    const fd = new FormData()
    fd.append("file", file)
    xhr.send(fd)
  })
}

function formatPeriod(entry: Pick<PortfolioEntry, "startMonth"|"startYear"|"endMonth"|"endYear"|"isOngoing">) {
  const start = `${MONTHS[entry.startMonth - 1]} ${entry.startYear}`
  if (entry.isOngoing) return `${start} – Sekarang`
  if (entry.endMonth && entry.endYear) return `${start} – ${MONTHS[entry.endMonth - 1]} ${entry.endYear}`
  return start
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressIndicator({ phase, progress }: { phase: VideoPhase; progress: number }) {
  if (phase === "upload") {
    return (
      <div className="w-full">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-[#5BBFB0] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-sm text-[#666666] text-center">Mengunggah… {progress}%</p>
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-6 h-6 border-2 border-[#5BBFB0] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-[#666666]">{phase === "prepare" ? "Mempersiapkan…" : "Menyelesaikan…"}</p>
    </div>
  )
}

function CategoryPicker({ onSelect, onCancel }: {
  onSelect: (id: string, label: string, source: UploadSource) => void
  onCancel: () => void
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [custom, setCustom] = useState("")

  function handleNext(source: UploadSource) {
    if (!selected) return
    const cat = SKILL_CATEGORIES.find((c) => c.id === selected)
    const label = selected === "lainnya" && custom.trim() ? custom.trim() : (cat?.label ?? selected)
    onSelect(selected, label, source)
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-end">
      <div className="w-full bg-white rounded-t-[24px] px-4 pt-5 pb-8 max-h-[85vh] overflow-y-auto">
        <div className="w-10 h-1 bg-[#E0D0F0] rounded-full mx-auto mb-4" />
        <h3 className="font-bold text-[#5A3A7A] text-[15px] mb-1">Pilih Kategori Keahlian</h3>
        <p className="text-[12px] text-[#999AAA] mb-4">Video kamu akan diberi label ini agar parent mudah menemukannya.</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {SKILL_CATEGORIES.map((cat) => (
            <button key={cat.id} onClick={() => setSelected(cat.id)}
              className={`text-left px-3 py-3 rounded-[12px] border-2 text-[13px] font-medium transition-colors ${
                selected === cat.id ? "border-[#5BBFB0] bg-[#E5F6F4] text-[#2C5F5A]" : "border-[#E0D0F0] text-[#5A3A7A]"
              }`}
            >{cat.label}</button>
          ))}
        </div>
        {selected === "lainnya" && (
          <input type="text" placeholder="Nama keahlian kamu…" value={custom} onChange={(e) => setCustom(e.target.value)}
            maxLength={50}
            className="w-full border-2 border-[#E0D0F0] rounded-[12px] px-4 py-3 text-[13px] text-[#5A3A7A] mb-4 focus:outline-none focus:border-[#5BBFB0]"
          />
        )}
        <div className="flex flex-col gap-2 mt-2">
          <p className="text-[12px] text-[#999AAA] text-center mb-1">Lanjut dengan:</p>
          <button disabled={!selected || (selected === "lainnya" && !custom.trim())} onClick={() => handleNext("camera")}
            className="w-full min-h-[48px] bg-[#5BBFB0] disabled:opacity-40 text-white font-semibold text-[13px] rounded-[12px] flex items-center justify-center gap-2"
          ><span>📹</span> Rekam dengan Kamera</button>
          <button disabled={!selected || (selected === "lainnya" && !custom.trim())} onClick={() => handleNext("gallery")}
            className="w-full min-h-[48px] border-2 border-[#5BBFB0] disabled:opacity-40 text-[#5BBFB0] font-semibold text-[13px] rounded-[12px] flex items-center justify-center gap-2"
          ><span>🖼️</span> Pilih dari Galeri</button>
          <button onClick={onCancel} className="w-full min-h-[44px] text-[#999AAA] text-[13px]">Batal</button>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MediaClient({
  initialProfilePhotoUrl,
  initialIntroVideo,
  initialSkillVideos,
  initialPortfolioPhotos,
  initialPortfolioEntries,
}: Props) {

  // ── State ───────────────────────────────────────────────────────────────────

  const [profilePhotoUrl, setProfilePhotoUrl] = useState(initialProfilePhotoUrl)
  const [profilePhotoUploading, setProfilePhotoUploading] = useState(false)
  const profilePhotoRef = useRef<HTMLInputElement>(null)

  const [introVideo, setIntroVideo] = useState<VideoItem | null>(initialIntroVideo)
  const [introUploading, setIntroUploading] = useState(false)
  const [introPhase, setIntroPhase] = useState<VideoPhase | null>(null)
  const [introProgress, setIntroProgress] = useState(0)
  const [showIntroCamera, setShowIntroCamera] = useState(false)
  const introVideoRef = useRef<HTMLInputElement>(null)

  const [skillVideos, setSkillVideos] = useState<VideoItem[]>(initialSkillVideos)
  const [skillUploading, setSkillUploading] = useState(false)
  const [skillPhase, setSkillPhase] = useState<VideoPhase | null>(null)
  const [skillProgress, setSkillProgress] = useState(0)
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [pendingCategory, setPendingCategory] = useState<{ id: string; label: string } | null>(null)
  const [showSkillCamera, setShowSkillCamera] = useState(false)
  const skillVideoRef = useRef<HTMLInputElement>(null)

  const [portfolioPhotos, setPortfolioPhotos] = useState<(PhotoItem | null)[]>(initialPortfolioPhotos)
  const [activePhotoSlot, setActivePhotoSlot] = useState<number | null>(null)
  const [portfolioUploading, setPortfolioUploading] = useState<number | null>(null)
  const portfolioPhotoRef = useRef<HTMLInputElement>(null)

  const [portfolioEntries, setPortfolioEntries] = useState<PortfolioEntry[]>(initialPortfolioEntries)
  const [showPortfolioModal, setShowPortfolioModal] = useState(false)

  const [error, setError] = useState<string | null>(null)

  // ── Polling: tandai video ready saat CF Stream selesai encode ─────────────
  useEffect(() => {
    // embedUrl format: https://iframe.videodelivery.net/<uid>
    const uidFromEmbed = (url: string) => new URL(url).pathname.replace(/^\//, "")

    const pendingUids: string[] = []
    if (introVideo?.isReady === false) pendingUids.push(uidFromEmbed(introVideo.embedUrl))
    skillVideos.forEach((v) => {
      if (v.isReady === false) pendingUids.push(uidFromEmbed(v.embedUrl))
    })

    if (pendingUids.length === 0) return

    const interval = setInterval(async () => {
      const stillPending: string[] = []
      await Promise.all(
        pendingUids.map(async (uid) => {
          if (!uid) return
          try {
            const res = await fetch(`/api/upload/video/status?uid=${uid}`)
            const json = await res.json()
            if (json.data?.isReady) {
              setIntroVideo((prev) => (prev && uidFromEmbed(prev.embedUrl) === uid ? { ...prev, isReady: true } : prev))
              setSkillVideos((prev) => prev.map((v) => uidFromEmbed(v.embedUrl) === uid ? { ...v, isReady: true } : v))
            } else {
              stillPending.push(uid)
            }
          } catch {
            stillPending.push(uid)
          }
        })
      )
      if (stillPending.length === 0) clearInterval(interval)
    }, 5000)

    return () => clearInterval(interval)
    // introVideo dan skillVideos sebagai deps — effect restart saat video baru ditambah atau status berubah
  }, [introVideo, skillVideos])  // eslint-disable-line react-hooks/exhaustive-deps

  // ── dnd-kit sensors ────────────────────────────────────────────────────────

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  async function handleSkillDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = skillVideos.findIndex((v) => v.id === active.id)
    const newIndex = skillVideos.findIndex((v) => v.id === over.id)
    const reordered = arrayMove(skillVideos, oldIndex, newIndex)
    setSkillVideos(reordered)

    try {
      await fetch("/api/nanny/video/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: reordered.map((v) => v.id) }),
      })
    } catch {
      // reorder gagal — silent, UI sudah updated optimistically
    }
  }

  // ── Core video upload ──────────────────────────────────────────────────────

  const handleVideoUpload = useCallback(async (
    file: File,
    type: "INTRO_VIDEO" | "SKILL_VIDEO",
    categorySlug?: string,
    categoryLabel?: string,
  ) => {
    const isIntro = type === "INTRO_VIDEO"
    const slug = isIntro ? "perkenalan" : (categorySlug ?? "keahlian")
    const displayLabel = isIntro ? "perkenalan" : (categoryLabel ?? slug)

    setError(null)
    if (isIntro) { setIntroUploading(true); setIntroPhase("prepare"); setIntroProgress(0) }
    else { setSkillUploading(true); setSkillPhase("prepare"); setSkillProgress(0) }

    try {
      const duration = await getVideoDuration(file)
      if (duration > MAX_DURATION_SEC + 2) {
        throw new Error(`Durasi ${Math.round(duration)} detik melebihi batas 3 menit. Rekam ulang ya.`)
      }

      const res1 = await fetch("/api/upload/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, slug }),
      })
      const j1 = await res1.json()
      if (!j1.success) throw new Error(j1.error)
      const { uploadUrl, uid } = j1.data

      if (isIntro) setIntroPhase("upload"); else setSkillPhase("upload")

      await uploadToCloudflare(file, uploadUrl, (pct) => {
        if (isIntro) setIntroProgress(pct); else setSkillProgress(pct)
      })

      if (isIntro) setIntroPhase("confirm"); else setSkillPhase("confirm")

      const res3 = await fetch("/api/upload/video/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, type, slug: displayLabel }),
      })
      const j3 = await res3.json()
      if (!j3.success) throw new Error(j3.error)
      const { mediaId, embedUrl, thumbnailUrl, isReady } = j3.data

      const item: VideoItem = { id: mediaId, embedUrl, thumbnailUrl, slug: displayLabel, isReady: isReady === true }
      if (isIntro) {
        setIntroVideo(item)
      } else {
        setSkillVideos((prev) => [...prev, item])
        setPendingCategory(null)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal upload video")
    } finally {
      if (isIntro) { setIntroUploading(false); setIntroPhase(null); setIntroProgress(0) }
      else { setSkillUploading(false); setSkillPhase(null); setSkillProgress(0) }
    }
  }, [])

  // ── Intro handlers ─────────────────────────────────────────────────────────

  function handleIntroFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    handleVideoUpload(file, "INTRO_VIDEO")
    e.target.value = ""
  }

  // ── Skill handlers ─────────────────────────────────────────────────────────

  function handleCategorySelected(id: string, label: string, source: UploadSource) {
    setShowCategoryPicker(false)
    setPendingCategory({ id, label })
    if (source === "camera") setShowSkillCamera(true)
    else skillVideoRef.current?.click()
  }

  function handleSkillFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !pendingCategory) return
    handleVideoUpload(file, "SKILL_VIDEO", pendingCategory.id, pendingCategory.label)
    e.target.value = ""
  }

  function handleSkillCaptured(file: File) {
    setShowSkillCamera(false)
    if (!pendingCategory) return
    handleVideoUpload(file, "SKILL_VIDEO", pendingCategory.id, pendingCategory.label)
  }

  async function handleDeleteSkill(id: string) {
    setError(null)
    try {
      const res = await fetch(`/api/upload/media/${id}`, { method: "DELETE" })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setSkillVideos((prev) => prev.filter((v) => v.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghapus video")
    }
  }

  // ── Portfolio entry handlers ────────────────────────────────────────────────

  type PortfolioSaveData = {
    title: string; description: string; startMonth: number; startYear: number
    endMonth: number | null; endYear: number | null; isOngoing: boolean
    photos: { url: string; storageKey: string }[]
  }
  async function handlePortfolioSave(data: PortfolioSaveData) {
    const res = await fetch("/api/nanny/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!json.success) throw new Error(json.error)
    setPortfolioEntries((prev) => [...prev, json.data as PortfolioEntry])
    setShowPortfolioModal(false)
  }

  async function handlePortfolioDelete(id: string) {
    setError(null)
    try {
      const res = await fetch(`/api/nanny/portfolio/${id}`, { method: "DELETE" })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setPortfolioEntries((prev) => prev.filter((e) => e.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghapus pengalaman")
    }
  }

  // ── Photo handlers ─────────────────────────────────────────────────────────

  async function handleProfilePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setProfilePhotoUploading(true); setError(null)
    try {
      const fd = new FormData()
      fd.append("file", file); fd.append("type", "AVATAR")
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setProfilePhotoUrl(json.url)
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal upload foto profil") }
    finally { setProfilePhotoUploading(false); if (profilePhotoRef.current) profilePhotoRef.current.value = "" }
  }

  async function handlePortfolioPhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (activePhotoSlot === null || !file) return
    const slot = activePhotoSlot
    setPortfolioUploading(slot); setError(null)
    try {
      const fd = new FormData()
      fd.append("file", file); fd.append("type", "PORTFOLIO_PHOTO"); fd.append("slug", `foto-${slot + 1}`)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setPortfolioPhotos((prev) => {
        const next = [...prev]; next[slot] = { id: json.mediaId, url: json.url, slug: `foto-${slot + 1}` }
        return next
      })
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal upload foto") }
    finally { setPortfolioUploading(null); setActivePhotoSlot(null); if (portfolioPhotoRef.current) portfolioPhotoRef.current.value = "" }
  }

  async function handleDeleteMedia(id: string, type: "intro" | "photo", slot?: number) {
    setError(null)
    try {
      const res = await fetch(`/api/upload/media/${id}`, { method: "DELETE" })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      if (type === "intro") setIntroVideo(null)
      else if (type === "photo" && slot !== undefined)
        setPortfolioPhotos((prev) => { const next = [...prev]; next[slot] = null; return next })
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal menghapus") }
  }

  const filledPhotoCount = portfolioPhotos.filter(Boolean).length
  const canAddSkill = skillVideos.length < MAX_SKILL_VIDEOS && !skillUploading

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {showIntroCamera && (
        <VideoRecorder
          onCapture={(file) => { setShowIntroCamera(false); handleVideoUpload(file, "INTRO_VIDEO") }}
          onCancel={() => setShowIntroCamera(false)}
        />
      )}
      {showSkillCamera && (
        <VideoRecorder
          onCapture={handleSkillCaptured}
          onCancel={() => { setShowSkillCamera(false); setPendingCategory(null) }}
        />
      )}
      {showCategoryPicker && (
        <CategoryPicker onSelect={handleCategorySelected} onCancel={() => setShowCategoryPicker(false)} />
      )}
      {showPortfolioModal && (
        <AddPortfolioModal
          onSave={handlePortfolioSave}
          onCancel={() => setShowPortfolioModal(false)}
        />
      )}

      <div className="min-h-screen bg-[#F3EEF8]">
        <div className="bg-white border-b border-[#E0D0F0] px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/nanny" className="text-[#5A3A7A] font-bold text-xl leading-none">←</Link>
            <h1 className="font-bold text-[#5A3A7A] text-[16px]">Kelola Media</h1>
          </div>
          <Link href="/dashboard/nanny/profile/preview"
            className="text-[12px] text-[#5BBFB0] font-semibold border border-[#5BBFB0] px-3 py-1.5 rounded-full"
          >
            Lihat Profil →
          </Link>
        </div>

        <main className="max-w-lg mx-auto px-4 py-6 space-y-8">

          {error && (
            <div className="bg-[#FAEAEA] border border-[#F5C4A0] rounded-[12px] px-4 py-3 flex items-start gap-2">
              <span className="text-[#C75D5D] flex-shrink-0">⚠️</span>
              <p className="text-sm text-[#C75D5D]">{error}</p>
            </div>
          )}

          {/* ── Foto Profil ───────────────────────────────── */}
          <section>
            <p className="text-[13px] font-bold text-[#5A3A7A] mb-3">Foto Profil</p>
            <div className="flex items-center gap-4">
              {profilePhotoUploading ? (
                <div className="w-24 h-24 rounded-full bg-[#F3EEF8] flex items-center justify-center flex-shrink-0">
                  <div className="w-6 h-6 border-2 border-[#5BBFB0] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : profilePhotoUrl ? (
                <Image src={profilePhotoUrl} alt="Foto Profil" width={96} height={96}
                  className="w-24 h-24 rounded-full object-cover flex-shrink-0" unoptimized />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#E0D0F0] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#999AAA] text-2xl">👤</span>
                </div>
              )}
              <button onClick={() => profilePhotoRef.current?.click()} disabled={profilePhotoUploading}
                className="min-h-[48px] px-5 rounded-[12px] border-2 border-[#5BBFB0] text-[#5BBFB0] font-semibold text-[13px] hover:bg-[#E5F6F4] transition-colors disabled:opacity-50"
              >{profilePhotoUrl ? "Ganti Foto" : "Upload Foto"}</button>
            </div>
            <input type="file" accept="image/jpeg,image/png,image/webp" hidden ref={profilePhotoRef} onChange={handleProfilePhotoUpload} />
          </section>

          {/* ── Video Perkenalan ──────────────────────────── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-[13px] font-bold text-[#5A3A7A]">Video Perkenalan</p>
              <span className="text-[11px] text-[#999AAA] bg-white border border-[#E0D0F0] px-2 py-0.5 rounded-full">Opsional · Maks 3 menit</span>
            </div>
            {introUploading && introPhase ? (
              <div className="border-2 border-dashed border-[#A8DDD8] rounded-[12px] p-6 flex flex-col items-center">
                <ProgressIndicator phase={introPhase} progress={introProgress} />
              </div>
            ) : introVideo ? (
              <div>
                <div className="relative rounded-[12px] overflow-hidden bg-black aspect-video">
                  {introVideo.isReady === false ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#1a1a1a]">
                      <div className="w-6 h-6 border-2 border-[#5BBFB0] border-t-transparent rounded-full animate-spin" />
                      <p className="text-white/70 text-[12px] text-center px-4">
                        Sedang diproses oleh Cloudflare…<br />
                        <span className="text-[11px] text-white/50">Refresh halaman dalam 1–2 menit untuk memutar video.</span>
                      </p>
                    </div>
                  ) : (
                    <iframe src={introVideo.embedUrl} className="w-full h-full" allow="autoplay" title="Video Perkenalan" />
                  )}
                </div>
                <button onClick={() => handleDeleteMedia(introVideo.id, "intro")}
                  className="mt-2 min-h-[40px] px-4 rounded-[10px] border border-[#C75D5D] text-[#C75D5D] text-[12px] font-semibold hover:bg-[#FAEAEA] transition-colors"
                >Hapus & Ganti Video</button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-[#A8DDD8] rounded-[12px] p-6 flex flex-col items-center gap-3">
                <span className="text-4xl">🎬</span>
                <p className="text-[12px] text-[#999AAA] text-center">Perkenalkan diri kamu agar parent bisa mengenal kamu lebih baik.</p>
                <div className="flex flex-col gap-2 w-full max-w-[260px]">
                  <button onClick={() => setShowIntroCamera(true)}
                    className="min-h-[48px] bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[13px] rounded-[12px] flex items-center justify-center gap-2 transition-colors"
                  ><span>📹</span> Rekam dengan Kamera</button>
                  <button onClick={() => introVideoRef.current?.click()}
                    className="min-h-[48px] border-2 border-[#5BBFB0] text-[#5BBFB0] font-semibold text-[13px] rounded-[12px] flex items-center justify-center gap-2 hover:bg-[#E5F6F4] transition-colors"
                  ><span>🖼️</span> Pilih dari Galeri</button>
                </div>
              </div>
            )}
            <input type="file" accept="video/mp4,video/webm,video/quicktime,video/x-m4v" hidden ref={introVideoRef} onChange={handleIntroFileChange} />
          </section>

          {/* ── Video Keahlian (dnd-kit) ──────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <p className="text-[13px] font-bold text-[#5A3A7A]">Video Keahlian</p>
                <span className="text-[11px] text-[#999AAA] bg-white border border-[#E0D0F0] px-2 py-0.5 rounded-full">
                  {skillVideos.length}/{MAX_SKILL_VIDEOS} · 3 menit/video
                </span>
              </div>
            </div>

            {skillUploading && skillPhase && (
              <div className="border-2 border-dashed border-[#A8DDD8] rounded-[12px] p-4 flex flex-col items-center mb-3">
                <ProgressIndicator phase={skillPhase} progress={skillProgress} />
              </div>
            )}

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSkillDragEnd}>
              <SortableContext items={skillVideos.map((v) => v.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {skillVideos.map((video) => (
                    <SkillVideoItem
                      key={video.id}
                      video={video}
                      onDelete={() => handleDeleteSkill(video.id)}
                      disabled={skillUploading}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {canAddSkill && (
              <button onClick={() => setShowCategoryPicker(true)}
                className="w-full min-h-[64px] border-2 border-dashed border-[#C8B8DC] rounded-[12px] flex items-center justify-center gap-2 text-[#999AAA] text-[13px] hover:border-[#A97CC4] hover:text-[#5A3A7A] transition-colors mt-3"
              ><span className="text-lg">+</span> Tambah video keahlian</button>
            )}
            <input type="file" accept="video/mp4,video/webm,video/quicktime,video/x-m4v" hidden ref={skillVideoRef} onChange={handleSkillFileChange} />
          </section>

          {/* ── Portofolio Pengalaman ─────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <p className="text-[13px] font-bold text-[#5A3A7A]">Portofolio Pengalaman</p>
                <span className="text-[11px] text-[#999AAA] bg-white border border-[#E0D0F0] px-2 py-0.5 rounded-full">
                  {portfolioEntries.length}/10
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {portfolioEntries.map((entry) => (
                <div key={entry.id} className="bg-white border border-[#E0D0F0] rounded-[14px] p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[#5A3A7A] leading-snug">{entry.title}</p>
                      <p className="text-[12px] text-[#999AAA] mt-0.5">{formatPeriod(entry)}</p>
                      {entry.description && (
                        <p className="text-[12px] text-[#666666] mt-2 leading-relaxed">{entry.description}</p>
                      )}
                    </div>
                    <button onClick={() => handlePortfolioDelete(entry.id)}
                      className="text-[#C75D5D] text-[11px] font-semibold flex-shrink-0 min-h-[40px] px-2 hover:underline"
                    >Hapus</button>
                  </div>
                  {entry.media.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {entry.media.map((m) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={m.id} src={m.url} alt="foto" className="w-16 h-16 object-cover rounded-[8px]" />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {portfolioEntries.length < 10 && (
              <button onClick={() => setShowPortfolioModal(true)}
                className="w-full min-h-[64px] border-2 border-dashed border-[#C8B8DC] rounded-[12px] flex items-center justify-center gap-2 text-[#999AAA] text-[13px] hover:border-[#A97CC4] hover:text-[#5A3A7A] transition-colors mt-3"
              ><span className="text-lg">+</span> Tambah pengalaman</button>
            )}
          </section>

          {/* ── Foto Portfolio (grid) ─────────────────────── */}
          <section className="pb-8">
            <div className="flex items-center gap-2 mb-3">
              <p className="text-[13px] font-bold text-[#5A3A7A]">Foto Portfolio</p>
              <span className="text-[11px] text-[#999AAA] bg-white border border-[#E0D0F0] px-2 py-0.5 rounded-full">Maks 6 foto</span>
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
                      <img src={photo.url} alt={photo.slug ?? `Foto ${i + 1}`} className="w-full h-full object-cover rounded-[12px]" />
                      <button onClick={() => handleDeleteMedia(photo.id, "photo", i)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-[#C75D5D] font-bold text-base shadow-sm"
                      >×</button>
                    </>
                  ) : (
                    <button
                      onClick={() => { if (filledPhotoCount >= 6) return; setActivePhotoSlot(i); portfolioPhotoRef.current?.click() }}
                      disabled={portfolioUploading !== null || filledPhotoCount >= 6}
                      className="w-full h-full border-2 border-dashed border-[#C8B8DC] rounded-[12px] flex items-center justify-center text-[#999AAA] text-2xl hover:border-[#A97CC4] hover:text-[#5A3A7A] transition-colors disabled:opacity-50"
                    >+</button>
                  )}
                </div>
              ))}
            </div>
            <input type="file" accept="image/jpeg,image/png,image/webp" hidden ref={portfolioPhotoRef} onChange={handlePortfolioPhotoUpload} />
          </section>

        </main>
      </div>
    </>
  )
}
