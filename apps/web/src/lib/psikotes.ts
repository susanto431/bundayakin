import { prisma } from "@/lib/prisma"
import { getEffectiveValue } from "@/lib/pricing-config"
import type { CaptureWorkStyleDimension } from "@/lib/capture-work-style-instrument"
import { CAPTURE_WORK_STYLE_CATEGORIES } from "@/lib/capture-work-style-scoring"
import { getInterpretation } from "@/lib/capture-work-style-interpretation"

export type PsikotesCategoryResult = {
  id: string
  label: string
  narratives: string[]
}

export type PsikotesInfo = {
  available: boolean
  unlocked: boolean
  priceIDR: number | null
  categories: PsikotesCategoryResult[] | null
}

/**
 * Info Psikotes AI (Layer 2 — Capture Work Style) untuk ditampilkan di detail matching
 * satu nanny. Detail (categories) hanya dikirim kalau parent sudah bayar (psikotesUnlocked) —
 * jangan bocorkan hasil sebelum dibuka.
 *
 * Ditampilkan sebagai NARASI bahasa awam per kategori (bank interpretasi HCC, lihat
 * capture-work-style-interpretation.ts) — TIDAK menyertakan kode dimensi, istilah
 * Inggris, atau angka mentah (aturan CLAUDE.md §5, larangan istilah psikologi ke orang tua).
 */
export async function getPsikotesInfo(nannyProfileId: string, psikotesUnlocked: boolean): Promise<PsikotesInfo> {
  const result = await prisma.assessmentResult.findFirst({
    where: { nannyProfileId, layer: "LAYER_2", testType: "Capture Work Style" },
    orderBy: { issuedAt: "desc" },
    select: { rawScores: true },
  })

  if (!result) {
    return { available: false, unlocked: false, priceIDR: null, categories: null }
  }

  const priceIDR = await getEffectiveValue("ADDON_PSIKOTES_FEE_IDR")

  if (!psikotesUnlocked) {
    return { available: true, unlocked: false, priceIDR, categories: null }
  }

  const raw = result.rawScores as { dimensionRaw?: Record<CaptureWorkStyleDimension, number> } | null
  const dimensionRaw = raw?.dimensionRaw
  if (!dimensionRaw) {
    return { available: true, unlocked: true, priceIDR, categories: null }
  }

  const categories: PsikotesCategoryResult[] = CAPTURE_WORK_STYLE_CATEGORIES.map(cat => ({
    id: cat.id,
    label: cat.label,
    narratives: cat.dimensions.map(dim => getInterpretation(dim, dimensionRaw[dim] ?? 0)),
  }))

  return { available: true, unlocked: true, priceIDR, categories }
}
