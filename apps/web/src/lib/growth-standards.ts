// ============================================================
// GROWTH STANDARDS — referensi median WHO Child Growth Standards
// Tumbuh Kembang (PRD 13, Tahap 1)
//
// ⚠️ CATATAN AKURASI — WAJIB DIBACA SEBELUM MENGUBAH DATA INI:
// Titik acuan (anchor) di bawah adalah median berat & tinggi WHO 0–60 bulan
// yang direkonstruksi dari pengetahuan umum kesehatan anak (nilai yang sama
// juga umum dipakai di buku KIA/Posyandu Indonesia), BUKAN diunduh langsung
// dari tabel LMS resmi WHO saat pengembangan fitur ini. Nilai di antara titik
// anchor dihitung dengan interpolasi linear — bukan kurva LMS penuh.
// Cukup akurat untuk KECENDERUNGAN UMUM (naik/turun signifikan dari median),
// TIDAK cukup presisi untuk klaim persentil klinis.
//
// Konsekuensinya, produk ini SENGAJA tidak menampilkan angka persentil
// ("persentil ke-42") — hanya kategori kasar (sesuai / perlu pantau / perlu
// perhatian) dengan disclaimer "bukan alat diagnosis" di setiap tempat kurva
// ini ditampilkan. Sebelum diklaim akurat secara klinis di materi marketing,
// validasi ulang seluruh tabel ini terhadap rilis resmi WHO Child Growth
// Standards — sama seperti instrumen Skrining Perkembangan (KPSP) yang sudah
// ditandai butuh validasi psikolog HCC sebelum Tahap 2 (lihat PRD 13 §7).
// ============================================================

export type Sex = "L" | "P" // Laki-laki | Perempuan

/** ChildProfile.gender disimpan sebagai "MALE" | "FEMALE"; default ke "P" jika belum diisi. */
export function sexFromGender(gender: string | null): Sex {
  return gender === "MALE" ? "L" : "P"
}

type AnchorPoint = { months: number; medianKg?: number; medianCm?: number }

// Berat median (kg) per usia (bulan) — WHO weight-for-age, 0–60 bulan
const WEIGHT_ANCHORS: Record<Sex, AnchorPoint[]> = {
  L: [
    { months: 0, medianKg: 3.3 }, { months: 1, medianKg: 4.5 }, { months: 2, medianKg: 5.6 },
    { months: 3, medianKg: 6.4 }, { months: 4, medianKg: 7.0 }, { months: 5, medianKg: 7.5 },
    { months: 6, medianKg: 7.9 }, { months: 9, medianKg: 8.9 }, { months: 12, medianKg: 9.6 },
    { months: 15, medianKg: 10.3 }, { months: 18, medianKg: 10.9 }, { months: 21, medianKg: 11.5 },
    { months: 24, medianKg: 12.2 }, { months: 30, medianKg: 13.3 }, { months: 36, medianKg: 14.3 },
    { months: 42, medianKg: 15.3 }, { months: 48, medianKg: 16.3 }, { months: 54, medianKg: 17.3 },
    { months: 60, medianKg: 18.3 },
  ],
  P: [
    { months: 0, medianKg: 3.2 }, { months: 1, medianKg: 4.2 }, { months: 2, medianKg: 5.1 },
    { months: 3, medianKg: 5.8 }, { months: 4, medianKg: 6.4 }, { months: 5, medianKg: 6.9 },
    { months: 6, medianKg: 7.3 }, { months: 9, medianKg: 8.2 }, { months: 12, medianKg: 8.9 },
    { months: 15, medianKg: 9.6 }, { months: 18, medianKg: 10.2 }, { months: 21, medianKg: 10.9 },
    { months: 24, medianKg: 11.5 }, { months: 30, medianKg: 12.7 }, { months: 36, medianKg: 13.9 },
    { months: 42, medianKg: 14.9 }, { months: 48, medianKg: 16.1 }, { months: 54, medianKg: 17.2 },
    { months: 60, medianKg: 18.2 },
  ],
}

// Tinggi/panjang median (cm) per usia (bulan) — WHO length/height-for-age, 0–60 bulan
const HEIGHT_ANCHORS: Record<Sex, AnchorPoint[]> = {
  L: [
    { months: 0, medianCm: 49.9 }, { months: 1, medianCm: 54.7 }, { months: 2, medianCm: 58.4 },
    { months: 3, medianCm: 61.4 }, { months: 4, medianCm: 63.9 }, { months: 5, medianCm: 65.9 },
    { months: 6, medianCm: 67.6 }, { months: 9, medianCm: 72.0 }, { months: 12, medianCm: 75.7 },
    { months: 15, medianCm: 79.1 }, { months: 18, medianCm: 82.3 }, { months: 21, medianCm: 85.1 },
    { months: 24, medianCm: 87.8 }, { months: 30, medianCm: 91.9 }, { months: 36, medianCm: 96.1 },
    { months: 42, medianCm: 99.9 }, { months: 48, medianCm: 103.3 }, { months: 54, medianCm: 106.7 },
    { months: 60, medianCm: 110.0 },
  ],
  P: [
    { months: 0, medianCm: 49.1 }, { months: 1, medianCm: 53.7 }, { months: 2, medianCm: 57.1 },
    { months: 3, medianCm: 59.8 }, { months: 4, medianCm: 62.1 }, { months: 5, medianCm: 64.0 },
    { months: 6, medianCm: 65.7 }, { months: 9, medianCm: 70.1 }, { months: 12, medianCm: 74.0 },
    { months: 15, medianCm: 77.5 }, { months: 18, medianCm: 80.7 }, { months: 21, medianCm: 83.7 },
    { months: 24, medianCm: 86.4 }, { months: 30, medianCm: 91.0 }, { months: 36, medianCm: 95.1 },
    { months: 42, medianCm: 99.0 }, { months: 48, medianCm: 102.7 }, { months: 54, medianCm: 106.2 },
    { months: 60, medianCm: 109.4 },
  ],
}

function interpolate(anchors: AnchorPoint[], months: number, key: "medianKg" | "medianCm"): number | null {
  const clamped = Math.max(0, Math.min(60, months))
  if (anchors.length === 0) return null

  let lower = anchors[0]
  let upper = anchors[anchors.length - 1]
  for (let i = 0; i < anchors.length - 1; i++) {
    if (clamped >= anchors[i].months && clamped <= anchors[i + 1].months) {
      lower = anchors[i]
      upper = anchors[i + 1]
      break
    }
  }
  const lv = lower[key]
  const uv = upper[key]
  if (lv == null || uv == null) return null
  if (upper.months === lower.months) return lv
  const t = (clamped - lower.months) / (upper.months - lower.months)
  return lv + (uv - lv) * t
}

export function ageInMonths(dateOfBirth: Date, on: Date): number {
  const days = (on.getTime() - dateOfBirth.getTime()) / (1000 * 60 * 60 * 24)
  return Math.max(0, days / 30.4375)
}

export function whoMedianWeight(sex: Sex, months: number): number | null {
  return interpolate(WEIGHT_ANCHORS[sex], months, "medianKg")
}

export function whoMedianHeight(sex: Sex, months: number): number | null {
  return interpolate(HEIGHT_ANCHORS[sex], months, "medianCm")
}

/** Kurva median WHO untuk digambar di chart, dari 0 sampai maxMonths (langkah 1 bulan). */
export function whoWeightCurve(sex: Sex, maxMonths = 60): { months: number; value: number }[] {
  const points: { months: number; value: number }[] = []
  for (let m = 0; m <= maxMonths; m++) {
    const v = whoMedianWeight(sex, m)
    if (v != null) points.push({ months: m, value: v })
  }
  return points
}

export function whoHeightCurve(sex: Sex, maxMonths = 60): { months: number; value: number }[] {
  const points: { months: number; value: number }[] = []
  for (let m = 0; m <= maxMonths; m++) {
    const v = whoMedianHeight(sex, m)
    if (v != null) points.push({ months: m, value: v })
  }
  return points
}

export type GrowthCategory = "SESUAI" | "PERLU_PANTAU" | "PERLU_PERHATIAN"

/**
 * Kategori kasar berdasarkan persentase deviasi dari median — BUKAN persentil klinis.
 * Ambang batas dipilih longgar (bukan hasil studi) agar tidak overclaim presisi
 * dari data anchor yang sifatnya interpolasi. Selalu tampilkan dengan disclaimer.
 */
export function categorizeDeviation(actual: number, median: number): GrowthCategory {
  const deviationPct = ((actual - median) / median) * 100
  const abs = Math.abs(deviationPct)
  if (abs <= 15) return "SESUAI"
  if (abs <= 25) return "PERLU_PANTAU"
  return "PERLU_PERHATIAN"
}

export const GROWTH_CATEGORY_LABEL: Record<GrowthCategory, string> = {
  SESUAI: "Sesuai median",
  PERLU_PANTAU: "Perlu dipantau",
  PERLU_PERHATIAN: "Sebaiknya konsultasi",
}
