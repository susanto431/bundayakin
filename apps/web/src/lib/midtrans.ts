import { createHash } from "crypto"

// ── Config ────────────────────────────────────────────────────────────────────

const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === "true"
const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY ?? ""

const SNAP_BASE_URL = IS_PRODUCTION
  ? "https://app.midtrans.com/snap/v1/transactions"
  : "https://app.sandbox.midtrans.com/snap/v1/transactions"

function authHeader(): string {
  return "Basic " + Buffer.from(`${SERVER_KEY}:`).toString("base64")
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type SnapTransactionParams = {
  orderId: string
  amount: number        // IDR
  customerName: string
  customerEmail: string
  itemName: string
}

export type MidtransNotification = {
  order_id: string
  transaction_id: string
  transaction_status: string  // "settlement" | "capture" | "pending" | "deny" | "expire" | "cancel"
  payment_type: string
  gross_amount: string
  status_code: string
  signature_key: string
  fraud_status?: string
  settlement_time?: string
}

// ── Functions ─────────────────────────────────────────────────────────────────

/** Call Midtrans Snap API and return a snap_token */
export async function createSnapToken(params: SnapTransactionParams): Promise<string> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  const body = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: params.amount,
    },
    item_details: [
      {
        id: "BUNDA_SUB_ANNUAL",
        price: params.amount,
        quantity: 1,
        name: params.itemName,
      },
    ],
    customer_details: {
      first_name: params.customerName,
      email: params.customerEmail,
    },
    callbacks: {
      finish: `${appUrl}/dashboard/parent/subscription?payment=finish`,
      error: `${appUrl}/dashboard/parent/subscription?payment=error`,
      pending: `${appUrl}/dashboard/parent/subscription?payment=pending`,
    },
  }

  const res = await fetch(SNAP_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Midtrans error ${res.status}: ${errText}`)
  }

  const data = (await res.json()) as { token: string; redirect_url: string }
  return data.token
}

/** Verify Midtrans webhook signature to prevent spoofed notifications */
export function verifyWebhookSignature(notif: MidtransNotification): boolean {
  const hash = createHash("sha512")
    .update(notif.order_id + notif.status_code + notif.gross_amount + SERVER_KEY)
    .digest("hex")
  return hash === notif.signature_key
}

/** Returns true when a Midtrans transaction_status means payment was received */
export function isPaymentSuccess(status: string, fraudStatus?: string): boolean {
  if (status === "capture") return fraudStatus === "accept" || fraudStatus === undefined
  return status === "settlement"
}

/** Returns true when the transaction has definitively failed */
export function isPaymentFailed(status: string): boolean {
  return status === "deny" || status === "expire" || status === "cancel"
}
