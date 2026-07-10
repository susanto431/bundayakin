import { CAPTURE_WORK_STYLE_ITEMS, type CaptureWorkStyleDimension } from "@/lib/capture-work-style-instrument"

// Skoring Capture Work Style (Layer 2 — Psikotes AI) & pemetaan ke 8 aspek NannyCare Profile.
// Rumus & aturan status sesuai docs/opds/18_spec_nanny_care_profile_layer3.md — JANGAN ubah
// tanpa instruksi eksplisit Kartika (spesifikasi klinis resmi HCC).

export type CaptureWorkStyleAnswer = "A" | "B"

export type AspectId = "A1" | "A2" | "A3" | "A4" | "A5" | "A6" | "A7" | "A8"

const ASPECT_IDEAL: Record<AspectId, number> = {
  A1: 80, A2: 80, A3: 75, A4: 80, A5: 75, A6: 80, A7: 85, A8: 75,
}

export const ASPECT_LABEL: Record<AspectId, string> = {
  A1: "Bisa Diandalkan",
  A2: "Sigap & Penuh Inisiatif",
  A3: "Bisa Kerja Sendiri",
  A4: "Nurut Aturan Rumah",
  A5: "Mudah Beradaptasi",
  A6: "Mau Cerita ke Bunda",
  A7: "Hangat ke Anak",
  A8: "Bergaul di Lingkungan",
}

/** Raw score 0–9 per dimensi — dihitung dari jawaban 90 blok forced-choice. */
export function scoreDimensions(answers: CaptureWorkStyleAnswer[]): Record<CaptureWorkStyleDimension, number> {
  if (answers.length !== CAPTURE_WORK_STYLE_ITEMS.length) {
    throw new Error(`Jawaban harus lengkap ${CAPTURE_WORK_STYLE_ITEMS.length} blok, diterima ${answers.length}`)
  }

  const raw: Record<string, number> = {}
  CAPTURE_WORK_STYLE_ITEMS.forEach((item, idx) => {
    const chosenDimension = answers[idx] === "A" ? item.dimensionA : item.dimensionB
    raw[chosenDimension] = (raw[chosenDimension] ?? 0) + 1
  })
  return raw as Record<CaptureWorkStyleDimension, number>
}

/** raw (0–9) → skor 0–100. Formula: round((raw / 9) * 100) */
function to100(raw: number): number {
  return Math.round((raw / 9) * 100)
}

export type AspectResult = {
  id: AspectId
  label: string
  score: number
  ideal: number
  status: "ok" | "warn" | "partial"
}

export type CaptureWorkStyleResult = {
  dimensionRaw: Record<CaptureWorkStyleDimension, number>
  dimensionScore100: Record<CaptureWorkStyleDimension, number>
  aspects: AspectResult[]
  flags: string[]
}

// ── Kategori laporan hasil (format "Sikap Kerja" HCC, 10 Juli 2026) ───────────
// Kartika: tampilkan skor mentah 0–9 per dimensi langsung (bukan dikonversi ke
// 0–100), dikelompokkan sesuai contoh laporan "Sikap Kerja.pdf" — bukan sistem
// 8 aspek NannyCare Profile di atas (itu tetap dihitung & disimpan untuk Layer 3
// nanti, hanya tidak ditampilkan sebagai hasil Layer 2 sekarang). Belum ada bank
// narasi per skor — untuk sekarang tampilkan angkanya saja.

export type CaptureWorkStyleCategory = {
  id: string
  label: string
  dimensions: CaptureWorkStyleDimension[]
}

export const CAPTURE_WORK_STYLE_CATEGORIES: CaptureWorkStyleCategory[] = [
  { id: "work_direction", label: "Energi dan Dinamika Kerja (Work Direction)", dimensions: ["N", "G", "A"] },
  { id: "leadership", label: "Kepemimpinan (Leadership)", dimensions: ["L", "P", "I"] },
  { id: "activity", label: "Kecepatan dan Ketahanan (Activity)", dimensions: ["T", "V"] },
  { id: "followership", label: "Followership", dimensions: ["F", "W"] },
  { id: "social_nature", label: "Social Nature", dimensions: ["X", "S", "B", "O"] },
  { id: "work_style", label: "Work Style", dimensions: ["R", "D", "C"] },
  { id: "temperament", label: "Temperament", dimensions: ["Z", "E", "K"] },
]

export const DIMENSION_FULL_NAME: Record<CaptureWorkStyleDimension, string> = {
  N: "Need to Finish a Task",
  G: "Role of Hard Intense Worker",
  L: "Leadership Role",
  P: "Need to Control Others",
  I: "Ease in Decision Making",
  T: "Pace",
  V: "Vigorous Type",
  F: "Need to Support Authority",
  W: "Need for Rules and Supervision",
  X: "Need to Be Noticed",
  S: "Social Extension",
  B: "Need to Belong to Groups",
  O: "Need for Closeness and Affection",
  Z: "Need for Change",
  E: "Emotional Restraint",
  K: "Need to Be Forceful",
  R: "Theoretical Type",
  D: "Interest in Working With Detail",
  C: "Organize Type",
  A: "Need to Achieve",
}

function statusFor(score: number, ideal: number): "ok" | "warn" {
  return ideal - score > 20 ? "warn" : "ok"
}

/**
 * Hitung 8 aspek NannyCare Profile dari 20 skor dimensi Capture Work Style.
 * A1–A6 dihitung penuh dari PAPI (Layer 2, otomatis). A7/A8 di sini SELALU "partial"
 * (estimasi) — bacaan grafis final (DAP+BAUM) adalah pekerjaan psikolog di Layer 3.
 */
export function scoreCaptureWorkStyle(answers: CaptureWorkStyleAnswer[]): CaptureWorkStyleResult {
  const raw = scoreDimensions(answers)
  const s100: Record<string, number> = {}
  for (const dim of Object.keys(raw) as CaptureWorkStyleDimension[]) {
    s100[dim] = to100(raw[dim])
  }
  const c = (dim: CaptureWorkStyleDimension) => s100[dim] ?? 0

  const a1 = Math.round((c("N") + c("G")) / 2)
  const a2 = Math.round((c("L") + c("I") + (100 - c("T"))) / 3)
  const a3 = Math.round((100 - c("W") + c("I")) / 2)
  const a4 = Math.round((c("F") + c("W")) / 2)
  const a5 = Math.round((c("Z") + (100 - c("R")) + (100 - c("C"))) / 3)
  const a6 = Math.round((100 - c("K") + c("S") + c("X")) / 3)
  // A7/A8: estimasi awal dari PAPI — ditandai partial, bacaan grafis final menyusul di Layer 3
  const a7 = Math.round((c("O") + c("B") + c("E")) / 3)
  const a8 = Math.round((c("S") + c("B") + c("X")) / 3)

  const aspects: AspectResult[] = [
    { id: "A1", label: ASPECT_LABEL.A1, score: a1, ideal: ASPECT_IDEAL.A1, status: statusFor(a1, ASPECT_IDEAL.A1) },
    { id: "A2", label: ASPECT_LABEL.A2, score: a2, ideal: ASPECT_IDEAL.A2, status: statusFor(a2, ASPECT_IDEAL.A2) },
    { id: "A3", label: ASPECT_LABEL.A3, score: a3, ideal: ASPECT_IDEAL.A3, status: statusFor(a3, ASPECT_IDEAL.A3) },
    { id: "A4", label: ASPECT_LABEL.A4, score: a4, ideal: ASPECT_IDEAL.A4, status: statusFor(a4, ASPECT_IDEAL.A4) },
    { id: "A5", label: ASPECT_LABEL.A5, score: a5, ideal: ASPECT_IDEAL.A5, status: statusFor(a5, ASPECT_IDEAL.A5) },
    { id: "A6", label: ASPECT_LABEL.A6, score: a6, ideal: ASPECT_IDEAL.A6, status: statusFor(a6, ASPECT_IDEAL.A6) },
    { id: "A7", label: ASPECT_LABEL.A7, score: a7, ideal: ASPECT_IDEAL.A7, status: "partial" },
    { id: "A8", label: ASPECT_LABEL.A8, score: a8, ideal: ASPECT_IDEAL.A8, status: "partial" },
  ]

  // Flagging otomatis (docs/opds/18_spec_nanny_care_profile_layer3.md)
  const flags: string[] = []
  if ((raw.K ?? 9) <= 1) {
    flags.push("K sangat rendah — risiko tidak melapor insiden penting. Sistem laporan harian dari orang tua adalah keharusan.")
  }
  if ((raw.T ?? 9) <= 2) {
    flags.push("Jadwal harian tertulis adalah keharusan.")
  }
  if ((raw.W ?? 9) <= 2) {
    flags.push("SOP perlu dijelaskan konteksnya, bukan sekadar aturan.")
  }

  return { dimensionRaw: raw, dimensionScore100: s100 as Record<CaptureWorkStyleDimension, number>, aspects, flags }
}
