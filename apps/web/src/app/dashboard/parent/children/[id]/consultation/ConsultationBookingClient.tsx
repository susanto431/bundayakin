"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import type { ConsultationSlotTime } from "@/constants/consultation"
import ConsultationCalendar from "./ConsultationCalendar"
import PsikologPickerCard, { type PsikologListItem } from "./PsikologPickerCard"
import ReviewPromptModal from "./ReviewPromptModal"

type HistoryEntry = {
  id: string
  bookingDateISO: string
  slotTime: string
  status: "CONFIRMED" | "COMPLETED"
  psychologistNotes: string | null
  psikologName: string
  hasReview: boolean
}

type Props = {
  childId: string
  childName: string
  history: HistoryEntry[]
}

type DateStatus = "AVAILABLE" | "FULL"
type PriceInfo = { level: string; priceIDR: number }
type EntryMode = "PSIKOLOG" | "TANGGAL"

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
}

function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`
}

function currentYearMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

export default function ConsultationBookingClient({ childId, childName, history }: Props) {
  const searchParams = useSearchParams()
  const paidSuccess = searchParams.get("booking") === "success"
  const screeningRecordId = searchParams.get("screeningRecordId") ?? undefined
  const firstName = childName.split(" ")[0]

  const [entryMode, setEntryMode] = useState<EntryMode>("PSIKOLOG")
  const [month, setMonth] = useState(currentYearMonth())
  const [calendarStatus, setCalendarStatus] = useState<Record<string, DateStatus>>({})
  const [loadingCalendar, setLoadingCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Entry "pilih psikolog dulu"
  const [psikologList, setPsikologList] = useState<PsikologListItem[] | null>(null)
  const [selectedPsikolog, setSelectedPsikolog] = useState<PsikologListItem | null>(null)
  const [psikologSlots, setPsikologSlots] = useState<Array<{ slotTime: ConsultationSlotTime; available: boolean }>>([])

  // Entry "pilih tanggal dulu"
  const [dateSlots, setDateSlots] = useState<Array<{ slotTime: ConsultationSlotTime; psikologs: PsikologListItem[] }>>([])
  const [selectedPsikologForSlot, setSelectedPsikologForSlot] = useState<PsikologListItem | null>(null)

  const [selectedSlot, setSelectedSlot] = useState<ConsultationSlotTime | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [price, setPrice] = useState<PriceInfo | null>(null)
  const [isSubscriber, setIsSubscriber] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [historyItems, setHistoryItems] = useState(history)
  const [reviewTarget, setReviewTarget] = useState<HistoryEntry | null>(null)

  // Muat daftar psikolog sekali di awal (dipakai entry "pilih psikolog dulu",
  // dan sebagai sumber label nama saat konfirmasi).
  useEffect(() => {
    fetch(`/api/consultation/psikologs?childId=${childId}`)
      .then((res) => res.json())
      .then((data: { success: boolean; data?: { psikologs: PsikologListItem[] }; error?: string }) => {
        if (data.success && data.data) setPsikologList(data.data.psikologs)
      })
      .catch(() => setPsikologList([]))
  }, [childId])

  // Kalender bulan — sumbernya beda per entry mode (per-psikolog vs gabungan).
  useEffect(() => {
    setSelectedDate(null)
    setSelectedSlot(null)
    setPrice(null)

    if (entryMode === "PSIKOLOG") {
      if (!selectedPsikolog) return
      setLoadingCalendar(true)
      fetch(`/api/consultation/psikologs/${selectedPsikolog.id}/calendar?month=${month}`)
        .then((res) => res.json())
        .then((data: { success: boolean; data?: { calendar: Record<string, DateStatus> }; error?: string }) => {
          if (data.success && data.data) setCalendarStatus(data.data.calendar)
        })
        .finally(() => setLoadingCalendar(false))
    } else {
      setLoadingCalendar(true)
      fetch(`/api/consultation/calendar?month=${month}`)
        .then((res) => res.json())
        .then((data: { success: boolean; data?: { calendar: Record<string, DateStatus> }; error?: string }) => {
          if (data.success && data.data) setCalendarStatus(data.data.calendar)
        })
        .finally(() => setLoadingCalendar(false))
    }
  }, [entryMode, month, selectedPsikolog])

  // Jam tersedia untuk tanggal terpilih.
  useEffect(() => {
    if (!selectedDate) return
    setSelectedSlot(null)
    setSelectedPsikologForSlot(null)
    setLoadingSlots(true)
    setErrorMsg(null)

    if (entryMode === "PSIKOLOG" && selectedPsikolog) {
      fetch(`/api/consultation/psikologs/${selectedPsikolog.id}/slots?date=${selectedDate}`)
        .then((res) => res.json())
        .then(
          (data: {
            success: boolean
            data?: { slots: Array<{ slotTime: ConsultationSlotTime; available: boolean }>; price: PriceInfo; isSubscriber: boolean }
            error?: string
          }) => {
            if (data.success && data.data) {
              setPsikologSlots(data.data.slots)
              setPrice(data.data.price)
              setIsSubscriber(data.data.isSubscriber)
            } else {
              setErrorMsg(data.error ?? "Gagal memuat jam tersedia")
            }
          }
        )
        .catch(() => setErrorMsg("Koneksi bermasalah. Coba lagi."))
        .finally(() => setLoadingSlots(false))
    } else if (entryMode === "TANGGAL") {
      fetch(`/api/consultation/availability?date=${selectedDate}&childId=${childId}`)
        .then((res) => res.json())
        .then(
          (data: {
            success: boolean
            data?: { slots: Array<{ slotTime: ConsultationSlotTime; psikologs: PsikologListItem[] }>; price: PriceInfo; isSubscriber: boolean }
            error?: string
          }) => {
            if (data.success && data.data) {
              setDateSlots(data.data.slots)
              setPrice(data.data.price)
              setIsSubscriber(data.data.isSubscriber)
            } else {
              setErrorMsg(data.error ?? "Gagal memuat jam tersedia")
            }
          }
        )
        .catch(() => setErrorMsg("Koneksi bermasalah. Coba lagi."))
        .finally(() => setLoadingSlots(false))
    }
  }, [selectedDate, entryMode, selectedPsikolog, childId])

  const finalPsikolog = entryMode === "PSIKOLOG" ? selectedPsikolog : selectedPsikologForSlot

  async function handleConfirm() {
    if (!selectedSlot || !selectedDate || !finalPsikolog || submitting) return
    setSubmitting(true)
    setErrorMsg(null)
    try {
      const res = await fetch("/api/consultation/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childProfileId: childId,
          psikologId: finalPsikolog.id,
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

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setEntryMode("PSIKOLOG")}
          className={`flex-1 min-h-[40px] rounded-[10px] text-[12px] font-semibold border-[1.5px] transition-all ${
            entryMode === "PSIKOLOG" ? "bg-[#5A3A7A] border-[#5A3A7A] text-white" : "bg-white border-[#E0D0F0] text-[#666666]"
          }`}
        >
          Pilih Psikolog Dulu
        </button>
        <button
          type="button"
          onClick={() => setEntryMode("TANGGAL")}
          className={`flex-1 min-h-[40px] rounded-[10px] text-[12px] font-semibold border-[1.5px] transition-all ${
            entryMode === "TANGGAL" ? "bg-[#5A3A7A] border-[#5A3A7A] text-white" : "bg-white border-[#E0D0F0] text-[#666666]"
          }`}
        >
          Pilih Tanggal Dulu
        </button>
      </div>

      {entryMode === "PSIKOLOG" && !selectedPsikolog && (
        <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-4 mb-4">
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-3">Pilih Psikolog</p>
          {psikologList === null && <p className="text-[12px] text-[#999AAA]">Memuat daftar psikolog...</p>}
          {psikologList?.length === 0 && <p className="text-[12px] text-[#999AAA]">Belum ada psikolog aktif saat ini.</p>}
          <div className="space-y-2">
            {psikologList?.map((p) => (
              <PsikologPickerCard key={p.id} psikolog={p} childName={firstName} onSelect={() => setSelectedPsikolog(p)} />
            ))}
          </div>
        </div>
      )}

      {(entryMode === "TANGGAL" || (entryMode === "PSIKOLOG" && selectedPsikolog)) && (
        <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-4 mb-4">
          {entryMode === "PSIKOLOG" && selectedPsikolog && (
            <div className="flex justify-between items-center mb-3">
              <p className="text-[13px] font-bold text-[#5A3A7A]">{selectedPsikolog.fullName}</p>
              <button type="button" onClick={() => setSelectedPsikolog(null)} className="text-[11px] text-[#A97CC4] font-semibold">
                Ganti
              </button>
            </div>
          )}
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Pilih Tanggal</p>
          <ConsultationCalendar
            month={month}
            statusByDate={calendarStatus}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onMonthChange={setMonth}
            loading={loadingCalendar}
          />

          {selectedDate && (
            <div className="mt-4 pt-4 border-t border-[#F3EEF8]">
              <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Pilih Jam — {formatDate(selectedDate)}</p>
              {loadingSlots ? (
                <p className="text-[12px] text-[#999AAA]">Memuat jam tersedia...</p>
              ) : entryMode === "PSIKOLOG" ? (
                <div className="flex gap-2">
                  {psikologSlots.map((slot) => (
                    <button
                      key={slot.slotTime}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot.slotTime)}
                      className={`flex-1 min-h-[44px] rounded-[10px] font-semibold text-[13px] border-[1.5px] transition-all ${
                        !slot.available
                          ? "bg-[#F3EEF8] border-[#E0D0F0] text-[#C8B8DC] cursor-not-allowed"
                          : selectedSlot === slot.slotTime
                            ? "bg-[#5BBFB0] border-[#5BBFB0] text-white"
                            : "bg-white border-[#C8B8DC] text-[#666666] hover:border-[#5BBFB0]"
                      }`}
                    >
                      {slot.slotTime}
                      {!slot.available && <span className="block text-[10px] font-normal mt-0.5">Penuh</span>}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {dateSlots.map((slot) => (
                    <div key={slot.slotTime}>
                      <p className="text-[12px] font-semibold text-[#5A3A7A] mb-1.5">
                        Jam {slot.slotTime} {slot.psikologs.length === 0 && <span className="text-[#C8B8DC] font-normal">— Penuh</span>}
                      </p>
                      {slot.psikologs.length > 0 && (
                        <div className="space-y-1.5">
                          {slot.psikologs.map((p) => (
                            <PsikologPickerCard
                              key={p.id}
                              psikolog={p}
                              childName={firstName}
                              compact
                              selected={selectedSlot === slot.slotTime && selectedPsikologForSlot?.id === p.id}
                              onSelect={() => {
                                setSelectedSlot(slot.slotTime)
                                setSelectedPsikologForSlot(p)
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {price && selectedSlot && (
            <div className="mt-4 pt-4 border-t border-[#F3EEF8]">
              <p className="text-[12px] text-[#999AAA]">Biaya sesi</p>
              <p className="text-[18px] font-bold text-[#5A3A7A]">{formatRupiah(price.priceIDR)}</p>
              {isSubscriber && <p className="text-[11px] text-[#2C5F5A] mt-0.5">Harga khusus pelanggan sudah diterapkan</p>}
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <p className="text-[12px] text-red-600 mb-3" role="alert">
          {errorMsg}
        </p>
      )}

      <button
        type="button"
        onClick={handleConfirm}
        disabled={!selectedSlot || !finalPsikolog || submitting}
        className="w-full flex items-center justify-center bg-[#5BBFB0] hover:bg-[#2C5F5A] disabled:opacity-50 text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] mb-6 transition-all"
      >
        {submitting
          ? "Memproses..."
          : selectedSlot && finalPsikolog
            ? `Lanjut bayar — ${finalPsikolog.fullName}, jam ${selectedSlot}`
            : "Pilih psikolog & jam terlebih dahulu"}
      </button>

      <p className="text-[11px] text-[#999AAA] leading-relaxed mb-6">
        Konsultasi ini adalah pendampingan psikolog, bukan pengganti psikolog atau diagnosis medis.
      </p>

      {historyItems.length > 0 && (
        <div className="bg-white border border-[#E0D0F0] rounded-[16px] overflow-hidden">
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] px-4 pt-3 pb-2">Riwayat Konsultasi</p>
          {historyItems.map((h, idx) => (
            <div key={h.id} className={`px-4 py-3 ${idx < historyItems.length - 1 ? "border-b border-[#F3EEF8]" : ""}`}>
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-[#666666]">
                  {formatDate(h.bookingDateISO)} · jam {h.slotTime} · {h.psikologName}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                    h.status === "COMPLETED" ? "bg-[#E5F6F4] text-[#2C5F5A] border-[#A8DDD8]" : "bg-[#F3EEF8] text-[#5A3A7A] border-[#E0D0F0]"
                  }`}
                >
                  {h.status === "COMPLETED" ? "Selesai" : "Terjadwal"}
                </span>
              </div>
              {h.psychologistNotes && (
                <p className="text-[12px] text-[#666666] mt-2 leading-relaxed bg-[#F3EEF8] rounded-[8px] p-2">{h.psychologistNotes}</p>
              )}
              {h.status === "COMPLETED" && !h.hasReview && (
                <div className="mt-2 bg-[#F3EEF8] rounded-[8px] p-2.5 flex items-center justify-between gap-2">
                  <p className="text-[11px] text-[#666666]">Bagaimana pengalaman konsultasi dengan {h.psikologName}?</p>
                  <button
                    type="button"
                    onClick={() => setReviewTarget(h)}
                    className="flex-shrink-0 text-[11px] font-semibold text-white bg-[#A97CC4] hover:bg-[#5A3A7A] rounded-full px-3 py-1 transition-all"
                  >
                    Beri Ulasan
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {reviewTarget && (
        <ReviewPromptModal
          bookingId={reviewTarget.id}
          psikologName={reviewTarget.psikologName}
          onClose={() => setReviewTarget(null)}
          onSubmitted={() => {
            setHistoryItems((prev) => prev.map((h) => (h.id === reviewTarget.id ? { ...h, hasReview: true } : h)))
            setReviewTarget(null)
          }}
        />
      )}
    </div>
  )
}
