"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const CHECKIN_QUESTIONS = [
  {
    id: "q1",
    text: "Kondisi kerja minggu ini?",
    options: ["Sangat baik", "Baik", "Cukup", "Ada kendala"],
  },
  {
    id: "q2",
    text: "Kenyamanan bekerja di keluarga ini?",
    options: ["Sangat nyaman", "Nyaman", "Cukup nyaman", "Kurang nyaman"],
  },
  {
    id: "q3",
    text: "Komunikasi dengan keluarga?",
    options: ["Sangat lancar", "Lancar", "Cukup", "Perlu perbaikan"],
  },
  {
    id: "q4",
    text: "Ada kendala atau kekhawatiran?",
    options: ["Tidak ada", "Ada, masih bisa kuatasi", "Ada, butuh bantuan"],
  },
]

const EVALUATION_QUESTIONS = [
  {
    id: "m1",
    text: "Penilaian kondisi kerja bulan ini?",
    options: ["Sangat memuaskan", "Memuaskan", "Cukup", "Perlu perbaikan"],
  },
  {
    id: "m2",
    text: "Hubungan dengan anggota keluarga?",
    options: ["Sangat baik", "Baik", "Cukup", "Ada kendala"],
  },
  {
    id: "m3",
    text: "Komunikasi dengan keluarga?",
    options: ["Sangat lancar", "Lancar", "Cukup", "Perlu perbaikan"],
  },
]

const CONTINUE_OPTIONS = [
  { label: "Lanjut bekerja di sini", value: true },
  { label: "Lanjut tapi ada catatan", value: true },
  { label: "Masih dipertimbangkan", value: false },
  { label: "Ingin pindah", value: false },
]

type Props = {
  assignmentId: string
  timing: string
  familyName: string
  isCheckin: boolean
}

export default function MonitoringForm({ assignmentId, timing, familyName, isCheckin }: Props) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [nannyContinue, setNannyContinue] = useState<boolean | null>(null)
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const questions = isCheckin ? CHECKIN_QUESTIONS : EVALUATION_QUESTIONS

  const pill = (selected: boolean) =>
    `px-4 py-2 min-h-[44px] rounded-full border-[1.5px] text-[13px] font-medium transition-all cursor-pointer ${
      selected
        ? "bg-[#F3EEF8] text-[#5A3A7A] border-[#A97CC4] font-semibold"
        : "bg-white text-[#666666] border-[#C8B8DC] hover:border-[#A97CC4]"
    }`

  async function handleSubmit() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/nanny/monitoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, timing, answers, nannyContinue, notes }),
      })
      const data = await res.json() as { success: boolean; error?: string }
      if (!data.success) throw new Error(data.error ?? "Gagal mengirim")
      router.push("/dashboard/nanny")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 mb-4">
      {questions.map((q, i) => (
        <div key={q.id}>
          <p className="text-[13px] font-semibold text-[#5A3A7A] mb-2">{i + 1}. {q.text}</p>
          <div className="flex flex-wrap gap-2">
            {q.options.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                className={pill(answers[q.id] === opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      {!isCheckin && (
        <div>
          <p className="text-[13px] font-semibold text-[#5A3A7A] mb-2">{questions.length + 1}. Rencana Sus ke depan?</p>
          <div className="flex flex-wrap gap-2">
            {CONTINUE_OPTIONS.map(opt => (
              <button
                key={opt.label}
                type="button"
                onClick={() => {
                  setAnswers(prev => ({ ...prev, continue: opt.label }))
                  setNannyContinue(opt.value)
                }}
                className={pill(answers.continue === opt.label)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">
          Catatan bebas <span className="font-normal text-[#999AAA]">(opsional)</span>
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Ada hal lain yang ingin Sus sampaikan..."
          rows={3}
          className="w-full px-3.5 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[72px] focus:border-[#A97CC4] focus:ring-2 focus:ring-[#A97CC4]/15 placeholder:text-[#999AAA] outline-none transition-all resize-none leading-relaxed"
        />
      </div>

      <div className="bg-[#F3EEF8] rounded-[10px] px-3 py-2.5">
        <p className="text-[12px] text-[#999AAA]">
          Keluarga {familyName} juga sedang mengisi. Hasil dikirim ke Sus lewat WA setelah keduanya selesai.
        </p>
      </div>

      {error && (
        <p className="text-[12px] text-[#C75D5D] font-medium">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full flex items-center justify-center bg-[#A97CC4] hover:bg-[#5A3A7A] disabled:opacity-50 text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] transition-all"
      >
        {loading ? "Mengirim..." : "Kirim pemantauan"}
      </button>
    </div>
  )
}
