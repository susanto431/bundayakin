"use client"

import { useMemo, useRef, useState } from "react"

const MONTHS = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
]

type PortfolioPhoto = { file: File; previewUrl: string }

type Props = {
  onSave: (data: {
    title: string
    description: string
    startMonth: number
    startYear: number
    endMonth: number | null
    endYear: number | null
    isOngoing: boolean
    photos: { url: string; storageKey: string }[]
  }) => Promise<void>
  onCancel: () => void
}

export default function AddPortfolioModal({ onSave, onCancel }: Props) {
  const currentYear = new Date().getFullYear()
  const years = useMemo(() => Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i), [currentYear])

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startMonth, setStartMonth] = useState<number | "">(new Date().getMonth() + 1)
  const [startYear, setStartYear] = useState<number | "">(currentYear)
  const [endMonth, setEndMonth] = useState<number | "">("")
  const [endYear, setEndYear] = useState<number | "">("")
  const [isOngoing, setIsOngoing] = useState(false)
  const [photos, setPhotos] = useState<PortfolioPhoto[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const photoRef = useRef<HTMLInputElement>(null)

  function handlePhotoAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || photos.length >= 3) return
    const previewUrl = URL.createObjectURL(file)
    setPhotos((prev) => [...prev, { file, previewUrl }])
    if (photoRef.current) photoRef.current.value = ""
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      const next = [...prev]
      URL.revokeObjectURL(next[index].previewUrl)
      next.splice(index, 1)
      return next
    })
  }

  async function handleSave() {
    if (!title.trim()) { setError("Judul wajib diisi"); return }
    if (!startMonth || !startYear) { setError("Periode mulai wajib diisi"); return }
    if (!isOngoing && (!endMonth || !endYear)) { setError("Periode selesai wajib diisi, atau centang 'Masih berlangsung'"); return }

    setSaving(true)
    setError("")
    try {
      const uploadedPhotos: { url: string; storageKey: string }[] = []
      for (let i = 0; i < photos.length; i++) {
        const fd = new FormData()
        fd.append("file", photos[i].file)
        fd.append("type", "PORTFOLIO_ENTRY_PHOTO")
        fd.append("slug", `entry-foto-${i + 1}`)
        const res = await fetch("/api/upload", { method: "POST", body: fd })
        const json = await res.json()
        if (!json.success) throw new Error(json.error)
        uploadedPhotos.push({ url: json.url, storageKey: json.storageKey })
      }
      await onSave({
        title: title.trim(),
        description: description.trim(),
        startMonth: startMonth as number,
        startYear: startYear as number,
        endMonth: isOngoing ? null : (endMonth as number),
        endYear: isOngoing ? null : (endYear as number),
        isOngoing,
        photos: uploadedPhotos,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan")
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-end">
      <div className="w-full bg-white rounded-t-[24px] px-4 pt-5 pb-8 max-h-[90vh] overflow-y-auto">
        <div className="w-10 h-1 bg-[#E0D0F0] rounded-full mx-auto mb-4" />
        <h3 className="font-bold text-[#5A3A7A] text-[15px] mb-4">Tambah Pengalaman</h3>

        {error && (
          <div className="bg-[#FAEAEA] border border-red-200 rounded-[10px] px-3 py-2 mb-4">
            <p className="text-[12px] text-[#C75D5D]">{error}</p>
          </div>
        )}

        {/* Judul */}
        <label className="block text-[12px] font-semibold text-[#5A3A7A] mb-1">
          Judul Pengalaman <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="cth: Merawat Bayi Kembar 3 Bulan"
          maxLength={100}
          className="w-full border-2 border-[#E0D0F0] rounded-[12px] px-4 py-3 text-[13px] text-[#5A3A7A] mb-4 focus:outline-none focus:border-[#5BBFB0]"
        />

        {/* Deskripsi */}
        <label className="block text-[12px] font-semibold text-[#5A3A7A] mb-1">
          Deskripsi Singkat
          <span className="text-[#999AAA] font-normal ml-1">({description.length}/500)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ceritakan pengalaman kamu…"
          maxLength={500}
          rows={3}
          className="w-full border-2 border-[#E0D0F0] rounded-[12px] px-4 py-3 text-[13px] text-[#5A3A7A] mb-4 focus:outline-none focus:border-[#5BBFB0] resize-none"
        />

        {/* Periode Mulai */}
        <label className="block text-[12px] font-semibold text-[#5A3A7A] mb-1">
          Mulai <span className="text-red-400">*</span>
        </label>
        <div className="flex gap-2 mb-4">
          <select
            value={startMonth}
            onChange={(e) => setStartMonth(Number(e.target.value))}
            className="flex-1 border-2 border-[#E0D0F0] rounded-[12px] px-3 py-3 text-[13px] text-[#5A3A7A] focus:outline-none focus:border-[#5BBFB0]"
          >
            <option value="">Bulan</option>
            {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
          <select
            value={startYear}
            onChange={(e) => setStartYear(Number(e.target.value))}
            className="flex-1 border-2 border-[#E0D0F0] rounded-[12px] px-3 py-3 text-[13px] text-[#5A3A7A] focus:outline-none focus:border-[#5BBFB0]"
          >
            <option value="">Tahun</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Masih berlangsung */}
        <label className="flex items-center gap-2 mb-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isOngoing}
            onChange={(e) => setIsOngoing(e.target.checked)}
            className="w-4 h-4 accent-[#5BBFB0]"
          />
          <span className="text-[13px] text-[#5A3A7A]">Masih berlangsung</span>
        </label>

        {/* Periode Selesai */}
        {!isOngoing && (
          <>
            <label className="block text-[12px] font-semibold text-[#5A3A7A] mb-1">
              Selesai <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2 mb-4">
              <select
                value={endMonth}
                onChange={(e) => setEndMonth(Number(e.target.value))}
                className="flex-1 border-2 border-[#E0D0F0] rounded-[12px] px-3 py-3 text-[13px] text-[#5A3A7A] focus:outline-none focus:border-[#5BBFB0]"
              >
                <option value="">Bulan</option>
                {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
              </select>
              <select
                value={endYear}
                onChange={(e) => setEndYear(Number(e.target.value))}
                className="flex-1 border-2 border-[#E0D0F0] rounded-[12px] px-3 py-3 text-[13px] text-[#5A3A7A] focus:outline-none focus:border-[#5BBFB0]"
              >
                <option value="">Tahun</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </>
        )}

        {/* Foto */}
        <label className="block text-[12px] font-semibold text-[#5A3A7A] mb-2">
          Foto Pendukung
          <span className="text-[#999AAA] font-normal ml-1">(maks 3)</span>
        </label>
        <div className="flex gap-2 mb-4">
          {photos.map((p, i) => (
            <div key={i} className="relative w-20 h-20 flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.previewUrl} alt={`foto ${i + 1}`} className="w-full h-full object-cover rounded-[10px]" />
              <button
                onClick={() => removePhoto(i)}
                disabled={saving}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#C75D5D] text-white text-xs flex items-center justify-center disabled:opacity-50"
              >×</button>
            </div>
          ))}
          {photos.length < 3 && (
            <button
              onClick={() => photoRef.current?.click()}
              disabled={saving}
              className="w-20 h-20 border-2 border-dashed border-[#C8B8DC] rounded-[10px] flex items-center justify-center text-[#999AAA] text-xl hover:border-[#A97CC4] disabled:opacity-50 flex-shrink-0"
            >
              +
            </button>
          )}
        </div>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          ref={photoRef}
          onChange={handlePhotoAdd}
        />

        {/* Actions */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={onCancel}
            disabled={saving}
            className="flex-1 min-h-[48px] border-2 border-[#E0D0F0] text-[#999AAA] font-semibold text-[13px] rounded-[12px]"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 min-h-[48px] bg-[#5BBFB0] disabled:opacity-50 text-white font-semibold text-[13px] rounded-[12px] flex items-center justify-center gap-2"
          >
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Menyimpan…</>
            ) : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  )
}
