"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
  assignmentId: string
  nannyFirstName: string
  startDateISO: string
}

const GUARANTEE_WINDOW_DAYS = 30

// Kartu akhiri penugasan — di bawah form monitoring.
// Jika berakhir ≤30 hari sejak mulai → Jaminan Kecocokan terbit otomatis (PRD 06 §5).
export default function EndAssignmentCard({ assignmentId, nannyFirstName, startDateISO }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [result, setResult] = useState<{ guaranteeGranted: boolean } | null>(null)

  const daysSinceStart = Math.floor((Date.now() - new Date(startDateISO).getTime()) / (24 * 60 * 60 * 1000))
  const withinGuarantee = daysSinceStart <= GUARANTEE_WINDOW_DAYS

  async function handleEnd() {
    if (!reason.trim() || loading) return
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch(`/api/assignment/${assignmentId}/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
      })
      const data = await res.json() as { success: boolean; data?: { guaranteeGranted: boolean }; error?: string }
      if (data.success && data.data) {
        setResult({ guaranteeGranted: data.data.guaranteeGranted })
        router.refresh()
      } else {
        setErrorMsg(data.error ?? "Terjadi kesalahan. Coba lagi.")
        setLoading(false)
      }
    } catch {
      setErrorMsg("Koneksi bermasalah. Coba lagi.")
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="bg-[#E5F6F4] border border-[#A8DDD8] rounded-[16px] p-4">
        <p className="text-[14px] font-bold text-[#1E4A45] mb-1">Penugasan telah diakhiri</p>
        <p className="text-[13px] text-[#2C5F5A] leading-relaxed">
          {result.guaranteeGranted
            ? "Karena berakhir dalam 30 hari pertama, Jaminan Kecocokan Bunda aktif: matching ulang dan penempatan ulang berikutnya gratis penuh."
            : "Terima kasih sudah memberi tahu. Bunda bisa menulis rekam jejak untuk membantu keluarga berikutnya."}
        </p>
      </div>
    )
  }

  if (!open) {
    return (
      <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-4">
        <p className="text-[13px] font-bold text-[#5A3A7A] mb-1">Nanny sudah tidak bekerja?</p>
        <p className="text-[13px] text-[#666666] leading-relaxed mb-3">
          {withinGuarantee
            ? `Masih dalam masa Jaminan Kecocokan (hari ke-${daysSinceStart} dari 30) — jika diakhiri sekarang, matching & penempatan ulang gratis.`
            : "Akhiri penugasan agar pemantauan berhenti dan Bunda bisa menulis rekam jejak."}
        </p>
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center bg-transparent border-[1.5px] border-[#C8B8DC] text-[#5A3A7A] font-semibold text-[13px] min-h-[48px] rounded-[10px] hover:bg-[#F3EEF8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BBFB0] transition-all"
        >
          Akhiri penugasan Sus {nannyFirstName}
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-4">
      <p className="text-[13px] font-bold text-[#5A3A7A] mb-2">Akhiri penugasan Sus {nannyFirstName}</p>
      <label htmlFor="end-reason" className="block text-[13px] text-[#666666] mb-1.5">
        Kenapa penugasan berakhir? <span className="text-[#E07B39]">*</span>
      </label>
      <textarea
        id="end-reason"
        value={reason}
        onChange={e => setReason(e.target.value)}
        rows={3}
        placeholder="Contoh: Sus pulang kampung dan tidak kembali"
        className="w-full text-[14px] text-[#333] border border-[#E0D0F0] rounded-[10px] p-3 focus:outline-none focus:ring-2 focus:ring-[#5BBFB0] mb-1"
      />
      <p className="text-[12px] text-[#999AAA] mb-3">
        Alasan ini membantu tim kami dan tersimpan sebagai catatan internal — tidak tampil di profil nanny.
      </p>
      {errorMsg && <p className="text-[12px] text-red-600 mb-2" role="alert">{errorMsg}</p>}
      <div className="space-y-2">
        <button
          onClick={handleEnd}
          disabled={!reason.trim() || loading}
          className="w-full flex items-center justify-center bg-[#E07B39] hover:bg-[#CC6B2A] disabled:opacity-50 text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BBFB0] transition-all"
        >
          {loading ? "Memproses..." : "Ya, akhiri penugasan"}
        </button>
        <button
          onClick={() => setOpen(false)}
          disabled={loading}
          className="w-full flex items-center justify-center bg-transparent border-[1.5px] border-[#C8B8DC] text-[#666666] font-semibold text-[13px] min-h-[48px] rounded-[10px] hover:bg-[#F3EEF8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BBFB0] transition-all"
        >
          Batal
        </button>
      </div>
    </div>
  )
}
