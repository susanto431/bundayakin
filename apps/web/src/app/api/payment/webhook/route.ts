import { prisma } from "@/lib/prisma"
import {
  verifyMayarWebhookToken,
  isMayarPaymentSuccess,
  isMayarPaymentFailed,
  type MayarWebhookPayload,
} from "@/lib/mayar"
import { activatePlacement } from "@/lib/placement"
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

    const { status, transactionStatus, paymentMethod, id: paymentId, productId, updatedAt } = notif.data

    // Mayar mengirim data.id sebagai payment transaction ID,
    // sedangkan data.productId adalah ID invoice/produk yang kita buat (tersimpan sebagai mayarInvoiceId).
    const lookupId = productId ?? paymentId

    const transaction = await prisma.transaction.findUnique({
      where: { mayarInvoiceId: lookupId },
      select: { id: true, subscriptionId: true, status: true, type: true, parentProfileId: true, metadata: true },
    })
    if (!transaction) {
      // Return 200 agar Mayar tidak retry — transaksi mungkin dari produk lain
      console.warn("[WEBHOOK] Transaction not found, lookupId:", lookupId, "paymentId:", paymentId)
      return NextResponse.json({ success: true })
    }

    if (transaction.status === "SUCCESS") {
      return NextResponse.json({ success: true, data: { message: "Already processed" } })
    }

    const effectiveStatus = status || transactionStatus

    if (isMayarPaymentSuccess(effectiveStatus)) {
      const now = new Date()
      const paidAt = updatedAt ? new Date(updatedAt) : now

      if (transaction.type === "PLACEMENT_FEE") {
        // Atomic: update transaction + buat semua data assignment dalam satu DB transaction
        await handlePlacementFeeSuccess(transaction, paidAt, paymentMethod ?? null, effectiveStatus)
      } else if (transaction.type === "SUBSCRIPTION" && transaction.subscriptionId) {
        await handleSubscriptionSuccess(transaction, paidAt, paymentMethod ?? null, effectiveStatus, now)
      } else {
        // Tipe lain — cukup update status
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: "SUCCESS", mayarStatus: effectiveStatus, paymentMethod: paymentMethod ?? null, paidAt },
        })
      }

      console.info("[WEBHOOK] Payment SUCCESS:", lookupId, transaction.type)
    } else if (isMayarPaymentFailed(effectiveStatus)) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: effectiveStatus.toUpperCase() === "EXPIRED" ? "EXPIRED" : "FAILED",
          mayarStatus: effectiveStatus,
        },
      })
      console.info("[WEBHOOK] Payment FAILED:", lookupId, effectiveStatus)
    } else {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { mayarStatus: effectiveStatus },
      })
      console.info("[WEBHOOK] Payment PENDING:", lookupId, effectiveStatus)
    }

    // Selalu return 200 ke Mayar untuk event yang sudah ter-handle
    return NextResponse.json({ success: true })
  } catch (error) {
    // Unexpected error (DB down, dll) — return 500 agar Mayar retry
    console.error("[WEBHOOK]", error)
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 })
  }
}

// ── SUBSCRIPTION success handler ──────────────────────────────────────────────

async function handleSubscriptionSuccess(
  transaction: { id: string; subscriptionId: string | null; parentProfileId: string | null },
  paidAt: Date,
  paymentMethod: string | null,
  effectiveStatus: string,
  now: Date
) {
  const oneYearLater = new Date(paidAt)
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1)

  const sub = await prisma.$transaction(async (tx) => {
    await tx.transaction.update({
      where: { id: transaction.id },
      data: { status: "SUCCESS", mayarStatus: effectiveStatus, paymentMethod, paidAt },
    })

    const updated = await tx.subscription.update({
      where: { id: transaction.subscriptionId! },
      data: { status: "ACTIVE", startDate: paidAt, endDate: oneYearLater },
      select: { parentProfile: { select: { userId: true, id: true } } },
    })

    // Buka talentPoolLimit untuk periode aktif setelah berlangganan
    const activePeriod = await tx.connectionQuota.findFirst({
      where: { parentProfileId: updated.parentProfile.id, periodEnd: { gt: now } },
      orderBy: { periodEnd: "desc" },
    })
    if (activePeriod && activePeriod.talentPoolLimit === 0) {
      await tx.connectionQuota.update({
        where: { id: activePeriod.id },
        data: { talentPoolLimit: 7 },
      })
    }

    return updated
  })

  await logActivity({
    userId: sub.parentProfile.userId,
    action: "SUBSCRIPTION_ACTIVATED",
    entity: "Subscription",
    entityId: transaction.subscriptionId!,
    metadata: { paymentMethod },
  })
  revalidateTag(`parent-${sub.parentProfile.userId}`)
}

// ── PLACEMENT_FEE success handler ─────────────────────────────────────────────

type PlacementMeta = { matchingRequestId?: string; childIds?: string[] }

async function handlePlacementFeeSuccess(
  transaction: { id: string; parentProfileId: string | null; metadata: unknown },
  paidAt: Date,
  paymentMethod: string | null,
  effectiveStatus: string
) {
  const meta = (transaction.metadata ?? {}) as PlacementMeta
  const { matchingRequestId, childIds } = meta

  if (!matchingRequestId || !childIds || childIds.length === 0) {
    console.error("[WEBHOOK_PLACEMENT] metadata tidak lengkap, transactionId:", transaction.id)
    return
  }

  const result = await activatePlacement({
    matchingRequestId,
    childIds,
    startDate: paidAt,
    extraTx: async (tx) => {
      // Update transaction ke SUCCESS — di dalam DB transaction agar atomic
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { status: "SUCCESS", mayarStatus: effectiveStatus, paymentMethod, paidAt },
      })
    },
  })

  if (result.status === "ALREADY_ACCEPTED") {
    // Pastikan transaction juga ter-update kalau retry terjadi setelah partial failure
    await prisma.transaction.updateMany({
      where: { id: transaction.id, status: { not: "SUCCESS" } },
      data: { status: "SUCCESS", mayarStatus: effectiveStatus, paymentMethod, paidAt },
    })
    return
  }
  if (result.status === "NOT_FOUND") return

  revalidateTag(`parent-${result.parentUserId}`)
  revalidateTag(`nanny-${result.nannyUserId}`)

  console.info("[WEBHOOK_PLACEMENT] Assignment created for matchingRequest:", matchingRequestId)
}
