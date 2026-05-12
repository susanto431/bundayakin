"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterNannyPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    source: "",
    familyCode: "",
    bank: "",
    bankNumber: "",
  })
  const [workTypes, setWorkTypes] = useState({ longterm: true, temporary: true })
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!agreed) { setError("Harap setujui syarat & ketentuan"); return }
    if (form.password.length < 8) { setError("Kata sandi minimal 8 karakter"); return }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          password: form.password,
          role: "NANNY",
          phone: form.phone || undefined,
        }),
      })
      const data = await res.json() as { success: boolean; error?: string }
      if (!data.success) { setError(data.error ?? "Terjadi kesalahan, coba lagi"); setLoading(false); return }
      router.push("/auth/login?registered=1")
    } catch {
      setError("Tidak dapat terhubung ke server")
      setLoading(false)
    }
  }

  const inputCls = "w-full px-3.5 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[48px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/15 placeholder:text-[#999AAA] outline-none transition-all"

  return (
    <main className="min-h-screen bg-[#FDFBFF] font-[var(--font-jakarta)]">
      <div className="max-w-[480px] mx-auto px-4 py-6">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-4">
          <svg width="28" height="28" viewBox="0 0 60 60" aria-hidden="true">
            <circle cx="22" cy="28" r="20" fill="#A97CC4" />
            <circle cx="38" cy="28" r="20" fill="#5BBFB0" />
            <circle cx="30" cy="20" r="9" fill="#fff" />
            <ellipse cx="30" cy="36" rx="12" ry="8" fill="#fff" opacity=".9" />
          </svg>
          <span className="font-[var(--font-dm-serif)] text-[16px] text-[#5A3A7A]">BundaYakin</span>
        </div>

        {/* Header */}
        <div className="border-b border-[#E0D0F0] pb-3 mb-4">
          <h1 className="text-[16px] font-bold text-[#5A3A7A]">Daftar sebagai nanny</h1>
          <p className="text-[12px] text-[#999AAA] mt-0.5">Gratis · profil terverifikasi · rekam jejak terbentuk</p>
        </div>

        {/* Benefits card */}
        <div className="bg-[#F3EEF8] border border-[#E0D0F0] rounded-[16px] p-3.5 mb-4">
          <p className="text-[12px] font-bold text-[#5A3A7A] mb-1.5">Manfaat bergabung di BundaYakin</p>
          <ul className="text-[12px] text-[#5A3A7A] pl-4 leading-[1.8] list-disc">
            <li>Profil nanny terverifikasi platform</li>
            <li>Rekam jejak kerja terbentuk otomatis</li>
            <li>Bonus Rp 150.000 kalau bertahan 3 bulan</li>
            <li>Badge Terpercaya untuk nanny andalan</li>
          </ul>
        </div>

        {error && (
          <div className="bg-[#FAEAEA] border-l-4 border-[#C75D5D] rounded-r-[12px] px-4 py-3 text-[13px] text-[#C75D5D] mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">Nama lengkap</label>
            <input name="name" type="text" value={form.name} onChange={handleChange} placeholder="Cth: Dewi Rahayu" required className={inputCls} />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">Nomor HP</label>
            <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="0812..." className={inputCls} />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">Kata sandi</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min. 8 karakter" required className={inputCls} />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">Tahu BundaYakin dari mana?</label>
            <select name="source" value={form.source} onChange={handleChange} className={inputCls}>
              <option value="">Pilih sumber</option>
              <option>Teman / nanny lain</option>
              <option>Penyalur nanny</option>
              <option>Instagram / TikTok</option>
              <option>Lainnya</option>
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">Kode undangan keluarga <span className="font-normal text-[#999AAA]">(opsional)</span></label>
            <input name="familyCode" type="text" value={form.familyCode} onChange={handleChange} placeholder="BY-XXXX — dari keluarga yang mengundang" className={inputCls} />
          </div>

          {/* Bank section */}
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] pt-1">Rekening / e-wallet untuk bonus</p>
          <p className="text-[11px] text-[#999AAA] -mt-2">Untuk transfer bonus bertahan dan fee rekomendasi. Bisa diisi nanti.</p>
          <div>
            <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">Bank atau e-wallet</label>
            <select name="bank" value={form.bank} onChange={handleChange} className={inputCls}>
              <option value="">Pilih bank / e-wallet</option>
              <option>GoPay</option>
              <option>BCA</option>
              <option>BRI</option>
              <option>Mandiri</option>
              <option>OVO</option>
              <option>DANA</option>
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">Nomor rekening / HP e-wallet</label>
            <input name="bankNumber" type="text" value={form.bankNumber} onChange={handleChange} placeholder="1234567890" className={inputCls} />
          </div>

          {/* Work type */}
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] pt-1">Saya bersedia bekerja sebagai</p>
          <div className="space-y-2 -mt-2">
            {[
              { key: "longterm" as const, label: "Jangka panjang (tinggal / harian rutin)" },
              { key: "temporary" as const, label: "Temporer / infal" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-start gap-2.5 cursor-pointer">
                <div
                  className={`w-5 h-5 rounded-[6px] border-[1.5px] flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${workTypes[key] ? "bg-[#5BBFB0] border-[#5BBFB0]" : "bg-white border-[#C8B8DC]"}`}
                  onClick={() => setWorkTypes(v => ({ ...v, [key]: !v[key] }))}
                >
                  {workTypes[key] && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </div>
                <span className="text-[13px] text-[#666666] leading-relaxed">{label}</span>
              </label>
            ))}
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-[6px] border-[1.5px] border-[#C8B8DC] bg-white flex items-center justify-center flex-shrink-0 mt-0.5 opacity-50" />
              <span className="text-[13px] text-[#999AAA]">Harian / per jam (tersedia nanti)</span>
            </div>
          </div>

          {/* T&C card */}
          <div className="bg-[#F3EEF8] border border-[#E0D0F0] rounded-[16px] p-3.5">
            <p className="text-[12px] font-bold text-[#5A3A7A] mb-1.5">Syarat &amp; Ketentuan Data Nanny</p>
            <p className="text-[12px] text-[#5A3A7A] leading-relaxed mb-3">Dengan daftar, data boleh dipakai untuk pencocokan. Manfaat balik: profil terverifikasi + rekam jejak + bonus bertahan.</p>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <div
                className={`w-5 h-5 rounded-[6px] border-[1.5px] flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${agreed ? "bg-[#A97CC4] border-[#A97CC4]" : "bg-white border-[#C8B8DC]"}`}
                onClick={() => setAgreed(v => !v)}
              >
                {agreed && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </div>
              <span className="text-[13px] text-[#666666] leading-relaxed">Saya setuju</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !agreed}
            className="w-full flex items-center justify-center bg-[#A97CC4] hover:bg-[#5A3A7A] text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] transition-all disabled:opacity-50"
          >
            {loading ? "Membuat akun..." : "Buat akun nanny gratis"}
          </button>
        </form>

        <p className="text-center text-[12px] text-[#999AAA] mt-4">
          Sudah punya akun?{" "}
          <Link href="/auth/login" className="text-[#5BBFB0] font-semibold">Masuk di sini</Link>
        </p>
      </div>
    </main>
  )
}
