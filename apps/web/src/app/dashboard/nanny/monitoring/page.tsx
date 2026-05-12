"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const QUESTIONS = [
  {
    id: "q1",
    text: "Penilaian keseluruhan kondisi kerja bulan ini",
    options: ["Sangat memuaskan", "Memuaskan", "Cukup", "Perlu perbaikan"],
  },
  {
    id: "q2",
    text: "Hubungan dengan anggota keluarga berjalan baik?",
    options: ["Sangat baik", "Baik", "Cukup", "Ada kendala"],
  },
  {
    id: "q3",
    text: "Rencana Sus ke depan?",
    options: ["Lanjut bekerja di sini", "Lanjut tapi ada catatan", "Masih dipertimbangkan", "Ingin pindah"],
  },
]

export default function NannyMonitoringPage() {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const pillPu = (selected: boolean) =>
    `px-4 py-2 min-h-[44px] rounded-full border-[1.5px] text-[13px] font-medium transition-all cursor-pointer ${
      selected
        ? "bg-[#F3EEF8] text-[#5A3A7A] border-[#A97CC4] font-semibold"
        : "bg-white text-[#666666] border-[#C8B8DC] hover:border-[#A97CC4]"
    }`

  async function handleSubmit() {
    setLoading(true)
    try {
      await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, notes, type: "nanny_monthly", role: "NANNY" }),
      })
    } catch {
      // non-blocking
    }
    router.push("/dashboard/nanny")
  }

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-28">

      <div className="border-b border-[#E0D0F0] pb-3 mb-4">
        <h1 className="text-[16px] font-bold text-[#5A3A7A]">Pemantauan Bulan ke-1</h1>
        <p className="text-[12px] text-[#999AAA] mt-0.5">Dari sisi Sus · keluarga juga sedang mengisi</p>
      </div>

      <div className="bg-[#F3EEF8] border border-[#E0D0F0] rounded-[16px] p-3.5 mb-4">
        <p className="text-[12px] font-bold text-[#5A3A7A] mb-1">Untuk apa pemantauan ini?</p>
        <p className="text-[12px] text-[#666666] leading-relaxed">
          Untuk menjaga kenyamanan kedua belah pihak. Hasil dikompilasi dan dikirim lewat WA setelah keduanya selesai.
        </p>
      </div>

      <div className="space-y-4 mb-4">
        {QUESTIONS.map((q, i) => (
          <div key={q.id}>
            <p className="text-[13px] font-semibold text-[#5A3A7A] mb-2">{i + 1}. {q.text}</p>
            <div className="flex flex-wrap gap-2">
              {q.options.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                  className={pillPu(answers[q.id] === opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}

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
            Keluarga Ria Putri juga sedang mengisi. Hasil dikirim ke Sus lewat WA setelah keduanya selesai.
          </p>
        </div>
      </div>

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
