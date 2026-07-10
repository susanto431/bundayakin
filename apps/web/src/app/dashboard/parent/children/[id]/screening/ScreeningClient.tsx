"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import KpspVisualAid from "@/components/screening/KpspVisualAid"
import { nextKpspScreeningDate, KPSP_CATEGORY_LABEL, KPSP_CATEGORY_MESSAGE, type KpspCategory } from "@/lib/kpsp-scoring"
import type { KpspItem } from "@/lib/kpsp-instrument"

type HistoryEntry = {
  id: string
  screeningDateISO: string
  ageBand: number
  yaCount: number
  category: KpspCategory
}

type Props = {
  childId: string
  childName: string
  isPaid: boolean
  ageBand: number | null
  currentAgeMonths: number
  questions: KpspItem[]
  history: HistoryEntry[]
}

const CATEGORY_STYLE: Record<KpspCategory, string> = {
  SESUAI: "bg-[#E5F6F4] text-[#2C5F5A] border-[#A8DDD8]",
  MERAGUKAN: "bg-[#FEF0E7] text-[#A35320] border-[#F5C4A0]",
  PENYIMPANGAN: "bg-[#FAEAEA] text-[#C75D5D] border-[#F5AAAA]",
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
}

export default function ScreeningClient({ childId, childName, isPaid, ageBand, currentAgeMonths, questions, history }: Props) {
  const router = useRouter()
  const firstName = childName.split(" ")[0]

  const [answers, setAnswers] = useState<(boolean | null)[]>(() => questions.map(() => null))
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [result, setResult] = useState<{ id: string; yaCount: number; category: KpspCategory } | null>(null)

  const alreadyDoneThisBand = history.some(h => h.ageBand === ageBand)
  const allAnswered = answers.every(a => a !== null)
  const answeredCount = answers.filter(a => a !== null).length

  function setAnswer(idx: number, value: boolean) {
    setAnswers(prev => prev.map((a, i) => (i === idx ? value : a)))
  }

  async function handleSubmit() {
    if (!allAnswered || loading || ageBand == null) return
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch(`/api/parent/children/${childId}/screening`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ageBand, answers }),
      })
      const data = await res.json() as { success: boolean; data?: { id: string; yaCount: number; category: KpspCategory }; error?: string }
      if (data.success && data.data) {
        setResult(data.data)
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

  // Anak belum mencapai usia skrining pertama (3 bulan)
  if (ageBand == null) {
    return (
      <div className="max-w-[480px] mx-auto px-4 pt-5 pb-4">
        <Header childId={childId} firstName={firstName} />
        <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-6 text-center">
          <p className="text-[13px] text-[#999AAA]">
            Skrining Perkembangan mulai tersedia saat {firstName} berusia 3 bulan. Kembali lagi nanti ya, Bunda.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-4">
      <Header childId={childId} firstName={firstName} />

      <p className="text-[12px] text-[#999AAA] mb-3">
        Formulir usia {ageBand} bulan — usia {firstName} saat ini {currentAgeMonths} bulan
      </p>

      {result ? (
        <ResultCard
          childId={childId}
          screeningRecordId={result.id}
          firstName={firstName}
          category={result.category}
          yaCount={result.yaCount}
          totalQuestions={questions.length}
          isPaid={isPaid}
          ageBand={ageBand}
        />
      ) : (
        <>
          {alreadyDoneThisBand && (
            <div className="bg-[#F3EEF8] border border-[#E0D0F0] rounded-[12px] p-3 mb-3">
              <p className="text-[12px] text-[#5A3A7A]">
                Formulir usia {ageBand} bulan sudah pernah diisi. Bunda tetap bisa mengisi ulang jika ingin memantau perkembangan lebih lanjut.
              </p>
            </div>
          )}

          <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-4 mb-4">
            <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-3">
              {answeredCount}/{questions.length} terjawab
            </p>
            <div className="space-y-5">
              {questions.map((q, idx) => (
                <div key={idx} className={idx > 0 ? "pt-5 border-t border-[#F3EEF8]" : ""}>
                  <p className="text-[14px] text-[#5A3A7A] leading-relaxed mb-1">
                    <span className="font-bold">{idx + 1}. </span>{q.text}
                  </p>
                  {q.note && <p className="text-[12px] text-[#999AAA] mb-1 leading-relaxed">{q.note}</p>}
                  {q.visualAid && <KpspVisualAid kind={q.visualAid} />}
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setAnswer(idx, true)}
                      className={`flex-1 min-h-[44px] rounded-[10px] font-semibold text-[13px] border-[1.5px] transition-all ${
                        answers[idx] === true
                          ? "bg-[#5BBFB0] border-[#5BBFB0] text-white"
                          : "bg-white border-[#C8B8DC] text-[#666666] hover:border-[#5BBFB0]"
                      }`}
                    >
                      Ya
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnswer(idx, false)}
                      className={`flex-1 min-h-[44px] rounded-[10px] font-semibold text-[13px] border-[1.5px] transition-all ${
                        answers[idx] === false
                          ? "bg-[#C75D5D] border-[#C75D5D] text-white"
                          : "bg-white border-[#C8B8DC] text-[#666666] hover:border-[#C75D5D]"
                      }`}
                    >
                      Tidak
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {errorMsg && <p className="text-[12px] text-red-600 mb-3" role="alert">{errorMsg}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allAnswered || loading}
            className="w-full flex items-center justify-center bg-[#5BBFB0] hover:bg-[#2C5F5A] disabled:opacity-50 text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] mb-6 transition-all"
          >
            {loading ? "Menyimpan..." : allAnswered ? "Lihat hasil" : `Jawab semua pertanyaan (${answeredCount}/${questions.length})`}
          </button>
        </>
      )}

      {history.length > 0 && (
        <div className="bg-white border border-[#E0D0F0] rounded-[16px] overflow-hidden">
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] px-4 pt-3 pb-2">Riwayat Skrining</p>
          {history.map((h, idx) => (
            <div key={h.id} className={`px-4 py-3 flex justify-between items-center ${idx < history.length - 1 ? "border-b border-[#F3EEF8]" : ""}`}>
              <span className="text-[12px] text-[#666666]">
                {formatDate(h.screeningDateISO)} · usia {h.ageBand} bln
              </span>
              {isPaid ? (
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_STYLE[h.category]}`}>
                  {KPSP_CATEGORY_LABEL[h.category]}
                </span>
              ) : (
                <span className="text-[11px] text-[#999AAA]">Tersimpan</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Header({ childId, firstName }: { childId: string; firstName: string }) {
  return (
    <div className="border-b border-[#E0D0F0] pb-3 mb-4">
      <Link href={`/dashboard/parent/children/${childId}`} className="text-[12px] text-[#A97CC4] font-semibold mb-1 inline-block">
        ← Kembali ke profil {firstName}
      </Link>
      <h1 className="text-[16px] font-bold text-[#5A3A7A]">Skrining Perkembangan — {firstName}</h1>
      <p className="text-[12px] text-[#999AAA] mt-0.5">Berdasarkan KPSP (Kemenkes/SDIDTK)</p>
    </div>
  )
}

function ResultCard({
  childId,
  screeningRecordId,
  firstName,
  category,
  yaCount,
  totalQuestions,
  isPaid,
  ageBand,
}: {
  childId: string
  screeningRecordId: string
  firstName: string
  category: KpspCategory
  yaCount: number
  totalQuestions: number
  isPaid: boolean
  ageBand: number
}) {
  const nextDate = nextKpspScreeningDate(ageBand, new Date())

  if (!isPaid) {
    return (
      <div className="bg-[#5A3A7A] rounded-[16px] p-4 mb-4">
        <p className="text-[10px] font-bold tracking-[2px] uppercase text-[#A8DDD8] mb-1">Fitur Pelanggan</p>
        <p className="text-[14px] font-bold text-white mb-1">Jawaban {firstName} sudah tersimpan</p>
        <p className="text-[13px] leading-relaxed mb-3" style={{ color: "rgba(255,255,255,0.7)" }}>
          Pelanggan mendapat hasil lengkap: kategori perkembangan, saran stimulasi, dan pengingat skrining berikutnya.
        </p>
        <Link
          href="/dashboard/parent/subscription"
          className="inline-flex items-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white text-[13px] font-semibold px-4 py-2 rounded-[10px] min-h-[40px] transition-all"
        >
          Langganan Rp 500rb/tahun →
        </Link>
      </div>
    )
  }

  return (
    <div className={`rounded-[16px] border p-4 mb-4 ${CATEGORY_STYLE[category]}`}>
      <p className="text-[10px] font-bold uppercase tracking-wide opacity-70 mb-1">{yaCount}/{totalQuestions} jawaban &ldquo;Ya&rdquo;</p>
      <p className="text-[16px] font-bold mb-2">{KPSP_CATEGORY_LABEL[category]}</p>
      <p className="text-[13px] leading-relaxed mb-3">{KPSP_CATEGORY_MESSAGE[category].replace(/\{nama\}/g, firstName)}</p>
      <p className="text-[12px] opacity-80">
        Jadwal skrining berikutnya: <strong>{nextDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</strong>
      </p>
      {category === "PENYIMPANGAN" && (
        <Link
          href={`/dashboard/parent/children/${childId}/consultation?screeningRecordId=${screeningRecordId}`}
          className="inline-flex items-center bg-white text-[#C75D5D] border border-[#F5AAAA] text-[13px] font-semibold px-4 py-2 rounded-[10px] min-h-[40px] mt-3 transition-all hover:bg-[#FAEAEA]"
        >
          Jadwalkan konsultasi psikolog →
        </Link>
      )}
      <p className="text-[11px] mt-3 opacity-70 leading-relaxed">
        Hasil ini adalah arahan awal, bukan diagnosis. Untuk penilaian klinis, konsultasikan ke dokter anak, Posyandu, atau psikolog.
      </p>
    </div>
  )
}
