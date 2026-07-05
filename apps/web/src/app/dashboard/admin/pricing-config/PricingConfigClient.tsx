"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { PricingConfigKey } from "@prisma/client"
import { PRICING_CONFIG_LABEL, PRICING_CONFIG_UNIT } from "@/constants/pricing-config-meta"

type ScheduleEntry = {
  id: string
  value: number
  effectiveFromISO: string
  reason: string
  cancelled: boolean
  cancelledAtISO: string | null
  createdAtISO: string
  createdByName: string
  cancelledByName: string | null
}

type Item = {
  key: PricingConfigKey
  currentValue: number
  schedule: ScheduleEntry[]
}

type Props = { items: Item[] }

function formatValue(key: PricingConfigKey, value: number): string {
  if (PRICING_CONFIG_UNIT[key] === "IDR") return `Rp ${value.toLocaleString("id-ID")}`
  return `${value}×`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
}

function todayISODate(): string {
  return new Date().toISOString().split("T")[0]
}

export default function PricingConfigClient({ items }: Props) {
  return (
    <div className="max-w-[640px] mx-auto px-4 pt-6 pb-16">
      <div className="border-b border-[#E0D0F0] pb-3 mb-5">
        <h1 className="text-[18px] font-bold text-[#5A3A7A]">Konfigurasi Harga &amp; Kuota</h1>
        <p className="text-[13px] text-[#999AAA] mt-1 leading-relaxed">
          Perubahan berlaku <strong>maju saja, tidak retroaktif</strong> — pelanggan yang sedang aktif tidak
          terpengaruh sampai masa berlakunya habis dan mereka membayar/memperpanjang lagi (seperti kenaikan
          harga Google Workspace). Semua perubahan (termasuk yang dijadwalkan) tercatat permanen di riwayat.
        </p>
      </div>

      <div className="space-y-4">
        {items.map(item => (
          <PricingItemCard key={item.key} item={item} />
        ))}
      </div>
    </div>
  )
}

function PricingItemCard({ item }: { item: Item }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [value, setValue] = useState("")
  const [effectiveFrom, setEffectiveFrom] = useState(todayISODate())
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [cancelingId, setCancelingId] = useState<string | null>(null)

  const upcoming = item.schedule
    .filter(s => !s.cancelled && new Date(s.effectiveFromISO).getTime() > Date.now())
    .sort((a, b) => new Date(a.effectiveFromISO).getTime() - new Date(b.effectiveFromISO).getTime())[0]

  const history = item.schedule.filter(s => s.id !== upcoming?.id)

  async function handleSubmit() {
    if (loading) return
    setErrorMsg(null)
    const numValue = Number(value)
    if (!value || !Number.isInteger(numValue) || numValue <= 0) {
      setErrorMsg("Nilai harus angka bulat positif")
      return
    }
    if (!reason.trim()) {
      setErrorMsg("Alasan perubahan wajib diisi")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/admin/pricing-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: item.key, value: numValue, effectiveFrom, reason: reason.trim() }),
      })
      const data = await res.json() as { success: boolean; error?: string }
      if (data.success) {
        setValue(""); setReason(""); setShowForm(false)
        router.refresh()
      } else {
        setErrorMsg(data.error ?? "Gagal menyimpan. Coba lagi.")
      }
    } catch {
      setErrorMsg("Koneksi bermasalah. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel(entryId: string) {
    setCancelingId(entryId)
    try {
      const res = await fetch(`/api/admin/pricing-config/${entryId}/cancel`, { method: "POST" })
      const data = await res.json() as { success: boolean; error?: string }
      if (data.success) {
        router.refresh()
      } else {
        setErrorMsg(data.error ?? "Gagal membatalkan")
      }
    } catch {
      setErrorMsg("Koneksi bermasalah. Coba lagi.")
    } finally {
      setCancelingId(null)
    }
  }

  return (
    <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-4">
      <div className="flex items-start justify-between mb-1">
        <p className="text-[13px] font-bold text-[#5A3A7A]">{PRICING_CONFIG_LABEL[item.key]}</p>
      </div>
      <p className="font-[var(--font-dm-serif)] text-[24px] text-[#5A3A7A] mb-2">
        {formatValue(item.key, item.currentValue)}
        <span className="text-[12px] font-sans text-[#999AAA] ml-2">berlaku sekarang</span>
      </p>

      {upcoming && (
        <div className="bg-[#FEF0E7] border border-[#F5C4A0] rounded-[12px] p-3 mb-3">
          <p className="text-[12px] font-bold text-[#A35320]">
            Akan berubah jadi {formatValue(item.key, upcoming.value)} mulai {formatDate(upcoming.effectiveFromISO)}
          </p>
          <p className="text-[11px] text-[#7A4018] mt-1 italic">&ldquo;{upcoming.reason}&rdquo;</p>
          <p className="text-[10px] text-[#999AAA] mt-1">Dijadwalkan oleh {upcoming.createdByName}</p>
          <button
            type="button"
            onClick={() => handleCancel(upcoming.id)}
            disabled={cancelingId === upcoming.id}
            className="mt-2 text-[11px] font-semibold text-[#C75D5D] underline disabled:opacity-50"
          >
            {cancelingId === upcoming.id ? "Membatalkan..." : "Batalkan jadwal ini"}
          </button>
        </div>
      )}

      {showForm ? (
        <div className="border-t border-[#E0D0F0] pt-3 mt-1">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-[11px] text-[#666666] mb-1">
                Nilai baru {PRICING_CONFIG_UNIT[item.key] === "IDR" ? "(Rp)" : "(jumlah)"}
              </label>
              <input
                type="number" inputMode="numeric" value={value} onChange={e => setValue(e.target.value)}
                placeholder={String(item.currentValue)}
                className="w-full px-3 py-2 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[44px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/15 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#666666] mb-1">Mulai berlaku</label>
              <input
                type="date" value={effectiveFrom} min={todayISODate()}
                onChange={e => setEffectiveFrom(e.target.value)}
                className="w-full px-3 py-2 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[44px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/15 outline-none transition-all"
              />
            </div>
          </div>
          <label className="block text-[11px] text-[#666666] mb-1">Alasan perubahan *</label>
          <textarea
            value={reason} onChange={e => setReason(e.target.value)} rows={2}
            placeholder="Contoh: penyesuaian tahunan mengikuti inflasi"
            className="w-full px-3 py-2 text-[13px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/15 outline-none transition-all resize-none mb-2"
          />
          {errorMsg && <p className="text-[12px] text-red-600 mb-2" role="alert">{errorMsg}</p>}
          <div className="flex gap-2">
            <button
              type="button" onClick={() => { setShowForm(false); setErrorMsg(null) }} disabled={loading}
              className="flex-1 border-[1.5px] border-[#C8B8DC] text-[#666666] font-semibold text-[13px] min-h-[40px] rounded-[10px] hover:bg-[#F3EEF8] transition-all"
            >
              Batal
            </button>
            <button
              type="button" onClick={handleSubmit} disabled={loading}
              className="flex-1 bg-[#5BBFB0] hover:bg-[#2C5F5A] disabled:opacity-50 text-white font-semibold text-[13px] min-h-[40px] rounded-[10px] transition-all"
            >
              {loading ? "Menyimpan..." : "Jadwalkan"}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="text-[12px] font-semibold text-[#A97CC4] underline"
        >
          + Jadwalkan perubahan
        </button>
      )}

      {history.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#F3EEF8]">
          <button
            type="button"
            onClick={() => setShowHistory(v => !v)}
            className="text-[11px] font-semibold text-[#999AAA] underline"
          >
            {showHistory ? "Sembunyikan riwayat" : `Lihat riwayat (${history.length})`}
          </button>
          {showHistory && (
            <div className="mt-2 space-y-1.5">
              {history.map(h => (
                <div key={h.id} className="text-[11px] text-[#666666] flex justify-between gap-2">
                  <span className={h.cancelled ? "line-through text-[#C8B8DC]" : ""}>
                    {formatValue(item.key, h.value)} · mulai {formatDate(h.effectiveFromISO)}
                    {h.cancelled && " (dibatalkan)"}
                  </span>
                  <span className="text-[#999AAA] flex-shrink-0">{h.createdByName}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
