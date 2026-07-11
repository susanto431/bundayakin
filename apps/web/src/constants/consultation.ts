// Slot Konsultasi Psikolog Anak — 3 jam baku, sama untuk semua psikolog sebagai
// pilihan jam (PRD 13 §7b poin 5). Mana yang benar-benar dibuka tiap psikolog
// diatur lewat Jadwal Psikolog masing-masing (PRD 13 §7c, 11 Juli 2026, belum
// dikoding — lihat ADR-012).
export const CONSULTATION_SLOT_TIMES = ["09:00", "13:00", "16:00"] as const

export type ConsultationSlotTime = (typeof CONSULTATION_SLOT_TIMES)[number]

export function isValidSlotTime(value: string): value is ConsultationSlotTime {
  return (CONSULTATION_SLOT_TIMES as readonly string[]).includes(value)
}

// Kapasitas psikolog — 3 sesi/hari nyaman, maksimum 5 (PRD 13 §7 keputusan 2).
// Nilai default saat akun psikolog dibuat; admin bisa naikkan per psikolog
// sampai batas maksimum ini (bukan config global, lihat PsikologProfile.dailyCapacity).
export const CONSULTATION_DEFAULT_DAILY_CAPACITY = 3
export const CONSULTATION_MAX_DAILY_CAPACITY = 5
