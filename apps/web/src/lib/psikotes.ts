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
  /** Kapan Undangan Psikotes terakhir dikirim untuk nanny ini, kalau dia belum
   * menyelesaikan testnya (ADR-014). */
  invitedAt: string | null
  priceIDR: number | null
  categories: PsikotesCategoryResult[] | null
}

function categoriesFromRawScores(rawScores: unknown): PsikotesCategoryResult[] | null {
  const raw = rawScores as { dimensionRaw?: Record<CaptureWorkStyleDimension, number> } | null
  const dimensionRaw = raw?.dimensionRaw
  if (!dimensionRaw) return null

  return CAPTURE_WORK_STYLE_CATEGORIES.map(cat => ({
    id: cat.id,
    label: cat.label,
    narratives: cat.dimensions.map(dim => getInterpretation(dim, dimensionRaw[dim] ?? 0)),
  }))
}

/**
 * Narasi bahasa awam per kategori untuk hasil Capture Work Style (Layer 2) satu nanny.
 * Dipakai di luar getPsikotesInfo (mis. email hasil Undangan Psikotes ke parent untuk
 * nanny off-platform yang belum tentu punya MatchResult).
 */
export async function getPsikotesCategories(nannyProfileId: string): Promise<PsikotesCategoryResult[] | null> {
  const result = await prisma.assessmentResult.findFirst({
    where: { nannyProfileId, layer: "LAYER_2", testType: "Capture Work Style" },
    orderBy: { issuedAt: "desc" },
    select: { rawScores: true },
  })
  return result ? categoriesFromRawScores(result.rawScores) : null
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
export async function getPsikotesInfo(
  nannyProfileId: string,
  parentProfileId: string,
  psikotesUnlocked: boolean
): Promise<PsikotesInfo> {
  const [priceIDR, assessment] = await Promise.all([
    getEffectiveValue("ADDON_PSIKOTES_FEE_IDR"),
    prisma.assessmentResult.findFirst({
      where: { nannyProfileId, layer: "LAYER_2", testType: "Capture Work Style" },
      orderBy: { issuedAt: "desc" },
      select: { rawScores: true },
    }),
  ])

  if (!assessment) {
    const invitation = await prisma.psikotesInvitation.findFirst({
      where: { parentProfileId, nannyProfileId, status: { not: "COMPLETED" } },
      orderBy: { invitedAt: "desc" },
      select: { invitedAt: true },
    })
    return { available: false, unlocked: false, invitedAt: invitation?.invitedAt.toISOString() ?? null, priceIDR, categories: null }
  }

  if (!psikotesUnlocked) {
    return { available: true, unlocked: false, invitedAt: null, priceIDR, categories: null }
  }

  return { available: true, unlocked: true, invitedAt: null, priceIDR, categories: categoriesFromRawScores(assessment.rawScores) }
}
