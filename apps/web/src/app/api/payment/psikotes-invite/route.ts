import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createMayarInvoice } from "@/lib/mayar"
import { getEffectiveValue } from "@/lib/pricing-config"
import { normalizePhone } from "@/lib/phone"
import { NextResponse } from "next/server"

// POST /api/payment/psikotes-invite
// Body: { nannyProfileId: string } — nanny sudah terdaftar/match, belum isi Psikotes (tombol
//   "Kirim Undangan Psikotes" di NannyDetailDrawer)
// ATAU
// Body: { nannyName: string, nannyPhone: string } — nanny belum dikenal platform sama sekali
//   (PsikotesInviteForm, kartu "Kenal calon nanny di luar BundaYakin?")
//
// Satu harga (ADR-014, sinkron dengan ADDON_PSIKOTES_FEE_IDR) — checkout otomatis via Mayar.
// Reconciliation (siapa yang diundang, kapan selesai) terjadi di webhook (handlePsikotesInviteSuccess).
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "PARENT") {
      return NextResponse.json({ success: false, error: "Hanya orang tua yang bisa mengirim Undangan Psikotes" }, { status: 403 })
    }

    const body = (await request.json()) as { nannyProfileId?: string; nannyName?: string; nannyPhone?: string }

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
    const parentPhone = normalizePhone(user.phone)
    if (parentPhone.length < 10) {
      return NextResponse.json({ success: false, error: `Nomor HP tidak valid (${parentPhone.length} digit, minimal 10). Perbarui nomor HP di halaman profil.` }, { status: 400 })
    }

    const parentProfile = await prisma.parentProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })
    if (!parentProfile) {
      return NextResponse.json({ success: false, error: "Profil orang tua tidak ditemukan" }, { status: 404 })
    }

    const priceIDR = await getEffectiveValue("ADDON_PSIKOTES_FEE_IDR")
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

    // ── Jalur A: nanny sudah terdaftar/match ──────────────────────────────────
    if (body.nannyProfileId) {
      const nannyProfileId = body.nannyProfileId

      const nanny = await prisma.nannyProfile.findUnique({
        where: { id: nannyProfileId },
        select: {
          id: true,
          fullName: true,
          assessmentResults: { where: { layer: "LAYER_2", testType: "Capture Work Style" }, select: { id: true }, take: 1 },
        },
      })
      if (!nanny) {
        return NextResponse.json({ success: false, error: "Profil nanny tidak ditemukan" }, { status: 404 })
      }
      if (nanny.assessmentResults.length > 0) {
        return NextResponse.json({ success: false, error: "Nanny ini sudah mengerjakan Psikotes — gunakan tombol Lihat Hasil Psikotes" }, { status: 400 })
      }

      const matchResult = await prisma.matchResult.findUnique({
        where: { parentProfileId_nannyProfileId: { parentProfileId: parentProfile.id, nannyProfileId } },
        select: { psikotesUnlocked: true },
      })
      if (!matchResult) {
        return NextResponse.json({ success: false, error: "Hitung kecocokan dengan nanny ini dulu sebelum mengirim Undangan Psikotes" }, { status: 400 })
      }
      if (matchResult.psikotesUnlocked) {
        return NextResponse.json({ success: false, error: "Hasil Psikotes AI nanny ini sudah terbuka" }, { status: 400 })
      }

      const activeInvitation = await prisma.psikotesInvitation.findFirst({
        where: { parentProfileId: parentProfile.id, nannyProfileId, status: { not: "COMPLETED" } },
        select: { id: true },
      })
      if (activeInvitation) {
        return NextResponse.json({ success: false, error: "Undangan Psikotes untuk nanny ini sudah pernah dikirim, masih menunggu dia mengerjakan" }, { status: 400 })
      }

      const existingTransaction = await prisma.transaction.findFirst({
        where: { parentProfileId: parentProfile.id, nannyProfileId, type: "PSIKOTES_INVITE", status: "PENDING", expiredAt: { gt: new Date() } },
        select: { mayarPaymentUrl: true },
      })
      if (existingTransaction?.mayarPaymentUrl) {
        return NextResponse.json({ success: true, data: { paymentUrl: existingTransaction.mayarPaymentUrl } })
      }

      const nannyFirstName = nanny.fullName.split(" ")[0]
      const orderId = `PSIKOTES-INV-${parentProfile.id.slice(-8).toUpperCase()}-${Date.now()}`

      const invoice = await createMayarInvoice({
        orderId,
        amount: priceIDR,
        customerName: user.name ?? "Orang tua BundaYakin",
        customerEmail: user.email,
        customerPhone: parentPhone,
        itemName: `Undangan Psikotes — ${nannyFirstName}`,
        description: "Undang nanny ini mengerjakan Psikotes Karakter Kerja Nanny.",
        redirectUrl: `${appUrl}/dashboard/parent/cari-nanny/direktori?psikotes_invite=success&nannyProfileId=${nannyProfileId}`,
      })

      await prisma.transaction.create({
        data: {
          parentProfileId: parentProfile.id,
          nannyProfileId,
          type: "PSIKOTES_INVITE",
          status: "PENDING",
          amountIDR: priceIDR,
          mayarInvoiceId: invoice.invoiceId,
          mayarPaymentUrl: invoice.paymentUrl,
          expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          metadata: { nannyProfileId },
        },
      })

      console.info("[PAYMENT_PSIKOTES_INVITE]", orderId, parentProfile.id, "→ matched nanny", nannyProfileId)
      return NextResponse.json({ success: true, data: { paymentUrl: invoice.paymentUrl } })
    }

    // ── Jalur B: nanny belum terdaftar di BundaYakin sama sekali ──────────────
    const nannyName = body.nannyName?.trim()
    const nannyPhoneRaw = body.nannyPhone?.trim()
    if (!nannyName || !nannyPhoneRaw) {
      return NextResponse.json({ success: false, error: "nannyProfileId atau (nannyName + nannyPhone) diperlukan" }, { status: 400 })
    }

    const nannyPhone = normalizePhone(nannyPhoneRaw)
    if (nannyPhone.length < 10) {
      return NextResponse.json({ success: false, error: "Nomor HP calon nanny tidak valid" }, { status: 400 })
    }

    const activeInvitation = await prisma.psikotesInvitation.findFirst({
      where: { parentProfileId: parentProfile.id, nannyPhone, status: { not: "COMPLETED" } },
      select: { id: true },
    })
    if (activeInvitation) {
      return NextResponse.json({ success: false, error: "Undangan Psikotes untuk nomor ini sudah pernah dikirim, masih menunggu diselesaikan" }, { status: 400 })
    }

    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        parentProfileId: parentProfile.id,
        type: "PSIKOTES_INVITE",
        status: "PENDING",
        expiredAt: { gt: new Date() },
        metadata: { path: ["nannyPhone"], equals: nannyPhone },
      },
      select: { mayarPaymentUrl: true },
    })
    if (existingTransaction?.mayarPaymentUrl) {
      return NextResponse.json({ success: true, data: { paymentUrl: existingTransaction.mayarPaymentUrl } })
    }

    const nannyFirstName = nannyName.split(" ")[0]
    const orderId = `PSIKOTES-INV-${parentProfile.id.slice(-8).toUpperCase()}-${Date.now()}`

    const invoice = await createMayarInvoice({
      orderId,
      amount: priceIDR,
      customerName: user.name ?? "Orang tua BundaYakin",
      customerEmail: user.email,
      customerPhone: parentPhone,
      itemName: `Undangan Psikotes — ${nannyFirstName}`,
      description: "Undang calon nanny (belum terdaftar) mengerjakan Psikotes Karakter Kerja Nanny.",
      redirectUrl: `${appUrl}/dashboard/parent/matching?psikotes_invite=success`,
    })

    await prisma.transaction.create({
      data: {
        parentProfileId: parentProfile.id,
        type: "PSIKOTES_INVITE",
        status: "PENDING",
        amountIDR: priceIDR,
        mayarInvoiceId: invoice.invoiceId,
        mayarPaymentUrl: invoice.paymentUrl,
        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        metadata: { nannyName, nannyPhone },
      },
    })

    console.info("[PAYMENT_PSIKOTES_INVITE]", orderId, parentProfile.id, "→ off-platform", nannyPhone)
    return NextResponse.json({ success: true, data: { paymentUrl: invoice.paymentUrl } })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("[PAYMENT_PSIKOTES_INVITE] error:", msg)
    if (msg.startsWith("Mayar error")) {
      return NextResponse.json({ success: false, error: msg }, { status: 500 })
    }
    return NextResponse.json({ success: false, error: "Gagal membuat pembayaran" }, { status: 500 })
  }
}
