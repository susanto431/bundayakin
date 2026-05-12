// Domain and aspect weights for AI scoring.
// Source of truth: docs/BLOK5_SurveyMatching_53Questions.md
// Total must sum to 1.0. Adjust here only — never hardcode elsewhere.

export const DOMAIN_WEIGHTS: Record<"A" | "B" | "C", number> = {
  A: 0.35, // Kondisi Kerja & Ekspektasi Praktis
  B: 0.30, // Nilai, Kepercayaan & Gaya Hidup
  C: 0.35, // Pengalaman & Kemampuan Nanny
} as const

export const ASPECT_WEIGHTS: Record<string, number> = {
  A1: 0.20, // Gaji, Libur & Fasilitas   — financial viability
  A2: 0.15, // Lingkup & Tugas Kerja
  B1: 0.10, // Agama & Kepercayaan
  B2: 0.07, // Pakaian & Penampilan
  B3: 0.13, // Gaya Pengasuhan            — core value alignment
  C1: 0.14, // Rekam Jejak Pengalaman
  C2: 0.12, // Kemampuan Praktis
  C3: 0.05, // Gaya Komunikasi
  C4: 0.04, // Kecocokan Lingkungan
} as const

// Dealbreaker multiplier: score dampened toward 0 when dealbreaker mismatches
export const DEALBREAKER_PENALTY = 0.3
