import { prisma } from "@/lib/prisma"
import {
  verifyWebhookSignature,
  isPaymentSuccess,
  isPaymentFailed,
  type MidtransNotification,
} from "@/lib/midtrans"
import { logActivity } from "@/lib/activity"
import { NextResponse } from "next/server"

// POST /api/payment/webhook
// Midtrans sends payment notifications here.
// No session auth — validated via Midtrans signature instead.
export async function POST(request: Request) {
  try {
    const notif = (await request.json()) as MidtransNotification

    // Verify signature to reject spoofed requests
    if (!verifyWebhookSignature(notif)) {
      console.warn("[WEBHOOK] Invalid signature for order:", notif.order_id)
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 403 })
    }

    const { order_id, transaction_status, payment_type, fraud_status } = notif

    // Find the transaction
    const transaction = await prisma.transaction.findUnique({
      where: { midtransOrderId: order_id },
      select: { id: true, subscriptionId: true, status: true },
    })
    if (!transaction) {
      console.warn("[WEBHOOK] Transaction not found:", order_id)
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 })
    }

    // Skip if already processed to prevent duplicate updates
    if (transaction.status === "SUCCESS") {
      return NextResponse.json({ success: true, data: { message: "Already processed" } })
    }

    if (isPaymentSuccess(transaction_status, fraud_status)) {
      const now = new Date()
      const oneYearLater = new Date(now)
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1)

      // Find full transaction details
      const fullTransaction = await prisma.transaction.findUnique({
        where: { id: transaction.id },
        select: { id: true, type: true, parentProfileId: true, nannyProfileId: true, subscriptionId: true, notes: true },
      })

      // Update transaction
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "SUCCESS",
          midtransStatus: transaction_status,
          paymentMethod: payment_type,
          paidAt: now,
        },
      })

      // Activate subscription
      if (fullTransaction?.type === "SUBSCRIPTION" && transaction.subscriptionId) {
        const sub = await prisma.subscription.update({
          where: { id: transaction.subscriptionId },
          data: { status: "ACTIVE", startDate: now, endDate: oneYearLater },
          select: { parentProfile: { select: { userId: true } } },
        })

        await logActivity({
          userId: sub.parentProfile.userId,
          action: "SUBSCRIPTION_ACTIVATED",
          entity: "Subscription",
          entityId: transaction.subscriptionId,
          metadata: { orderId: order_id, paymentType: payment_type },
        })
      }

      // Unlock nanny profile (LinkedIn mode)
      if (fullTransaction?.type === "NANNY_UNLOCK" && fullTransaction.parentProfileId && fullTransaction.nannyProfileId) {
        await prisma.unlockedNanny.upsert({
          where: {
            parentId_nannyId: {
              parentId: fullTransaction.parentProfileId,
              nannyId: fullTransaction.nannyProfileId,
            },
          },
          create: {
            parentId: fullTransaction.parentProfileId,
            nannyId: fullTransaction.nannyProfileId,
            amountIDR: 100_000,
          },
          update: {},
        })
        console.info("[WEBHOOK] Nanny unlocked:", fullTransaction.parentProfileId, "→", fullTransaction.nannyProfileId)
      }

      console.info("[WEBHOOK] Payment SUCCESS:", order_id)
    } else if (isPaymentFailed(transaction_status)) {
      const failStatus = transaction_status === "expire" ? "EXPIRED" : "FAILED"
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: failStatus, midtransStatus: transaction_status },
      })
      console.info("[WEBHOOK] Payment FAILED:", order_id, transaction_status)
    } else {
      // Pending — just log
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { midtransStatus: transaction_status },
      })
      console.info("[WEBHOOK] Payment PENDING:", order_id, transaction_status)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[WEBHOOK]", error)
    // Always return 200 to Midtrans — retries are not needed for internal errors
    return NextResponse.json({ success: false, error: "Internal error" })
  }
}
