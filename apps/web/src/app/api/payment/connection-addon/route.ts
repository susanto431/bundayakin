import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createMayarInvoice } from "@/lib/mayar"
import { connectionAddonReturnPath, type ConnectionFlow } from "@/lib/connection"
import { EXTRA_CONNECTION_FEE_IDR } from "@/constants/pricing"
import { NextResponse } from "next/server"

// POST /api/payment/connection-addon
// Body: { nannyProfileId: string, flowType: "REFERRAL" | "TALENT_POOL", matchingRequestId?: string }
// Beli koneksi tambahan Rp 100rb saat Kuota Koneksi habis — checkout otomatis via Mayar
// (menggantikan jalur CS manual sebelumnya, keputusan Kartika Juli 2026).
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "PARENT") {
      return NextResponse.json({ success: false, error: "Hanya orang tua yang bisa membeli koneksi tambahan" }, { status: 403 })
    }

    const body = (await request.json()) as {
      nannyProfileId?: string
      flowType?: string
      matchingRequestId?: string
    }
    const { nannyProfileId, matchingRequestId } = body
    const flowType = body.flowType as ConnectionFlow

    if (!nannyProfileId) {
      return NextResponse.json({ success: false, error: "nannyProfileId diperlukan" }, { status: 400 })
    }
    if (!["REFERRAL", "TALENT_POOL"].includes(flowType)) {
      return NextResponse.json({ success: false, error: "flowType tidak valid" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, phone: true },
    })
    if (!user?.email) {
      return NextResponse.json({ success: false, error: "Email pengguna tidak ditemukan. Tambahkan email di halaman profil." }, { status: 400 })
    }
    if (!user.phone) {
      return NextResponse.json({ success: false, error: "Nomor HP diperlukan untuk pembayaran. Tambahkan nomor HP di halaman profil." }, { status: 400 })
    }
    const normalizedPhone = user.phone.replace(/\D/g, "").replace(/^0/, "62")
    if (normalizedPhone.length < 10) {
      return NextResponse.json({ success: false, error: `Nomor HP tidak valid (${normalizedPhone.length} digit, minimal 10). Perbarui nomor HP di halaman profil.` }, { status: 400 })
    }

    const parentProfile = await prisma.parentProfile.findUnique({
      where: { userId: user.id },
      select: { id: true, subscription: { select: { status: true, endDate: true } } },
    })
    if (!parentProfile) {
      return NextResponse.json({ success: false, error: "Profil orang tua tidak ditemukan" }, { status: 404 })
    }

    // Talent Pool tetap khusus pelanggan — add-on tidak boleh jadi jalan pintas melewati langganan
    if (flowType === "TALENT_POOL") {
      const sub = parentProfile.subscription
      const isSubscriber = sub?.status === "ACTIVE" && sub?.endDate != null && sub.endDate > new Date()
      if (!isSubscriber) {
        return NextResponse.json(
          { success: false, error: "Fitur Talent Pool memerlukan langganan aktif", code: "SUBSCRIPTION_REQUIRED" },
          { status: 403 }
        )
      }
    }

    const nanny = await prisma.nannyProfile.findUnique({
      where: { id: nannyProfileId },
      select: { id: true, fullName: true, openToJob: true },
    })
    if (!nanny) {
      return NextResponse.json({ success: false, error: "Profil nanny tidak ditemukan" }, { status: 404 })
    }
    if (!nanny.openToJob) {
      return NextResponse.json({ success: false, error: "Nanny tidak sedang mencari keluarga" }, { status: 400 })
    }

    const existingResult = await prisma.matchResult.findUnique({
      where: { parentProfileId_nannyProfileId: { parentProfileId: parentProfile.id, nannyProfileId } },
      select: { kontakTerbuka: true },
    })
    if (existingResult?.kontakTerbuka) {
      return NextResponse.json({ success: false, error: "Kontak nanny ini sudah terbuka" }, { status: 400 })
    }

    // Idempotency: kembalikan paymentUrl yang sudah ada kalau masih PENDING dan belum expired
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        parentProfileId: parentProfile.id,
        nannyProfileId,
        type: "CONNECTION_ADDON",
        status: "PENDING",
        expiredAt: { gt: new Date() },
      },
      select: { mayarPaymentUrl: true },
    })
    if (existingTransaction?.mayarPaymentUrl) {
      return NextResponse.json({ success: true, data: { paymentUrl: existingTransaction.mayarPaymentUrl } })
    }

    const nannyFirstName = nanny.fullName.split(" ")[0]
    const orderId = `CONN-${parentProfile.id.slice(-8).toUpperCase()}-${Date.now()}`
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    const returnPath = connectionAddonReturnPath(flowType, nannyProfileId, matchingRequestId)

    const invoice = await createMayarInvoice({
      orderId,
      amount: EXTRA_CONNECTION_FEE_IDR,
      customerName: user.name ?? "Orang tua BundaYakin",
      customerEmail: user.email,
      customerPhone: normalizedPhone,
      itemName: `Buka Kontak Nanny — ${nannyFirstName}`,
      description: "Koneksi tambahan setelah kuota bulanan habis.",
      redirectUrl: `${appUrl}${returnPath}`,
    })

    await prisma.transaction.create({
      data: {
        parentProfileId: parentProfile.id,
        nannyProfileId,
        type: "CONNECTION_ADDON",
        status: "PENDING",
        amountIDR: EXTRA_CONNECTION_FEE_IDR,
        mayarInvoiceId: invoice.invoiceId,
        mayarPaymentUrl: invoice.paymentUrl,
        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        metadata: { nannyProfileId, flowType, matchingRequestId: matchingRequestId ?? null },
      },
    })

    console.info("[PAYMENT_CONNECTION_ADDON]", orderId, parentProfile.id, nannyProfileId, flowType)

    return NextResponse.json({ success: true, data: { paymentUrl: invoice.paymentUrl } })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("[PAYMENT_CONNECTION_ADDON] error:", msg)
    if (msg.startsWith("Mayar error")) {
      return NextResponse.json({ success: false, error: msg }, { status: 500 })
    }
    return NextResponse.json({ success: false, error: "Gagal membuat pembayaran" }, { status: 500 })
  }
}
