"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
  honorific: string // "Sus" / sapaan sesuai gender
}

// Prompt pasca-survey: tuntun nanny menyalakan "Siap Kerja" agar bisa ditemukan keluarga.
// Usability walkthrough temuan #3 — nanny masuk "ruang tunggu" tanpa tahu langkah berikutnya.
export default function OpenToJobPromptCard({ honorific }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleActivate() {
    if (loading) return
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch("/api/nanny/open-to-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ openToJob: true }),
      })
      const data = await res.json() as { success: boolean; error?: string }
      if (data.success) {
        setDone(true)
        router.refresh()
      } else {
        setErrorMsg(data.error ?? "Terjadi kesalahan. Coba lagi.")
        setLoading(false)
      }
    } catch {
      setErrorMsg("Koneksi bermasalah. Coba lagi.")
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="bg-[#E5F6F4] border border-[#A8DDD8] rounded-[16px] p-4 mb-4">
        <p className="text-[14px] font-bold text-[#1E4A45] mb-1">Status &ldquo;Siap Kerja&rdquo; aktif ✓</p>
        <p className="text-[13px] text-[#2C5F5A] leading-relaxed">
          Profil {honorific} sekarang bisa ditemukan keluarga yang sedang mencari nanny. Pastikan foto dan video profil lengkap agar makin dilirik.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[#5A3A7A] rounded-[16px] p-4 mb-4">
      <p className="text-[10px] font-bold tracking-[2px] uppercase text-[#A8DDD8] mb-1">Langkah terakhir</p>
      <p className="text-[14px] font-bold text-white mb-1">
        Nyalakan &ldquo;Siap Kerja&rdquo; supaya keluarga bisa menemukan {honorific}
      </p>
      <p className="text-[13px] leading-relaxed mb-3" style={{ color: "rgba(255,255,255,0.7)" }}>
        Tes Kecocokan {honorific} sudah selesai. Dengan status Siap Kerja, profil {honorific} muncul di pencarian keluarga yang sedang butuh nanny.
      </p>
      {errorMsg && <p className="text-[12px] text-red-300 mb-2" role="alert">{errorMsg}</p>}
      <button
        onClick={handleActivate}
        disabled={loading}
        className="w-full flex items-center justify-center bg-[#5BBFB0] hover:bg-[#2C5F5A] disabled:opacity-50 text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-all"
      >
        {loading ? "Mengaktifkan..." : "Nyalakan Siap Kerja"}
      </button>
      <p className="text-[11px] mt-2 text-center" style={{ color: "rgba(255,255,255,0.5)" }}>
        Bisa dimatikan kapan saja di menu Akun
      </p>
    </div>
  )
}
