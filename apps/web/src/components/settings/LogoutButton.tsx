"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"

export function LogoutButton() {
  const [step, setStep] = useState<"idle" | "confirm" | "loading">("idle")

  async function handleLogout() {
    setStep("loading")
    await signOut({ callbackUrl: "/auth/login" })
  }

  if (step === "confirm") {
    return (
      <div className="bg-[#F3EEF8] border border-[#C8B8DC] rounded-[12px] p-3.5 space-y-2">
        <p className="text-[13px] font-semibold text-[#5A3A7A]">Yakin ingin keluar?</p>
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleLogout}
            className="flex-1 bg-[#5A3A7A] hover:bg-[#3D2456] text-white font-semibold text-[12px] min-h-[40px] rounded-[8px] transition-all"
          >
            Ya, keluar
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
      className="block text-[#A97CC4] font-semibold text-[13px] min-h-[40px] disabled:opacity-50"
    >
      {step === "loading" ? "Keluar..." : "Keluar dari akun"}
    </button>
  )
}
