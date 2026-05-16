"use client"

import { useState } from "react"
import Link from "next/link"
import UnlockNannyButton from "./UnlockNannyButton"

type NannyCard = {
  id: string
  city: string
  yearsOfExperience: number
  nannyType: string[]
  isUnlocked: boolean
}

type Props = {
  nannies: NannyCard[]
  isPaid: boolean
}

const NANNY_TYPE_LABEL: Record<string, string> = {
  LIVE_IN: "Tinggal",
  LIVE_OUT: "Harian",
  INFAL: "Infal",
  TEMPORARY: "Temporer",
}

export default function LinkedInModeSection({ nannies, isPaid }: Props) {
  const [unlockedIds, setUnlockedIds] = useState<string[]>(
    nannies.filter(n => n.isUnlocked).map(n => n.id)
  )

  function handleUnlocked(nannyId: string) {
    setUnlockedIds(prev => [...prev, nannyId])
  }

  const typeLabel = (types: string[]) =>
    types
      .slice(0, 2)
      .map(t => NANNY_TYPE_LABEL[t] ?? t)
      .join(" · ")

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA]">Nanny sedang cari keluarga</p>
        <span className="text-[10px] bg-[#5BBFB0]/15 text-[#2C5F5A] font-semibold px-2 py-0.5 rounded-full">
          {nannies.length} tersedia
        </span>
      </div>

      <div className="space-y-2">
        {nannies.map(nanny => {
          const nannyTypes = Array.isArray(nanny.nannyType) ? nanny.nannyType : []
          const isUnlocked = isPaid || unlockedIds.includes(nanny.id)

          return (
            <div key={nanny.id} className="bg-white border border-[#E0D0F0] rounded-[16px] p-3.5">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-[16px] flex-shrink-0 ${
                    isUnlocked
                      ? "bg-[#F3EEF8] border-2 border-[#E0D0F0] text-[#5A3A7A]"
                      : "bg-[#E0D0F0]"
                  }`}>
                    {isUnlocked ? "N" : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999AAA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    )}
                  </div>
                  {!isUnlocked && (
                    <div className="absolute inset-0 rounded-full bg-[#999AAA]/10 backdrop-blur-[2px]" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-[#5A3A7A]">
                    {isUnlocked ? `Nanny · ${nanny.city || "Kota belum diisi"}` : `Nanny di ${nanny.city || "sekitarmu"}`}
                  </p>
                  <p className="text-[12px] text-[#999AAA] mt-0.5">
                    {nanny.yearsOfExperience > 0 ? `${nanny.yearsOfExperience} thn pengalaman` : "Pengalaman baru"}
                    {nannyTypes.length > 0 && ` · ${typeLabel(nannyTypes)}`}
                  </p>
                  {!isUnlocked && (
                    <div className="flex gap-1 mt-1.5">
                      <span className="text-[10px] bg-[#F3EEF8] text-[#5A3A7A] border border-[#C8B8DC] px-2 py-0.5 rounded-full">Nama tersembunyi</span>
                      <span className="text-[10px] bg-[#F3EEF8] text-[#5A3A7A] border border-[#C8B8DC] px-2 py-0.5 rounded-full">Kontak terkunci</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="mt-3">
                {isUnlocked ? (
                  <Link
                    href="/dashboard/parent/matching"
                    className="w-full flex items-center justify-center gap-1.5 bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[13px] px-4 py-2.5 rounded-[10px] min-h-[44px] transition-all"
                  >
                    Undang ke matching →
                  </Link>
                ) : (
                  <UnlockNannyButton nannyId={nanny.id} onUnlocked={() => handleUnlocked(nanny.id)} />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {!isPaid && (
        <p className="text-[11px] text-[#999AAA] text-center mt-2 leading-relaxed">
          Berlangganan Rp 500rb/tahun untuk lihat semua profil tanpa bayar per nanny.{" "}
          <Link href="/dashboard/parent/subscription" className="text-[#5A3A7A] font-semibold underline">
            Lihat paket
          </Link>
        </p>
      )}
    </div>
  )
}
