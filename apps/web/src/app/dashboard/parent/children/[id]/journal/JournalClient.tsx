"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

type Entry = {
  id: string
  caption: string
  photoUrl: string | null
  momentDateISO: string
  authorRole: string
}

type Props = {
  childId: string
  childName: string
  entries: Entry[]
}

function groupByMonth(entries: Entry[]): { label: string; items: Entry[] }[] {
  const groups = new Map<string, Entry[]>()
  for (const e of entries) {
    const d = new Date(e.momentDateISO)
    const key = d.toLocaleDateString("id-ID", { month: "long", year: "numeric" })
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(e)
  }
  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }))
}

export default function JournalClient({ childId, childName, entries }: Props) {
  const router = useRouter()
  const firstName = childName.split(" ")[0]
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [showForm, setShowForm] = useState(false)
  const [caption, setCaption] = useState("")
  const [momentDate, setMomentDate] = useState(() => new Date().toISOString().split("T")[0])
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function handleSubmit() {
    if (!caption.trim() || loading) return
    setLoading(true)
    setErrorMsg(null)
    try {
      let photoUrl: string | undefined
      let photoKey: string | undefined

      if (photoFile) {
        const formData = new FormData()
        formData.append("file", photoFile)
        formData.append("type", "CHILD_JOURNAL_PHOTO")
        formData.append("childId", childId)
        formData.append("slug", "momen")
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData })
        const uploadData = await uploadRes.json() as { success: boolean; url?: string; storageKey?: string; error?: string }
        if (!uploadData.success || !uploadData.url) {
          setErrorMsg(uploadData.error ?? "Gagal upload foto")
          setLoading(false)
          return
        }
        photoUrl = uploadData.url
        photoKey = uploadData.storageKey
      }

      const res = await fetch(`/api/parent/children/${childId}/journal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: caption.trim(), momentDate, photoUrl, photoKey }),
      })
      const data = await res.json() as { success: boolean; error?: string }
      if (data.success) {
        setCaption(""); setPhotoFile(null); setPhotoPreview(null); setShowForm(false)
        router.refresh()
      } else {
        setErrorMsg(data.error ?? "Gagal menyimpan. Coba lagi.")
      }
    } catch {
      setErrorMsg("Koneksi bermasalah. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  const grouped = groupByMonth(entries)

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-4">
      {/* Header */}
      <div className="border-b border-[#E0D0F0] pb-3 mb-4">
        <Link href={`/dashboard/parent/children/${childId}`} className="text-[12px] text-[#A97CC4] font-semibold mb-1 inline-block">
          ← Kembali ke profil {firstName}
        </Link>
        <h1 className="text-[16px] font-bold text-[#5A3A7A]">Jurnal Momen — {firstName}</h1>
        <p className="text-[12px] text-[#999AAA] mt-0.5">Catat momen penting yang tidak ingin Bunda lupakan</p>
      </div>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 bg-[#A97CC4] hover:bg-[#5A3A7A] text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] mb-4 transition-all"
        >
          + Tulis momen baru
        </button>
      ) : (
        <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-4 mb-4">
          <p className="text-[13px] font-bold text-[#5A3A7A] mb-3">Momen baru</p>
          <div className="space-y-3">
            <div>
              <label htmlFor="momentDate" className="block text-[12px] text-[#666666] mb-1">Tanggal</label>
              <input id="momentDate" type="date" value={momentDate} max={new Date().toISOString().split("T")[0]}
                onChange={e => setMomentDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[48px] focus:border-[#A97CC4] focus:ring-2 focus:ring-[#A97CC4]/15 outline-none transition-all" />
            </div>
            <div>
              <label htmlFor="caption" className="block text-[12px] text-[#666666] mb-1">Ceritanya</label>
              <textarea id="caption" value={caption} onChange={e => setCaption(e.target.value)} rows={3}
                placeholder={`Contoh: hari ini ${firstName} bisa berdiri sendiri untuk pertama kali!`}
                className="w-full px-3.5 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[90px] focus:border-[#A97CC4] focus:ring-2 focus:ring-[#A97CC4]/15 outline-none transition-all resize-none leading-relaxed" />
            </div>
            <div>
              <label className="block text-[12px] text-[#666666] mb-1">Foto (opsional)</label>
              {photoPreview ? (
                <div className="relative w-24 h-24 rounded-[10px] overflow-hidden border border-[#E0D0F0]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL lokal, bukan kandidat next/image */}
                  <img src={photoPreview} alt="Pratinjau foto momen" className="w-full h-full object-cover" />
                  <button
                    onClick={() => { setPhotoFile(null); setPhotoPreview(null); if (fileInputRef.current) fileInputRef.current.value = "" }}
                    className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center bg-black/50 rounded-full text-white text-[12px]"
                    aria-label="Hapus foto"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 flex items-center justify-center rounded-[10px] border-[1.5px] border-dashed border-[#C8B8DC] text-[#999AAA] hover:border-[#A97CC4] transition-all"
                  aria-label="Tambah foto"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoSelect} className="hidden" />
            </div>
            {errorMsg && <p className="text-[12px] text-red-600" role="alert">{errorMsg}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => { setShowForm(false); setCaption(""); setPhotoFile(null); setPhotoPreview(null) }}
                disabled={loading}
                className="flex-1 border-[1.5px] border-[#C8B8DC] text-[#666666] font-semibold text-[13px] min-h-[44px] rounded-[10px] hover:bg-[#F3EEF8] transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={!caption.trim() || loading}
                className="flex-1 bg-[#A97CC4] hover:bg-[#5A3A7A] disabled:opacity-50 text-white font-semibold text-[13px] min-h-[44px] rounded-[10px] transition-all"
              >
                {loading ? "Menyimpan..." : "Simpan momen"}
              </button>
            </div>
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-6 text-center">
          <p className="text-[13px] text-[#999AAA]">Belum ada momen tercatat. Mulai tulis cerita tentang {firstName}.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(group => (
            <div key={group.label}>
              <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">{group.label}</p>
              <div className="space-y-2">
                {group.items.map(entry => (
                  <div key={entry.id} className="bg-white border border-[#E0D0F0] rounded-[16px] p-3.5 flex gap-3">
                    {entry.photoUrl && (
                      <div className="relative w-16 h-16 rounded-[10px] overflow-hidden flex-shrink-0">
                        <Image src={entry.photoUrl} alt="Foto momen" fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-[#999AAA] mb-0.5">
                        {new Date(entry.momentDateISO).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                        {entry.authorRole === "NANNY" && " · dari Sus"}
                      </p>
                      <p className="text-[13px] text-[#5A3A7A] leading-relaxed">{entry.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
