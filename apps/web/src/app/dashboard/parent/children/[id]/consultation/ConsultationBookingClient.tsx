"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import type { ConsultationSlotTime } from "@/constants/consultation"

type HistoryEntry = {
  id: string
  bookingDateISO: string
  slotTime: string
  status: "CONFIRMED" | "COMPLETED"
  psychologistNotes: string | null
}

type Props = {
  childId: string
  childName: string
  history: HistoryEntry[]
}

type SlotInfo = { slotTime: ConsultationSlotTime; remaining: number }
type PriceInfo = { level: string; priceIDR: number }

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
}

function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`
}

function todayISODate(): string {
  return new Date().toISOString().split("T")[0]
}

function maxBookableISODate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().split("T")[0]
}

export default function ConsultationBookingClient({ childId, childName, history }: Props) {
  const searchParams = useSearchParams()
  const paidSuccess = searchParams.get("booking") === "success"
  const screeningRecordId = searchParams.get("screeningRecordId") ?? undefined
  const firstName = childName.split(" ")[0]

  const [selectedDate, setSelectedDate] = useState(todayISODate())
  const [slots, setSlots] = useState<SlotInfo[]>([])
  const [price, setPrice] = useState<PriceInfo | null>(null)
  const [isSubscriber, setIsSubscriber] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<ConsultationSlotTime | null>(null)
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    setSelectedSlot(null)
    setLoadingAvailability(true)
    setErrorMsg(null)
    fetch(`/api/consultation/availability?date=${selectedDate}`)
      .then(res => res.json())
      .then((data: { success: boolean; data?: { slots: SlotInfo[]; price: PriceInfo; isSubscriber: boolean }; error?: string }) => {
        if (data.success && data.data) {
          setSlots(data.data.slots)
          setPrice(data.data.price)
          setIsSubscriber(data.data.isSubscriber)
        } else {
          setErrorMsg(data.error ?? "Gagal memuat jadwal")
        }
      })
      .catch(() => setErrorMsg("Koneksi bermasalah. Coba lagi."))
      .finally(() => setLoadingAvailability(false))
  }, [selectedDate])

  async function handleConfirm() {
    if (!selectedSlot || submitting) return
    setSubmitting(true)
    setErrorMsg(null)
    try {
      const res = await fetch("/api/consultation/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childProfileId: childId,
          bookingDate: selectedDate,
          slotTime: selectedSlot,
          screeningRecordId,
        }),
      })
      const data = (await res.json()) as { success: boolean; data?: { paymentUrl: string }; error?: string }
      if (data.success && data.data) {
        window.location.href = data.data.paymentUrl
      } else {
        setErrorMsg(data.error ?? "Gagal membuat pembayaran. Coba lagi.")
        setSubmitting(false)
      }
    } catch {
      setErrorMsg("Koneksi bermasalah. Coba lagi.")
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-4">
      <div className="border-b border-[#E0D0F0] pb-3 mb-4">
        <Link href={`/dashboard/parent/children/${childId}`} className="text-[12px] text-[#A97CC4] font-semibold mb-1 inline-block">
          ← Kembali ke profil {firstName}
        </Link>
        <h1 className="text-[16px] font-bold text-[#5A3A7A]">Konsultasi Psikolog Anak — {firstName}</h1>
        <p className="text-[12px] text-[#999AAA] mt-0.5">Didampingi psikolog HCC</p>
      </div>

      {paidSuccess && (
        <div className="bg-[#E5F6F4] border border-[#A8DDD8] rounded-[12px] p-3 mb-4">
          <p className="text-[13px] text-[#2C5F5A] font-semibold">Pembayaran berhasil</p>
          <p className="text-[12px] text-[#2C5F5A] mt-0.5">Sesi konsultasi {firstName} sudah terjadwal. Tim kami akan menghubungi Bunda menjelang jadwal.</p>
        </div>
      )}

      <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-4 mb-4">
        <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-3">Pilih tanggal</p>
        <input
          type="date"
          value={selectedDate}
          min={todayISODate()}
          max={maxBookableISODate()}
          onChange={e => setSelectedDate(e.target.value)}
          className="w-full min-h-[44px] rounded-[10px] border-[1.5px] border-[#C8B8DC] px-3 text-[14px] text-[#5A3A7A]"
        />

        <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2 mt-4">Pilih jam</p>
        {loadingAvailability ? (
          <p className="text-[12px] text-[#999AAA]">Memuat jadwal...</p>
        ) : (
          <div className="flex gap-2">
            {slots.map(slot => (
              <button
                key={slot.slotTime}
                type="button"
                disabled={slot.remaining === 0}
                onClick={() => setSelectedSlot(slot.slotTime)}
                className={`flex-1 min-h-[44px] rounded-[10px] font-semibold text-[13px] border-[1.5px] transition-all ${
                  slot.remaining === 0
                    ? "bg-[#F3EEF8] border-[#E0D0F0] text-[#C8B8DC] cursor-not-allowed"
                    : selectedSlot === slot.slotTime
                      ? "bg-[#5BBFB0] border-[#5BBFB0] text-white"
                      : "bg-white border-[#C8B8DC] text-[#666666] hover:border-[#5BBFB0]"
                }`}
              >
                {slot.slotTime}
                {slot.remaining === 0 && <span className="block text-[10px] font-normal mt-0.5">Penuh</span>}
              </button>
            ))}
          </div>
        )}

        {price && (
          <div className="mt-4 pt-4 border-t border-[#F3EEF8]">
            <p className="text-[12px] text-[#999AAA]">Biaya sesi</p>
            <p className="text-[18px] font-bold text-[#5A3A7A]">{formatRupiah(price.priceIDR)}</p>
            {isSubscriber && <p className="text-[11px] text-[#2C5F5A] mt-0.5">Harga khusus pelanggan sudah diterapkan</p>}
          </div>
        )}
      </div>

      {errorMsg && <p className="text-[12px] text-red-600 mb-3" role="alert">{errorMsg}</p>}

      <button
        type="button"
        onClick={handleConfirm}
        disabled={!selectedSlot || submitting}
        className="w-full flex items-center justify-center bg-[#5BBFB0] hover:bg-[#2C5F5A] disabled:opacity-50 text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] mb-6 transition-all"
      >
        {submitting ? "Memproses..." : selectedSlot ? `Lanjut bayar — jam ${selectedSlot}` : "Pilih jam terlebih dahulu"}
      </button>

      <p className="text-[11px] text-[#999AAA] leading-relaxed mb-6">
        Konsultasi ini adalah pendampingan psikolog, bukan pengganti psikolog atau diagnosis medis.
      </p>

      {history.length > 0 && (
        <div className="bg-white border border-[#E0D0F0] rounded-[16px] overflow-hidden">
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] px-4 pt-3 pb-2">Riwayat Konsultasi</p>
          {history.map((h, idx) => (
            <div key={h.id} className={`px-4 py-3 ${idx < history.length - 1 ? "border-b border-[#F3EEF8]" : ""}`}>
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-[#666666]">{formatDate(h.bookingDateISO)} · jam {h.slotTime}</span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                  h.status === "COMPLETED" ? "bg-[#E5F6F4] text-[#2C5F5A] border-[#A8DDD8]" : "bg-[#F3EEF8] text-[#5A3A7A] border-[#E0D0F0]"
                }`}>
                  {h.status === "COMPLETED" ? "Selesai" : "Terjadwal"}
                </span>
              </div>
              {h.psychologistNotes && (
                <p className="text-[12px] text-[#666666] mt-2 leading-relaxed bg-[#F3EEF8] rounded-[8px] p-2">{h.psychologistNotes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
