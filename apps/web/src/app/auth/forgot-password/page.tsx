"use client"

import { useState } from "react"
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

type Step = "phone" | "otp" | "password" | "done"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("phone")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [resetToken, setResetToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [cooldown, setCooldown] = useState(0)

  function startCooldown() {
    setCooldown(60)
    const t = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(t); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json() as { success: boolean; error?: string }
      if (!data.success) { setError(data.error ?? "Gagal mengirim OTP"); return }
      setStep("otp")
      startCooldown()
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (cooldown > 0) return
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json() as { success: boolean; error?: string }
      if (!data.success) { setError(data.error ?? "Gagal mengirim ulang OTP"); return }
      startCooldown()
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp }),
      })
      const data = await res.json() as { success: boolean; resetToken?: string; error?: string }
      if (!data.success) { setError(data.error ?? "Kode OTP salah"); return }
      setResetToken(data.resetToken!)
      setStep("password")
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (newPassword !== confirmPassword) { setError("Kata sandi tidak sama"); return }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, resetToken, newPassword }),
      })
      const data = await res.json() as { success: boolean; error?: string }
      if (!data.success) { setError(data.error ?? "Gagal mereset kata sandi"); return }
      setStep("done")
    } finally {
      setLoading(false)
    }
  }

  const stepIndex = { phone: 1, otp: 2, password: 3, done: 3 }[step]

  return (
    <main className="min-h-screen bg-[#FDFBFF] font-[var(--font-jakarta)]">
      <div className="max-w-[480px] mx-auto px-4 py-10">

        <div className="flex flex-col items-center mb-8">
          <BYLogo />
          <p className="font-[var(--font-dm-serif)] text-[24px] text-[#5A3A7A] mt-2">BundaYakin</p>
          <p className="text-[11px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mt-0.5">Online Nanny Assessment</p>
        </div>

        <h1 className="font-[var(--font-dm-serif)] text-[20px] text-[#5A3A7A] mb-1">Reset kata sandi</h1>

        {/* Step indicator */}
        {step !== "done" && (
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                  n < stepIndex ? "bg-[#5BBFB0] text-white" :
                  n === stepIndex ? "bg-[#5A3A7A] text-white" :
                  "bg-[#E0D0F0] text-[#999AAA]"
                }`}>{n < stepIndex ? "✓" : n}</div>
                {n < 3 && <div className={`flex-1 h-[2px] w-8 ${n < stepIndex ? "bg-[#5BBFB0]" : "bg-[#E0D0F0]"}`} />}
              </div>
            ))}
            <p className="ml-2 text-[12px] text-[#999AAA]">
              {step === "phone" && "Masukkan nomor WA"}
              {step === "otp" && "Verifikasi OTP"}
              {step === "password" && "Buat kata sandi baru"}
            </p>
          </div>
        )}

        {error && (
          <div className="bg-[#FAEAEA] border-l-4 border-[#C75D5D] rounded-r-[12px] px-4 py-3 text-[13px] text-[#C75D5D] mb-4">
            {error}
          </div>
        )}

        {/* Step 1: Phone */}
        {step === "phone" && (
          <form onSubmit={handleSendOtp}>
            <p className="text-[13px] text-[#666666] leading-relaxed mb-4">
              Masukkan nomor WhatsApp yang terdaftar di akun BundaYakin Anda. Kami akan kirim kode OTP ke nomor tersebut.
            </p>
            <div className="mb-4">
              <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">Nomor WhatsApp</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="0812 3456 7890"
                required
                className="w-full px-3.5 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[48px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/15 placeholder:text-[#999AAA] outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !phone}
              className="w-full flex items-center justify-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] mb-3 transition-all disabled:opacity-50"
            >
              {loading ? "Mengirim..." : "Kirim kode OTP"}
            </button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp}>
            <p className="text-[13px] text-[#666666] leading-relaxed mb-4">
              Kode 6 digit sudah dikirim ke WhatsApp <strong>{phone}</strong>. Berlaku 10 menit.
            </p>
            <div className="mb-4">
              <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">Kode OTP</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="_ _ _ _ _ _"
                required
                className="w-full px-3.5 py-2.5 text-[18px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[56px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/15 placeholder:text-[#E0D0F0] outline-none transition-all tracking-[0.4em] text-center font-bold"
              />
            </div>
            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full flex items-center justify-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] mb-3 transition-all disabled:opacity-50"
            >
              {loading ? "Memverifikasi..." : "Verifikasi OTP"}
            </button>
            <div className="text-center text-[12px] text-[#999AAA]">
              Tidak menerima kode?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || loading}
                className="text-[#5BBFB0] font-semibold disabled:text-[#999AAA] disabled:cursor-not-allowed"
              >
                {cooldown > 0 ? `Kirim ulang (${cooldown}s)` : "Kirim ulang"}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: New password */}
        {step === "password" && (
          <form onSubmit={handleResetPassword}>
            <p className="text-[13px] text-[#666666] leading-relaxed mb-4">
              Verifikasi berhasil. Buat kata sandi baru untuk akun Anda.
            </p>
            <div className="mb-3.5">
              <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">Kata sandi baru</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                required
                minLength={8}
                className="w-full px-3.5 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[48px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/15 placeholder:text-[#999AAA] outline-none transition-all"
              />
            </div>
            <div className="mb-4">
              <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">Ulangi kata sandi</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[48px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/15 placeholder:text-[#999AAA] outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full flex items-center justify-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] transition-all disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan kata sandi baru"}
            </button>
          </form>
        )}

        {/* Done */}
        {step === "done" && (
          <div>
            <div className="bg-[#E5F6F4] border-l-4 border-[#5BBFB0] rounded-r-[12px] px-4 py-3 text-[13px] text-[#2C5F5A] mb-6">
              Kata sandi berhasil diubah! Silakan masuk dengan kata sandi baru Anda.
            </div>
            <Link
              href="/auth/login"
              className="flex items-center justify-center w-full bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] transition-all"
            >
              Masuk sekarang
            </Link>
          </div>
        )}

        {step !== "done" && (
          <>
            <div className="border-t border-[#E0D0F0] my-4" />
            <Link
              href="/auth/login"
              className="flex items-center justify-center w-full bg-transparent border-[1.5px] border-[#C8B8DC] hover:bg-[#F3EEF8] text-[#666666] font-semibold text-[14px] min-h-[48px] rounded-[10px] transition-all"
            >
              ← Kembali ke halaman masuk
            </Link>
          </>
        )}

      </div>
    </main>
  )
}
