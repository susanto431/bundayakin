"use client"

import { useState } from "react"

type Props = {
  nannyId: string       // NannyProfile.id
  onUnlocked: () => void
}

export default function UnlockNannyButton({ nannyId, onUnlocked }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleUnlock() {
    if (loading) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/matching/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nannyId }),
      })
      const data = (await res.json()) as {
        success: boolean
        data?: { snapToken?: string; unlocked?: boolean; free?: boolean }
        error?: string
      }

      if (!data.success) {
        setError(data.error ?? "Gagal membuka profil")
        setLoading(false)
        return
      }

      // Paid tier — langsung terbuka tanpa payment
      if (data.data?.unlocked && data.data?.free) {
        setLoading(false)
        onUnlocked()
        return
      }

      // Free tier — buka Midtrans Snap
      const snapToken = data.data?.snapToken
      if (!snapToken) {
        setError("Token pembayaran tidak tersedia")
        setLoading(false)
        return
      }

      window.snap?.pay(snapToken, {
        onSuccess: () => {
          setLoading(false)
          onUnlocked()
        },
        onPending: () => {
          setLoading(false)
        },
        onError: () => {
          setLoading(false)
          setError("Pembayaran gagal. Coba lagi.")
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
            Buka profil — Rp 100rb
          </>
        )}
      </button>
      {error && <p className="text-[11px] text-red-500 text-center mt-1">{error}</p>}
    </div>
  )
}
