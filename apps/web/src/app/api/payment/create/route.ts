import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createMayarInvoice } from "@/lib/mayar"
import { NextResponse } from "next/server"

const SUBSCRIPTION_AMOUNT = 500_000  // Rp 500.000/tahun

// POST /api/payment/create
// Membuat Transaction + Subscription pending, mengembalikan Mayar paymentUrl.
export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "PARENT") {
      return NextResponse.json({ success: false, error: "Hanya orang tua yang bisa berlangganan" }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true },
    })
    if (!user?.email) {
      return NextResponse.json({ success: false, error: "Email pengguna tidak ditemukan" }, { status: 400 })
    }

    let parentProfile = await prisma.parentProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })
    if (!parentProfile) {
      parentProfile = await prisma.parentProfile.create({
        data: { userId: user.id, fullName: user.name ?? "Orang tua" },
        select: { id: true },
      })
    }

    const subscription = await prisma.subscription.upsert({
      where: { parentProfileId: parentProfile.id },
      create: { parentProfileId: parentProfile.id },
      update: {},
      select: { id: true, status: true },
    })

    if (subscription.status === "ACTIVE") {
      return NextResponse.json({ success: false, error: "Langganan sudah aktif" }, { status: 400 })
    }

    const orderId = `BUNDA-${parentProfile.id.slice(-8).toUpperCase()}-${Date.now()}`

    const invoice = await createMayarInvoice({
      orderId,
      amount: SUBSCRIPTION_AMOUNT,
      customerName: user.name ?? "Orang tua BundaYakin",
      customerEmail: user.email,
      itemName: "Langganan BundaYakin 1 Tahun",
    })

    await prisma.transaction.create({
      data: {
        subscriptionId: subscription.id,
        parentProfileId: parentProfile.id,
        type: "SUBSCRIPTION",
        status: "PENDING",
        amountIDR: SUBSCRIPTION_AMOUNT,
        mayarInvoiceId: invoice.invoiceId,
        mayarPaymentUrl: invoice.paymentUrl,
        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })

    console.info("[PAYMENT_CREATE]", orderId, parentProfile.id)

    return NextResponse.json({ success: true, data: { paymentUrl: invoice.paymentUrl, invoiceId: invoice.invoiceId } })
  } catch (error) {
    console.error("[PAYMENT_CREATE]", error)
    return NextResponse.json({ success: false, error: "Gagal membuat pembayaran" }, { status: 500 })
  }
}
