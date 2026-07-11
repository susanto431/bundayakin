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
  "TALENT_POOL_CONTACT_FEE_IDR",
  "CONSULTATION_JUNIOR_FEE_IDR",
  "CONSULTATION_MID_FEE_IDR",
  "CONSULTATION_SENIOR_FEE_IDR",
  "CONSULTATION_CUSTOMER_FEE_IDR",
  "ADDON_PSIKOTES_FEE_IDR",
]

export const PRICING_CONFIG_LABEL: Record<PricingConfigKey, string> = {
  SUBSCRIPTION_FEE_IDR: "Langganan Tahunan",
  PLACEMENT_FEE_IDR: "Biaya Penempatan Nanny",
  CONNECTION_ADDON_FEE_IDR: "Connection Add-on — buka kontak Referral setelah kuota habis",
  REFERRAL_QUOTA: "Kuota Referral (per 30 hari, semua akun)",
  TALENT_POOL_QUOTA: "Kuota akses direktori Talent Pool (per 30 hari, khusus pelanggan)",
  TALENT_POOL_CONTACT_FEE_IDR: "Buka nomor WA nanny dari AI Talent Pool (selalu berbayar, per kontak)",
  CONSULTATION_JUNIOR_FEE_IDR: "Konsultasi Psikolog Anak — Junior (belum dijual)",
  CONSULTATION_MID_FEE_IDR: "Konsultasi Psikolog Anak — Mid (harga peluncuran, aktif dijual)",
  CONSULTATION_SENIOR_FEE_IDR: "Konsultasi Psikolog Anak — Senior (belum dijual)",
  CONSULTATION_CUSTOMER_FEE_IDR: "Konsultasi Psikolog Anak — Harga Pelanggan (berlaku untuk tarif Mid)",
  ADDON_PSIKOTES_FEE_IDR: "Psikotes AI (Layer 2) — buka hasil per nanny",
}

export const PRICING_CONFIG_UNIT: Record<PricingConfigKey, "IDR" | "COUNT"> = {
  SUBSCRIPTION_FEE_IDR: "IDR",
  PLACEMENT_FEE_IDR: "IDR",
  CONNECTION_ADDON_FEE_IDR: "IDR",
  REFERRAL_QUOTA: "COUNT",
  TALENT_POOL_QUOTA: "COUNT",
  TALENT_POOL_CONTACT_FEE_IDR: "IDR",
  CONSULTATION_JUNIOR_FEE_IDR: "IDR",
  CONSULTATION_MID_FEE_IDR: "IDR",
  CONSULTATION_SENIOR_FEE_IDR: "IDR",
  CONSULTATION_CUSTOMER_FEE_IDR: "IDR",
  ADDON_PSIKOTES_FEE_IDR: "IDR",
}
