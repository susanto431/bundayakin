"use client"

import { useCallback, useEffect, useState } from "react"
import NannyMatchCard from "@/components/matching/NannyMatchCard"
import NannyDetailDrawer from "@/components/matching/NannyDetailDrawer"
import type { NannyDirectoryItem } from "@/app/api/nanny/directory/route"

const TIPE_OPTIONS = [
  { value: "", label: "Semua Tipe" },
  { value: "LIVE_IN", label: "Live In" },
  { value: "LIVE_OUT", label: "Live Out" },
  { value: "INFAL", label: "Infal" },
  { value: "TEMPORARY", label: "Sementara" },
]

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white border p-4 animate-pulse" style={{ borderColor: "#E0D0F0" }}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-14 h-14 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
      <div className="h-8 bg-gray-100 rounded-xl" />
    </div>
  )
}

export default function DirektoriNannyPage() {
  const [nannies, setNannies] = useState<NannyDirectoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [kota, setKota] = useState("")
  const [tipe, setTipe] = useState("")
  const [selectedNannyId, setSelectedNannyId] = useState<string | null>(null)

  const fetchDirectory = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams()
      if (kota) params.set("kota", kota)
      if (tipe) params.set("tipe", tipe)
      const res = await fetch(`/api/nanny/directory?${params}`)
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setNannies(json.data.nannies)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat direktori")
    } finally {
      setLoading(false)
    }
  }, [kota, tipe])

  useEffect(() => {
    fetchDirectory()
  }, [fetchDirectory])

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FDFBFF" }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-4" style={{ backgroundColor: "#FDFBFF" }}>
        <h1 className="text-2xl font-bold text-[#5A3A7A]">Temukan Nanny yang Cocok</h1>
        <p className="text-sm text-[#666666] mt-1">
          Skor kecocokan dihitung khusus untuk profil keluarga Bunda
        </p>
      </div>

      {/* Filter bar */}
      <div className="px-5 pb-4 flex gap-2 flex-wrap">
        <input
          type="text"
          placeholder="Kota..."
          value={kota}
          onChange={e => setKota(e.target.value)}
          className="flex-1 min-w-32 px-3 py-2 rounded-xl text-sm border text-[#5A3A7A] focus:outline-none focus:ring-2 focus:ring-[#5BBFB0]"
          style={{ borderColor: "#E0D0F0" }}
        />
        <select
          value={tipe}
          onChange={e => setTipe(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm border text-[#5A3A7A] bg-white focus:outline-none focus:ring-2 focus:ring-[#5BBFB0]"
          style={{ borderColor: "#E0D0F0" }}
        >
          {TIPE_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      <div className="px-5 pb-8">
        {error && (
          <div className="text-center py-10">
            <p className="text-[#C75D5D] text-sm mb-3">{error}</p>
            <button onClick={fetchDirectory} className="text-[#5BBFB0] text-sm underline">
              Coba lagi
            </button>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && !error && nannies.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold text-[#5A3A7A] mb-1">Belum ada nanny terdaftar</p>
            <p className="text-sm text-[#666666]">
              {kota || tipe ? "Coba ubah filter pencarian Bunda." : "Nanny aktif akan muncul di sini."}
            </p>
          </div>
        )}

        {!loading && !error && nannies.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {nannies.map(nanny => (
              <NannyMatchCard
                key={nanny.id}
                nanny={nanny}
                onClick={() => setSelectedNannyId(nanny.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {selectedNannyId && (
        <NannyDetailDrawer
          nannyProfileId={selectedNannyId}
          onClose={() => setSelectedNannyId(null)}
          onMatchCalculated={fetchDirectory}
        />
      )}
    </div>
  )
}
