"use client"

import { useMemo } from "react"

type DateStatus = "AVAILABLE" | "FULL"

type Props = {
  month: string // "YYYY-MM"
  statusByDate: Record<string, DateStatus>
  selectedDate: string | null
  onSelectDate: (date: string) => void
  onMonthChange: (month: string) => void
  loading?: boolean
}

const DAY_HEADERS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

function shiftMonth(month: string, delta: number): string {
  const [year, m] = month.split("-").map(Number)
  const d = new Date(Date.UTC(year, m - 1 + delta, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
}

function monthLabel(month: string): string {
  const [year, m] = month.split("-").map(Number)
  return new Date(Date.UTC(year, m - 1, 1)).toLocaleDateString("id-ID", { month: "long", year: "numeric" })
}

function todayISODate(): string {
  return new Date().toISOString().split("T")[0]
}

// Kalender bulan bergaya Calendly: hijau = ada slot tersedia, abu-abu = penuh/tutup.
// Dipakai untuk dua entry point booking (pilih psikolog dulu / pilih tanggal
// dulu) — hanya beda sumber data statusByDate-nya (ADR-012, 11 Juli 2026).
export default function ConsultationCalendar({ month, statusByDate, selectedDate, onSelectDate, onMonthChange, loading }: Props) {
  const cells = useMemo(() => {
    const [year, m] = month.split("-").map(Number)
    const firstDay = new Date(Date.UTC(year, m - 1, 1))
    const daysInMonthCount = new Date(Date.UTC(year, m, 0)).getUTCDate()
    const leadingBlanks = firstDay.getUTCDay()
    const days: Array<{ iso: string; day: number } | null> = []
    for (let i = 0; i < leadingBlanks; i++) days.push(null)
    for (let day = 1; day <= daysInMonthCount; day++) {
      const iso = `${year}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      days.push({ iso, day })
    }
    return days
  }, [month])

  const today = todayISODate()
  const minMonth = today.slice(0, 7)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => onMonthChange(shiftMonth(month, -1))}
          disabled={month <= minMonth}
          className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-[#E0D0F0] text-[#5A3A7A] disabled:opacity-30"
          aria-label="Bulan sebelumnya"
        >
          ‹
        </button>
        <p className="text-[13px] font-bold text-[#5A3A7A] capitalize">{monthLabel(month)}</p>
        <button
          type="button"
          onClick={() => onMonthChange(shiftMonth(month, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-[#E0D0F0] text-[#5A3A7A]"
          aria-label="Bulan berikutnya"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_HEADERS.map((label) => (
          <p key={label} className="text-[10px] font-semibold text-[#999AAA] text-center uppercase">
            {label}
          </p>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, idx) => {
          if (!cell) return <div key={`blank-${idx}`} />
          const isPast = cell.iso < today
          const status = statusByDate[cell.iso]
          const isAvailable = !isPast && status === "AVAILABLE"
          const isSelected = selectedDate === cell.iso

          return (
            <button
              key={cell.iso}
              type="button"
              disabled={isPast || !isAvailable || loading}
              onClick={() => onSelectDate(cell.iso)}
              className={`aspect-square rounded-[8px] text-[12px] font-semibold transition-all ${
                isSelected
                  ? "bg-[#2C5F5A] text-white"
                  : isPast
                    ? "text-[#C8B8DC] cursor-not-allowed"
                    : isAvailable
                      ? "bg-[#5BBFB0]/15 text-[#2C5F5A] border-[1.5px] border-[#5BBFB0] hover:bg-[#5BBFB0]/30"
                      : "bg-[#F3EEF8] text-[#C8B8DC] cursor-not-allowed"
              }`}
            >
              {cell.day}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-[4px] bg-[#5BBFB0]/30 border border-[#5BBFB0]" />
          <span className="text-[11px] text-[#666666]">Tersedia</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-[4px] bg-[#F3EEF8] border border-[#E0D0F0]" />
          <span className="text-[11px] text-[#666666]">Penuh</span>
        </div>
      </div>
    </div>
  )
}
