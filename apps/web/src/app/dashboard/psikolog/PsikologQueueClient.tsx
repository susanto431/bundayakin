"use client"

import { useState } from "react"

type Booking = {
  id: string
  bookingDateISO: string
  slotTime: string
  status: "CONFIRMED" | "COMPLETED"
  psychologistNotes: string | null
  childName: string
  parentName: string
}

type Props = {
  psikologName: string
  level: string
  dailyCapacity: number
  bookings: Booking[]
}

const LEVEL_LABEL: Record<string, string> = { JUNIOR: "Junior", MID: "Mid", SENIOR: "Senior" }

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
}

export default function PsikologQueueClient({ psikologName, level, dailyCapacity, bookings }: Props) {
  const [items, setItems] = useState(bookings)
  const upcoming = items.filter(b => b.status === "CONFIRMED")
  const completed = items.filter(b => b.status === "COMPLETED")

  return (
    <div className="max-w-[640px] mx-auto px-4 pt-6">
      <div className="mb-5">
        <h1 className="text-[18px] font-bold text-[#5A3A7A]">Halo, {psikologName.split(" ")[0]}</h1>
        <p className="text-[12px] text-[#999AAA] mt-1">
          Level {LEVEL_LABEL[level] ?? level} · Kapasitas {dailyCapacity} sesi/hari
        </p>
      </div>

      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Sesi Terjadwal ({upcoming.length})</p>
      <div className="space-y-3 mb-6">
        {upcoming.length === 0 && <p className="text-[13px] text-[#999AAA] py-4">Belum ada sesi terjadwal.</p>}
        {upcoming.map(b => (
          <BookingCard key={b.id} booking={b} onUpdated={updated => setItems(prev => prev.map(x => (x.id === updated.id ? updated : x)))} />
        ))}
      </div>

      {completed.length > 0 && (
        <>
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Sesi Selesai ({completed.length})</p>
          <div className="space-y-3 mb-6">
            {completed.map(b => (
              <BookingCard key={b.id} booking={b} onUpdated={updated => setItems(prev => prev.map(x => (x.id === updated.id ? updated : x)))} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function BookingCard({ booking, onUpdated }: { booking: Booking; onUpdated: (b: Booking) => void }) {
  const [notes, setNotes] = useState(booking.psychologistNotes ?? "")
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)

  async function save(markCompleted: boolean) {
    setSaving(true)
    try {
      const res = await fetch(`/api/psikolog/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ psychologistNotes: notes, ...(markCompleted ? { markCompleted: true } : {}) }),
      })
      const data = (await res.json()) as {
        success: boolean
        data?: { booking: { id: string; status: "CONFIRMED" | "COMPLETED"; psychologistNotes: string | null; completedAt: string | null } }
        error?: string
      }
      if (data.success && data.data) {
        onUpdated({ ...booking, status: data.data.booking.status, psychologistNotes: data.data.booking.psychologistNotes })
        setEditing(false)
      } else {
        alert(data.error ?? "Gagal menyimpan")
      }
    } catch {
      alert("Koneksi bermasalah. Coba lagi.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white border border-[#E0D0F0] rounded-[14px] p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[14px] font-bold text-[#5A3A7A]">{booking.childName}</p>
          <p className="text-[12px] text-[#999AAA]">Orang tua: {booking.parentName}</p>
          <p className="text-[12px] text-[#666666] mt-0.5">{formatDate(booking.bookingDateISO)} · jam {booking.slotTime}</p>
        </div>
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
            booking.status === "COMPLETED" ? "bg-[#E5F6F4] text-[#2C5F5A] border-[#A8DDD8]" : "bg-[#F3EEF8] text-[#5A3A7A] border-[#E0D0F0]"
          }`}
        >
          {booking.status === "COMPLETED" ? "Selesai" : "Terjadwal"}
        </span>
      </div>

      {editing ? (
        <div className="mt-3">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Catatan hasil sesi untuk orang tua..."
            className="w-full rounded-[8px] border border-[#C8B8DC] px-3 py-2 text-[13px]"
          />
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => save(false)}
              disabled={saving}
              className="flex-1 min-h-[36px] rounded-[8px] border-[1.5px] border-[#C8B8DC] text-[#666666] text-[12px] font-semibold disabled:opacity-50"
            >
              Simpan catatan
            </button>
            {booking.status === "CONFIRMED" && (
              <button
                type="button"
                onClick={() => save(true)}
                disabled={saving}
                className="flex-1 min-h-[36px] rounded-[8px] bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white text-[12px] font-semibold disabled:opacity-50 transition-all"
              >
                Tandai selesai
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {booking.psychologistNotes && (
            <p className="text-[12px] text-[#666666] mt-2 leading-relaxed bg-[#F3EEF8] rounded-[8px] p-2">{booking.psychologistNotes}</p>
          )}
          <button type="button" onClick={() => setEditing(true)} className="text-[12px] text-[#A97CC4] font-semibold mt-2">
            {booking.psychologistNotes ? "Ubah catatan" : "Tulis catatan sesi"}
          </button>
        </>
      )}
    </div>
  )
}
