"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type TabKey = "questions" | "summary"

const WEEKLY_QUESTIONS = [
  {
    id: "q1",
    text: "Secara umum, bagaimana kondisi nanny minggu ini?",
    options: ["Sangat baik", "Baik", "Cukup", "Ada kendala"],
  },
  {
    id: "q2",
    text: "Ada yang perlu diperhatikan?",
    options: ["Tidak ada — sejauh ini baik-baik saja", "Ada sedikit, tapi bisa saya tangani", "Ada, dan butuh bantuan tim BY"],
    dangerOption: "Ada, dan butuh bantuan tim BY",
  },
  {
    id: "q3",
    text: "Nanny terlihat nyaman & beradaptasi?",
    options: ["Sangat terlihat", "Cukup terlihat", "Belum terlihat"],
  },
]

const MONTHLY_QUESTIONS = [
  {
    id: "m1",
    text: "Penilaian keseluruhan kinerja nanny bulan ini",
    options: ["Sangat memuaskan", "Memuaskan", "Cukup", "Perlu perbaikan"],
  },
  {
    id: "m2",
    text: "Nanny aktif mengajak si kecil main & belajar?",
    options: ["Hangat & aktif", "Baik tapi kurang inisiatif", "Biasa saja"],
  },
  {
    id: "m3",
    text: "Rencana lanjut kerja sama?",
    options: ["Ya pasti", "Ya tapi ada catatan", "Masih dipertimbangkan", "Tidak"],
  },
]

export default function MonitoringPage() {
  const router = useRouter()
  const [tab, setTab] = useState<TabKey>("questions")
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  // Determine if this is weekly or monthly (would come from URL/server in prod)
  const isWeekly = true
  const questions = isWeekly ? WEEKLY_QUESTIONS : MONTHLY_QUESTIONS
  const nannyFirstName = "Siti"

  async function handleSubmit() {
    setLoading(true)
    try {
      await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, notes, type: isWeekly ? "weekly" : "monthly" }),
      })
    } catch {
      // non-blocking
    }
    router.push("/dashboard/parent")
  }

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-28">

      {/* Header */}
      <div className="border-b border-[#E0D0F0] pb-3 mb-4">
        <h1 className="text-[16px] font-bold text-[#5A3A7A]">
          {isWeekly ? "Kabar minggu pertama" : "Pemantauan Bulan ke-1"}
        </h1>
        <p className="text-[12px] text-[#999AAA] mt-0.5">
          {nannyFirstName} Rahayu · {isWeekly ? "5 pertanyaan singkat, ~2 menit" : "isi sebelum 20 Juni 2026"}
        </p>
      </div>

      {/* Tabs (monthly only) */}
      {!isWeekly && (
        <div className="flex border-b-2 border-[#E0D0F0] mb-4">
          <button
            onClick={() => setTab("questions")}
            className={`pb-2 text-[13px] font-semibold mr-5 border-b-2 -mb-[2px] transition-colors ${tab === "questions" ? "text-[#5BBFB0] border-[#5BBFB0]" : "text-[#999AAA] border-transparent"}`}
          >
            Pertanyaan Bunda
          </button>
          <button
            onClick={() => setTab("summary")}
            className={`pb-2 text-[13px] font-semibold border-b-2 -mb-[2px] transition-colors ${tab === "summary" ? "text-[#5BBFB0] border-[#5BBFB0]" : "text-[#999AAA] border-transparent"}`}
          >
            Ringkasan hasil
          </button>
        </div>
      )}

      {/* Why card */}
      {tab === "questions" && (
        <div className="bg-[#E5F6F4] border border-[#A8DDD8] rounded-[16px] p-3.5 mb-4">
          <p className="text-[12px] font-bold text-[#1E4A45] mb-1">
            {isWeekly ? "Mengapa ada kabar mingguan?" : "Untuk apa pemantauan ini?"}
          </p>
          <p className="text-[12px] text-[#2C5F5A] leading-relaxed">
            {isWeekly
              ? `Minggu pertama sering jadi penentu. Dengan berbagi kabar lebih awal, kami bisa bantu sebelum hal kecil jadi besar. ${nannyFirstName} juga mengisi dari sisinya — hasilnya untuk berdua.`
              : `Untuk menjaga kenyamanan kedua belah pihak. ${nannyFirstName} juga mengisi dari sisinya — hasilnya kami kompilasi dan kirim via WA. Bahasa di laporan diperhalus oleh AI agar tetap konstruktif.`}
          </p>
        </div>
      )}

      {/* Questions */}
      {tab === "questions" && (
        <div className="space-y-4 mb-4">
          {questions.map((q, i) => (
            <div key={q.id}>
              <p className="text-[13px] font-semibold text-[#5A3A7A] mb-2">{i + 1}. {q.text}</p>
              <div className="flex flex-wrap gap-2">
                {q.options.map(opt => {
                  const selected = answers[q.id] === opt
                  const isDanger = (q as typeof q & { dangerOption?: string }).dangerOption === opt
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                      className={`px-4 py-2 min-h-[44px] rounded-full border-[1.5px] text-[13px] font-medium transition-all cursor-pointer ${
                        selected
                          ? isDanger
                            ? "bg-[#FAEAEA] text-[#C75D5D] border-[#C75D5D] font-semibold"
                            : "bg-[#E5F6F4] text-[#1E4A45] border-[#5BBFB0] font-semibold"
                          : isDanger
                          ? "bg-white text-[#C75D5D] border-[#C75D5D]"
                          : "bg-white text-[#666666] border-[#C8B8DC] hover:border-[#5BBFB0]"
                      }`}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Notes */}
          <div>
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

          {/* Notice */}
          <div className="bg-[#F3EEF8] rounded-[10px] px-3 py-2.5">
            <p className="text-[12px] text-[#999AAA]">
              {isWeekly
                ? "Tidak ada jawaban benar atau salah — ini untuk membantu dua pihak merasa nyaman."
                : `${nannyFirstName} sedang mengisi dari sisinya. Hasil dikirim ke Bunda lewat WA saat keduanya selesai.`}
            </p>
          </div>
        </div>
      )}

      {/* Summary tab placeholder */}
      {tab === "summary" && (
        <div className="text-center py-8 text-[#999AAA] text-[13px]">
          Ringkasan akan tersedia setelah kedua pihak mengisi.
        </div>
      )}

      {/* Submit */}
      {tab === "questions" && (
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full flex items-center justify-center bg-[#5BBFB0] hover:bg-[#2C5F5A] disabled:opacity-50 text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] transition-all"
        >
          {loading ? "Mengirim..." : isWeekly ? "Kirim kabar minggu ini" : "Kirim pemantauan"}
        </button>
      )}

    </div>
  )
}
