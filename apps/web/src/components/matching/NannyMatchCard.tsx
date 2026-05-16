"use client"

import type { NannyDirectoryItem } from "@/app/api/nanny/directory/route"

type Props = {
  nanny: NannyDirectoryItem
  onClick: () => void
}

type ScoreTier = {
  label: string
  color: string
  bg: string
}

function getScoreTier(skor: number | null, dealbreaker: boolean): ScoreTier {
  if (dealbreaker || skor === 0) {
    return { label: "Tidak Cocok", color: "#999AAA", bg: "#F5F5F8" }
  }
  if (skor === null) return { label: "Menghitung...", color: "#999AAA", bg: "#F5F5F8" }
  if (skor >= 85) return { label: "Sangat Cocok", color: "#5BBFB0", bg: "#E5F6F4" }
  if (skor >= 70) return { label: "Cocok", color: "#5BBFB0", bg: "#E5F6F4" }
  if (skor >= 55) return { label: "Cukup Cocok", color: "#E07B39", bg: "#FEF0E7" }
  return { label: "Kurang Cocok", color: "#C75D5D", bg: "#FAEAEA" }
}

function NannyAvatar({ nama, fotoUrl }: { nama: string; fotoUrl: string | null }) {
  if (fotoUrl) {
    return (
      <img
        src={fotoUrl}
        alt={nama}
        className="w-14 h-14 rounded-full object-cover flex-shrink-0"
      />
    )
  }
  const initials = nama
    .split(" ")
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase()
  return (
    <div className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-lg"
      style={{ backgroundColor: "#A97CC4" }}>
      {initials}
    </div>
  )
}

export default function NannyMatchCard({ nanny, onClick }: Props) {
  const tier = getScoreTier(nanny.skorKeseluruhan, nanny.adaDealbreaker)
  const isCalculating = nanny.skorKeseluruhan === null && !nanny.adaDealbreaker
  const isDealbreaker = nanny.adaDealbreaker || nanny.skorKeseluruhan === 0

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl bg-white border p-4 shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-[#5BBFB0]"
      style={{ borderColor: "#E0D0F0" }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <NannyAvatar nama={nanny.nama} fotoUrl={nanny.fotoUrl} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#5A3A7A] truncate">{nanny.nama}</p>
          <p className="text-sm text-[#666666]">
            {[nanny.usia ? `${nanny.usia} th` : null, nanny.kotaDomisili]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <p className="text-sm text-[#666666]">
            Pengalaman {nanny.pengalamanTahun} tahun
          </p>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {nanny.tipeKerja.map(t => (
          <span
            key={t}
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: "#F3EEF8", color: "#5A3A7A" }}
          >
            {t === "LIVE_IN" ? "Live In" : t === "LIVE_OUT" ? "Live Out" : t === "INFAL" ? "Infal" : "Sementara"}
          </span>
        ))}
        {nanny.pendidikan && (
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "#E5F6F4", color: "#2C5F5A" }}
          >
            {nanny.pendidikan}
          </span>
        )}
      </div>

      {/* Score bar */}
      <div
        className="rounded-xl px-3 py-2 flex items-center gap-3"
        style={{ backgroundColor: tier.bg }}
      >
        {isCalculating ? (
          <div className="flex-1 flex items-center gap-2">
            <div className="h-2 flex-1 rounded-full bg-gray-200 overflow-hidden">
              <div className="h-full w-1/3 rounded-full animate-pulse bg-gray-300" />
            </div>
            <span className="text-xs text-[#999AAA] whitespace-nowrap">Menghitung kecocokan...</span>
          </div>
        ) : (
          <>
            <div className="flex-1">
              <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${isDealbreaker ? 0 : nanny.skorKeseluruhan ?? 0}%`,
                    backgroundColor: tier.color,
                  }}
                />
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {!isDealbreaker && nanny.skorKeseluruhan !== null && (
                <span className="font-bold text-sm" style={{ color: tier.color }}>
                  {nanny.skorKeseluruhan}%
                </span>
              )}
              <span className="text-xs font-medium" style={{ color: tier.color }}>
                {tier.label}
              </span>
            </div>
          </>
        )}
      </div>

      {/* CTA */}
      <p className="text-xs text-[#A97CC4] font-medium mt-3 text-right">
        Lihat Detail &amp; Kontak →
      </p>
    </button>
  )
}
