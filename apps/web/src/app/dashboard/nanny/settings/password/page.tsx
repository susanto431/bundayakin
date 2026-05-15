"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NannyChangePasswordPage() {
  const router = useRouter()
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (next !== confirm) {
      setError("Kata sandi baru tidak cocok.")
      return
    }
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      })
      const json = await res.json()
      if (!json.success) {
        setError(json.error ?? "Gagal mengganti kata sandi.")
      } else {
        setSuccess(true)
        setTimeout(() => router.push("/dashboard/nanny/settings"), 1500)
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-28">
      <div className="border-b border-[#E0D0F0] pb-3 mb-6">
        <Link
          href="/dashboard/nanny/settings"
          className="inline-flex items-center text-[12px] text-[#999AAA] hover:text-[#5A3A7A] mb-2 transition-colors"
        >
          ← Kembali ke pengaturan
        </Link>
        <h1 className="text-[16px] font-bold text-[#5A3A7A]">Ganti kata sandi</h1>
      </div>

      {success ? (
        <div className="bg-[#E5F6F4] border border-[#A8DDD8] rounded-[16px] p-4 text-center">
          <p className="text-[14px] font-semibold text-[#1E4A45]">Kata sandi berhasil diubah.</p>
          <p className="text-[12px] text-[#2C5F5A] mt-1">Mengalihkan...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-[#FEF0E7] border border-[#F5C4A0] rounded-[12px] px-3.5 py-2.5">
              <p className="text-[13px] text-[#A35320]">{error}</p>
            </div>
          )}

          {(["Kata sandi saat ini", "Kata sandi baru", "Konfirmasi kata sandi baru"] as const).map(
            (label, i) => {
              const val = [current, next, confirm][i]
              const setter = [setCurrent, setNext, setConfirm][i]
              return (
                <div key={label}>
                  <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">{label}</label>
                  <input
                    type="password"
                    value={val}
                    onChange={e => setter(e.target.value)}
                    required
                    minLength={i > 0 ? 8 : 1}
                    className="w-full px-3.5 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[48px] focus:border-[#A97CC4] focus:ring-2 focus:ring-[#A97CC4]/15 outline-none transition-all"
                  />
                </div>
              )
            }
          )}

          <button
            type="submit"
            disabled={loading || !current || !next || !confirm}
            className="w-full flex items-center justify-center bg-[#A97CC4] hover:bg-[#5A3A7A] text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] transition-all disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </form>
      )}
    </div>
  )
}
