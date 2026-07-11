import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createMayarInvoice } from "@/lib/mayar"
import { createConsultationBooking, getConsultationPrice } from "@/lib/consultation"
import { isValidSlotTime } from "@/constants/consultation"
import { NextResponse } from "next/server"

// POST /api/consultation/book
// Body: { childProfileId, psikologId, bookingDate (YYYY-MM-DD), slotTime, screeningRecordId? }
// Checkout otomatis via Mayar untuk Konsultasi Psikolog Anak — mengikuti pola
// checkout add-on lain (lihat api/payment/connection-addon). psikologId sekarang
// wajib — kedua entry point booking (pilih psikolog dulu / pilih tanggal dulu)
// sama-sama sudah tahu psikolog mana sebelum konfirmasi (ADR-012, 11 Juli 2026).
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "PARENT") {
      return NextResponse.json({ success: false, error: "Hanya orang tua yang bisa memesan konsultasi" }, { status: 403 })
    }

    const body = (await request.json()) as {
      childProfileId?: string
      psikologId?: string
      bookingDate?: string
      slotTime?: string
      screeningRecordId?: string
    }
    const { childProfileId, psikologId, bookingDate: bookingDateStr, slotTime, screeningRecordId } = body

    if (!childProfileId || !psikologId || !bookingDateStr || !slotTime) {
      return NextResponse.json({ success: false, error: "Data booking tidak lengkap" }, { status: 400 })
    }
    if (!isValidSlotTime(slotTime)) {
      return NextResponse.json({ success: false, error: "Slot jam tidak valid" }, { status: 400 })
    }
    const bookingDate = new Date(bookingDateStr)
    if (Number.isNaN(bookingDate.getTime())) {
      return NextResponse.json({ success: false, error: "Tanggal tidak valid" }, { status: 400 })
    }
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    if (bookingDate < startOfToday) {
      return NextResponse.json({ success: false, error: "Tanggal tidak boleh di masa lalu" }, { status: 400 })
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

    const child = await prisma.childProfile.findUnique({
      where: { id: childProfileId },
      select: { id: true, name: true, parentProfileId: true },
    })
    if (!child || child.parentProfileId !== parentProfile.id) {
      return NextResponse.json({ success: false, error: "Profil anak tidak ditemukan" }, { status: 404 })
    }

    // Idempotency: kembalikan paymentUrl booking PENDING_PAYMENT yang sama persis kalau belum expired
    const existingBooking = await prisma.consultationBooking.findFirst({
      where: {
        parentProfileId: parentProfile.id,
        childProfileId: child.id,
        psikologId,
        bookingDate,
        slotTime,
        status: "PENDING_PAYMENT",
      },
      select: {
        transactionId: true,
      },
    })
    if (existingBooking?.transactionId) {
      const existingTx = await prisma.transaction.findUnique({
        where: { id: existingBooking.transactionId },
        select: { mayarPaymentUrl: true, expiredAt: true },
      })
      if (existingTx?.mayarPaymentUrl && existingTx.expiredAt && existingTx.expiredAt > new Date()) {
        return NextResponse.json({ success: true, data: { paymentUrl: existingTx.mayarPaymentUrl } })
      }
    }

    const sub = parentProfile.subscription
    const isSubscriber = sub?.status === "ACTIVE" && sub?.endDate != null && sub.endDate > new Date()
    const { level, priceIDR } = await getConsultationPrice(isSubscriber ?? false)

    const bookingResult = await createConsultationBooking({
      parentProfileId: parentProfile.id,
      childProfileId: child.id,
      psikologId,
      bookingDate,
      slotTime,
      priceIDR,
      level,
      sourceScreeningId: screeningRecordId ?? null,
    })
    if (!bookingResult.ok) {
      return NextResponse.json({ success: false, error: bookingResult.error }, { status: 409 })
    }

    const childFirstName = child.name.split(" ")[0]
    const orderId = `CONSULT-${parentProfile.id.slice(-8).toUpperCase()}-${Date.now()}`
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

    try {
      const invoice = await createMayarInvoice({
        orderId,
        amount: priceIDR,
        customerName: user.name ?? "Orang tua BundaYakin",
        customerEmail: user.email,
        customerPhone: normalizedPhone,
        itemName: `Konsultasi Psikolog Anak — ${childFirstName}`,
        description: "Sesi konsultasi didampingi psikolog HCC.",
        redirectUrl: `${appUrl}/dashboard/parent/children/${child.id}/consultation?booking=success`,
      })

      const transaction = await prisma.transaction.create({
        data: {
          parentProfileId: parentProfile.id,
          type: "CONSULTATION_PSIKOLOG_ANAK",
          status: "PENDING",
          amountIDR: priceIDR,
          mayarInvoiceId: invoice.invoiceId,
          mayarPaymentUrl: invoice.paymentUrl,
          expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          metadata: { bookingId: bookingResult.bookingId, childProfileId: child.id },
        },
      })

      await prisma.consultationBooking.update({
        where: { id: bookingResult.bookingId },
        data: { transactionId: transaction.id },
      })

      console.info("[CONSULTATION_BOOK]", orderId, parentProfile.id, bookingResult.bookingId)

      return NextResponse.json({ success: true, data: { paymentUrl: invoice.paymentUrl } })
    } catch (invoiceError) {
      // Gagal buat invoice/transaction — batalkan booking supaya slot tidak terkunci selamanya
      await prisma.consultationBooking.update({
        where: { id: bookingResult.bookingId },
        data: { status: "CANCELLED" },
      })
      throw invoiceError
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("[CONSULTATION_BOOK] error:", msg)
    if (msg.startsWith("Mayar error")) {
      return NextResponse.json({ success: false, error: msg }, { status: 500 })
    }
    return NextResponse.json({ success: false, error: "Gagal membuat pembayaran" }, { status: 500 })
  }
}
