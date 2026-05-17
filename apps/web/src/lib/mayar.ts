// ============================================================
// MAYAR PAYMENT GATEWAY
// Dokumentasi: https://mayar.id/docs (perlu dikonfirmasi dengan tim Mayar)
// Menggantikan Midtrans Snap sejak 17 Mei 2026
// ============================================================

import { createHmac } from "crypto"

const API_KEY = process.env.MAYAR_API_KEY ?? ""
const MAYAR_BASE = "https://api.mayar.id/hl/v1"

function authHeader() {
  return `Bearer ${API_KEY}`
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type MayarInvoiceParams = {
  orderId: string        // ID unik dari sistem kita
  amount: number         // IDR
  customerName: string
  customerEmail: string
  customerPhone?: string
  itemName: string
  description?: string
}

export type MayarWebhookPayload = {
  id: string
  status: string         // "paid" | "pending" | "expired" | "failed"
  amount: number
  referenceId: string    // orderId yang kita kirim
  paidAt?: string
  paymentMethod?: string
}

// ── Functions ─────────────────────────────────────────────────────────────────

/**
 * Buat payment invoice di Mayar dan dapatkan payment URL.
 * Gantikan createSnapToken dari Midtrans.
 * TODO: Sesuaikan endpoint dan struktur body dengan dokumentasi Mayar terbaru.
 */
export async function createMayarInvoice(params: MayarInvoiceParams): Promise<{
  invoiceId: string
  paymentUrl: string
}> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  const body = {
    name: params.itemName,
    amount: params.amount,
    description: params.description ?? params.itemName,
    customer: {
      name: params.customerName,
      email: params.customerEmail,
      phone: params.customerPhone,
    },
    redirectUrl: `${appUrl}/dashboard/parent/subscription?payment=finish`,
    referenceId: params.orderId,
  }

  const res = await fetch(`${MAYAR_BASE}/payment/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Mayar error ${res.status}: ${errText}`)
  }

  const data = await res.json()

  // TODO: Sesuaikan field ini dengan response aktual Mayar API
  return {
    invoiceId: data.data?.id ?? data.id,
    paymentUrl: data.data?.paymentUrl ?? data.paymentUrl,
  }
}

/**
 * Verifikasi signature webhook Mayar.
 * TODO: Implementasi sesuai dokumentasi Mayar — ganti dengan logic aktual.
 */
export function verifyMayarWebhook(
  payload: string,
  signature: string
): boolean {
  const webhookSecret = process.env.MAYAR_WEBHOOK_SECRET ?? ""
  const expected = createHmac("sha256", webhookSecret)
    .update(payload)
    .digest("hex")
  return expected === signature
}

/** Mayar payment berhasil jika status "paid" */
export function isMayarPaymentSuccess(status: string): boolean {
  return status === "paid" || status === "settlement"
}

/** Mayar payment gagal jika status di bawah ini */
export function isMayarPaymentFailed(status: string): boolean {
  return status === "expired" || status === "failed" || status === "cancelled"
}
