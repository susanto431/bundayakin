"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { CaptureWorkStyleBlock } from "@/lib/capture-work-style-instrument"

type Props = {
  items: CaptureWorkStyleBlock[]
  alreadyDoneAtISO: string | null
}

const PAGE_SIZE = 10

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
}

export default function TesSikapKerjaClient({ items, alreadyDoneAtISO }: Props) {
  const router = useRouter()
  const [answers, setAnswers] = useState<("A" | "B" | null)[]>(() => items.map(() => null))
  const [page, setPage] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [done, setDone] = useState(!!alreadyDoneAtISO)

  const totalPages = Math.ceil(items.length / PAGE_SIZE)
  const pageItems = items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)
  const answeredCount = answers.filter(a => a !== null).length
  const allAnswered = answeredCount === items.length
  const pageAnswered = pageItems.every((_, i) => answers[page * PAGE_SIZE + i] !== null)

  function setAnswer(globalIdx: number, value: "A" | "B") {
    setAnswers(prev => prev.map((a, i) => (i === globalIdx ? value : a)))
  }

  async function handleSubmit() {
    if (!allAnswered || submitting) return
    setSubmitting(true)
    setErrorMsg(null)
    try {
      const res = await fetch("/api/nanny/tes-sikap-kerja", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      })
      const data = (await res.json()) as { success: boolean; error?: string }
      if (data.success) {
        setDone(true)
        router.refresh()
      } else {
        setErrorMsg(data.error ?? "Gagal menyimpan. Coba lagi.")
      }
    } catch {
      setErrorMsg("Koneksi bermasalah. Coba lagi.")
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="max-w-[480px] mx-auto px-4 pt-5 pb-8">
        <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-5 text-center">
          <p className="text-[16px] font-bold text-[#5A3A7A] mb-1">Psikotes Karakter Kerja Nanny sudah selesai</p>
          <p className="text-[13px] text-[#999AAA] leading-relaxed">
            {alreadyDoneAtISO && `Dikerjakan ${formatDate(alreadyDoneAtISO)}. `}
            Hasilnya sudah masuk ke profil Sus dan bisa dilihat keluarga yang tertarik.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-8">
      <div className="border-b border-[#E0D0F0] pb-3 mb-4">
        <h1 className="text-[16px] font-bold text-[#5A3A7A]">Psikotes Karakter Kerja Nanny</h1>
        <p className="text-[12px] text-[#999AAA] mt-0.5">Tidak dibatasi waktu — pilih jawaban yang pertama kali terlintas di pikiran Sus.</p>
      </div>

      <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-4 mb-4">
        <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-3">
          {answeredCount}/{items.length} terjawab · Halaman {page + 1}/{totalPages}
        </p>
        <div className="space-y-5">
          {pageItems.map((item, i) => {
            const globalIdx = page * PAGE_SIZE + i
            return (
              <div key={item.no} className={i > 0 ? "pt-5 border-t border-[#F3EEF8]" : ""}>
                <p className="text-[12px] text-[#999AAA] mb-2">Soal {item.no} — pernyataan mana yang lebih menggambarkan diri Sus?</p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setAnswer(globalIdx, "A")}
                    className={`w-full text-left px-3 py-2.5 rounded-[10px] text-[13px] border-[1.5px] transition-all ${
                      answers[globalIdx] === "A"
                        ? "bg-[#5BBFB0] border-[#5BBFB0] text-white"
                        : "bg-white border-[#C8B8DC] text-[#666666] hover:border-[#5BBFB0]"
                    }`}
                  >
                    {item.statementA}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnswer(globalIdx, "B")}
                    className={`w-full text-left px-3 py-2.5 rounded-[10px] text-[13px] border-[1.5px] transition-all ${
                      answers[globalIdx] === "B"
                        ? "bg-[#5BBFB0] border-[#5BBFB0] text-white"
                        : "bg-white border-[#C8B8DC] text-[#666666] hover:border-[#5BBFB0]"
                    }`}
                  >
                    {item.statementB}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {errorMsg && <p className="text-[12px] text-red-600 mb-3" role="alert">{errorMsg}</p>}

      <div className="flex gap-2">
        {page > 0 && (
          <button
            type="button"
            onClick={() => setPage(p => p - 1)}
            className="flex-1 min-h-[48px] rounded-[10px] border-[1.5px] border-[#C8B8DC] text-[#666666] font-semibold text-[14px]"
          >
            ← Sebelumnya
          </button>
        )}
        {page < totalPages - 1 ? (
          <button
            type="button"
            onClick={() => setPage(p => p + 1)}
            disabled={!pageAnswered}
            className="flex-1 min-h-[48px] rounded-[10px] bg-[#5BBFB0] hover:bg-[#2C5F5A] disabled:opacity-50 text-white font-semibold text-[14px] transition-all"
          >
            {pageAnswered ? "Lanjut →" : "Jawab semua dulu"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className="flex-1 min-h-[48px] rounded-[10px] bg-[#5BBFB0] hover:bg-[#2C5F5A] disabled:opacity-50 text-white font-semibold text-[14px] transition-all"
          >
            {submitting ? "Menyimpan..." : allAnswered ? "Selesai & kirim" : "Jawab semua dulu"}
          </button>
        )}
      </div>
    </div>
  )
}
