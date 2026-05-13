"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ParentBottomNav from "@/components/layout/ParentBottomNav"

export default function ChildRulesPage() {
  const router = useRouter()
  const [childId, setChildId] = useState<string | null>(null)
  const [childName, setChildName] = useState("si Kecil")
  const [pantangan, setPantangan] = useState("")
  const [schedule, setSchedule] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetch("/api/parent/children")
      .then(r => r.json())
      .then(({ data }) => {
        if (data?.length > 0) {
          const c = data[0]
          setChildId(c.id)
          setChildName(c.name ?? "si Kecil")
          setPantangan(c.pantangan ?? "")
          setSchedule(c.schedule ?? "")
          setAdditionalNotes(c.additionalNotes ?? "")
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!childId) return
    setLoading(true)
    try {
      await fetch(`/api/parent/children/${childId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pantangan, schedule, additionalNotes }),
      })
    } catch {
      // non-blocking
    }
    router.push("/dashboard/parent/children")
  }

  if (fetching) {
    return (
      <main className="min-h-screen bg-[#FDFBFF] font-[var(--font-jakarta)]">
        <div className="max-w-[480px] mx-auto px-4 py-6 pb-28 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-[#E0D0F0] rounded-[16px] h-14 animate-pulse" />
          ))}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#FDFBFF] font-[var(--font-jakarta)]">
      <div className="max-w-[480px] mx-auto px-4 py-6 pb-28">

        {/* Header */}
        <div className="border-b border-[#E0D0F0] pb-3 mb-4">
          <Link
            href="/dashboard/parent/children"
            className="inline-flex items-center text-[12px] text-[#999AAA] hover:text-[#5A3A7A] mb-2 transition-colors"
          >
            ← Kembali ke catatan anak
          </Link>
          <h2 className="text-[16px] font-bold text-[#5A3A7A]">Aturan rumah</h2>
          <p className="text-[12px] text-[#999AAA] mt-0.5">Pantangan, rutinitas harian, dan catatan penting untuk nanny</p>
        </div>

        {!childId && (
          <div className="bg-[#FEF0E7] border border-[#F5C4A0] rounded-[16px] p-4 mb-4 text-center">
            <p className="text-[13px] font-semibold text-[#A35320] mb-1">Profil anak belum diisi</p>
            <p className="text-[12px] text-[#7A4018]">Isi profil dasar anak terlebih dahulu.</p>
            <Link
              href="/onboarding/parent"
              className="inline-flex items-center mt-2 bg-[#5A3A7A] text-white font-semibold text-[12px] px-4 py-2 rounded-[10px] min-h-[40px] transition-all"
            >
              Isi profil anak →
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Pantangan */}
          <div>
            <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">
              Pantangan makanan & aktivitas <span className="font-normal text-[#999AAA]">(opsional)</span>
            </label>
            <p className="text-[11px] text-[#999AAA] mb-2 leading-relaxed">
              Hal-hal yang tidak boleh dilakukan atau diberikan ke {childName}.
            </p>
            <textarea
              value={pantangan}
              onChange={e => setPantangan(e.target.value)}
              placeholder="Mis: tidak boleh makan makanan manis berlebihan, tidak boleh nonton TV lebih dari 1 jam, hindari mainan berukuran kecil..."
              className="w-full px-3.5 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[100px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/15 placeholder:text-[#999AAA] outline-none transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Daily schedule / routine */}
          <div>
            <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">
              Rutinitas harian <span className="font-normal text-[#999AAA]">(opsional)</span>
            </label>
            <p className="text-[11px] text-[#999AAA] mb-2 leading-relaxed">
              Jadwal makan, tidur siang, mandi, dan kegiatan rutin lainnya.
            </p>
            <textarea
              value={schedule}
              onChange={e => setSchedule(e.target.value)}
              placeholder="Mis: bangun 06.30, sarapan 07.00, tidur siang 13.00–15.00, mandi sore 16.00, tidur malam 21.00..."
              className="w-full px-3.5 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[100px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/15 placeholder:text-[#999AAA] outline-none transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Additional house rules */}
          <div>
            <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">
              Aturan rumah lainnya <span className="font-normal text-[#999AAA]">(opsional)</span>
            </label>
            <p className="text-[11px] text-[#999AAA] mb-2 leading-relaxed">
              Area yang boleh/tidak boleh diakses, tamu, dan aturan lain yang perlu nanny tahu.
            </p>
            <textarea
              value={additionalNotes}
              onChange={e => setAdditionalNotes(e.target.value)}
              placeholder="Mis: tidak ada tamu tanpa izin, kamar utama tidak boleh dimasuki, anjing peliharaan takut dengan suara keras..."
              className="w-full px-3.5 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[80px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/15 placeholder:text-[#999AAA] outline-none transition-all resize-none leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !childId}
            className="w-full flex items-center justify-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] transition-all disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan perubahan"}
          </button>
        </form>
      </div>
      <ParentBottomNav />
    </main>
  )
}
