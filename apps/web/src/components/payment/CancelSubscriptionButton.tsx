"use client"

import { useState } from "react"

type Props = {
  endDate: Date | null
}

export default function CancelSubscriptionButton({ endDate }: Props) {
  const [step, setStep] = useState<"idle" | "confirm" | "loading" | "done">("idle")
  const [error, setError] = useState("")

  const endDateStr = endDate
    ? new Date(endDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : ""

  async function handleConfirm() {
    setStep("loading")
    setError("")
    try {
      const res = await fetch("/api/parent/subscription/cancel", { method: "POST" })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setStep("done")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal membatalkan")
      setStep("confirm")
    }
  }

  if (step === "done") {
    return (
      <div className="bg-[#F3EEF8] border border-[#C8B8DC] rounded-[12px] px-4 py-3 mt-4">
        <p className="text-[13px] font-semibold text-[#5A3A7A] mb-0.5">Pembatalan dikonfirmasi</p>
        <p className="text-[12px] text-[#666666] leading-relaxed">
          Langganan Bunda telah dibatalkan. Akses tetap aktif hingga <strong>{endDateStr}</strong>. Setelah itu, akun beralih ke paket gratis.
        </p>
      </div>
    )
  }

  if (step === "confirm") {
    return (
      <div className="bg-[#FAEAEA] border border-[#F5C4C4] rounded-[12px] px-4 py-4 mt-4 space-y-3">
        <p className="text-[13px] font-bold text-[#C75D5D]">Yakin ingin membatalkan langganan?</p>
        <p className="text-[12px] text-[#666666] leading-relaxed">
          Bunda masih bisa menggunakan semua fitur hingga <strong>{endDateStr}</strong>. Setelah tanggal tersebut, akun beralih ke paket gratis (3 matching/bulan, tanpa catatan anak & monitoring).
        </p>
        {error && (
          <p className="text-[12px] text-[#C75D5D]">{error}</p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setStep("idle")}
            className="flex-1 border-[1.5px] border-[#C8B8DC] text-[#666666] font-semibold text-[13px] py-2.5 rounded-[10px] min-h-[44px] hover:bg-[#F3EEF8] transition-all"
          >
            Batalkan
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 bg-[#C75D5D] hover:bg-[#A84040] text-white font-semibold text-[13px] py-2.5 rounded-[10px] min-h-[44px] transition-all"
          >
            Ya, batalkan langganan
          </button>
        </div>
      </div>
    )
  }

  if (step === "loading") {
    return (
      <div className="mt-4 text-center py-3">
        <p className="text-[12px] text-[#999AAA]">Memproses pembatalan...</p>
      </div>
    )
  }

  return (
    <div className="mt-4 pt-4 border-t border-[#E0D0F0]">
      <button
        type="button"
        onClick={() => setStep("confirm")}
        className="w-full border-[1.5px] border-[#C8B8DC] text-[#999AAA] font-semibold text-[13px] py-2.5 rounded-[10px] min-h-[44px] hover:border-[#C75D5D] hover:text-[#C75D5D] transition-all"
      >
        Batalkan Langganan
      </button>
      <p className="text-center text-[11px] text-[#999AAA] mt-2">
        Akses tetap aktif hingga akhir periode yang sudah dibayar
      </p>
    </div>
  )
}
