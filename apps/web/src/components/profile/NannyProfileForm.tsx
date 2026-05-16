"use client"

import { useState } from "react"
import LocationSelector from "./LocationSelector"

const NANNY_TYPE_OPTIONS = [
  { value: "LIVE_IN",    label: "Live-in (tinggal di rumah)" },
  { value: "LIVE_OUT",   label: "Live-out (pulang setiap hari)" },
  { value: "INFAL",      label: "Infal / pengganti" },
  { value: "TEMPORARY",  label: "Sementara / kontrak singkat" },
]

const AGE_GROUP_OPTIONS = [
  { value: "INFANT_0_6M",   label: "Bayi 0–6 bulan" },
  { value: "INFANT_6_12M",  label: "Bayi 6–12 bulan" },
  { value: "TODDLER_1_3Y",  label: "Balita 1–3 tahun" },
  { value: "PRESCHOOL_3_6Y",label: "Prasekolah 3–6 tahun" },
]

const EDUCATION_OPTIONS = [
  "SD / Sederajat",
  "SMP / Sederajat",
  "SMA / SMK / Sederajat",
  "D1 / D2 / D3",
  "S1 / S2 / S3",
]

const COMMON_SKILLS = [
  "MPASI", "Menyusui", "Toilet training", "Bayi kolik",
  "Renang bayi", "Pijat bayi", "Masak", "Bahasa Inggris",
]

const COMMON_LANGUAGES = ["Indonesia", "Sunda", "Jawa", "Batak", "Minang", "Inggris"]

type InitialData = {
  fullName: string
  phone: string
  dateOfBirth: string
  province: string
  city: string
  district: string
  bio: string
  nannyType: string[]
  preferredAgeGroup: string[]
  expectedSalaryMin: string
  expectedSalaryMax: string
  educationLevel: string
  yearsOfExperience: string
  skills: string[]
  languages: string[]
  religion: string
}

export default function NannyProfileForm({ initial }: { initial: InitialData }) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  function setLocation(field: "province" | "city" | "district", value: string) {
    setForm(f => ({ ...f, [field]: value }))
    setSaved(false)
  }

  function set(field: keyof InitialData, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    setSaved(false)
  }

  function toggleArray(field: "nannyType" | "preferredAgeGroup" | "skills" | "languages", value: string) {
    setForm(f => {
      const arr = f[field] as string[]
      return {
        ...f,
        [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
      }
    })
    setSaved(false)
  }

  async function handleSave() {
    if (!form.fullName.trim()) { setError("Nama lengkap wajib diisi"); return }
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/nanny/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          phone: form.phone,
          dateOfBirth: form.dateOfBirth || null,
          province: form.province,
          city: form.city,
          district: form.district,
          bio: form.bio,
          nannyType: form.nannyType,
          preferredAgeGroup: form.preferredAgeGroup,
          expectedSalaryMin: form.expectedSalaryMin ? parseInt(form.expectedSalaryMin) * 1_000_000 : null,
          expectedSalaryMax: form.expectedSalaryMax ? parseInt(form.expectedSalaryMax) * 1_000_000 : null,
          educationLevel: form.educationLevel,
          yearsOfExperience: form.yearsOfExperience ? parseInt(form.yearsOfExperience) : 0,
          skills: form.skills,
          languages: form.languages,
          religion: form.religion,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setSaved(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* ── Data Diri ────────────────────────────────────────────────────── */}
      <section>
        <p className="text-xs font-bold tracking-widest uppercase text-[#999AAA] mb-3">Data Diri</p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-[#5A3A7A] mb-1">Nama lengkap <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={form.fullName}
              onChange={e => set("fullName", e.target.value)}
              placeholder="Nama lengkap kamu"
              className="w-full border-[1.5px] border-[#E0D0F0] rounded-[10px] px-4 py-3 text-base text-[#5A3A7A] placeholder-[#C8B8DC] focus:outline-none focus:border-[#5BBFB0] min-h-[48px]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#5A3A7A] mb-1">No. HP / WhatsApp</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => set("phone", e.target.value)}
              placeholder="08xxxxxxxxxx"
              className="w-full border-[1.5px] border-[#E0D0F0] rounded-[10px] px-4 py-3 text-base text-[#5A3A7A] placeholder-[#C8B8DC] focus:outline-none focus:border-[#5BBFB0] min-h-[48px]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#5A3A7A] mb-1">Tanggal lahir</label>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={e => set("dateOfBirth", e.target.value)}
              className="w-full border-[1.5px] border-[#E0D0F0] rounded-[10px] px-4 py-3 text-base text-[#5A3A7A] focus:outline-none focus:border-[#5BBFB0] min-h-[48px]"
            />
          </div>
          <LocationSelector
            province={form.province}
            city={form.city}
            district={form.district}
            onProvinceChange={v => setLocation("province", v)}
            onCityChange={v => setLocation("city", v)}
            onDistrictChange={v => setLocation("district", v)}
            labelClass="block text-sm font-semibold text-[#5A3A7A] mb-1"
            selectClass="w-full border-[1.5px] border-[#E0D0F0] rounded-[10px] px-4 py-3 text-base text-[#5A3A7A] focus:outline-none focus:border-[#5BBFB0] min-h-[48px] bg-white appearance-none"
          />
          <div>
            <label className="block text-sm font-semibold text-[#5A3A7A] mb-1">Agama</label>
            <input
              type="text"
              value={form.religion}
              onChange={e => set("religion", e.target.value)}
              placeholder="Islam, Kristen, dll."
              className="w-full border-[1.5px] border-[#E0D0F0] rounded-[10px] px-4 py-3 text-base text-[#5A3A7A] placeholder-[#C8B8DC] focus:outline-none focus:border-[#5BBFB0] min-h-[48px]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#5A3A7A] mb-1">Tentang saya</label>
            <textarea
              value={form.bio}
              onChange={e => set("bio", e.target.value)}
              placeholder="Ceritakan sedikit tentang diri kamu, pengalaman, dan kepribadian kamu..."
              rows={3}
              className="w-full border-[1.5px] border-[#E0D0F0] rounded-[10px] px-4 py-3 text-base text-[#5A3A7A] placeholder-[#C8B8DC] focus:outline-none focus:border-[#5BBFB0] resize-none"
            />
          </div>
        </div>
      </section>

      {/* ── Preferensi Kerja ─────────────────────────────────────────────── */}
      <section>
        <p className="text-xs font-bold tracking-widest uppercase text-[#999AAA] mb-3">Preferensi Kerja</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#5A3A7A] mb-2">Tipe kerja (bisa lebih dari satu)</label>
            <div className="flex flex-wrap gap-2">
              {NANNY_TYPE_OPTIONS.map(opt => {
                const active = form.nannyType.includes(opt.value)
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleArray("nannyType", opt.value)}
                    className={`px-3 py-2 rounded-full border-[1.5px] text-sm font-medium min-h-[40px] transition-all ${
                      active
                        ? "bg-[#E5F6F4] border-[#5BBFB0] text-[#2C5F5A]"
                        : "bg-white border-[#E0D0F0] text-[#5A3A7A]"
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#5A3A7A] mb-2">Usia anak yang ingin dijaga</label>
            <div className="flex flex-wrap gap-2">
              {AGE_GROUP_OPTIONS.map(opt => {
                const active = form.preferredAgeGroup.includes(opt.value)
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleArray("preferredAgeGroup", opt.value)}
                    className={`px-3 py-2 rounded-full border-[1.5px] text-sm font-medium min-h-[40px] transition-all ${
                      active
                        ? "bg-[#E5F6F4] border-[#5BBFB0] text-[#2C5F5A]"
                        : "bg-white border-[#E0D0F0] text-[#5A3A7A]"
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-[#5A3A7A] mb-1">Gaji minimum (juta/bulan)</label>
              <input
                type="number"
                value={form.expectedSalaryMin}
                onChange={e => set("expectedSalaryMin", e.target.value)}
                placeholder="2"
                min="0"
                className="w-full border-[1.5px] border-[#E0D0F0] rounded-[10px] px-4 py-3 text-base text-[#5A3A7A] placeholder-[#C8B8DC] focus:outline-none focus:border-[#5BBFB0] min-h-[48px]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#5A3A7A] mb-1">Gaji maksimum (juta/bulan)</label>
              <input
                type="number"
                value={form.expectedSalaryMax}
                onChange={e => set("expectedSalaryMax", e.target.value)}
                placeholder="4"
                min="0"
                className="w-full border-[1.5px] border-[#E0D0F0] rounded-[10px] px-4 py-3 text-base text-[#5A3A7A] placeholder-[#C8B8DC] focus:outline-none focus:border-[#5BBFB0] min-h-[48px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Latar Belakang ───────────────────────────────────────────────── */}
      <section>
        <p className="text-xs font-bold tracking-widest uppercase text-[#999AAA] mb-3">Latar Belakang</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#5A3A7A] mb-1">Pendidikan terakhir</label>
            <select
              value={form.educationLevel}
              onChange={e => set("educationLevel", e.target.value)}
              className="w-full border-[1.5px] border-[#E0D0F0] rounded-[10px] px-4 py-3 text-base text-[#5A3A7A] focus:outline-none focus:border-[#5BBFB0] min-h-[48px] bg-white"
            >
              <option value="">Pilih pendidikan</option>
              {EDUCATION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#5A3A7A] mb-1">Lama pengalaman jadi nanny (tahun)</label>
            <input
              type="number"
              value={form.yearsOfExperience}
              onChange={e => set("yearsOfExperience", e.target.value)}
              placeholder="0"
              min="0"
              max="50"
              className="w-full border-[1.5px] border-[#E0D0F0] rounded-[10px] px-4 py-3 text-base text-[#5A3A7A] placeholder-[#C8B8DC] focus:outline-none focus:border-[#5BBFB0] min-h-[48px]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#5A3A7A] mb-2">Keahlian khusus</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {COMMON_SKILLS.map(s => {
                const active = form.skills.includes(s)
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleArray("skills", s)}
                    className={`px-3 py-2 rounded-full border-[1.5px] text-sm font-medium min-h-[40px] transition-all ${
                      active
                        ? "bg-[#F3EEF8] border-[#A97CC4] text-[#5A3A7A]"
                        : "bg-white border-[#E0D0F0] text-[#999AAA]"
                    }`}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#5A3A7A] mb-2">Bahasa yang dikuasai</label>
            <div className="flex flex-wrap gap-2">
              {COMMON_LANGUAGES.map(l => {
                const active = form.languages.includes(l)
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => toggleArray("languages", l)}
                    className={`px-3 py-2 rounded-full border-[1.5px] text-sm font-medium min-h-[40px] transition-all ${
                      active
                        ? "bg-[#F3EEF8] border-[#A97CC4] text-[#5A3A7A]"
                        : "bg-white border-[#E0D0F0] text-[#999AAA]"
                    }`}
                  >
                    {l}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Save ─────────────────────────────────────────────────────────── */}
      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-[10px] px-4 py-3">{error}</p>
      )}
      {saved && (
        <p className="text-sm text-[#2C5F5A] bg-[#E5F6F4] border border-[#5BBFB0] rounded-[10px] px-4 py-3">
          Profil berhasil disimpan
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-[#5BBFB0] hover:bg-[#2C5F5A] disabled:bg-[#C8E8E5] text-white font-semibold py-3.5 rounded-[10px] min-h-[52px] text-base transition-all"
      >
        {saving ? "Menyimpan..." : "Simpan Profil"}
      </button>
    </div>
  )
}
