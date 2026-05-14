"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function StartMatchingButton({ nannyUserId }: { nannyUserId: string }) {
  const router = useRouter()
  const [state, setState] = useState<"idle" | "loading" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  async function handleStart() {
    setState("loading")
    setErrorMsg("")
    try {
      const res = await fetch("/api/matching/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nannyUserId }),
      })
      const data = await res.json() as { success: boolean; error?: string }
      if (!data.success) {
        setErrorMsg(data.error ?? "Gagal memulai matching")
        setState("error")
        return
      }
      router.refresh()
    } catch {
      setErrorMsg("Tidak dapat terhubung ke server")
      setState("error")
    }
  }

  if (state === "loading") {
    return (
      <div className="w-full flex flex-col items-center justify-center bg-[#F3EEF8] border border-[#C8B8DC] rounded-[16px] p-5 text-center">
        <div className="w-8 h-8 border-[3px] border-[#A97CC4] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-[13px] font-semibold text-[#5A3A7A]">AI sedang menganalisis kecocokan...</p>
        <p className="text-[11px] text-[#999AAA] mt-1">Biasanya 10–20 detik</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {state === "error" && (
        <div className="bg-[#FAEAEA] border border-[#C75D5D] rounded-[10px] px-3.5 py-2.5">
          <p className="text-[13px] text-[#C75D5D] font-medium">{errorMsg}</p>
        </div>
      )}
      <button
        onClick={handleStart}
        className="w-full flex items-center justify-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] transition-all"
      >
        Jalankan matching AI →
      </button>
    </div>
  )
}
