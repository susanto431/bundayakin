"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"

export function DeleteAccountButton() {
  const [step, setStep] = useState<"idle" | "confirm" | "loading">("idle")

  async function handleDelete() {
    setStep("loading")
    try {
      await fetch("/api/parent/profile", { method: "DELETE" })
    } catch {
      // best-effort
    }
    await signOut({ callbackUrl: "/auth/login" })
  }

  if (step === "confirm") {
    return (
      <div className="bg-[#FAEAEA] border border-[#C75D5D] rounded-[12px] p-3.5 space-y-2">
        <p className="text-[13px] font-semibold text-[#C75D5D]">Hapus akun secara permanen?</p>
        <p className="text-[12px] text-[#666666]">Semua data, riwayat matching, dan langganan akan dihapus. Tidak bisa dikembalikan.</p>
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleDelete}
            className="flex-1 bg-[#C75D5D] hover:bg-[#A04040] text-white font-semibold text-[12px] min-h-[40px] rounded-[8px] transition-all"
          >
            Ya, hapus akun
          </button>
          <button
            onClick={() => setStep("idle")}
            className="flex-1 bg-transparent border-[1.5px] border-[#C8B8DC] text-[#666666] font-semibold text-[12px] min-h-[40px] rounded-[8px] hover:bg-[#F3EEF8] transition-all"
          >
            Batal
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setStep("confirm")}
      disabled={step === "loading"}
      className="block text-[#C75D5D] font-semibold text-[13px] min-h-[40px] disabled:opacity-50"
    >
      {step === "loading" ? "Menghapus..." : "Hapus akun"}
    </button>
  )
}
