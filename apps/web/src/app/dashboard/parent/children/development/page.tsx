"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ParentBottomNav from "@/components/layout/ParentBottomNav"

export default function ChildDevelopmentPage() {
  const router = useRouter()
  const [childId, setChildId] = useState<string | null>(null)
  const [childName, setChildName] = useState("si Kecil")
  const [medicalNotes, setMedicalNotes] = useState("")
  const [schoolName, setSchoolName] = useState("")
  const [schoolSchedule, setSchoolSchedule] = useState("")
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
          setMedicalNotes(c.medicalNotes ?? "")
          setSchoolName(c.schoolName ?? "")
          setSchoolSchedule(c.schoolSchedule ?? "")
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
        body: JSON.stringify({ medicalNotes, schoolName, schoolSchedule }),
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
          <h2 className="text-[16px] font-bold text-[#5A3A7A]">Perkembangan {childName}</h2>
          <p className="text-[12px] text-[#999AAA] mt-0.5">Milestone, tumbuh kembang, dan info sekolah</p>
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

          {/* Medical / health notes */}
          <div>
            <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">
              Catatan kesehatan & tumbuh kembang <span className="font-normal text-[#999AAA]">(opsional)</span>
            </label>
            <p className="text-[11px] text-[#999AAA] mb-2 leading-relaxed">
              Milestone yang sudah dicapai, kondisi kesehatan, catatan dari dokter, atau hal yang perlu diperhatikan nanny.
            </p>
            <textarea
              value={medicalNotes}
              onChange={e => setMedicalNotes(e.target.value)}
              placeholder="Mis: sudah bisa berjalan 10 langkah, sedang terapi wicara, rutin cek ke dokter Sp.A setiap bulan..."
              className="w-full px-3.5 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[100px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/15 placeholder:text-[#999AAA] outline-none transition-all resize-none leading-relaxed"
            />
          </div>

          {/* School name */}
          <div>
            <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">
              Nama sekolah / daycare <span className="font-normal text-[#999AAA]">(opsional)</span>
            </label>
            <input
              type="text"
              value={schoolName}
              onChange={e => setSchoolName(e.target.value)}
              placeholder="Mis: TK Bintang Kecil, Playgroup Happy Kids..."
              className="w-full px-3.5 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[48px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/15 placeholder:text-[#999AAA] outline-none transition-all"
            />
          </div>

          {/* School schedule */}
          <div>
            <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">
              Jadwal sekolah <span className="font-normal text-[#999AAA]">(opsional)</span>
            </label>
            <textarea
              value={schoolSchedule}
              onChange={e => setSchoolSchedule(e.target.value)}
              placeholder="Mis: Senin–Jumat pukul 08.00–11.00, nanny antar jemput dengan motor..."
              className="w-full px-3.5 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[72px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/15 placeholder:text-[#999AAA] outline-none transition-all resize-none leading-relaxed"
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
