"use client"

import { useState } from "react"

type Props = {
  bookingId: string
  psikologName: string
  onClose: () => void
  onSubmitted: () => void
}

const PARAMS: Array<{ key: string; label: string; options: string[] }> = [
  { key: "kejelasan_penjelasan", label: "Kejelasan penjelasan psikolog", options: ["Baik", "Cukup", "Kurang"] },
  { key: "empati", label: "Empati & kenyamanan bicara", options: ["Baik", "Cukup", "Kurang"] },
  { key: "ketepatan_waktu", label: "Ketepatan waktu sesi", options: ["Baik", "Cukup", "Kurang"] },
]

// Ulasan Psikolog — internal-only, HANYA untuk pemantauan kualitas HCC (ADR-012).
// Tidak pernah ditampilkan ke orang tua lain di mana pun.
export default function ReviewPromptModal({ bookingId, psikologName, onClose, onSubmitted }: Props) {
  const [isGood, setIsGood] = useState<boolean | null>(null)
  const [scores, setScores] = useState<Record<string, string>>({})
  const [narrative, setNarrative] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSubmit() {
    if (isGood === null || submitting) return
    setSubmitting(true)
    setErrorMsg(null)
    try {
      const res = await fetch("/api/consultation/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, isGood, scores, narrative: narrative || undefined }),
      })
      const data = (await res.json()) as { success: boolean; error?: string }
      if (data.success) {
        onSubmitted()
      } else {
        setErrorMsg(data.error ?? "Gagal menyimpan ulasan")
        setSubmitting(false)
      }
    } catch {
      setErrorMsg("Koneksi bermasalah. Coba lagi.")
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[16px] w-full max-w-[420px] p-5 max-h-[85vh] overflow-y-auto">
        <p className="text-[15px] font-bold text-[#5A3A7A]">Bagaimana sesi dengan {psikologName}?</p>
        <p className="text-[12px] text-[#999AAA] mt-1 mb-4">
          Ulasan ini membantu kami menjaga kualitas psikolog untuk Bunda lainnya — hanya dilihat tim internal, tidak ditampilkan ke orang tua lain.
        </p>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setIsGood(true)}
            className={`flex-1 min-h-[44px] rounded-[10px] border-[1.5px] font-semibold text-[13px] transition-all ${
              isGood === true ? "bg-[#5BBFB0] border-[#5BBFB0] text-white" : "bg-white border-[#C8B8DC] text-[#666666]"
            }`}
          >
            🙂 Puas
          </button>
          <button
            type="button"
            onClick={() => setIsGood(false)}
            className={`flex-1 min-h-[44px] rounded-[10px] border-[1.5px] font-semibold text-[13px] transition-all ${
              isGood === false ? "bg-[#A97CC4] border-[#A97CC4] text-white" : "bg-white border-[#C8B8DC] text-[#666666]"
            }`}
          >
            🙁 Kurang puas
          </button>
        </div>

        {isGood !== null && (
          <>
            <div className="space-y-3 mb-4">
              {PARAMS.map((p) => (
                <div key={p.key}>
                  <label className="text-[11px] font-semibold text-[#666666]">{p.label}</label>
                  <div className="flex gap-2 mt-1">
                    {p.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setScores((prev) => ({ ...prev, [p.key]: opt }))}
                        className={`flex-1 min-h-[36px] rounded-[8px] border-[1.5px] text-[12px] font-semibold transition-all ${
                          scores[p.key] === opt ? "bg-[#5A3A7A] border-[#5A3A7A] text-white" : "bg-white border-[#E0D0F0] text-[#666666]"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <label className="text-[11px] font-semibold text-[#666666]">Ceritakan lebih lanjut (opsional)</label>
            <textarea
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              rows={3}
              placeholder="Apa yang berkesan atau perlu diperbaiki dari sesi ini?"
              className="w-full rounded-[8px] border border-[#C8B8DC] px-3 py-2 text-[13px] mt-1 mb-4"
            />
          </>
        )}

        {errorMsg && <p className="text-[12px] text-red-600 mb-2">{errorMsg}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-[44px] rounded-[10px] border-[1.5px] border-[#C8B8DC] text-[#666666] font-semibold text-[13px]"
          >
            Nanti saja
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isGood === null || submitting}
            className="flex-1 min-h-[44px] rounded-[10px] bg-[#5BBFB0] hover:bg-[#2C5F5A] disabled:opacity-50 text-white font-semibold text-[13px] transition-all"
          >
            {submitting ? "Mengirim..." : "Kirim Ulasan"}
          </button>
        </div>
      </div>
    </div>
  )
}
