// ============================================================
// MAYAR PAYMENT GATEWAY
// Dokumentasi: https://docs.mayar.id/api-reference/introduction
// Menggantikan Midtrans Snap sejak 17 Mei 2026
// ============================================================

const API_KEY = process.env.MAYAR_API_KEY ?? ""
const MAYAR_BASE = "https://api.mayar.id/hl/v1"

function authHeader() {
  return `Bearer ${API_KEY}`
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type MayarInvoiceParams = {
  orderId: string
  amount: number         // IDR
  customerName: string
  customerEmail: string
  customerPhone?: string
  itemName: string
  description?: string
}

// Struktur payload webhook dari Mayar: { event, data: { ... } }
export type MayarWebhookPayload = {
  event: string
  data: {
    id: string
    transactionId?: string
    status: string            // "SUCCESS" | "FAILED" | "EXPIRED"
    transactionStatus: string // "paid" | "pending" | "expired"
    customerName?: string
    customerEmail?: string
    customerMobile?: string
    amount: number
    paymentMethod?: string | null
    createdAt?: string
    updatedAt?: string
  }
}

// ── Functions ─────────────────────────────────────────────────────────────────

/**
 * Buat payment request di Mayar dan dapatkan payment URL.
 * Response: { statusCode, messages, data: { id, transactionId, link } }
 */
export async function createMayarInvoice(params: MayarInvoiceParams): Promise<{
  invoiceId: string
  paymentUrl: string
}> {
  if (!API_KEY) throw new Error("Mayar error: MAYAR_API_KEY tidak dikonfigurasi di environment variables")

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  const body = {
    name: params.itemName,
    amount: params.amount,
    description: params.description ?? params.itemName,
    email: params.customerEmail,
    mobile: params.customerPhone,
    redirectURL: `${appUrl}/dashboard/parent/subscription?payment=finish`,
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

  const invoiceId = data.data?.id ?? data.id
  const paymentUrl = data.data?.link ?? data.link

  if (!paymentUrl) {
    throw new Error(`Mayar error: link tidak ada di response. Data: ${JSON.stringify(data).slice(0, 300)}`)
  }

  return { invoiceId: invoiceId ?? "", paymentUrl }
}

/**
 * Verifikasi token webhook dari query param ?token=...
 * Mayar tidak mengirim HMAC signature — gunakan URL token sebagai gantinya.
 * Daftarkan webhook URL: /api/payment/webhook?token=MAYAR_WEBHOOK_SECRET
 */
export function verifyMayarWebhookToken(token: string | null): boolean {
  const secret = process.env.MAYAR_WEBHOOK_SECRET ?? ""
  if (!secret) return true   // jika tidak dikonfigurasi, lewati (tidak aman untuk prod)
  return token === secret
}

/** Mayar payment berhasil jika data.status "SUCCESS" */
export function isMayarPaymentSuccess(status: string): boolean {
  return status === "SUCCESS" || status === "paid"
}

/** Mayar payment gagal jika data.status berikut */
export function isMayarPaymentFailed(status: string): boolean {
  return status === "FAILED" || status === "EXPIRED" || status === "expired" || status === "failed"
}
