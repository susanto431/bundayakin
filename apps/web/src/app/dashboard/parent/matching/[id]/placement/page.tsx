"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

export default function PlacementFeePage() {
  const params = useParams()
  const router = useRouter()
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)

  // Dummy data — in production from server props
  const nannyName = "Siti Rahayu"
  const score = 78
  const matchingId = params.id as string

  async function handlePay() {
    if (!agreed) return
    setLoading(true)
    try {
      const res = await fetch("/api/payment/placement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchingRequestId: matchingId }),
      })
      const data = await res.json() as { success: boolean; snapToken?: string; error?: string }
      if (data.success && data.snapToken) {
        // Open Midtrans Snap
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).snap?.pay(data.snapToken, {
          onSuccess: () => router.push("/dashboard/parent"),
          onPending: () => router.push("/dashboard/parent"),
          onError: () => { setLoading(false) },
          onClose: () => { setLoading(false) },
        })
      } else {
        setLoading(false)
      }
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-28">

      {/* Header */}
      <div className="border-b border-[#E0D0F0] pb-3 mb-4">
        <h1 className="text-[16px] font-bold text-[#5A3A7A]">Konfirmasi penerimaan nanny</h1>
        <p className="text-[12px] text-[#999AAA] mt-0.5">Langkah terakhir sebelum {nannyName.split(" ")[0]} resmi mulai</p>
      </div>

      {/* Nanny card */}
      <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-3.5 mb-4">
        <div className="flex items-start gap-2.5">
          <div className="w-11 h-11 rounded-full bg-[#F3EEF8] border-2 border-[#E0D0F0] flex items-center justify-center font-bold text-[16px] text-[#5A3A7A] flex-shrink-0">
            {nannyName.split(" ").map(w => w[0]).slice(0, 2).join("")}
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-bold text-[#5A3A7A]">{nannyName}</p>
            <p className="text-[12px] text-[#999AAA] mt-0.5">Jangka panjang · menginap</p>
            <div className="flex justify-between items-center mt-1.5">
              <span className="text-[11px] text-[#999AAA]">Tingkat kecocokan</span>
              <span className="text-[11px] font-semibold bg-[#E5F6F4] text-[#2C5F5A] border border-[#A8DDD8] px-2 py-0.5 rounded-full">{score}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fee card */}
      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Biaya penempatan nanny</p>
      <div className="bg-[#FEF0E7] border border-[#F5C4A0] rounded-[16px] p-3.5 mb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 mr-3">
            <p className="text-[13px] font-bold text-[#A35320]">Jangka panjang — all-in</p>
            <p className="text-[12px] text-[#7A4018] mt-1 leading-relaxed">
              Termasuk: bonus untuk {nannyName.split(" ")[0]} kalau bertahan 3 bulan, dan fee untuk siapa pun yang merekomendasikan {nannyName.split(" ")[0]} ke Bunda.
            </p>
            <button className="text-[12px] text-[#E07B39] font-semibold mt-1.5">
              Selengkapnya tentang biaya ini →
            </button>
          </div>
          <p className="font-[var(--font-dm-serif)] text-[22px] text-[#A35320] flex-shrink-0">1,2jt</p>
        </div>
      </div>

      {/* Guarantee card */}
      <div className="bg-[#E5F6F4] border border-[#A8DDD8] rounded-[16px] p-3.5 mb-4">
        <p className="text-[12px] font-bold text-[#1E4A45] mb-1">Jaminan kecocokan</p>
        <p className="text-[12px] text-[#2C5F5A] leading-relaxed">
          Kalau dalam 3 bulan terasa tidak cocok: Bunda mendapat 1× penempatan nanny baru secara gratis. Prosedur klaim tersedia di halaman Bantuan.
        </p>
      </div>

      {/* T&C checkbox */}
      <label className="flex items-start gap-2.5 cursor-pointer mb-4">
        <div
          className={`w-5 h-5 rounded-[6px] border-[1.5px] flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${agreed ? "bg-[#5BBFB0] border-[#5BBFB0]" : "bg-white border-[#C8B8DC]"}`}
          onClick={() => setAgreed(v => !v)}
        >
          {agreed && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <span className="text-[13px] text-[#666666] leading-relaxed">Saya setuju dengan syarat jaminan di atas</span>
      </label>

      {/* Pay button */}
      <div className="space-y-2">
        <button
          onClick={handlePay}
          disabled={!agreed || loading}
          className="w-full flex items-center justify-center bg-[#E07B39] hover:bg-[#CC6B2A] disabled:opacity-50 text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] transition-all"
        >
          {loading ? "Memproses..." : "Bayar Rp 1.200.000 & konfirmasi"}
        </button>
        <Link
          href={`/dashboard/parent/matching/${matchingId}`}
          className="w-full flex items-center justify-center bg-transparent border-[1.5px] border-[#C8B8DC] text-[#666666] font-semibold text-[13px] min-h-[48px] rounded-[10px] hover:bg-[#F3EEF8] transition-all"
        >
          Kembali ke laporan
        </Link>
        <div className="text-center">
          <button className="text-[12px] text-[#5B7EC9] font-semibold mt-1">
            Perbedaan biaya BY dan penyalur tradisional →
          </button>
        </div>
      </div>

    </div>
  )
}
