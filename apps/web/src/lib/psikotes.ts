import { prisma } from "@/lib/prisma"
import { getEffectiveValue } from "@/lib/pricing-config"
import type { CaptureWorkStyleDimension } from "@/lib/capture-work-style-instrument"

export type PsikotesInfo = {
  available: boolean
  unlocked: boolean
  priceIDR: number | null
  dimensionRaw: Record<CaptureWorkStyleDimension, number> | null
}

/**
 * Info Psikotes AI (Layer 2 — Capture Work Style) untuk ditampilkan di detail matching
 * satu nanny. Detail (dimensionRaw) hanya dikirim kalau parent sudah bayar (psikotesUnlocked) —
 * jangan bocorkan hasil sebelum dibuka.
 *
 * Ditampilkan sebagai skor mentah 0–9 per dimensi (bukan dikonversi 0–100), dikelompokkan
 * per kategori "Sikap Kerja" (lihat CAPTURE_WORK_STYLE_CATEGORIES) — keputusan Kartika
 * 10 Juli 2026, belum ada bank narasi jadi angka mentah dulu. Skor 8 aspek NannyCare
 * Profile tetap dihitung & disimpan di rawScores untuk Layer 3 nanti, tidak dikirim di sini.
 */
export async function getPsikotesInfo(nannyProfileId: string, psikotesUnlocked: boolean): Promise<PsikotesInfo> {
  const result = await prisma.assessmentResult.findFirst({
    where: { nannyProfileId, layer: "LAYER_2", testType: "Capture Work Style" },
    orderBy: { issuedAt: "desc" },
    select: { rawScores: true },
  })

  if (!result) {
    return { available: false, unlocked: false, priceIDR: null, dimensionRaw: null }
  }

  const priceIDR = await getEffectiveValue("ADDON_PSIKOTES_FEE_IDR")
  const raw = result.rawScores as { dimensionRaw?: Record<CaptureWorkStyleDimension, number> } | null

  return {
    available: true,
    unlocked: psikotesUnlocked,
    priceIDR,
    dimensionRaw: psikotesUnlocked ? (raw?.dimensionRaw ?? null) : null,
  }
}
