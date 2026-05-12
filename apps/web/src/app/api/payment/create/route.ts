import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createSnapToken } from "@/lib/midtrans"
import { NextResponse } from "next/server"

const SUBSCRIPTION_AMOUNT = 500_000  // Rp 500.000/tahun

// POST /api/payment/create
// Creates a pending Transaction + Subscription record and returns a Midtrans snap_token.
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

    // Get or create ParentProfile
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

    // Upsert Subscription (each parent has exactly one)
    const subscription = await prisma.subscription.upsert({
      where: { parentProfileId: parentProfile.id },
      create: { parentProfileId: parentProfile.id },
      update: {},
      select: { id: true, status: true },
    })

    if (subscription.status === "ACTIVE") {
      return NextResponse.json({ success: false, error: "Langganan sudah aktif" }, { status: 400 })
    }

    // Build a unique order ID
    const orderId = `BUNDA-${parentProfile.id.slice(-8).toUpperCase()}-${Date.now()}`

    // Get Snap token from Midtrans
    const snapToken = await createSnapToken({
      orderId,
      amount: SUBSCRIPTION_AMOUNT,
      customerName: user.name ?? "Orang tua BundaYakin",
      customerEmail: user.email,
      itemName: "Langganan BundaYakin 1 Tahun",
    })

    // Persist Transaction with PENDING status
    await prisma.transaction.create({
      data: {
        subscriptionId: subscription.id,
        parentProfileId: parentProfile.id,
        type: "SUBSCRIPTION",
        status: "PENDING",
        amountIDR: SUBSCRIPTION_AMOUNT,
        midtransOrderId: orderId,
        midtransToken: snapToken,
        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 jam
      },
    })

    console.info("[PAYMENT_CREATE]", orderId, parentProfile.id)

    return NextResponse.json({ success: true, data: { snapToken, orderId } })
  } catch (error) {
    console.error("[PAYMENT_CREATE]", error)
    return NextResponse.json({ success: false, error: "Gagal membuat pembayaran" }, { status: 500 })
  }
}
