import { prisma } from "@/lib/prisma"
import {
  verifyMayarWebhookToken,
  isMayarPaymentSuccess,
  isMayarPaymentFailed,
  type MayarWebhookPayload,
} from "@/lib/mayar"
import { logActivity } from "@/lib/activity"
import { revalidateTag } from "next/cache"
import { NextResponse } from "next/server"

// POST /api/payment/webhook
// Mayar mengirim notifikasi pembayaran ke sini.
// Keamanan: URL token via ?token=MAYAR_WEBHOOK_SECRET (Mayar tidak mengirim HMAC signature).
// Daftarkan webhook URL di dashboard Mayar: /api/payment/webhook?token=<MAYAR_WEBHOOK_SECRET>
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!verifyMayarWebhookToken(token)) {
      console.warn("[WEBHOOK] Invalid token")
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const rawBody = await request.text()
    const notif = JSON.parse(rawBody) as MayarWebhookPayload

    // Event "testing" dari dashboard Mayar — tidak perlu diproses
    if (notif.event === "testing") {
      console.info("[WEBHOOK] Test ping received")
      return NextResponse.json({ success: true })
    }

    const { status, transactionStatus, paymentMethod, id: invoiceId, updatedAt } = notif.data

    const transaction = await prisma.transaction.findUnique({
      where: { mayarInvoiceId: invoiceId },
      select: { id: true, subscriptionId: true, status: true, type: true, parentProfileId: true },
    })
    if (!transaction) {
      // Return 200 agar Mayar tidak retry — transaksi mungkin dari produk lain bukan subscription
      console.warn("[WEBHOOK] Transaction not found, invoiceId:", invoiceId)
      return NextResponse.json({ success: true })
    }

    if (transaction.status === "SUCCESS") {
      return NextResponse.json({ success: true, data: { message: "Already processed" } })
    }

    const effectiveStatus = status || transactionStatus

    if (isMayarPaymentSuccess(effectiveStatus)) {
      const now = new Date()
      const paidAt = updatedAt ? new Date(updatedAt) : now

      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "SUCCESS",
          mayarStatus: effectiveStatus,
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
          metadata: { invoiceId, paymentMethod },
        })
        revalidateTag(`parent-${sub.parentProfile.userId}`)

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

      console.info("[WEBHOOK] Payment SUCCESS:", invoiceId, transaction.type)
    } else if (isMayarPaymentFailed(effectiveStatus)) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: effectiveStatus.toUpperCase() === "EXPIRED" ? "EXPIRED" : "FAILED",
          mayarStatus: effectiveStatus,
        },
      })
      console.info("[WEBHOOK] Payment FAILED:", invoiceId, effectiveStatus)
    } else {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { mayarStatus: effectiveStatus },
      })
      console.info("[WEBHOOK] Payment PENDING:", invoiceId, effectiveStatus)
    }

    // Selalu return 200 ke Mayar agar tidak ada retry yang tidak perlu
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[WEBHOOK]", error)
    return NextResponse.json({ success: false, error: "Internal error" })
  }
}
