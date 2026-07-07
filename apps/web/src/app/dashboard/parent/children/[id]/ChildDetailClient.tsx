"use client"

import { useState } from "react"
import Link from "next/link"

type Child = {
  id: string
  name: string
  ageGroup: string
  gender: string | null
  allergies: string | null
  medicalNotes: string | null
  pantangan: string | null
  schedule: string | null
  schoolName: string | null
  schoolSchedule: string | null
  additionalNotes: string | null
  nannyNotes: string | null
  caraMenenangkan: string | null
  updatedAt: string
}

import { AGE_OPTIONS, AGE_GROUP_LABEL, monthsAgoDate } from "@/constants/children"

const AGE_GROUP_TO_LABEL = AGE_GROUP_LABEL

async function saveChild(id: string, data: Record<string, unknown>) {
  const res = await fetch(`/api/parent/children/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return res.json() as Promise<{ success: boolean; error?: string }>
}

function pillCls(active: boolean) {
  return `text-[13px] font-medium px-3.5 py-2 min-h-[40px] border-[1.5px] rounded-full transition-all cursor-pointer ${
    active
      ? "bg-[#E5F6F4] text-[#1E4A45] border-[#5BBFB0] font-semibold"
      : "bg-white text-[#666666] border-[#C8B8DC] hover:border-[#A97CC4]"
  }`
}

function inputCls() {
  return "w-full px-3.5 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[48px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/15 placeholder:text-[#999AAA] outline-none transition-all"
}

function textareaCls() {
  return "w-full px-3.5 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[90px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/15 placeholder:text-[#999AAA] outline-none transition-all resize-none leading-relaxed"
}

function SaveButton({ saving, saved }: { saving: boolean; saved: boolean }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="w-full flex items-center justify-center bg-[#5BBFB0] hover:bg-[#2C5F5A] disabled:opacity-50 text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] transition-all"
    >
      {saving ? "Menyimpan..." : saved ? "Tersimpan ✓" : "Simpan perubahan"}
    </button>
  )
}

export default function ChildDetailClient({ child }: { child: Child }) {
  // Section 1 — Profil
  const [name, setName] = useState(child.name)
  const [ageLabel, setAgeLabel] = useState(AGE_GROUP_TO_LABEL[child.ageGroup] ?? "1–3 thn")
  const [gender, setGender] = useState(child.gender ?? "FEMALE")
  const [allergies, setAllergies] = useState(child.allergies ?? "")
  const [caraMenenangkan, setCaraMenenangkan] = useState(child.caraMenenangkan ?? "")
  const [savingProfil, setSavingProfil] = useState(false)
  const [savedProfil, setSavedProfil] = useState(false)
  const [errorProfil, setErrorProfil] = useState<string | null>(null)

  // Section 2 — Perkembangan
  const [medicalNotes, setMedicalNotes] = useState(child.medicalNotes ?? "")
  const [schoolName, setSchoolName] = useState(child.schoolName ?? "")
  const [schoolSchedule, setSchoolSchedule] = useState(child.schoolSchedule ?? "")
  const [savingDev, setSavingDev] = useState(false)
  const [savedDev, setSavedDev] = useState(false)
  const [errorDev, setErrorDev] = useState<string | null>(null)

  // Section 3 — Aturan Rumah
  const [pantangan, setPantangan] = useState(child.pantangan ?? "")
  const [schedule, setSchedule] = useState(child.schedule ?? "")
  const [additionalNotes, setAdditionalNotes] = useState(child.additionalNotes ?? "")
  const [savingRules, setSavingRules] = useState(false)
  const [savedRules, setSavedRules] = useState(false)
  const [errorRules, setErrorRules] = useState<string | null>(null)

  // Catatan nanny — read-only, tidak dikirim di PATCH
  const nannyNotes = child.nannyNotes

  async function handleSaveProfil(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfil(true)
    setSavedProfil(false)
    setErrorProfil(null)
    const selectedAge = AGE_OPTIONS.find(o => o.label === ageLabel) ?? AGE_OPTIONS[2]
    const result = await saveChild(child.id, {
      name: name.trim(),
      dateOfBirth: monthsAgoDate(selectedAge.months),
      gender,
      allergies,
      caraMenenangkan,
    })
    setSavingProfil(false)
    if (result.success) {
      setSavedProfil(true)
      setTimeout(() => setSavedProfil(false), 2500)
    } else {
      setErrorProfil(result.error ?? "Gagal menyimpan. Coba lagi.")
    }
  }

  async function handleSaveDev(e: React.FormEvent) {
    e.preventDefault()
    setSavingDev(true)
    setSavedDev(false)
    setErrorDev(null)
    const result = await saveChild(child.id, { medicalNotes, schoolName, schoolSchedule })
    setSavingDev(false)
    if (result.success) {
      setSavedDev(true)
      setTimeout(() => setSavedDev(false), 2500)
    } else {
      setErrorDev(result.error ?? "Gagal menyimpan. Coba lagi.")
    }
  }

  async function handleSaveRules(e: React.FormEvent) {
    e.preventDefault()
    setSavingRules(true)
    setSavedRules(false)
    setErrorRules(null)
    const result = await saveChild(child.id, { pantangan, schedule, additionalNotes })
    setSavingRules(false)
    if (result.success) {
      setSavedRules(true)
      setTimeout(() => setSavedRules(false), 2500)
    } else {
      setErrorRules(result.error ?? "Gagal menyimpan. Coba lagi.")
    }
  }

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-28">

      {/* Header */}
      <div className="border-b border-[#E0D0F0] pb-3 mb-5">
        <Link
          href="/dashboard/parent/children"
          className="inline-flex items-center gap-1 text-[12px] text-[#999AAA] hover:text-[#5A3A7A] mb-2 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Semua anak
        </Link>
        <h1 className="text-[16px] font-bold text-[#5A3A7A]">{child.name}</h1>
        <p className="text-[12px] text-[#999AAA] mt-0.5">Terakhir diperbarui {child.updatedAt}</p>
      </div>

      {/* Tumbuh Kembang — Kurva Pertumbuhan, Jurnal Momen (Tahap 1) & Skrining Perkembangan (Tahap 2) */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <Link
          href={`/dashboard/parent/children/${child.id}/growth`}
          className="bg-white border border-[#E0D0F0] rounded-[14px] p-3 hover:border-[#5BBFB0] transition-all"
        >
          <div className="w-8 h-8 bg-[#E5F6F4] rounded-[8px] flex items-center justify-center mb-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2C5F5A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="M18 9l-5 5-4-4-4 4" />
            </svg>
          </div>
          <p className="text-[12px] font-bold text-[#5A3A7A] leading-tight">Tumbuh Kembang</p>
          <p className="text-[10px] text-[#999AAA] mt-0.5">Kurva WHO</p>
        </Link>
        <Link
          href={`/dashboard/parent/children/${child.id}/journal`}
          className="bg-white border border-[#E0D0F0] rounded-[14px] p-3 hover:border-[#A97CC4] transition-all"
        >
          <div className="w-8 h-8 bg-[#F3EEF8] rounded-[8px] flex items-center justify-center mb-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5A3A7A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
          <p className="text-[12px] font-bold text-[#5A3A7A] leading-tight">Jurnal Momen</p>
          <p className="text-[10px] text-[#999AAA] mt-0.5">Cerita & foto</p>
        </Link>
        <Link
          href={`/dashboard/parent/children/${child.id}/screening`}
          className="bg-white border border-[#E0D0F0] rounded-[14px] p-3 hover:border-[#5BBFB0] transition-all"
        >
          <div className="w-8 h-8 bg-[#E5F6F4] rounded-[8px] flex items-center justify-center mb-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2C5F5A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <p className="text-[12px] font-bold text-[#5A3A7A] leading-tight">Skrining</p>
          <p className="text-[10px] text-[#999AAA] mt-0.5">Basis KPSP</p>
        </Link>
      </div>

      {/* SECTION 1 — Profil */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-[#F3EEF8] rounded-[8px] flex items-center justify-center text-[16px] border border-[#E0D0F0]">👶</div>
          <p className="text-[14px] font-bold text-[#5A3A7A]">Profil dasar</p>
        </div>
        <form onSubmit={handleSaveProfil} className="space-y-3.5">
          <div>
            <label className="block text-[12px] font-semibold text-[#5A3A7A] mb-1.5">Nama *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required className={inputCls()} />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#5A3A7A] mb-1.5">Usia</label>
            <div className="flex flex-wrap gap-2">
              {AGE_OPTIONS.map(opt => (
                <button key={opt.label} type="button" onClick={() => setAgeLabel(opt.label)} className={pillCls(ageLabel === opt.label)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#5A3A7A] mb-1.5">Jenis kelamin</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setGender("FEMALE")} className={pillCls(gender === "FEMALE")}>Perempuan</button>
              <button type="button" onClick={() => setGender("MALE")} className={pillCls(gender === "MALE")}>Laki-laki</button>
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#5A3A7A] mb-1">Alergi &amp; kondisi kesehatan <span className="font-normal text-[#999AAA]">(opsional)</span></label>
            <p className="text-[11px] text-[#999AAA] mb-1.5">Alergi makanan, obat, atau kondisi medis yang perlu diketahui nanny.</p>
            <textarea value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="Mis: alergi susu sapi, kacang tanah..." className={textareaCls()} />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#5A3A7A] mb-1">Cara menenangkan saat rewel <span className="font-normal text-[#999AAA]">(opsional)</span></label>
            <textarea value={caraMenenangkan} onChange={e => setCaraMenenangkan(e.target.value)} placeholder="Mis: dipeluk sambil digoyang pelan, diajak lihat pohon di luar..." className={textareaCls()} />
          </div>
          {errorProfil && <p className="text-[12px] text-red-600">{errorProfil}</p>}
          <SaveButton saving={savingProfil} saved={savedProfil} />
        </form>
      </div>

      <div className="h-px bg-[#E0D0F0] mb-5" />

      {/* SECTION 2 — Perkembangan */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-[#FEF0E7] rounded-[8px] flex items-center justify-center text-[16px] border border-[#E0D0F0]">📈</div>
          <p className="text-[14px] font-bold text-[#5A3A7A]">Perkembangan</p>
        </div>
        <form onSubmit={handleSaveDev} className="space-y-3.5">
          <div>
            <label className="block text-[12px] font-semibold text-[#5A3A7A] mb-1">Catatan kesehatan &amp; tumbuh kembang <span className="font-normal text-[#999AAA]">(opsional)</span></label>
            <p className="text-[11px] text-[#999AAA] mb-1.5">Milestone, kondisi kesehatan, catatan dari dokter, atau hal yang perlu nanny perhatikan.</p>
            <textarea value={medicalNotes} onChange={e => setMedicalNotes(e.target.value)} placeholder="Mis: sudah bisa berjalan 10 langkah, sedang terapi wicara, rutin cek Sp.A tiap bulan..." className={textareaCls()} />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#5A3A7A] mb-1.5">Nama sekolah / daycare <span className="font-normal text-[#999AAA]">(opsional)</span></label>
            <input type="text" value={schoolName} onChange={e => setSchoolName(e.target.value)} placeholder="Mis: TK Bintang Kecil, Playgroup Happy Kids..." className={inputCls()} />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#5A3A7A] mb-1.5">Jadwal sekolah <span className="font-normal text-[#999AAA]">(opsional)</span></label>
            <textarea value={schoolSchedule} onChange={e => setSchoolSchedule(e.target.value)} placeholder="Mis: Senin–Jumat pukul 08.00–11.00, nanny antar jemput dengan motor..." className={textareaCls()} />
          </div>
          {errorDev && <p className="text-[12px] text-red-600">{errorDev}</p>}
          <SaveButton saving={savingDev} saved={savedDev} />
        </form>
      </div>

      <div className="h-px bg-[#E0D0F0] mb-5" />

      {/* SECTION 3 — Aturan Rumah */}
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-[#FEF0E7] rounded-[8px] flex items-center justify-center text-[16px] border border-[#E0D0F0]">🏠</div>
          <p className="text-[14px] font-bold text-[#5A3A7A]">Aturan rumah</p>
        </div>
        <form onSubmit={handleSaveRules} className="space-y-3.5">
          <div>
            <label className="block text-[12px] font-semibold text-[#5A3A7A] mb-1">Pantangan makanan &amp; aktivitas <span className="font-normal text-[#999AAA]">(opsional)</span></label>
            <textarea value={pantangan} onChange={e => setPantangan(e.target.value)} placeholder="Mis: tidak boleh makan permen sebelum makan siang, hindari mainan berukuran kecil..." className={textareaCls()} />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#5A3A7A] mb-1">Rutinitas harian <span className="font-normal text-[#999AAA]">(opsional)</span></label>
            <textarea value={schedule} onChange={e => setSchedule(e.target.value)} placeholder="Mis: bangun 06.30, sarapan 07.00, tidur siang 13.00–15.00, mandi sore 16.00..." className={textareaCls()} />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-[#5A3A7A] mb-1">Aturan rumah lainnya <span className="font-normal text-[#999AAA]">(opsional)</span></label>
            <p className="text-[11px] text-[#999AAA] mb-1.5">Area yang boleh/tidak boleh diakses, tamu, dan hal lain yang perlu nanny tahu.</p>
            <textarea value={additionalNotes} onChange={e => setAdditionalNotes(e.target.value)} placeholder="Mis: tidak ada tamu tanpa izin, kamar utama tidak boleh dimasuki..." className={textareaCls()} />
          </div>
          {errorRules && <p className="text-[12px] text-red-600">{errorRules}</p>}
          <SaveButton saving={savingRules} saved={savedRules} />
        </form>
      </div>

      {/* Catatan dari nanny — read-only */}
      {nannyNotes && (
        <>
          <div className="h-px bg-[#E0D0F0] mb-5" />
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-[#EEF2FC] rounded-[8px] flex items-center justify-center text-[16px] border border-[#E0D0F0]">📋</div>
              <p className="text-[14px] font-bold text-[#5A3A7A]">Catatan dari nanny</p>
            </div>
            <div className="bg-[#EEF2FC] border border-[#B5C8EF] rounded-[12px] px-3.5 py-3">
              <p className="text-[11px] text-[#5B7EC9] font-semibold mb-2 uppercase tracking-wide">Diisi oleh nanny · tidak bisa diedit Bunda</p>
              <p className="text-[13px] text-[#3A5A9A] leading-relaxed whitespace-pre-line">{nannyNotes}</p>
            </div>
          </div>
        </>
      )}

    </div>
  )
}
