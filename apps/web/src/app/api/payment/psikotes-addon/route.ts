import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createMayarInvoice } from "@/lib/mayar"
import { getEffectiveValue } from "@/lib/pricing-config"
import { NextResponse } from "next/server"

// POST /api/payment/psikotes-addon
// Body: { nannyProfileId: string }
// Buka hasil Psikotes AI (Layer 2 — Capture Work Style) untuk 1 nanny — checkout otomatis via Mayar.
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "PARENT") {
      return NextResponse.json({ success: false, error: "Hanya orang tua yang bisa membuka hasil psikotes" }, { status: 403 })
    }

    const body = (await request.json()) as { nannyProfileId?: string }
    const { nannyProfileId } = body
    if (!nannyProfileId) {
      return NextResponse.json({ success: false, error: "nannyProfileId diperlukan" }, { status: 400 })
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
      select: { id: true },
    })
    if (!parentProfile) {
      return NextResponse.json({ success: false, error: "Profil orang tua tidak ditemukan" }, { status: 404 })
    }

    const nanny = await prisma.nannyProfile.findUnique({
      where: { id: nannyProfileId },
      select: {
        id: true,
        fullName: true,
        assessmentResults: {
          where: { layer: "LAYER_2", testType: "Capture Work Style" },
          select: { id: true },
          take: 1,
        },
      },
    })
    if (!nanny) {
      return NextResponse.json({ success: false, error: "Profil nanny tidak ditemukan" }, { status: 404 })
    }
    if (nanny.assessmentResults.length === 0) {
      return NextResponse.json({ success: false, error: "Nanny ini belum mengisi Tes Sikap Kerja" }, { status: 400 })
    }

    const matchResult = await prisma.matchResult.findUnique({
      where: { parentProfileId_nannyProfileId: { parentProfileId: parentProfile.id, nannyProfileId } },
      select: { psikotesUnlocked: true },
    })
    if (!matchResult) {
      return NextResponse.json({ success: false, error: "Hitung kecocokan dengan nanny ini dulu sebelum membuka Psikotes AI" }, { status: 400 })
    }
    if (matchResult.psikotesUnlocked) {
      return NextResponse.json({ success: false, error: "Hasil Psikotes AI nanny ini sudah terbuka" }, { status: 400 })
    }

    // Idempotency: kembalikan paymentUrl yang sudah ada kalau masih PENDING dan belum expired
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        parentProfileId: parentProfile.id,
        nannyProfileId,
        type: "ADDON_PSIKOTES",
        status: "PENDING",
        expiredAt: { gt: new Date() },
      },
      select: { mayarPaymentUrl: true },
    })
    if (existingTransaction?.mayarPaymentUrl) {
      return NextResponse.json({ success: true, data: { paymentUrl: existingTransaction.mayarPaymentUrl } })
    }

    const nannyFirstName = nanny.fullName.split(" ")[0]
    const orderId = `PSIKOTES-${parentProfile.id.slice(-8).toUpperCase()}-${Date.now()}`
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    const priceIDR = await getEffectiveValue("ADDON_PSIKOTES_FEE_IDR")

    const invoice = await createMayarInvoice({
      orderId,
      amount: priceIDR,
      customerName: user.name ?? "Orang tua BundaYakin",
      customerEmail: user.email,
      customerPhone: normalizedPhone,
      itemName: `Psikotes AI — ${nannyFirstName}`,
      description: "Buka hasil detail Tes Sikap Kerja nanny ini.",
      redirectUrl: `${appUrl}/dashboard/parent/cari-nanny/direktori?psikotes=success&nannyProfileId=${nannyProfileId}`,
    })

    await prisma.transaction.create({
      data: {
        parentProfileId: parentProfile.id,
        nannyProfileId,
        type: "ADDON_PSIKOTES",
        status: "PENDING",
        amountIDR: priceIDR,
        mayarInvoiceId: invoice.invoiceId,
        mayarPaymentUrl: invoice.paymentUrl,
        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        metadata: { nannyProfileId },
      },
    })

    console.info("[PAYMENT_PSIKOTES_ADDON]", orderId, parentProfile.id, nannyProfileId)

    return NextResponse.json({ success: true, data: { paymentUrl: invoice.paymentUrl } })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("[PAYMENT_PSIKOTES_ADDON] error:", msg)
    if (msg.startsWith("Mayar error")) {
      return NextResponse.json({ success: false, error: msg }, { status: 500 })
    }
    return NextResponse.json({ success: false, error: "Gagal membuat pembayaran" }, { status: 500 })
  }
}
