"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

function BYLogo() {
  return (
    <svg width="56" height="56" viewBox="0 0 60 60" aria-hidden="true">
      <circle cx="22" cy="28" r="20" fill="#A97CC4" />
      <circle cx="38" cy="28" r="20" fill="#5BBFB0" />
      <circle cx="30" cy="20" r="9" fill="#fff" />
      <ellipse cx="30" cy="36" rx="12" ry="8" fill="#fff" opacity=".9" />
    </svg>
  )
}

function LoginForm() {
  const searchParams = useSearchParams()
  const registered = searchParams.get("registered") === "1"

  const [credential, setCredential] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await signIn("credentials", {
      email: credential,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Nomor HP / email atau kata sandi salah")
      setLoading(false)
      return
    }

    window.location.href = "/"
  }

  return (
    <main className="min-h-screen bg-[#FDFBFF] font-[var(--font-jakarta)]">
      <div className="max-w-[480px] mx-auto px-4 py-10">

        {/* Logo center */}
        <div className="flex flex-col items-center mb-8">
          <BYLogo />
          <p className="font-[var(--font-dm-serif)] text-[24px] text-[#5A3A7A] mt-2">BundaYakin</p>
          <p className="text-[11px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mt-0.5">Online Nanny Assessment</p>
        </div>

        {registered && (
          <div className="bg-[#E5F6F4] border-l-4 border-[#5BBFB0] rounded-r-[12px] px-4 py-3 text-[13px] text-[#2C5F5A] mb-4">
            Akun berhasil dibuat! Silakan masuk.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-[#FAEAEA] border-l-4 border-[#C75D5D] rounded-r-[12px] px-4 py-3 text-[13px] text-[#C75D5D] mb-4">
              {error}
            </div>
          )}

          <div className="mb-3.5">
            <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">Nomor HP atau email</label>
            <input
              type="text"
              value={credential}
              onChange={e => setCredential(e.target.value)}
              placeholder="0812... atau email@..."
              required
              className="w-full px-3.5 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[48px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/15 placeholder:text-[#999AAA] outline-none transition-all"
            />
          </div>

          <div className="mb-1">
            <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">Kata sandi</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[48px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/15 placeholder:text-[#999AAA] outline-none transition-all"
            />
          </div>
          <div className="text-right mb-4">
            <Link href="/auth/forgot-password" className="text-[12px] text-[#5BBFB0] font-semibold hover:underline">
              Lupa password? Reset via SMS/WA →
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] mb-3 transition-all disabled:opacity-50"
          >
            {loading ? "Memuat..." : "Masuk"}
          </button>
        </form>

        {/* Auto-detect note */}
        <div className="bg-[#F3EEF8] border border-[#E0D0F0] rounded-[16px] p-3.5 mb-4">
          <p className="text-[12px] text-[#999AAA] text-center leading-relaxed">
            Sistem mendeteksi otomatis akun Orang Tua atau Nanny → diarahkan ke dashboard masing-masing.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-[#E0D0F0] mb-4" />

        <p className="text-[12px] text-[#999AAA] text-center mb-3">Belum punya akun?</p>
        <div className="flex gap-2">
          <Link
            href="/auth/register/parent"
            className="flex-1 flex items-center justify-center bg-[#E5F6F4] hover:bg-[#A8DDD8] text-[#1E4A45] font-semibold text-[12px] min-h-[36px] rounded-[10px] transition-all"
          >
            Daftar OT
          </Link>
          <Link
            href="/auth/register/nanny"
            className="flex-1 flex items-center justify-center bg-[#A97CC4] hover:bg-[#5A3A7A] text-white font-semibold text-[12px] min-h-[36px] rounded-[10px] transition-all"
          >
            Daftar Nanny
          </Link>
        </div>

      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#FDFBFF] flex items-center justify-center">
        <p className="text-sm text-[#999AAA]">Memuat...</p>
      </main>
    }>
      <LoginForm />
    </Suspense>
  )
}
