"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
  assignmentId: string
  nannyFirstName: string
}

// Form rekam jejak pasca-penugasan — menutup loop reputasi (POC §6.3).
// Review terverifikasi otomatis karena terikat penugasan nyata.
export default function TrackRecordCard({ assignmentId, nannyFirstName }: Props) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit() {
    if (rating < 1 || loading) return
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch("/api/track-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, rating, reviewText: reviewText.trim(), isPublic }),
      })
      const data = await res.json() as { success: boolean; error?: string }
      if (data.success) {
        setDone(true)
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

  if (done) {
    return (
      <div className="bg-[#E5F6F4] border border-[#A8DDD8] rounded-[16px] p-4">
        <p className="text-[14px] font-bold text-[#1E4A45] mb-1">Rekam jejak tersimpan</p>
        <p className="text-[13px] text-[#2C5F5A] leading-relaxed">
          Terima kasih, Bunda. Pengalaman Bunda membantu keluarga berikutnya memilih dengan yakin.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-4">
      <p className="text-[14px] font-bold text-[#5A3A7A] mb-1">
        Bagaimana pengalaman bersama Sus {nannyFirstName}?
      </p>
      <p className="text-[13px] text-[#666666] leading-relaxed mb-3">
        Rekam jejak ini terverifikasi platform dan membangun reputasi nanny untuk keluarga berikutnya.
      </p>

      {/* Rating bintang */}
      <div className="flex items-center gap-1.5 mb-3" role="radiogroup" aria-label="Rating 1 sampai 5">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} bintang`}
            onClick={() => setRating(n)}
            className="w-11 h-11 flex items-center justify-center rounded-[10px] hover:bg-[#F3EEF8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BBFB0] transition-all"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill={n <= rating ? "#E07B39" : "none"} stroke={n <= rating ? "#E07B39" : "#C8B8DC"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        ))}
      </div>

      <label htmlFor="review-text" className="block text-[13px] text-[#666666] mb-1.5">
        Cerita singkat (opsional)
      </label>
      <textarea
        id="review-text"
        value={reviewText}
        onChange={e => setReviewText(e.target.value)}
        rows={3}
        placeholder={`Contoh: Sus ${nannyFirstName} sabar dan telaten, anak saya cepat lengket`}
        className="w-full text-[14px] text-[#333] border border-[#E0D0F0] rounded-[10px] p-3 focus:outline-none focus:ring-2 focus:ring-[#5BBFB0] mb-3"
      />

      <label className="flex items-start gap-2.5 cursor-pointer mb-4">
        <input
          type="checkbox"
          className="sr-only"
          checked={isPublic}
          onChange={e => setIsPublic(e.target.checked)}
        />
        <div
          aria-hidden="true"
          className={`w-5 h-5 rounded-[6px] border-[1.5px] flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
            isPublic ? "bg-[#5BBFB0] border-[#5BBFB0]" : "bg-white border-[#C8B8DC]"
          }`}
        >
          {isPublic && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <span className="text-[13px] text-[#666666] leading-relaxed">
          Tampilkan nama saya di rekam jejak (jika tidak dicentang, review tampil anonim)
        </span>
      </label>

      {errorMsg && <p className="text-[12px] text-red-600 mb-2" role="alert">{errorMsg}</p>}

      <button
        onClick={handleSubmit}
        disabled={rating < 1 || loading}
        className="w-full flex items-center justify-center bg-[#5BBFB0] hover:bg-[#2C5F5A] disabled:opacity-50 text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5A3A7A] transition-all"
      >
        {loading ? "Menyimpan..." : "Simpan rekam jejak"}
      </button>
    </div>
  )
}
