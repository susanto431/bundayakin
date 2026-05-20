"use client"

import { useState } from "react"

type Props = {
  childId: string
  childName: string
  existingNotes: string | null
}

export default function NannyChildNotesForm({ childId, childName, existingNotes }: Props) {
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  async function handleSave() {
    if (!notes.trim()) return
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/nanny/child-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, notes: notes.trim() }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setSaved(true)
      setNotes("")
      setTimeout(() => setSaved(false), 3000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-[#F3EEF8] border border-[#C8B8DC] rounded-[16px] overflow-hidden">
      <div className="flex items-center gap-3 p-3.5 border-b border-[#C8B8DC]">
        <div className="w-8 h-8 bg-[#E8DCF0] rounded-[8px] flex items-center justify-center text-[16px]">📋</div>
        <div>
          <p className="text-[14px] font-bold text-[#5A3A7A]">Catatan dari Sus</p>
          <p className="text-[12px] text-[#A97CC4]">Pengamatan Sus tentang {childName}</p>
        </div>
      </div>

      <div className="p-3.5 space-y-3">
        {existingNotes && (
          <div className="bg-white border border-[#C8B8DC] rounded-[10px] px-3 py-2.5">
            <p className="text-[11px] font-semibold text-[#A97CC4] uppercase tracking-wide mb-1.5">Catatan Sus sebelumnya</p>
            <p className="text-[13px] text-[#5A3A7A] leading-relaxed whitespace-pre-line">{existingNotes}</p>
          </div>
        )}

        <p className="text-[13px] text-[#666666] leading-relaxed">
          Tuliskan pengamatan Sus — perkembangan baru, perubahan kebiasaan, atau hal penting yang perlu diketahui keluarga &amp; nanny berikutnya.
        </p>

        <textarea
          value={notes}
          onChange={e => { setNotes(e.target.value); setSaved(false) }}
          placeholder={`cth: ${childName} mulai bisa bilang kalimat 3 kata. Suka lagu sebelum tidur. Tidak mau makan sayur hijau hari ini...`}
          rows={4}
          maxLength={2000}
          className="w-full px-3.5 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] focus:border-[#A97CC4] focus:ring-2 focus:ring-[#A97CC4]/15 placeholder:text-[#C8B8DC] outline-none transition-all resize-none leading-relaxed min-h-[100px]"
        />

        {notes.length > 1800 && (
          <p className="text-[12px] text-[#999AAA] text-right">{notes.length}/2000</p>
        )}

        {error && (
          <p className="text-[13px] text-[#C75D5D] bg-[#FAEAEA] border border-[#F5C4C4] rounded-[8px] px-3 py-2">{error}</p>
        )}
        {saved && (
          <p className="text-[13px] text-[#2C5F5A] bg-[#E5F6F4] border border-[#A8DDD8] rounded-[8px] px-3 py-2 font-semibold">Catatan berhasil disimpan ✓</p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !notes.trim()}
          className="w-full bg-[#A97CC4] hover:bg-[#5A3A7A] disabled:bg-[#C8B8DC] text-white font-semibold py-3 rounded-[10px] min-h-[48px] text-[14px] transition-all"
        >
          {saving ? "Menyimpan..." : "Simpan Catatan"}
        </button>

        <p className="text-[12px] text-[#999AAA] text-center leading-relaxed">
          Catatan Sus akan disimpan dan dibaca oleh nanny berikutnya untuk menjaga kesinambungan perawatan {childName}.
        </p>
      </div>
    </div>
  )
}
