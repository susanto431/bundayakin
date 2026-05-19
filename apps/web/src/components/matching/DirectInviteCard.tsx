"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
  nannyProfileId: string
  nannyCity: string
  nannyExperience: number
}

export default function DirectInviteCard({ nannyProfileId, nannyCity, nannyExperience }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleInvite() {
    if (loading) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/matching/direct-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nannyProfileId }),
      })
      const data = (await res.json()) as { success: boolean; error?: string }

      if (!data.success) {
        setError(data.error ?? "Gagal membuat undangan")
        setLoading(false)
        return
      }

      // Redirect bersih — hilangkan ?invite dari URL
      router.replace("/dashboard/parent/matching")
      router.refresh()
    } catch {
      setLoading(false)
      setError("Terjadi kesalahan. Coba lagi.")
    }
  }

  return (
    <div className="bg-[#E5F6F4] border-l-4 border-[#5BBFB0] rounded-r-[16px] px-3.5 py-3.5 mb-4">
      <p className="text-[10px] font-bold tracking-[1.5px] uppercase text-[#2C5F5A] mb-1">Lanjutkan dengan nanny ini</p>
      <p className="text-[13px] font-semibold text-[#2C5F5A]">
        Nanny · {nannyCity || "Kota belum diisi"}
      </p>
      <p className="text-[12px] text-[#5A8A85] mt-0.5 mb-3">
        {nannyExperience > 0 ? `${nannyExperience} tahun pengalaman` : "Pengalaman baru"} · Kontak sudah terbuka
      </p>
      <button
        onClick={handleInvite}
        disabled={loading}
        className="inline-flex items-center bg-[#5BBFB0] hover:bg-[#2C5F5A] disabled:bg-[#A8DDD8] text-white font-semibold text-[13px] px-4 py-2 rounded-[10px] min-h-[40px] transition-all"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Memproses...
          </span>
        ) : "Mulai matching sekarang →"}
      </button>
      {error && <p className="text-[11px] text-red-500 mt-1.5">{error}</p>}
    </div>
  )
}
