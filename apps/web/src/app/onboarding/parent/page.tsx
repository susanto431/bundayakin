"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type SeekType = "longterm" | "temporary" | "daily"
type ChildGender = "female" | "male"

const AGE_OPTIONS = [
  "0–6 bulan",
  "6–12 bulan",
  "1–3 tahun",
  "3–6 tahun",
  "6 tahun ke atas",
]

export default function OnboardingParentPage() {
  const router = useRouter()
  const [seekType, setSeekType] = useState<SeekType>("longterm")
  const [childName, setChildName] = useState("")
  const [childAge, setChildAge] = useState("1–3 tahun")
  const [childGender, setChildGender] = useState<ChildGender>("female")
  const [needToilet, setNeedToilet] = useState<string>("Ya, perlu")
  const [needPickup, setNeedPickup] = useState<string>("Tidak")
  const [conditions, setConditions] = useState("")
  const [city, setCity] = useState("")
  const [loading, setLoading] = useState(false)

  const isToddler = childAge === "1–3 tahun"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch("/api/parent/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: childName, age: childAge, gender: childGender, conditions, city }),
      })
    } catch {
      // non-blocking
    }
    router.push("/dashboard/parent")
  }

  const pillCls = (active: boolean, purple = false) =>
    `inline-flex items-center cursor-pointer text-[13px] font-medium px-4 py-2 min-h-[44px] border-[1.5px] rounded-full transition-all ${
      active
        ? purple
          ? "bg-[#F3EEF8] text-[#5A3A7A] border-[#A97CC4] font-semibold"
          : "bg-[#E5F6F4] text-[#1E4A45] border-[#5BBFB0] font-semibold"
        : "bg-white text-[#666666] border-[#C8B8DC]"
    }`

  return (
    <main className="min-h-screen bg-[#FDFBFF] font-[var(--font-jakarta)]">
      <div className="max-w-[480px] mx-auto px-4 py-6">

        {/* Header */}
        <div className="border-b border-[#E0D0F0] pb-3 mb-4">
          <h2 className="text-[16px] font-bold text-[#5A3A7A]">Ceritakan tentang si Kecil</h2>
          <p className="text-[12px] text-[#999AAA] mt-0.5">Membantu kami menemukan nanny yang paling cocok</p>
        </div>

        {/* Steps */}
        <div className="flex gap-1.5 mb-5">
          <div className="flex-1 h-1 rounded-full bg-[#5BBFB0]" />
          <div className="flex-1 h-1 rounded-full bg-[#A8DDD8]" />
          <div className="flex-1 h-1 rounded-full bg-[#E0D0F0]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seeking type */}
          <div>
            <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Saya mencari nanny untuk</p>
            <div className="flex flex-wrap gap-2">
              {([["longterm", "Jangka panjang"], ["temporary", "Temporer / infal"], ["daily", "Per hari / per jam"]] as [SeekType, string][]).map(([v, label]) => (
                <button key={v} type="button" onClick={() => setSeekType(v)} className={pillCls(seekType === v)}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Child name */}
          <div>
            <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">Nama anak</label>
            <input
              type="text"
              value={childName}
              onChange={e => setChildName(e.target.value)}
              placeholder="Kira"
              required
              className="w-full px-3.5 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[48px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/15 placeholder:text-[#999AAA] outline-none transition-all"
            />
          </div>

          {/* Child age */}
          <div>
            <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">Usia anak</label>
            <select
              value={childAge}
              onChange={e => setChildAge(e.target.value)}
              className="w-full px-3.5 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[48px] focus:border-[#5BBFB0] outline-none transition-all"
            >
              {AGE_OPTIONS.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>

          {/* Child gender */}
          <div>
            <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">Jenis kelamin</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setChildGender("female")} className={pillCls(childGender === "female")}>Perempuan</button>
              <button type="button" onClick={() => setChildGender("male")} className={pillCls(childGender === "male")}>Laki-laki</button>
            </div>
          </div>

          {/* Conditional questions for toddler */}
          {isToddler && (
            <div className="bg-[#FEF0E7] border border-[#F5C4A0] rounded-[16px] p-3.5">
              <p className="text-[12px] font-bold text-[#A35320] mb-3">Pertanyaan tambahan — usia 1–3 tahun</p>

              <p className="text-[13px] text-[#666666] mb-2">Nanny perlu bantu latih toilet training?</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {["Ya, perlu", "Tidak perlu"].map(v => (
                  <button key={v} type="button" onClick={() => setNeedToilet(v)}
                    className={`inline-flex items-center cursor-pointer text-[13px] font-medium px-4 py-2 min-h-[44px] border-[1.5px] rounded-full transition-all ${needToilet === v ? "bg-[#FEF0E7] text-[#A35320] border-[#E07B39] font-semibold" : "bg-white text-[#666666] border-[#C8B8DC]"}`}
                  >{v}</button>
                ))}
              </div>

              <p className="text-[13px] text-[#666666] mb-2">Nanny perlu antar jemput ke sekolah / les?</p>
              <div className="flex flex-wrap gap-2">
                {["Ya", "Tidak"].map(v => (
                  <button key={v} type="button" onClick={() => setNeedPickup(v)}
                    className={`inline-flex items-center cursor-pointer text-[13px] font-medium px-4 py-2 min-h-[44px] border-[1.5px] rounded-full transition-all ${needPickup === v ? "bg-[#FEF0E7] text-[#A35320] border-[#E07B39] font-semibold" : "bg-white text-[#666666] border-[#C8B8DC]"}`}
                  >{v}</button>
                ))}
              </div>
            </div>
          )}

          {/* Conditions */}
          <div>
            <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">Kondisi khusus / alergi <span className="font-normal text-[#999AAA]">(opsional)</span></label>
            <textarea
              value={conditions}
              onChange={e => setConditions(e.target.value)}
              placeholder="Mis: alergi susu sapi, asma ringan..."
              className="w-full px-3.5 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[72px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/15 placeholder:text-[#999AAA] outline-none transition-all resize-none leading-relaxed"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">Kota / area <span className="font-normal text-[#999AAA]">(opsional)</span></label>
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="Jakarta Selatan"
              className="w-full px-3.5 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[48px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/15 placeholder:text-[#999AAA] outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !childName.trim()}
            className="w-full flex items-center justify-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] transition-all disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan & ke dashboard"}
          </button>
        </form>
      </div>
    </main>
  )
}
