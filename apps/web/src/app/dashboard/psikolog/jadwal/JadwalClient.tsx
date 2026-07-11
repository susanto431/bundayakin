"use client"

import { useState } from "react"
import Link from "next/link"
import { CONSULTATION_SLOT_TIMES, type ConsultationSlotTime } from "@/constants/consultation"

type WeeklyScheduleEntry = { dayOfWeek: number; slotTime: ConsultationSlotTime; isOpen: boolean }
type CutiEntry = { id: string; cutiDateISO: string; reason: string | null }

type Props = {
  weeklySchedule: WeeklyScheduleEntry[]
  cutiDates: CutiEntry[]
}

const DAY_LABELS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
}

function todayISODate(): string {
  return new Date().toISOString().split("T")[0]
}

export default function JadwalClient({ weeklySchedule, cutiDates }: Props) {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {}
    for (const day of [0, 1, 2, 3, 4, 5, 6]) {
      for (const slotTime of CONSULTATION_SLOT_TIMES) {
        const entry = weeklySchedule.find((e) => e.dayOfWeek === day && e.slotTime === slotTime)
        map[`${day}-${slotTime}`] = entry?.isOpen ?? false
      }
    }
    return map
  })
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState<string | null>(null)

  const [cutis, setCutis] = useState(cutiDates)
  const [newCutiDate, setNewCutiDate] = useState("")
  const [newCutiReason, setNewCutiReason] = useState("")
  const [addingCuti, setAddingCuti] = useState(false)

  function toggle(day: number, slotTime: ConsultationSlotTime) {
    setOpenMap((prev) => ({ ...prev, [`${day}-${slotTime}`]: !prev[`${day}-${slotTime}`] }))
    setSavedMsg(null)
  }

  async function handleSave() {
    setSaving(true)
    setSavedMsg(null)
    try {
      const updates = [0, 1, 2, 3, 4, 5, 6].flatMap((day) =>
        CONSULTATION_SLOT_TIMES.map((slotTime) => ({ dayOfWeek: day, slotTime, isOpen: openMap[`${day}-${slotTime}`] ?? false }))
      )
      const res = await fetch("/api/psikolog/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      })
      const data = (await res.json()) as { success: boolean; error?: string }
      if (data.success) {
        setSavedMsg("Jadwal tersimpan")
      } else {
        setSavedMsg(data.error ?? "Gagal menyimpan jadwal")
      }
    } catch {
      setSavedMsg("Koneksi bermasalah. Coba lagi.")
    } finally {
      setSaving(false)
    }
  }

  async function handleAddCuti() {
    if (!newCutiDate || addingCuti) return
    setAddingCuti(true)
    try {
      const res = await fetch("/api/psikolog/schedule/cuti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cutiDate: newCutiDate, reason: newCutiReason || undefined }),
      })
      const data = (await res.json()) as { success: boolean; error?: string }
      if (data.success) {
        setCutis((prev) =>
          [...prev, { id: newCutiDate, cutiDateISO: new Date(newCutiDate).toISOString(), reason: newCutiReason || null }].sort(
            (a, b) => a.cutiDateISO.localeCompare(b.cutiDateISO)
          )
        )
        setNewCutiDate("")
        setNewCutiReason("")
      } else {
        alert(data.error ?? "Gagal menambah cuti")
      }
    } catch {
      alert("Koneksi bermasalah. Coba lagi.")
    } finally {
      setAddingCuti(false)
    }
  }

  async function handleRemoveCuti(cutiDateISO: string) {
    const dateOnly = cutiDateISO.split("T")[0]
    setCutis((prev) => prev.filter((c) => c.cutiDateISO !== cutiDateISO))
    try {
      const res = await fetch(`/api/psikolog/schedule/cuti/${dateOnly}`, { method: "DELETE" })
      const data = (await res.json()) as { success: boolean; error?: string }
      if (!data.success) alert(data.error ?? "Gagal menghapus cuti")
    } catch {
      alert("Koneksi bermasalah. Coba lagi.")
    }
  }

  return (
    <div className="max-w-[640px] mx-auto px-4 pt-6 pb-16">
      <div className="border-b border-[#E0D0F0] pb-3 mb-5">
        <Link href="/dashboard/psikolog" className="text-[12px] text-[#A97CC4] font-semibold mb-1 inline-block">
          ← Kembali ke Portal Psikolog
        </Link>
        <h1 className="text-[18px] font-bold text-[#5A3A7A]">Atur Jadwal</h1>
        <p className="text-[13px] text-[#999AAA] mt-1">
          Nyalakan jam yang Anda buka tiap hari — berlaku otomatis tiap minggu sampai diubah lagi.
        </p>
      </div>

      <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-4 mb-5 overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse">
          <thead>
            <tr>
              <th className="text-left text-[10px] font-semibold text-[#999AAA] uppercase tracking-wide pb-2">Jam</th>
              {DAY_LABELS.map((label, day) => (
                <th key={day} className="text-[10px] font-semibold text-[#999AAA] uppercase tracking-wide pb-2 px-1">
                  {label.slice(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CONSULTATION_SLOT_TIMES.map((slotTime) => (
              <tr key={slotTime}>
                <td className="text-[13px] font-semibold text-[#5A3A7A] py-1.5 pr-2">{slotTime}</td>
                {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                  const isOpen = openMap[`${day}-${slotTime}`] ?? false
                  return (
                    <td key={day} className="px-1 py-1.5">
                      <button
                        type="button"
                        onClick={() => toggle(day, slotTime)}
                        aria-pressed={isOpen}
                        aria-label={`${DAY_LABELS[day]} jam ${slotTime}: ${isOpen ? "buka" : "tutup"}`}
                        className={`w-full min-h-[40px] rounded-[8px] border-[1.5px] transition-all ${
                          isOpen ? "bg-[#5BBFB0] border-[#5BBFB0]" : "bg-[#F3EEF8] border-[#E0D0F0]"
                        }`}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {savedMsg && <p className="text-[12px] text-[#2C5F5A] mb-2">{savedMsg}</p>}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="w-full min-h-[48px] rounded-[10px] bg-[#5BBFB0] hover:bg-[#2C5F5A] disabled:opacity-50 text-white font-semibold text-[14px] mb-8 transition-all"
      >
        {saving ? "Menyimpan..." : "Simpan Jadwal"}
      </button>

      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Tandai Cuti</p>
      <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-4 mb-4 space-y-3">
        <div>
          <label className="text-[11px] font-semibold text-[#666666]">Tanggal cuti</label>
          <input
            type="date"
            value={newCutiDate}
            min={todayISODate()}
            onChange={(e) => setNewCutiDate(e.target.value)}
            className="w-full min-h-[40px] rounded-[8px] border border-[#C8B8DC] px-3 text-[13px] mt-1"
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[#666666]">Alasan (opsional)</label>
          <input
            value={newCutiReason}
            onChange={(e) => setNewCutiReason(e.target.value)}
            className="w-full min-h-[40px] rounded-[8px] border border-[#C8B8DC] px-3 text-[13px] mt-1"
          />
        </div>
        <button
          type="button"
          onClick={handleAddCuti}
          disabled={!newCutiDate || addingCuti}
          className="w-full min-h-[40px] rounded-[10px] bg-[#A97CC4] hover:bg-[#5A3A7A] disabled:opacity-50 text-white font-semibold text-[13px] transition-all"
        >
          {addingCuti ? "Menyimpan..." : "Tambah Cuti"}
        </button>
      </div>

      <div className="space-y-2">
        {cutis.length === 0 && <p className="text-[13px] text-[#999AAA] text-center py-4">Belum ada cuti mendatang.</p>}
        {cutis.map((c) => (
          <div key={c.cutiDateISO} className="bg-white border border-[#E0D0F0] rounded-[10px] p-3 flex justify-between items-center">
            <div>
              <p className="text-[13px] font-semibold text-[#5A3A7A]">{formatDate(c.cutiDateISO)}</p>
              {c.reason && <p className="text-[12px] text-[#999AAA]">{c.reason}</p>}
            </div>
            <button type="button" onClick={() => handleRemoveCuti(c.cutiDateISO)} className="text-[12px] text-red-600 font-semibold">
              Hapus
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
