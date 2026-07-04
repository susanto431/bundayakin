"use client"

import { useState } from "react"
import Link from "next/link"
import { AGE_GROUP_LABEL } from "@/constants/children"

type Child = {
  id: string
  name: string
  ageGroup: string
}

type Props = {
  matchingId: string
  nannyName: string
  nannyCity: string | null
  nannyType: string
  score: number | null
  childList: Child[]
  placementFeeIDR: number
  hasGuarantee?: boolean // Jaminan Kecocokan aktif → penempatan ini gratis penuh
}

const NANNY_TYPE_LABEL: Record<string, string> = {
  LIVE_IN: "Jangka panjang · menginap",
  LIVE_OUT: "Jangka panjang · tidak menginap",
  INFAL: "Infal / pengganti",
  TEMPORARY: "Sementara / kontrak singkat",
}

const AGE_GROUP_SHORT: Record<string, string> = { ...AGE_GROUP_LABEL, MIXED: "Campuran" }

function formatRupiah(amount: number) {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)}jt`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}rb`
  return `Rp ${amount.toLocaleString("id-ID")}`
}

export default function PlacementClient({
  matchingId,
  nannyName,
  nannyCity,
  nannyType,
  score,
  childList,
  placementFeeIDR,
  hasGuarantee = false,
}: Props) {
  const [selectedChildIds, setSelectedChildIds] = useState<Set<string>>(
    () => new Set(childList.length === 1 ? [childList[0].id] : [])
  )
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const firstName = nannyName.split(" ")[0]
  const canPay = selectedChildIds.size > 0 && agreed && !loading

  function toggleChild(id: string) {
    setSelectedChildIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handlePay() {
    if (!canPay) return
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch("/api/payment/placement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchingRequestId: matchingId,
          childIds: Array.from(selectedChildIds),
        }),
      })
      const data = await res.json() as {
        success: boolean
        data?: { paymentUrl?: string; free?: boolean }
        error?: string
      }
      if (data.success && data.data?.free) {
        // Jaminan Kecocokan: penempatan langsung aktif tanpa pembayaran
        window.location.href = "/dashboard/parent?placement=success"
      } else if (data.success && data.data?.paymentUrl) {
        window.location.href = data.data.paymentUrl
      } else {
        setErrorMsg(data.error ?? "Terjadi kesalahan. Coba lagi.")
        setLoading(false)
      }
    } catch {
      setErrorMsg("Koneksi bermasalah. Coba lagi.")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-28">

      {/* Header */}
      <div className="border-b border-[#E0D0F0] pb-3 mb-4">
        <h1 className="text-[16px] font-bold text-[#5A3A7A]">Konfirmasi penerimaan nanny</h1>
        <p className="text-[13px] text-[#999AAA] mt-0.5">
          Langkah terakhir sebelum {firstName} resmi mulai
        </p>
      </div>

      {/* Nanny card */}
      <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-3.5 mb-4">
        <div className="flex items-start gap-2.5">
          <div className="w-11 h-11 rounded-full bg-[#F3EEF8] border-2 border-[#E0D0F0] flex items-center justify-center font-bold text-[16px] text-[#5A3A7A] flex-shrink-0">
            {nannyName.split(" ").map(w => w[0]).slice(0, 2).join("")}
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-bold text-[#5A3A7A]">{nannyName}</p>
            <p className="text-[12px] text-[#999AAA] mt-0.5">
              {NANNY_TYPE_LABEL[nannyType] ?? nannyType}
              {nannyCity ? ` · ${nannyCity}` : ""}
            </p>
            {score !== null && (
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[11px] text-[#999AAA]">Tingkat kecocokan</span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                  score >= 80
                    ? "bg-[#E5F6F4] text-[#2C5F5A] border-[#A8DDD8]"
                    : score >= 60
                    ? "bg-[#FEF0E7] text-[#A35320] border-[#F5C4A0]"
                    : "bg-[#FCE8E8] text-[#8B2020] border-[#F5AAAA]"
                }`}>
                  {score}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Child selector — wajib pilih minimal 1 */}
      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">
        Sus {firstName} akan merawat siapa?
      </p>
      <div className="bg-white border border-[#E0D0F0] rounded-[16px] overflow-hidden mb-4">
        {childList.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-[13px] text-[#999AAA]">Belum ada data anak.</p>
            <Link href="/dashboard/parent/children" className="text-[13px] text-[#A97CC4] font-semibold mt-1 inline-block">
              Tambah profil anak →
            </Link>
          </div>
        ) : (
          childList.map((child, idx) => {
            const checked = selectedChildIds.has(child.id)
            return (
              <button
                key={child.id}
                onClick={() => toggleChild(child.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 min-h-[48px] text-left transition-colors ${
                  idx < childList.length - 1 ? "border-b border-[#E0D0F0]" : ""
                } ${checked ? "bg-[#F3EEF8]" : "bg-white hover:bg-[#FDFBFF]"}`}
              >
                {/* Checkbox */}
                <div className={`w-5 h-5 rounded-[6px] border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all ${
                  checked ? "bg-[#A97CC4] border-[#A97CC4]" : "bg-white border-[#C8B8DC]"
                }`}>
                  {checked && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-[#5A3A7A]">{child.name}</p>
                  <p className="text-[12px] text-[#999AAA] mt-0.5">
                    {AGE_GROUP_SHORT[child.ageGroup] ?? child.ageGroup}
                  </p>
                </div>
              </button>
            )
          })
        )}
      </div>

      {/* Fee card */}
      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">
        Biaya penempatan nanny
      </p>
      {hasGuarantee ? (
        <div className="bg-[#E5F6F4] border border-[#A8DDD8] rounded-[16px] p-3.5 mb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1 mr-3">
              <p className="text-[13px] font-bold text-[#1E4A45]">
                {NANNY_TYPE_LABEL[nannyType] ?? nannyType}
              </p>
              <p className="text-[12px] text-[#2C5F5A] mt-1 leading-relaxed">
                Penempatan ini <strong>gratis penuh</strong> karena Bunda memakai Jaminan Kecocokan dari penempatan sebelumnya.
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-[13px] text-[#999AAA] line-through">{formatRupiah(placementFeeIDR)}</p>
              <p className="font-[var(--font-dm-serif)] text-[22px] text-[#2C5F5A]">Gratis</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#FEF0E7] border border-[#F5C4A0] rounded-[16px] p-3.5 mb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1 mr-3">
              <p className="text-[13px] font-bold text-[#A35320]">
                {NANNY_TYPE_LABEL[nannyType] ?? nannyType}
              </p>
              <p className="text-[12px] text-[#7A4018] mt-1 leading-relaxed">
                Termasuk: bonus untuk {firstName} kalau bertahan 3 bulan, dan fee untuk siapa pun yang merekomendasikan {firstName} ke Bunda.
              </p>
            </div>
            <p className="font-[var(--font-dm-serif)] text-[22px] text-[#A35320] flex-shrink-0">
              {formatRupiah(placementFeeIDR)}
            </p>
          </div>
        </div>
      )}

      {/* Guarantee card */}
      <div className="bg-[#E5F6F4] border border-[#A8DDD8] rounded-[16px] p-3.5 mb-4">
        <p className="text-[12px] font-bold text-[#1E4A45] mb-1">Jaminan Kecocokan</p>
        <p className="text-[12px] text-[#2C5F5A] leading-relaxed">
          Kalau nanny berhenti dalam 30 hari pertama: Bunda mendapat matching ulang dan 1× penempatan ulang secara gratis — otomatis, tanpa klaim manual.
        </p>
      </div>

      {/* T&C checkbox */}
      <label className="flex items-start gap-2.5 cursor-pointer mb-4">
        <input
          type="checkbox"
          className="sr-only"
          checked={agreed}
          onChange={e => setAgreed(e.target.checked)}
        />
        <div
          aria-hidden="true"
          className={`w-5 h-5 rounded-[6px] border-[1.5px] flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
            agreed ? "bg-[#5BBFB0] border-[#5BBFB0]" : "bg-white border-[#C8B8DC]"
          }`}
        >
          {agreed && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <span className="text-[13px] text-[#666666] leading-relaxed">
          Saya setuju dengan syarat jaminan di atas
        </span>
      </label>

      {/* Validation hint */}
      {!loading && selectedChildIds.size === 0 && (
        <p className="text-[12px] text-[#E07B39] mb-3">
          Pilih dulu anak yang akan dirawat Sus {firstName}.
        </p>
      )}
      {errorMsg && (
        <p className="text-[12px] text-red-600 mb-3">{errorMsg}</p>
      )}

      {/* Buttons */}
      <div className="space-y-2">
        <button
          onClick={handlePay}
          disabled={!canPay}
          className="w-full flex items-center justify-center bg-[#E07B39] hover:bg-[#CC6B2A] disabled:opacity-50 text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] transition-all"
        >
          {loading
            ? "Memproses..."
            : hasGuarantee
            ? "Konfirmasi penempatan — Gratis (Jaminan Kecocokan)"
            : `Bayar Rp ${placementFeeIDR.toLocaleString("id-ID")} & konfirmasi`}
        </button>
        <Link
          href={`/dashboard/parent/matching/${matchingId}`}
          className="w-full flex items-center justify-center bg-transparent border-[1.5px] border-[#C8B8DC] text-[#666666] font-semibold text-[13px] min-h-[48px] rounded-[10px] hover:bg-[#F3EEF8] transition-all"
        >
          Kembali ke laporan
        </Link>
      </div>

    </div>
  )
}
