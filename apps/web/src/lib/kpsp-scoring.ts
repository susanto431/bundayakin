// ============================================================
// KPSP — logika penentuan usia formulir & skoring
// Aturan resmi bersumber dari buku panduan (lihat kpsp-instrument.ts)
// ============================================================

import { KPSP_AGE_BANDS, type KpspAgeBand } from "./kpsp-instrument"

/** Selisih bulan-kalender-penuh + sisa hari antara dua tanggal (bukan estimasi 30,4375 hari/bulan). */
function calendarMonthsAndDays(from: Date, to: Date): { months: number; days: number } {
  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth())
  const anchorBeforeAdjust = new Date(from.getFullYear(), from.getMonth() + months, from.getDate())
  if (anchorBeforeAdjust.getTime() > to.getTime()) months -= 1
  const anchor = new Date(from.getFullYear(), from.getMonth() + months, from.getDate())
  const days = Math.round((to.getTime() - anchor.getTime()) / (1000 * 60 * 60 * 24))
  return { months, days }
}

/** Usia dibulatkan: >16 hari lewat bulan penuh → dibulatkan ke atas 1 bulan (aturan resmi buku panduan). */
export function kpspRoundedAgeMonths(dateOfBirth: Date, screeningDate: Date): number {
  const { months, days } = calendarMonthsAndDays(dateOfBirth, screeningDate)
  return days > 16 ? months + 1 : months
}

/**
 * Usia koreksi untuk bayi prematur (usia kehamilan ≤35 minggu, usia kronologis <24 bulan).
 * Di luar syarat itu, kembalikan usia apa adanya (tidak dikoreksi).
 */
export function applyPrematureCorrection(ageMonths: number, gestationalWeeksAtBirth: number | null): number {
  if (gestationalWeeksAtBirth == null || gestationalWeeksAtBirth > 35) return ageMonths
  if (ageMonths >= 24) return ageMonths
  const correctionWeeks = 40 - gestationalWeeksAtBirth
  const correctionMonths = correctionWeeks / 4.345 // ~minggu per bulan
  return Math.max(0, Math.round(ageMonths - correctionMonths))
}

/**
 * Pilih formulir KPSP terdekat yang LEBIH MUDA (bukan pembulatan/interpolasi) — aturan resmi.
 * Return null jika anak belum mencapai usia skrining pertama (3 bulan).
 */
export function selectKpspAgeBand(ageMonths: number): KpspAgeBand | null {
  if (ageMonths < 3) return null
  let selected: KpspAgeBand = KPSP_AGE_BANDS[0]
  for (const band of KPSP_AGE_BANDS) {
    if (band <= ageMonths) selected = band
    else break
  }
  return selected
}

/** Jadwal skrining ulang resmi: setiap 3 bulan untuk usia <24 bulan, setiap 6 bulan untuk 24–72 bulan. */
export function nextKpspScreeningDate(ageMonthsUsed: number, from: Date): Date {
  const intervalMonths = ageMonthsUsed < 24 ? 3 : 6
  const next = new Date(from)
  next.setMonth(next.getMonth() + intervalMonths)
  return next
}

export type KpspCategory = "SESUAI" | "MERAGUKAN" | "PENYIMPANGAN"

/** Skor resmi: 9–10 Ya = SESUAI, 7–8 = MERAGUKAN, <6 = PENYIMPANGAN. */
export function scoreKpsp(answers: boolean[]): { yaCount: number; category: KpspCategory } {
  const yaCount = answers.filter(Boolean).length
  const category: KpspCategory = yaCount >= 9 ? "SESUAI" : yaCount >= 7 ? "MERAGUKAN" : "PENYIMPANGAN"
  return { yaCount, category }
}

// Label & pesan untuk orang tua — bahasa ramah, TANPA istilah klinis
// (aturan tetap proyek: tidak ada "diagnosis"/"penyimpangan" ke orang tua).
// Diadaptasi dari bagian INTERVENSI buku panduan, ditulis ulang non-klinis.
export const KPSP_CATEGORY_LABEL: Record<KpspCategory, string> = {
  SESUAI: "Sesuai usia",
  MERAGUKAN: "Perlu distimulasi lebih",
  PENYIMPANGAN: "Sebaiknya konsultasi",
}

/** {nama} akan diganti nama depan anak oleh pemanggil. */
export const KPSP_CATEGORY_MESSAGE: Record<KpspCategory, string> = {
  SESUAI:
    "Perkembangan {nama} sesuai usianya — Bunda sudah mengasuh dengan baik. Teruskan stimulasi sesering mungkin sesuai usia dan kesiapan {nama}.",
  MERAGUKAN:
    "Ada beberapa hal yang perlu distimulasi lebih sering untuk {nama}. Coba lebih intensif selama 2 minggu, lalu isi ulang skrining ini untuk melihat perkembangannya.",
  PENYIMPANGAN:
    "Sebaiknya {nama} didampingi psikolog untuk penilaian lebih lanjut — ini arahan, bukan diagnosis, supaya {nama} mendapat perhatian ekstra sedini mungkin.",
}
