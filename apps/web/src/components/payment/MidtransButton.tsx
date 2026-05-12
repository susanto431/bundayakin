"use client"

import { useState } from "react"
import Script from "next/script"

// Midtrans Snap types
declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: unknown) => void
          onPending?: (result: unknown) => void
          onError?: (result: unknown) => void
          onClose?: () => void
        }
      ) => void
    }
  }
}

const SNAP_JS_URL =
  process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js"

type Props = {
  label?: string
  className?: string
  /** Called after successful payment before page reload */
  onSuccess?: () => void
}

export default function MidtransButton({
  label = "Bayar Sekarang",
  className,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Cache snap token within the same page session
  const [cachedToken, setCachedToken] = useState<string | null>(null)

  async function handlePay() {
    if (loading) return
    setLoading(true)
    setError(null)

    try {
      let token = cachedToken

      if (!token) {
        const res = await fetch("/api/payment/create", { method: "POST" })
        const data = (await res.json()) as { success: boolean; data?: { snapToken: string }; error?: string }
        if (!data.success || !data.data?.snapToken) {
          setError(data.error ?? "Gagal membuat pembayaran")
          setLoading(false)
          return
        }
        token = data.data.snapToken
        setCachedToken(token)
      }

      window.snap?.pay(token, {
        onSuccess: () => {
          setLoading(false)
          onSuccess?.()
          window.location.reload()
        },
        onPending: () => {
          setLoading(false)
        },
        onError: () => {
          setLoading(false)
          setError("Pembayaran gagal. Coba lagi.")
          setCachedToken(null)
        },
        onClose: () => {
          setLoading(false)
        },
      })
    } catch {
      setLoading(false)
      setError("Terjadi kesalahan. Coba lagi.")
    }
  }

  return (
    <>
      <Script
        src={SNAP_JS_URL}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />

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
          <p className="text-xs text-red-500 text-center">{error}</p>
        )}
      </div>
    </>
  )
}
