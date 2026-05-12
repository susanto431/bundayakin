"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterParentPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    city: "",
    source: "",
    referralCode: "",
  })
  const [agreed, setAgreed] = useState(true)
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
          email: form.email || undefined,
          password: form.password,
          role: "PARENT",
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
          <h1 className="text-[16px] font-bold text-[#5A3A7A]">Daftar sebagai orang tua</h1>
          <p className="text-[12px] text-[#999AAA] mt-0.5">Akun gratis · tidak perlu bayar dulu</p>
        </div>

        {/* Step dots */}
        <div className="flex gap-1.5 mb-5">
          {[0, 1, 2].map(i => (
            <div key={i} className={`flex-1 h-1 rounded-full ${i === 0 ? "bg-[#A8DDD8]" : "bg-[#E0D0F0]"}`} />
          ))}
        </div>

        {error && (
          <div className="bg-[#FAEAEA] border-l-4 border-[#C75D5D] rounded-r-[12px] px-4 py-3 text-[13px] text-[#C75D5D] mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">Nama lengkap</label>
            <input name="name" type="text" value={form.name} onChange={handleChange} placeholder="Cth: Ria Putri" required className={inputCls} />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">Nomor HP</label>
            <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="0812..." className={inputCls} />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">Email <span className="font-normal text-[#999AAA]">(opsional)</span></label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@..." className={inputCls} />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">Kata sandi</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min. 8 karakter" required className={inputCls} />
            <p className="text-[11px] text-[#999AAA] mt-1">Kombinasi huruf, angka, dan simbol</p>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">Kota domisili</label>
            <input name="city" type="text" value={form.city} onChange={handleChange} placeholder="Jakarta Selatan" className={inputCls} />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">Tahu BundaYakin dari mana?</label>
            <select name="source" value={form.source} onChange={handleChange} className={inputCls}>
              <option value="">Pilih sumber</option>
              <option>Instagram / TikTok</option>
              <option>Teman / keluarga</option>
              <option>Google</option>
              <option>Komunitas ibu-ibu</option>
              <option>Lainnya</option>
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">Kode rekomendasi <span className="font-normal text-[#999AAA]">(opsional)</span></label>
            <input name="referralCode" type="text" value={form.referralCode} onChange={handleChange} placeholder="BY-REF-XXXX dari teman / penyalur" className={inputCls} />
          </div>

          {/* T&C card */}
          <div className="bg-[#E5F6F4] border border-[#A8DDD8] rounded-[16px] p-3.5">
            <p className="text-[12px] font-bold text-[#1E4A45] mb-1.5">Syarat &amp; Ketentuan Data (PDP)</p>
            <p className="text-[12px] text-[#2C5F5A] leading-relaxed mb-3">Data hanya untuk pencocokan dan pemantauan nanny. Tidak dijual ke pihak ketiga.</p>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <div
                className={`w-5 h-5 rounded-[6px] border-[1.5px] flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${agreed ? "bg-[#5BBFB0] border-[#5BBFB0]" : "bg-white border-[#C8B8DC]"}`}
                onClick={() => setAgreed(v => !v)}
              >
                {agreed && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </div>
              <span className="text-[13px] text-[#666666] leading-relaxed">Saya menyetujui syarat &amp; ketentuan</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] transition-all disabled:opacity-50"
          >
            {loading ? "Membuat akun..." : "Buat akun & lanjut →"}
          </button>
        </form>

        <p className="text-center text-[12px] text-[#999AAA] mt-3">
          Sudah punya akun?{" "}
          <Link href="/auth/login" className="text-[#5BBFB0] font-semibold">Masuk di sini</Link>
        </p>
        <p className="text-center text-[11px] text-[#999AAA] mt-1">
          Lupa password?{" "}
          <span className="text-[#5BBFB0] cursor-pointer">Reset via SMS/WA</span>
        </p>
      </div>
    </main>
  )
}
