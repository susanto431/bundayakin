"use client"

import { useState } from "react"
import Link from "next/link"
import { usePostHog } from "posthog-js/react"

type Props = {
  label?: string
  className?: string
}

export default function MayarButton({ label = "Bayar Sekarang", className }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const posthog = usePostHog()

  async function handlePay() {
    if (loading) return
    setLoading(true)
    setError(null)
    posthog.capture("subscription_payment_initiated")

    try {
      const res = await fetch("/api/payment/create", { method: "POST" })
      const data = (await res.json()) as {
        success: boolean
        data?: { paymentUrl: string; invoiceId: string }
        error?: string
      }

      if (!data.success || !data.data?.paymentUrl) {
        setError(data.error ?? "Gagal membuat pembayaran")
        setLoading(false)
        return
      }

      posthog.capture("subscription_payment_redirected")
      window.location.href = data.data.paymentUrl
    } catch {
      posthog.capture("subscription_payment_error", { reason: "network" })
      setLoading(false)
      setError("Terjadi kesalahan. Coba lagi.")
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handlePay}
        disabled={loading}
        className={
          className ??
          "w-full flex items-center justify-center bg-[#5BBFB0] hover:bg-[#2C5F5A] disabled:bg-[#C8B8DC] text-white font-semibold py-3.5 rounded-[12px] min-h-[52px] text-sm transition-all"
        }
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Memproses...
          </span>
        ) : (
          label
        )}
      </button>

      {error && (
        <div className="text-center">
          <p className="text-xs text-red-500">{error}</p>
          {/* Error minta lengkapi profil (email/HP) — beri jalan langsung, bukan cuma instruksi (walkthrough #2 temuan #1) */}
          {error.includes("halaman profil") && (
            <Link
              href="/dashboard/parent/profile"
              className="inline-flex items-center text-xs font-semibold text-[#A97CC4] underline mt-1"
            >
              Lengkapi profil sekarang →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
