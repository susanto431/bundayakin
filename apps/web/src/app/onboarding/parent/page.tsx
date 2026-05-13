"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ParentBottomNav from "@/components/layout/ParentBottomNav"

type ChildGender = "FEMALE" | "MALE"
type SeekType = "longterm" | "temporary" | "daily"

const AGE_OPTIONS = [
  { label: "0–6 bulan", months: 3 },
  { label: "6–12 bulan", months: 9 },
  { label: "1–3 tahun", months: 24 },
  { label: "3–6 tahun", months: 54 },
  { label: "6 tahun ke atas", months: 90 },
]

function ageGroupLabel(dob: Date): string {
  const months = (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  if (months < 6) return "0–6 bulan"
  if (months < 12) return "6–12 bulan"
  if (months < 36) return "1–3 tahun"
  if (months < 72) return "3–6 tahun"
  return "6 tahun ke atas"
}

function monthsAgoDate(months: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() - months)
  return d.toISOString().split("T")[0]
}

export default function OnboardingParentPage() {
  const router = useRouter()
  const [seekType, setSeekType] = useState<SeekType>("longterm")
  const [childName, setChildName] = useState("")
  const [childAgeLabel, setChildAgeLabel] = useState("1–3 tahun")
  const [childGender, setChildGender] = useState<ChildGender>("FEMALE")
  const [needToilet, setNeedToilet] = useState<string>("Ya, perlu")
  const [needPickup, setNeedPickup] = useState<string>("Tidak")
  const [allergies, setAllergies] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [existingChildId, setExistingChildId] = useState<string | null>(null)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetch("/api/parent/children")
      .then(r => r.json())
      .then(({ data }) => {
        if (data?.length > 0) {
          const c = data[0]
          setExistingChildId(c.id)
          setChildName(c.name ?? "")
          setChildGender((c.gender as ChildGender) ?? "FEMALE")
          setAllergies(c.allergies ?? "")
          setAdditionalNotes(c.additionalNotes ?? "")
          if (c.dateOfBirth) {
            setChildAgeLabel(ageGroupLabel(new Date(c.dateOfBirth)))
          }
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [])

  const isToddler = childAgeLabel === "1–3 tahun"
  const selectedAgeOption = AGE_OPTIONS.find(o => o.label === childAgeLabel) ?? AGE_OPTIONS[2]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const dateOfBirth = monthsAgoDate(selectedAgeOption.months)
    const body = {
      name: childName,
      dateOfBirth,
      gender: childGender,
      allergies,
      additionalNotes,
    }
    try {
      if (existingChildId) {
        await fetch(`/api/parent/children/${existingChildId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      } else {
        await fetch("/api/parent/children", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      }
    } catch {
      // non-blocking
    }
    router.push("/dashboard/parent/children")
  }

  const pillCls = (active: boolean, purple = false) =>
    `inline-flex items-center cursor-pointer text-[13px] font-medium px-4 py-2 min-h-[44px] border-[1.5px] rounded-full transition-all ${
      active
        ? purple
          ? "bg-[#F3EEF8] text-[#5A3A7A] border-[#A97CC4] font-semibold"
          : "bg-[#E5F6F4] text-[#1E4A45] border-[#5BBFB0] font-semibold"
        : "bg-white text-[#666666] border-[#C8B8DC]"
    }`

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
          <h2 className="text-[16px] font-bold text-[#5A3A7A]">
            {existingChildId ? "Perbarui profil si Kecil" : "Ceritakan tentang si Kecil"}
          </h2>
          <p className="text-[12px] text-[#999AAA] mt-0.5">Membantu kami menemukan nanny yang paling cocok</p>
        </div>

        {/* Seek type */}
        {!existingChildId && (
          <div className="mb-4">
            <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Saya mencari nanny untuk</p>
            <div className="flex flex-wrap gap-2">
              {([["longterm", "Jangka panjang"], ["temporary", "Temporer / infal"], ["daily", "Per hari / per jam"]] as [SeekType, string][]).map(([v, label]) => (
                <button key={v} type="button" onClick={() => setSeekType(v)} className={pillCls(seekType === v)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">Usia anak (perkiraan)</label>
            <div className="flex flex-wrap gap-2">
              {AGE_OPTIONS.map(o => (
                <button
                  key={o.label}
                  type="button"
                  onClick={() => setChildAgeLabel(o.label)}
                  className={pillCls(childAgeLabel === o.label)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Child gender */}
          <div>
            <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">Jenis kelamin</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setChildGender("FEMALE")} className={pillCls(childGender === "FEMALE")}>Perempuan</button>
              <button type="button" onClick={() => setChildGender("MALE")} className={pillCls(childGender === "MALE")}>Laki-laki</button>
            </div>
          </div>

          {/* Toddler extras */}
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

          {/* Allergies */}
          <div>
            <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">
              Alergi atau kondisi kesehatan khusus <span className="font-normal text-[#999AAA]">(opsional)</span>
            </label>
            <textarea
              value={allergies}
              onChange={e => setAllergies(e.target.value)}
              placeholder="Mis: alergi susu sapi, asma ringan..."
              className="w-full px-3.5 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[72px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/15 placeholder:text-[#999AAA] outline-none transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Additional notes */}
          <div>
            <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">
              Catatan lain <span className="font-normal text-[#999AAA]">(opsional)</span>
            </label>
            <textarea
              value={additionalNotes}
              onChange={e => setAdditionalNotes(e.target.value)}
              placeholder="Mis: suka musik, takut anjing..."
              className="w-full px-3.5 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[60px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/15 placeholder:text-[#999AAA] outline-none transition-all resize-none leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !childName.trim()}
            className="w-full flex items-center justify-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] transition-all disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : existingChildId ? "Simpan perubahan" : "Simpan & lanjut"}
          </button>
        </form>
      </div>
      <ParentBottomNav />
    </main>
  )
}
