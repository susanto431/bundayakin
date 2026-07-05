import type { PricingConfigKey } from "@prisma/client"

// Metadata client-safe untuk Pricing Config Panel — dipisah dari
// src/lib/pricing-config.ts (yang berisi kode server/Prisma) agar bisa
// diimpor langsung oleh komponen "use client" tanpa membawa Prisma ke bundle.

export const PRICING_CONFIG_KEYS: PricingConfigKey[] = [
  "SUBSCRIPTION_FEE_IDR",
  "PLACEMENT_FEE_IDR",
  "CONNECTION_ADDON_FEE_IDR",
  "REFERRAL_QUOTA",
  "TALENT_POOL_QUOTA",
]

export const PRICING_CONFIG_LABEL: Record<PricingConfigKey, string> = {
  SUBSCRIPTION_FEE_IDR: "Langganan Tahunan",
  PLACEMENT_FEE_IDR: "Biaya Penempatan Nanny",
  CONNECTION_ADDON_FEE_IDR: "Connection Add-on (per koneksi)",
  REFERRAL_QUOTA: "Kuota Referral (per 30 hari, semua akun)",
  TALENT_POOL_QUOTA: "Kuota Talent Pool (per 30 hari, khusus pelanggan)",
}

export const PRICING_CONFIG_UNIT: Record<PricingConfigKey, "IDR" | "COUNT"> = {
  SUBSCRIPTION_FEE_IDR: "IDR",
  PLACEMENT_FEE_IDR: "IDR",
  CONNECTION_ADDON_FEE_IDR: "IDR",
  REFERRAL_QUOTA: "COUNT",
  TALENT_POOL_QUOTA: "COUNT",
}
