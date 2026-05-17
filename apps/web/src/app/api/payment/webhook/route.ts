import { prisma } from "@/lib/prisma"
import {
  verifyMayarWebhook,
  isMayarPaymentSuccess,
  isMayarPaymentFailed,
  type MayarWebhookPayload,
} from "@/lib/mayar"
import { logActivity } from "@/lib/activity"
import { NextResponse } from "next/server"

// POST /api/payment/webhook
// Mayar mengirim notifikasi pembayaran ke sini.
// Tidak pakai session auth — divalidasi via HMAC-SHA256 signature Mayar.
// TODO: konfirmasi nama header signature dari dokumentasi Mayar.
export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature =
      request.headers.get("X-Mayar-Signature") ??
      request.headers.get("X-Signature") ??
      ""

    if (!verifyMayarWebhook(rawBody, signature)) {
      console.warn("[WEBHOOK] Invalid Mayar signature")
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 403 })
    }

    const notif = JSON.parse(rawBody) as MayarWebhookPayload
    const { status, paymentMethod } = notif

    const transaction = await prisma.transaction.findUnique({
      where: { mayarInvoiceId: notif.id },
      select: { id: true, subscriptionId: true, status: true, type: true, parentProfileId: true },
    })
    if (!transaction) {
      console.warn("[WEBHOOK] Transaction not found, invoiceId:", notif.id)
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 })
    }

    if (transaction.status === "SUCCESS") {
      return NextResponse.json({ success: true, data: { message: "Already processed" } })
    }

    if (isMayarPaymentSuccess(status)) {
      const now = new Date()
      const paidAt = notif.paidAt ? new Date(notif.paidAt) : now

      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "SUCCESS",
          mayarStatus: status,
          paymentMethod: paymentMethod ?? null,
          paidAt,
        },
      })

      if (transaction.type === "SUBSCRIPTION" && transaction.subscriptionId) {
        const oneYearLater = new Date(paidAt)
        oneYearLater.setFullYear(oneYearLater.getFullYear() + 1)

        const sub = await prisma.subscription.update({
          where: { id: transaction.subscriptionId },
          data: { status: "ACTIVE", startDate: paidAt, endDate: oneYearLater },
          select: { parentProfile: { select: { userId: true, id: true } } },
        })

        await logActivity({
          userId: sub.parentProfile.userId,
          action: "SUBSCRIPTION_ACTIVATED",
          entity: "Subscription",
          entityId: transaction.subscriptionId,
          metadata: { invoiceId: notif.id, paymentMethod },
        })

        // Buka talentPoolLimit untuk periode aktif setelah berlangganan
        const activePeriod = await prisma.connectionQuota.findFirst({
          where: { parentProfileId: sub.parentProfile.id, periodEnd: { gt: now } },
          orderBy: { periodEnd: "desc" },
        })
        if (activePeriod && activePeriod.talentPoolLimit === 0) {
          await prisma.connectionQuota.update({
            where: { id: activePeriod.id },
            data: { talentPoolLimit: 7 },
          })
        }
      }

      console.info("[WEBHOOK] Payment SUCCESS:", notif.id, transaction.type)
    } else if (isMayarPaymentFailed(status)) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: status === "expired" ? "EXPIRED" : "FAILED",
          mayarStatus: status,
        },
      })
      console.info("[WEBHOOK] Payment FAILED:", notif.id, status)
    } else {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { mayarStatus: status },
      })
      console.info("[WEBHOOK] Payment PENDING:", notif.id, status)
    }

    // Selalu return 200 ke Mayar agar tidak ada retry yang tidak perlu
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[WEBHOOK]", error)
    return NextResponse.json({ success: false, error: "Internal error" })
  }
}
