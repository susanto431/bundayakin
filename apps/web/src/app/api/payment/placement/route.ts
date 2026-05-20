import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createMayarInvoice } from "@/lib/mayar"
import { NextResponse } from "next/server"

const PLACEMENT_FEE_IDR = 1_200_000

// POST /api/payment/placement
// Orang tua konfirmasi penempatan nanny, memilih anak yang ditangani, dan membayar fee.
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "PARENT") {
      return NextResponse.json({ success: false, error: "Hanya orang tua yang bisa melakukan penempatan" }, { status: 403 })
    }

    const body = await request.json() as { matchingRequestId?: string; childIds?: string[] }

    if (!body.matchingRequestId) {
      return NextResponse.json({ success: false, error: "matchingRequestId diperlukan" }, { status: 400 })
    }
    if (!Array.isArray(body.childIds) || body.childIds.length === 0) {
      return NextResponse.json({ success: false, error: "Pilih minimal 1 anak yang akan dirawat" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, phone: true },
    })
    if (!user?.email) {
      return NextResponse.json({ success: false, error: "Email pengguna tidak ditemukan" }, { status: 400 })
    }

    const parentProfile = await prisma.parentProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        children: { select: { id: true } },
      },
    })
    if (!parentProfile) {
      return NextResponse.json({ success: false, error: "Profil orang tua tidak ditemukan" }, { status: 404 })
    }

    // Validasi matching request milik parent ini dan statusnya valid
    const matchingRequest = await prisma.matchingRequest.findUnique({
      where: { id: body.matchingRequestId },
      select: { id: true, parentProfileId: true, status: true, nannyProfile: { select: { fullName: true } } },
    })
    if (!matchingRequest || matchingRequest.parentProfileId !== parentProfile.id) {
      return NextResponse.json({ success: false, error: "Matching request tidak ditemukan" }, { status: 404 })
    }
    if (!["COMPLETED", "NEGOTIATING"].includes(matchingRequest.status)) {
      return NextResponse.json({ success: false, error: "Status matching tidak valid untuk penempatan" }, { status: 400 })
    }

    // Validasi semua childId milik parent ini
    const ownedChildIds = new Set(parentProfile.children.map(c => c.id))
    const invalidIds = body.childIds.filter(id => !ownedChildIds.has(id))
    if (invalidIds.length > 0) {
      return NextResponse.json({ success: false, error: "Satu atau lebih anak tidak valid" }, { status: 400 })
    }

    // Idempotency: kembalikan paymentUrl yang sudah ada kalau masih PENDING dan belum expired
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        parentProfileId: parentProfile.id,
        type: "PLACEMENT_FEE",
        status: "PENDING",
        expiredAt: { gt: new Date() },
        metadata: { path: ["matchingRequestId"], equals: body.matchingRequestId },
      },
      select: { mayarPaymentUrl: true },
    })
    if (existingTransaction?.mayarPaymentUrl) {
      return NextResponse.json({ success: true, data: { paymentUrl: existingTransaction.mayarPaymentUrl } })
    }

    const nannyFirstName = matchingRequest.nannyProfile?.fullName?.split(" ")[0] ?? "Nanny"
    const orderId = `PLACE-${parentProfile.id.slice(-8).toUpperCase()}-${Date.now()}`
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

    const invoice = await createMayarInvoice({
      orderId,
      amount: PLACEMENT_FEE_IDR,
      customerName: user.name ?? "Orang tua BundaYakin",
      customerEmail: user.email,
      customerPhone: user.phone ?? undefined,
      itemName: `Biaya Penempatan Nanny — ${nannyFirstName}`,
      description: `Penempatan nanny via BundaYakin. Termasuk bonus 3 bulan dan fee referral.`,
      redirectUrl: `${appUrl}/dashboard/parent?placement=success`,
    })

    await prisma.transaction.create({
      data: {
        parentProfileId: parentProfile.id,
        type: "PLACEMENT_FEE",
        status: "PENDING",
        amountIDR: PLACEMENT_FEE_IDR,
        mayarInvoiceId: invoice.invoiceId,
        mayarPaymentUrl: invoice.paymentUrl,
        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        metadata: {
          matchingRequestId: body.matchingRequestId,
          childIds: body.childIds,
        },
      },
    })

    console.info("[PAYMENT_PLACEMENT]", orderId, parentProfile.id, body.matchingRequestId)

    return NextResponse.json({ success: true, data: { paymentUrl: invoice.paymentUrl } })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("[PAYMENT_PLACEMENT] error:", msg)
    if (msg.startsWith("Mayar error")) {
      return NextResponse.json({ success: false, error: msg }, { status: 500 })
    }
    return NextResponse.json({ success: false, error: "Gagal membuat pembayaran penempatan" }, { status: 500 })
  }
}
