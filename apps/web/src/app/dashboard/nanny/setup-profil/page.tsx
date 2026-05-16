"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

const TOTAL_STEPS = 3

const NANNY_TYPES = [
  { value: "LIVE_IN", label: "Menginap (live-in)", desc: "Tinggal di rumah keluarga" },
  { value: "LIVE_OUT", label: "Tidak menginap (live-out)", desc: "Pulang setiap hari" },
  { value: "TEMPORARY", label: "Sementara / infal", desc: "Pengganti, kontrak singkat" },
]

const EDUCATION_OPTIONS = [
  "SD / Sederajat",
  "SMP / Sederajat",
  "SMA / SMK / Sederajat",
  "D1 / D2 / D3",
  "S1 / D4",
  "S2 / S3",
]

const INPUT_CLASS =
  "w-full px-3.5 py-2.5 text-sm text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[48px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/20 placeholder:text-[#999AAA] outline-none transition-all"

const LABEL_CLASS = "block text-sm font-semibold text-[#5A3A7A] mb-1.5"

type Form = {
  // Step 1
  fullName: string
  dateOfBirth: string
  city: string
  province: string
  educationLevel: string
  profilePhotoUrl: string | null
  // Step 2
  nannyType: string[]
  yearsOfExperience: string
  expectedSalaryMin: string
  expectedSalaryMax: string
  bio: string
  // Step 3 (psikotes — opsional)
  wantsPsikotes: boolean | null
}

const EMPTY: Form = {
  fullName: "", dateOfBirth: "", city: "", province: "", educationLevel: "", profilePhotoUrl: null,
  nannyType: [], yearsOfExperience: "0", expectedSalaryMin: "", expectedSalaryMax: "", bio: "",
  wantsPsikotes: null,
}

export default function NannySetupProfilPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<Form>(EMPTY)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleInput(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  function toggleNannyType(val: string) {
    setForm(p => ({
      ...p,
      nannyType: p.nannyType.includes(val)
        ? p.nannyType.filter(v => v !== val)
        : [...p.nannyType, val],
    }))
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = (await res.json()) as { success: boolean; url?: string; error?: string }
      if (!data.success || !data.url) {
        setError(data.error ?? "Gagal upload foto")
        return
      }
      setForm(p => ({ ...p, profilePhotoUrl: data.url! }))
    } catch {
      setError("Tidak dapat mengunggah foto")
    } finally {
      setUploading(false)
    }
  }

  function validateStep(): string | null {
    if (step === 1) {
      if (!form.fullName.trim()) return "Nama wajib diisi"
      if (!form.dateOfBirth) return "Tanggal lahir wajib diisi"
      if (!form.city.trim()) return "Kota domisili wajib diisi"
      if (!form.educationLevel) return "Pendidikan wajib dipilih"
    }
    if (step === 2) {
      if (form.nannyType.length === 0) return "Pilih minimal satu tipe pekerjaan"
      if (!form.expectedSalaryMin) return "Gaji harapan minimal wajib diisi"
    }
    return null
  }

  function next() {
    const err = validateStep()
    if (err) { setError(err); return }
    setError(null)
    setStep(s => s + 1)
  }

  function back() {
    setError(null)
    setStep(s => s - 1)
  }

  async function finish(skipPsikotes = false) {
    setSaving(true)
    setError(null)
    try {
      const payload = {
        fullName: form.fullName.trim(),
        dateOfBirth: form.dateOfBirth || undefined,
        city: form.city.trim() || undefined,
        province: form.province.trim() || undefined,
        educationLevel: form.educationLevel || undefined,
        profilePhotoUrl: form.profilePhotoUrl || undefined,
        nannyType: form.nannyType,
        yearsOfExperience: parseInt(form.yearsOfExperience, 10) || 0,
        expectedSalaryMin: form.expectedSalaryMin ? parseInt(form.expectedSalaryMin.replace(/\D/g, ""), 10) : undefined,
        expectedSalaryMax: form.expectedSalaryMax ? parseInt(form.expectedSalaryMax.replace(/\D/g, ""), 10) : undefined,
        bio: form.bio.trim() || undefined,
      }

      const res = await fetch("/api/nanny/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as { success: boolean; error?: string }
      if (!data.success) {
        setError(data.error ?? "Gagal menyimpan profil")
        return
      }

      if (skipPsikotes) {
        router.push("/dashboard/nanny")
      } else {
        router.push("/dashboard/nanny/survey")
      }
    } catch {
      setError("Tidak dapat terhubung ke server")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F3EEF8]">
      <div className="max-w-[480px] mx-auto px-4 pt-6 pb-16">

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] text-[#999AAA]">Langkah {step} dari {TOTAL_STEPS}</p>
            <p className="text-[12px] font-semibold text-[#5BBFB0]">{Math.round((step / TOTAL_STEPS) * 100)}%</p>
          </div>
          <div className="h-1.5 bg-[#E0D0F0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#5BBFB0] rounded-full transition-all duration-500"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-[20px] shadow-sm border border-[#E0D0F0] overflow-hidden">

          {/* ── STEP 1: Foto + Data Diri ── */}
          {step === 1 && (
            <div className="p-6">
              <h2 className="text-[18px] font-bold text-[#5A3A7A] mb-1">Data Diri Sus</h2>
              <p className="text-[13px] text-[#999AAA] mb-6">Isi informasi dasar agar keluarga bisa mengenal Anda</p>

              {error && (
                <div className="bg-[#FAEAEA] border-l-4 border-[#C75D5D] rounded-[8px] px-4 py-3 text-sm text-[#C75D5D] mb-4">{error}</div>
              )}

              {/* Foto */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-[#F3EEF8] flex items-center justify-center mb-3">
                  {form.profilePhotoUrl ? (
                    <Image src={form.profilePhotoUrl} alt="Foto profil" width={80} height={80} className="object-cover w-full h-full" />
                  ) : (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C8B8DC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="7" r="4" /><path d="M5.5 20a7.5 7.5 0 0 1 13 0" />
                    </svg>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoUpload} />
                <button type="button" disabled={uploading} onClick={() => fileRef.current?.click()}
                  className="text-sm text-[#5BBFB0] font-semibold border border-[#A8DDD8] rounded-[8px] px-4 py-2 min-h-[40px] hover:bg-[#E5F6F4] disabled:opacity-50 transition-all">
                  {uploading ? "Mengunggah…" : form.profilePhotoUrl ? "Ganti Foto" : "Upload Foto"}
                </button>
                <p className="text-[11px] text-[#999AAA] mt-1.5">JPG, PNG atau WebP · maks 5 MB (opsional)</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={LABEL_CLASS}>Nama Lengkap <span className="text-[#C75D5D]">*</span></label>
                  <input name="fullName" type="text" value={form.fullName} onChange={handleInput}
                    placeholder="Nama lengkap sesuai KTP" className={INPUT_CLASS} />
                </div>

                <div>
                  <label className={LABEL_CLASS}>Tanggal Lahir <span className="text-[#C75D5D]">*</span></label>
                  <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleInput}
                    max={new Date().toISOString().slice(0, 10)} className={INPUT_CLASS} />
                </div>

                <div>
                  <label className={LABEL_CLASS}>Kota Domisili <span className="text-[#C75D5D]">*</span></label>
                  <input name="city" type="text" value={form.city} onChange={handleInput}
                    placeholder="cth: Jakarta Selatan, Bekasi, Depok" className={INPUT_CLASS} />
                </div>

                <div>
                  <label className={LABEL_CLASS}>Provinsi</label>
                  <input name="province" type="text" value={form.province} onChange={handleInput}
                    placeholder="cth: DKI Jakarta, Jawa Barat" className={INPUT_CLASS} />
                </div>

                <div>
                  <label className={LABEL_CLASS}>Pendidikan Terakhir <span className="text-[#C75D5D]">*</span></label>
                  <select name="educationLevel" value={form.educationLevel} onChange={handleInput}
                    className={INPUT_CLASS + " cursor-pointer"}>
                    <option value="">— pilih pendidikan —</option>
                    {EDUCATION_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Preferensi Kerja ── */}
          {step === 2 && (
            <div className="p-6">
              <h2 className="text-[18px] font-bold text-[#5A3A7A] mb-1">Preferensi Kerja</h2>
              <p className="text-[13px] text-[#999AAA] mb-6">Agar keluarga tahu harapan dan pengalaman Sus</p>

              {error && (
                <div className="bg-[#FAEAEA] border-l-4 border-[#C75D5D] rounded-[8px] px-4 py-3 text-sm text-[#C75D5D] mb-4">{error}</div>
              )}

              <div className="space-y-5">
                {/* Tipe kerja */}
                <div>
                  <label className={LABEL_CLASS}>Tipe Pekerjaan <span className="text-[#C75D5D]">*</span></label>
                  <p className="text-[11px] text-[#999AAA] mb-2">Boleh pilih lebih dari satu</p>
                  <div className="space-y-2">
                    {NANNY_TYPES.map(t => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => toggleNannyType(t.value)}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-[12px] border-[1.5px] transition-all text-left ${
                          form.nannyType.includes(t.value)
                            ? "border-[#5BBFB0] bg-[#E5F6F4]"
                            : "border-[#E0D0F0] bg-white hover:border-[#C8B8DC]"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-[1.5px] transition-all ${
                          form.nannyType.includes(t.value) ? "border-[#5BBFB0] bg-[#5BBFB0]" : "border-[#C8B8DC]"
                        }`}>
                          {form.nannyType.includes(t.value) && (
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#5A3A7A]">{t.label}</p>
                          <p className="text-[11px] text-[#999AAA]">{t.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pengalaman */}
                <div>
                  <label className={LABEL_CLASS}>Pengalaman (tahun)</label>
                  <input name="yearsOfExperience" type="number" min="0" max="50"
                    value={form.yearsOfExperience} onChange={handleInput}
                    placeholder="0" className={INPUT_CLASS} />
                </div>

                {/* Gaji */}
                <div>
                  <label className={LABEL_CLASS}>Gaji Harapan (IDR/bulan)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[11px] text-[#999AAA] mb-1">Minimum <span className="text-[#C75D5D]">*</span></p>
                      <input name="expectedSalaryMin" type="number" min="0"
                        value={form.expectedSalaryMin} onChange={handleInput}
                        placeholder="2500000" className={INPUT_CLASS} />
                    </div>
                    <div>
                      <p className="text-[11px] text-[#999AAA] mb-1">Maksimum</p>
                      <input name="expectedSalaryMax" type="number" min="0"
                        value={form.expectedSalaryMax} onChange={handleInput}
                        placeholder="3500000" className={INPUT_CLASS} />
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className={LABEL_CLASS}>Cerita Singkat Pengalaman Sus</label>
                  <textarea name="bio" value={form.bio} onChange={handleInput} rows={4}
                    placeholder="Ceritakan pengalaman merawat anak, usia anak yang pernah ditangani, atau hal spesial yang Sus bisa lakukan"
                    className="w-full px-3.5 py-2.5 text-sm text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/20 placeholder:text-[#999AAA] outline-none transition-all resize-none" />
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Psikotes (opsional) ── */}
          {step === 3 && (
            <div className="p-6">
              <h2 className="text-[18px] font-bold text-[#5A3A7A] mb-1">Psikotes BundaYakin</h2>
              <p className="text-[13px] text-[#999AAA] mb-4">Opsional · Gratis untuk Sus</p>

              {error && (
                <div className="bg-[#FAEAEA] border-l-4 border-[#C75D5D] rounded-[8px] px-4 py-3 text-sm text-[#C75D5D] mb-4">{error}</div>
              )}

              {/* Benefit box */}
              <div className="bg-[#E5F6F4] border border-[#A8DDD8] rounded-[14px] p-4 mb-5">
                <p className="text-[13px] font-bold text-[#1E4A45] mb-2">Manfaat psikotes untuk Sus</p>
                <ul className="text-[12px] text-[#2C5F5A] space-y-2 pl-4 list-disc leading-relaxed">
                  <li>Profil Sus jadi lebih <strong>lengkap dan terpercaya</strong> di mata keluarga</li>
                  <li>Hasil matching lebih <strong>akurat</strong> — Sus lebih mudah bertemu keluarga yang cocok</li>
                  <li>Badge &ldquo;Psikotes Selesai&rdquo; tampil di profil Sus — meningkatkan kepercayaan keluarga</li>
                  <li>Tidak ada jawaban benar/salah — hanya mengenali gaya kerja Sus</li>
                </ul>
              </div>

              {/* Waktu estimasi */}
              <div className="bg-white border border-[#E0D0F0] rounded-[12px] px-4 py-3 mb-5 flex items-center gap-3">
                <div className="w-9 h-9 bg-[#F3EEF8] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A97CC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#5A3A7A]">Estimasi waktu: 15–20 menit</p>
                  <p className="text-[12px] text-[#999AAA]">Bisa dikerjakan kapan saja, jawaban disimpan otomatis</p>
                </div>
              </div>

              <p className="text-[13px] text-[#5A3A7A] font-semibold mb-3 text-center">Apakah Sus ingin mengerjakan psikotes sekarang?</p>

              <div className="space-y-3">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => finish(false)}
                  className="w-full bg-[#5BBFB0] hover:bg-[#2C5F5A] disabled:bg-[#C8B8DC] text-white font-semibold py-3.5 rounded-[12px] min-h-[52px] text-sm transition-all"
                >
                  {saving ? "Menyimpan…" : "Ya, kerjakan psikotes sekarang"}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => finish(true)}
                  className="w-full border border-[#E0D0F0] text-[#666666] hover:text-[#5A3A7A] hover:border-[#C8B8DC] font-semibold py-3.5 rounded-[12px] min-h-[52px] text-sm transition-all"
                >
                  Lewati dulu, kerjakan nanti
                </button>
              </div>
              <p className="text-[11px] text-center text-[#999AAA] mt-3">
                Psikotes bisa dikerjakan kapan saja dari menu Survei di dashboard Sus
              </p>
            </div>
          )}

          {/* Navigation buttons (step 1–2 only) */}
          {step < 3 && (
            <div className="px-6 pb-6 pt-2 border-t border-[#F3EEF8] flex gap-3">
              {step > 1 && (
                <button type="button" onClick={back}
                  className="flex-1 border border-[#E0D0F0] text-[#5A3A7A] font-semibold py-3 rounded-[12px] min-h-[48px] text-sm hover:border-[#C8B8DC] transition-all">
                  Kembali
                </button>
              )}
              <button type="button" onClick={next}
                className="flex-1 bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold py-3 rounded-[12px] min-h-[48px] text-sm transition-all">
                {step === 2 ? "Lanjut ke Langkah Terakhir" : "Lanjut"}
              </button>
            </div>
          )}

          {step === 3 && step > 1 && (
            <div className="px-6 pb-2">
              <button type="button" onClick={back}
                className="w-full text-[#999AAA] text-xs py-2 hover:text-[#5A3A7A] transition-colors">
                ← Kembali ke langkah sebelumnya
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
