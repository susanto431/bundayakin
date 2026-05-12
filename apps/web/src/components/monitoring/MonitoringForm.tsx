"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Timing = "WEEK_1" | "WEEK_2" | "MONTH_1" | "MONTH_3"

type Props = {
  timing: Timing
  nannyFirstName: string
  assignmentId: string
  alreadyDone: boolean
}

const TIMING_LABEL: Record<Timing, string> = {
  WEEK_1: "Kabar minggu ke-1",
  WEEK_2: "Kabar minggu ke-2",
  MONTH_1: "Pemantauan bulan ke-1",
  MONTH_3: "Pemantauan bulan ke-3",
}

const WEEKLY_QUESTIONS = [
  { id: "q1", text: "Secara umum, bagaimana kondisi nanny minggu ini?", options: ["Sangat baik", "Baik", "Cukup", "Ada kendala"] },
  { id: "q2", text: "Ada yang perlu diperhatikan?", options: ["Tidak ada — sejauh ini baik-baik saja", "Ada sedikit, tapi bisa saya tangani", "Ada, dan butuh bantuan tim BY"], dangerOption: "Ada, dan butuh bantuan tim BY" },
  { id: "q3", text: "Nanny terlihat nyaman & beradaptasi?", options: ["Sangat terlihat", "Cukup terlihat", "Belum terlihat"] },
]

const MONTHLY_QUESTIONS = [
  { id: "m1", text: "Penilaian keseluruhan kinerja nanny bulan ini", options: ["Sangat memuaskan", "Memuaskan", "Cukup", "Perlu perbaikan"] },
  { id: "m2", text: "Nanny aktif mengajak si kecil main & belajar?", options: ["Hangat & aktif", "Baik tapi kurang inisiatif", "Biasa saja"] },
  { id: "m3", text: "Rencana lanjut kerja sama?", options: ["Ya pasti", "Ya tapi ada catatan", "Masih dipertimbangkan", "Tidak"] },
]

export default function MonitoringForm({ timing, nannyFirstName, assignmentId, alreadyDone }: Props) {
  const router = useRouter()
  const isWeekly = timing === "WEEK_1" || timing === "WEEK_2"
  const questions = isWeekly ? WEEKLY_QUESTIONS : MONTHLY_QUESTIONS

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const allAnswered = questions.every(q => !!answers[q.id])

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/parent/monitoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, timing, answers, notes }),
      })
      const json = await res.json() as { success: boolean; error?: string }
      if (!json.success) {
        setError(json.error ?? "Gagal menyimpan.")
      } else {
        router.push("/dashboard/parent")
        router.refresh()
      }
    } catch {
      setError("Tidak dapat terhubung ke server.")
    } finally {
      setLoading(false)
    }
  }

  if (alreadyDone) {
    return (
      <div className="max-w-[480px] mx-auto px-4 pt-16 text-center">
        <div className="w-16 h-16 bg-[#E5F6F4] rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5BBFB0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <p className="font-[var(--font-dm-serif)] text-[22px] text-[#5A3A7A] mb-2">Sudah diisi</p>
        <p className="text-[13px] text-[#999AAA] leading-relaxed">
          {TIMING_LABEL[timing]} sudah kamu isi.<br />Menunggu {nannyFirstName} mengisi dari sisinya.
        </p>
        <button
          onClick={() => router.push("/dashboard/parent")}
          className="mt-6 inline-flex items-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[13px] px-5 py-2.5 rounded-[10px] min-h-[44px] transition-all"
        >
          Kembali ke beranda
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-28">

      {/* Header */}
      <div className="border-b border-[#E0D0F0] pb-3 mb-4">
        <h1 className="text-[16px] font-bold text-[#5A3A7A]">{TIMING_LABEL[timing]}</h1>
        <p className="text-[12px] text-[#999AAA] mt-0.5">
          {nannyFirstName} · {isWeekly ? "5 pertanyaan singkat, ~2 menit" : "10 pertanyaan, ~5 menit"}
        </p>
      </div>

      {/* Why card */}
      <div className="bg-[#E5F6F4] border border-[#A8DDD8] rounded-[16px] p-3.5 mb-4">
        <p className="text-[12px] font-bold text-[#1E4A45] mb-1">
          {isWeekly ? "Mengapa ada kabar mingguan?" : "Untuk apa pemantauan ini?"}
        </p>
        <p className="text-[12px] text-[#2C5F5A] leading-relaxed">
          {isWeekly
            ? `Minggu pertama sering jadi penentu. Dengan berbagi kabar lebih awal, kami bisa bantu sebelum hal kecil jadi besar. ${nannyFirstName} juga mengisi dari sisinya — hasilnya untuk berdua.`
            : `Untuk menjaga kenyamanan kedua belah pihak. ${nannyFirstName} juga mengisi dari sisinya — hasilnya kami kompilasi dan kirim via WA.`}
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-4 mb-4">
        {questions.map((q, i) => {
          const selected = answers[q.id]
          return (
            <div key={q.id}>
              <p className="text-[13px] font-semibold text-[#5A3A7A] mb-2">{i + 1}. {q.text}</p>
              <div className="flex flex-wrap gap-2">
                {q.options.map(opt => {
                  const isSelected = selected === opt
                  const isDanger = (q as typeof q & { dangerOption?: string }).dangerOption === opt
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                      className={`px-4 py-2 min-h-[44px] rounded-full border-[1.5px] text-[13px] font-medium transition-all cursor-pointer ${
                        isSelected
                          ? isDanger ? "bg-[#FAEAEA] text-[#C75D5D] border-[#C75D5D] font-semibold" : "bg-[#E5F6F4] text-[#1E4A45] border-[#5BBFB0] font-semibold"
                          : isDanger ? "bg-white text-[#C75D5D] border-[#C75D5D]" : "bg-white text-[#666666] border-[#C8B8DC] hover:border-[#5BBFB0]"
                      }`}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Notes */}
      <div className="mb-4">
        <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">
          Pesan untuk tim BundaYakin? <span className="font-normal text-[#999AAA]">(opsional)</span>
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Tulis di sini..."
          rows={3}
          className="w-full px-3.5 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[72px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/15 placeholder:text-[#999AAA] outline-none transition-all resize-none leading-relaxed"
        />
      </div>

      <div className="bg-[#F3EEF8] rounded-[10px] px-3 py-2.5 mb-4">
        <p className="text-[12px] text-[#999AAA]">
          {isWeekly
            ? "Tidak ada jawaban benar atau salah — ini untuk membantu dua pihak merasa nyaman."
            : `${nannyFirstName} sedang mengisi dari sisinya. Hasil dikirim lewat WA saat keduanya selesai.`}
        </p>
      </div>

      {error && (
        <div className="bg-[#FAEAEA] border border-[#C75D5D] rounded-[10px] px-3.5 py-2.5 mb-3">
          <p className="text-[13px] text-[#C75D5D]">{error}</p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || !allAnswered}
        className="w-full flex items-center justify-center bg-[#5BBFB0] hover:bg-[#2C5F5A] disabled:opacity-50 text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] transition-all"
      >
        {loading ? "Mengirim..." : !allAnswered ? `Jawab semua pertanyaan dulu (${Object.keys(answers).length}/${questions.length})` : isWeekly ? "Kirim kabar →" : "Kirim pemantauan →"}
      </button>
    </div>
  )
}
