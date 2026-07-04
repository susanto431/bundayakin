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

const INITIAL_LIMIT = 12
const LOADMORE_LIMIT = 10

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white border p-4 animate-pulse" style={{ borderColor: "#E0D0F0" }}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-14 h-14 rounded-full bg-gray-200 flex-shrink-0" />
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

type Props = {
  talentPoolRemaining: number
  hasGuarantee?: boolean
}

export default function TalentPoolClient({ talentPoolRemaining, hasGuarantee = false }: Props) {
  const [nannies, setNannies] = useState<NannyDirectoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState("")
  const [kota, setKota] = useState("")
  const [tipe, setTipe] = useState("")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [selectedNannyId, setSelectedNannyId] = useState<string | null>(null)
  // Track quota client-side so it decrements after each unlock without server round-trip
  const [localQuota, setLocalQuota] = useState(talentPoolRemaining)

  const fetchInitial = useCallback(async () => {
    setLoading(true)
    setError("")
    setPage(1)
    try {
      const params = new URLSearchParams({ page: "1", limit: String(INITIAL_LIMIT) })
      if (kota) params.set("kota", kota)
      if (tipe) params.set("tipe", tipe)
      const res = await fetch(`/api/nanny/directory?${params}`)
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setNannies(json.data.nannies)
      setHasMore(json.data.hasMore)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat daftar nanny")
    } finally {
      setLoading(false)
    }
  }, [kota, tipe])

  useEffect(() => {
    fetchInitial()
  }, [fetchInitial])

  async function handleLoadMore() {
    if (loadingMore) return
    setLoadingMore(true)
    const nextPage = page + 1
    try {
      const params = new URLSearchParams({ page: String(nextPage), limit: String(LOADMORE_LIMIT) })
      if (kota) params.set("kota", kota)
      if (tipe) params.set("tipe", tipe)
      const res = await fetch(`/api/nanny/directory?${params}`)
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setNannies(prev => [...prev, ...json.data.nannies])
      setHasMore(json.data.hasMore)
      setPage(nextPage)
    } catch {
      // silently fail load-more — user can try again
    } finally {
      setLoadingMore(false)
    }
  }

  function handleContactUnlocked() {
    setLocalQuota(q => Math.max(0, q - 1))
    // Refetch to reflect updated kontakTerbuka in cards
    fetchInitial()
  }

  const quotaBadgeStyle =
    localQuota === 0
      ? "bg-[#FAEAEA] text-[#C75D5D] border-[#F5C4A0]"
      : localQuota <= 2
      ? "bg-[#FEF0E7] text-[#A35320] border-[#F5C4A0]"
      : "bg-[#E5F6F4] text-[#2C5F5A] border-[#A8DDD8]"

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FDFBFF" }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#5A3A7A]">AI Talent Pool</h1>
            <p className="text-sm text-[#666666] mt-1">
              Skor kecocokan dihitung khusus untuk profil keluarga Bunda
            </p>
          </div>
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 mt-1 ${quotaBadgeStyle}`}>
            {localQuota === 0 ? "Kuota habis" : `Sisa ${localQuota}×`}
          </span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="px-5 pb-4 flex gap-2 flex-wrap">
        <input
          type="text"
          placeholder="Kota..."
          value={kota}
          onChange={e => setKota(e.target.value)}
          className="flex-1 min-w-[120px] px-3 py-2 rounded-xl text-sm border text-[#5A3A7A] focus:outline-none focus:ring-2 focus:ring-[#5BBFB0]"
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
            <p className="text-sm mb-3" style={{ color: "#C75D5D" }}>{error}</p>
            <button onClick={fetchInitial} className="text-sm underline" style={{ color: "#5BBFB0" }}>
              Coba lagi
            </button>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && !error && nannies.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold mb-1" style={{ color: "#5A3A7A" }}>Belum ada nanny terdaftar</p>
            <p className="text-sm" style={{ color: "#666666" }}>
              {kota || tipe ? "Coba ubah filter pencarian Bunda." : "Nanny aktif akan muncul di sini."}
            </p>
          </div>
        )}

        {!loading && !error && nannies.length > 0 && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {nannies.map(nanny => (
                <NannyMatchCard
                  key={nanny.id}
                  nanny={nanny}
                  onClick={() => setSelectedNannyId(nanny.id)}
                />
              ))}
            </div>

            {hasMore && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60"
                  style={{ backgroundColor: "#F3EEF8", color: "#5A3A7A" }}
                >
                  {loadingMore ? "Memuat..." : "Cari 10 berikutnya →"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail drawer */}
      {selectedNannyId && (
        <NannyDetailDrawer
          nannyProfileId={selectedNannyId}
          onClose={() => setSelectedNannyId(null)}
          onMatchCalculated={fetchInitial}
          flowType="TALENT_POOL"
          remainingQuota={localQuota}
          onContactUnlocked={handleContactUnlocked}
          hasGuarantee={hasGuarantee}
        />
      )}
    </div>
  )
}
