"use client"

import { useState } from "react"

type Props = {
  nannyNama: string
  nannyProfileId: string
  onSuccess: () => void
  onClose: () => void
}

export default function PaymentModal({ nannyNama, nannyProfileId, onSuccess, onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleDemoUnlock() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/matching/demo-unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nannyProfileId }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error ?? "Gagal membuka kontak")
      onSuccess()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Modal */}
      <div className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-xl">
        <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-5 sm:hidden" />

        <h2 className="font-bold text-lg text-[#5A3A7A] mb-1">Buka Kontak Nanny</h2>
        <p className="text-[#666666] text-sm mb-5">
          Akses kontak dan laporan kecocokan lengkap dengan{" "}
          <span className="font-semibold text-[#5A3A7A]">{nannyNama}</span>
        </p>

        {/* Price box */}
        <div
          className="rounded-xl p-4 mb-5 flex items-center justify-between"
          style={{ backgroundColor: "#F3EEF8" }}
        >
          <div>
            <p className="text-sm text-[#666666]">Biaya sekali bayar</p>
            <p className="text-xl font-bold text-[#5A3A7A]">Rp 100.000</p>
          </div>
          <span className="text-3xl">📱</span>
        </div>

        <p className="text-xs text-[#999AAA] mb-4 text-center">
          Pembayaran satu kali — kontak terbuka selamanya
        </p>

        {error && (
          <p className="text-sm text-[#C75D5D] mb-3 text-center">{error}</p>
        )}

        {/* Demo button */}
        <button
          onClick={handleDemoUnlock}
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-semibold text-white transition-opacity disabled:opacity-60"
          style={{ backgroundColor: "#5BBFB0" }}
        >
          {loading ? "Memproses..." : "Simulasi Bayar (Demo)"}
        </button>

        <button
          onClick={onClose}
          className="w-full mt-3 py-3 rounded-xl font-medium text-[#666666] text-sm"
        >
          Batal
        </button>

        <p className="text-[10px] text-[#999AAA] text-center mt-3">
          Demo mode — integrasi Midtrans aktif di Sprint 3
        </p>
      </div>
    </div>
  )
}
