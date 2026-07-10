import { prisma } from "@/lib/prisma"
import { unstable_cache, revalidateTag } from "next/cache"
import type { PricingConfigKey } from "@prisma/client"
import {
  PRICING_CONFIG_KEYS,
  PRICING_CONFIG_LABEL,
  PRICING_CONFIG_UNIT,
} from "@/constants/pricing-config-meta"

// Re-export agar kode server yang sudah mengimpor dari file ini tidak perlu berubah.
export { PRICING_CONFIG_KEYS, PRICING_CONFIG_LABEL, PRICING_CONFIG_UNIT }

// ============================================================
// PRICING CONFIG — Panel Konfigurasi Harga & Kuota (ADR-008)
//
// Prinsip: nilai baru HANYA berlaku maju (tidak retroaktif). Transaksi dan
// periode ConnectionQuota yang sudah dibuat menyimpan nilai/harga saat itu
// secara permanen (snapshot) — mengubah config di sini TIDAK mengubah data
// yang sudah ada, hanya mempengaruhi transaksi/periode BARU yang dibuat
// setelah tanggal efektif. Ini sama seperti kenaikan harga Google Workspace:
// pelanggan aktif tidak terpengaruh sampai masa langganannya berakhir dan
// mereka membayar/memperpanjang lagi.
// ============================================================

// Dipakai HANYA sebelum admin pernah mengatur sesuatu (bootstrap) — nilai
// asli yang sebelumnya hardcode di src/constants/pricing.ts & di kode terkait.
const DEFAULT_PRICING: Record<PricingConfigKey, number> = {
  SUBSCRIPTION_FEE_IDR: 500_000,
  PLACEMENT_FEE_IDR: 1_200_000,
  CONNECTION_ADDON_FEE_IDR: 100_000,
  REFERRAL_QUOTA: 3,
  TALENT_POOL_QUOTA: 7,
  CONSULTATION_JUNIOR_FEE_IDR: 500_000,
  CONSULTATION_MID_FEE_IDR: 1_000_000,
  CONSULTATION_SENIOR_FEE_IDR: 2_000_000,
  CONSULTATION_CUSTOMER_FEE_IDR: 750_000,
}

const CACHE_TAG = "pricing-config"

async function fetchEffectiveValues(atISO: string): Promise<Record<PricingConfigKey, number>> {
  const at = new Date(atISO)
  const entries = await prisma.pricingConfigEntry.findMany({
    where: { cancelled: false, effectiveFrom: { lte: at } },
    orderBy: { effectiveFrom: "desc" },
    select: { key: true, value: true },
  })

  const result = { ...DEFAULT_PRICING }
  const seen = new Set<PricingConfigKey>()
  for (const entry of entries) {
    if (seen.has(entry.key)) continue // sudah dapat yang terbaru untuk key ini
    result[entry.key] = entry.value
    seen.add(entry.key)
  }
  return result
}

/**
 * Ambil semua nilai harga/kuota yang efektif pada waktu `at` (default: sekarang).
 * Di-cache singkat (60 detik) + tag `pricing-config` yang di-revalidate setiap
 * admin menjadwalkan/membatalkan perubahan — jadi tetap responsif tanpa query
 * berulang di setiap request pembayaran.
 */
export async function getEffectivePricing(at: Date = new Date()) {
  const cached = unstable_cache(fetchEffectiveValues, ["pricing-config-values"], {
    revalidate: 60,
    tags: [CACHE_TAG],
  })
  return cached(at.toISOString())
}

export async function getEffectiveValue(key: PricingConfigKey, at: Date = new Date()): Promise<number> {
  const all = await getEffectivePricing(at)
  return all[key]
}

// ── Admin: jadwalkan perubahan ────────────────────────────────────────────────

export type ScheduleChangeInput = {
  key: PricingConfigKey
  value: number
  effectiveFrom: Date
  reason: string
  createdByUserId: string
}

export type ScheduleChangeResult =
  | { ok: true; id: string }
  | { ok: false; error: string }

export async function scheduleConfigChange(input: ScheduleChangeInput): Promise<ScheduleChangeResult> {
  const { key, value, effectiveFrom, reason, createdByUserId } = input

  if (!PRICING_CONFIG_KEYS.includes(key)) {
    return { ok: false, error: "Item konfigurasi tidak valid" }
  }
  if (!Number.isInteger(value) || value <= 0) {
    return { ok: false, error: "Nilai harus angka bulat positif" }
  }
  if (PRICING_CONFIG_UNIT[key] === "COUNT" && value > 100) {
    return { ok: false, error: "Jumlah kuota tidak masuk akal (maks. 100)" }
  }
  if (!reason.trim()) {
    return { ok: false, error: "Alasan perubahan wajib diisi" }
  }

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  if (effectiveFrom.getTime() < startOfToday.getTime()) {
    return { ok: false, error: "Tanggal mulai berlaku tidak boleh di masa lalu" }
  }

  const entry = await prisma.pricingConfigEntry.create({
    data: {
      key,
      value,
      effectiveFrom,
      reason: reason.trim(),
      createdByUserId,
    },
    select: { id: true },
  })

  revalidateTag(CACHE_TAG)
  console.info("[PRICING_CONFIG] Dijadwalkan:", key, "→", value, "mulai", effectiveFrom.toISOString(), "oleh", createdByUserId)

  return { ok: true, id: entry.id }
}

export type CancelChangeResult = { ok: true } | { ok: false; error: string }

export async function cancelScheduledChange(entryId: string, cancelledByUserId: string): Promise<CancelChangeResult> {
  const entry = await prisma.pricingConfigEntry.findUnique({
    where: { id: entryId },
    select: { effectiveFrom: true, cancelled: true },
  })
  if (!entry) {
    return { ok: false, error: "Jadwal tidak ditemukan" }
  }
  if (entry.cancelled) {
    return { ok: false, error: "Jadwal ini sudah dibatalkan sebelumnya" }
  }
  if (entry.effectiveFrom.getTime() <= Date.now()) {
    return { ok: false, error: "Tidak bisa membatalkan perubahan yang sudah berlaku — ini prinsip tidak retroaktif" }
  }

  await prisma.pricingConfigEntry.update({
    where: { id: entryId },
    data: { cancelled: true, cancelledAt: new Date(), cancelledByUserId },
  })

  revalidateTag(CACHE_TAG)
  console.info("[PRICING_CONFIG] Dibatalkan:", entryId, "oleh", cancelledByUserId)

  return { ok: true }
}

// ── Admin: riwayat & jadwal per key (untuk UI) ────────────────────────────────

export async function listScheduleForKey(key: PricingConfigKey) {
  return prisma.pricingConfigEntry.findMany({
    where: { key },
    orderBy: { effectiveFrom: "desc" },
    select: {
      id: true,
      value: true,
      effectiveFrom: true,
      reason: true,
      cancelled: true,
      cancelledAt: true,
      createdAt: true,
      createdBy: { select: { name: true, email: true } },
      cancelledBy: { select: { name: true, email: true } },
    },
  })
}
