"use client"

import { useState } from "react"
import { usePostHog } from "posthog-js/react"

type Props = {
  nannyProfileId: string
  flowType: "REFERRAL" | "TALENT_POOL"
  quotaRemaining: number
  onUnlocked: () => void
}

export default function UnlockNannyButton({ nannyProfileId, flowType, quotaRemaining, onUnlocked }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const posthog = usePostHog()

  async function handleUnlock() {
    if (loading) return
    setLoading(true)
    setError(null)
    posthog.capture("nanny_profile_unlock_initiated", { nanny_id: nannyProfileId, flowType })

    try {
      const res = await fetch("/api/matching/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nannyProfileId, flowType }),
      })
      const data = (await res.json()) as {
        success: boolean
        data?: { paymentUrl?: string; unlocked?: boolean; remaining?: number }
        error?: string
      }

      if (!data.success) {
        setError(data.error ?? "Gagal membuka profil")
        setLoading(false)
        return
      }

      if (data.data?.unlocked) {
        posthog.capture("nanny_profile_unlock_success", { nanny_id: nannyProfileId, flowType })
        setLoading(false)
        onUnlocked()
        return
      }

      // Kuota habis — redirect ke halaman pembayaran Mayar (add-on)
      const paymentUrl = data.data?.paymentUrl
      if (!paymentUrl) {
        setError("URL pembayaran tidak tersedia")
        setLoading(false)
        return
      }

      posthog.capture("nanny_profile_unlock_payment_redirect", { nanny_id: nannyProfileId })
      window.location.href = paymentUrl
    } catch {
      setLoading(false)
      setError("Terjadi kesalahan. Coba lagi.")
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleUnlock}
        disabled={loading}
        className="w-full flex items-center justify-center gap-1.5 bg-[#5A3A7A] hover:bg-[#3D2558] disabled:bg-[#C8B8DC] text-white font-semibold text-[13px] px-4 py-2.5 rounded-[10px] min-h-[44px] transition-all"
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
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Pakai kuota (sisa {quotaRemaining}×)
          </>
        )}
      </button>
      {error && <p className="text-[11px] text-red-500 text-center mt-1">{error}</p>}
    </div>
  )
}
