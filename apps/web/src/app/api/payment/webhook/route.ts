import { prisma } from "@/lib/prisma"
import {
  verifyMayarWebhookToken,
  isMayarPaymentSuccess,
  isMayarPaymentFailed,
  type MayarWebhookPayload,
} from "@/lib/mayar"
import { activatePlacement } from "@/lib/placement"
import { unlockNannyContact, type ConnectionFlow } from "@/lib/connection"
import { getEffectiveValue } from "@/lib/pricing-config"
import { logActivity } from "@/lib/activity"
import { getPsikotesCategories } from "@/lib/psikotes"
import { deliverPsikotesInviteResult } from "@/lib/psikotes-invitation"
import { sendWhatsAppMessage } from "@/lib/fonnte"
import { normalizePhone } from "@/lib/phone"
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
      } else if (transaction.type === "CONNECTION_ADDON") {
        await handleConnectionAddonSuccess(transaction, paidAt, paymentMethod ?? null, effectiveStatus)
      } else if (transaction.type === "CONSULTATION_PSIKOLOG_ANAK") {
        await handleConsultationSuccess(transaction, paidAt, paymentMethod ?? null, effectiveStatus)
      } else if (transaction.type === "ADDON_PSIKOTES") {
        await handlePsikotesAddonSuccess(transaction, paidAt, paymentMethod ?? null, effectiveStatus)
      } else if (transaction.type === "PSIKOTES_INVITE") {
        await handlePsikotesInviteSuccess(transaction, paidAt, paymentMethod ?? null, effectiveStatus)
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

      if (transaction.type === "CONSULTATION_PSIKOLOG_ANAK") {
        // Bebaskan slot yang sempat ditahan booking ini — pembayaran gagal/expired
        await prisma.consultationBooking.updateMany({
          where: { transactionId: transaction.id, status: "PENDING_PAYMENT" },
          data: { status: "CANCELLED" },
        })
      }

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

  // Kuota efektif HARI INI — diambil di luar transaksi DB (query cache terpisah)
  const talentPoolQuota = await getEffectiveValue("TALENT_POOL_QUOTA")

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
        data: { talentPoolLimit: talentPoolQuota },
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

// ── CONNECTION_ADDON success handler ──────────────────────────────────────────

type ConnectionAddonMeta = { nannyProfileId?: string; flowType?: ConnectionFlow }

async function handleConnectionAddonSuccess(
  transaction: { id: string; parentProfileId: string | null; metadata: unknown },
  paidAt: Date,
  paymentMethod: string | null,
  effectiveStatus: string
) {
  const meta = (transaction.metadata ?? {}) as ConnectionAddonMeta
  const { nannyProfileId, flowType } = meta

  if (!transaction.parentProfileId || !nannyProfileId || !flowType) {
    console.error("[WEBHOOK_CONNECTION_ADDON] metadata tidak lengkap, transactionId:", transaction.id)
    return
  }

  const parentProfile = await prisma.parentProfile.findUnique({
    where: { id: transaction.parentProfileId },
    select: { userId: true },
  })
  if (!parentProfile) {
    console.error("[WEBHOOK_CONNECTION_ADDON] parentProfile tidak ditemukan:", transaction.parentProfileId)
    return
  }

  await prisma.$transaction(async (tx) => {
    await tx.transaction.update({
      where: { id: transaction.id },
      data: { status: "SUCCESS", mayarStatus: effectiveStatus, paymentMethod, paidAt },
    })
  })

  // quotaUsed: false — ini pembelian berbayar, bukan pemakaian kuota bulanan
  await unlockNannyContact(transaction.parentProfileId, nannyProfileId, flowType, { quotaUsed: false, at: paidAt })

  await prisma.notification.create({
    data: {
      userId: parentProfile.userId,
      type: "PAYMENT",
      title: "Kontak nanny terbuka",
      body: "Pembayaran koneksi tambahan berhasil — kontak nanny sudah bisa dilihat.",
    },
  })

  revalidateTag(`parent-${parentProfile.userId}`)

  console.info("[WEBHOOK_CONNECTION_ADDON] Kontak terbuka:", transaction.parentProfileId, "→", nannyProfileId)
}

// ── CONSULTATION_PSIKOLOG_ANAK success handler ────────────────────────────────

async function handleConsultationSuccess(
  transaction: { id: string; parentProfileId: string | null; metadata: unknown },
  paidAt: Date,
  paymentMethod: string | null,
  effectiveStatus: string
) {
  const booking = await prisma.consultationBooking.findUnique({
    where: { transactionId: transaction.id },
    select: {
      id: true,
      status: true,
      psikolog: { select: { userId: true } },
      childProfile: { select: { name: true } },
      parentProfile: { select: { userId: true } },
    },
  })
  if (!booking) {
    console.error("[WEBHOOK_CONSULTATION] booking tidak ditemukan untuk transactionId:", transaction.id)
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: "SUCCESS", mayarStatus: effectiveStatus, paymentMethod, paidAt },
    })
    return
  }

  await prisma.$transaction([
    prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: "SUCCESS", mayarStatus: effectiveStatus, paymentMethod, paidAt },
    }),
    prisma.consultationBooking.update({
      where: { id: booking.id },
      data: { status: "CONFIRMED" },
    }),
  ])

  const childFirstName = booking.childProfile.name.split(" ")[0]

  await prisma.notification.createMany({
    data: [
      {
        userId: booking.parentProfile.userId,
        type: "PAYMENT",
        title: "Konsultasi terjadwal",
        body: `Pembayaran berhasil — sesi Konsultasi Psikolog Anak untuk ${childFirstName} sudah terjadwal.`,
      },
      {
        userId: booking.psikolog.userId,
        type: "CONSULTATION_BOOKING",
        title: "Sesi konsultasi baru",
        body: `Ada sesi konsultasi baru untuk ${childFirstName} yang perlu didampingi.`,
        link: "/dashboard/psikolog",
      },
    ],
  })

  revalidateTag(`parent-${booking.parentProfile.userId}`)

  console.info("[WEBHOOK_CONSULTATION] Booking dikonfirmasi:", booking.id)
}

// ── ADDON_PSIKOTES (Layer 2) success handler ──────────────────────────────────

type PsikotesAddonMeta = { nannyProfileId?: string }

async function handlePsikotesAddonSuccess(
  transaction: { id: string; parentProfileId: string | null; metadata: unknown },
  paidAt: Date,
  paymentMethod: string | null,
  effectiveStatus: string
) {
  const meta = (transaction.metadata ?? {}) as PsikotesAddonMeta
  const { nannyProfileId } = meta

  if (!transaction.parentProfileId || !nannyProfileId) {
    console.error("[WEBHOOK_PSIKOTES_ADDON] metadata tidak lengkap, transactionId:", transaction.id)
    return
  }

  const parentProfile = await prisma.parentProfile.findUnique({
    where: { id: transaction.parentProfileId },
    select: { userId: true },
  })
  if (!parentProfile) {
    console.error("[WEBHOOK_PSIKOTES_ADDON] parentProfile tidak ditemukan:", transaction.parentProfileId)
    return
  }

  await prisma.$transaction([
    prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: "SUCCESS", mayarStatus: effectiveStatus, paymentMethod, paidAt },
    }),
    prisma.matchResult.update({
      where: { parentProfileId_nannyProfileId: { parentProfileId: transaction.parentProfileId, nannyProfileId } },
      data: { psikotesUnlocked: true, psikotesUnlockedAt: paidAt },
    }),
  ])

  await prisma.notification.create({
    data: {
      userId: parentProfile.userId,
      type: "PAYMENT",
      title: "Hasil Psikotes AI terbuka",
      body: "Pembayaran berhasil — hasil detail Psikotes Karakter Kerja Nanny ini sudah bisa dilihat.",
    },
  })

  revalidateTag(`parent-${parentProfile.userId}`)

  console.info("[WEBHOOK_PSIKOTES_ADDON] Terbuka:", transaction.parentProfileId, "→", nannyProfileId)
}

// ── PSIKOTES_INVITE (ADR-014) success handler ──────────────────────────────────
// Dua jalur: nannyProfileId (nanny sudah terdaftar/match) atau nannyName+nannyPhone
// (nanny off-platform — mungkin ternyata sudah punya akun via nomor HP-nya).

type PsikotesInviteMeta = { nannyProfileId?: string; nannyName?: string; nannyPhone?: string }

async function handlePsikotesInviteSuccess(
  transaction: { id: string; parentProfileId: string | null; metadata: unknown },
  paidAt: Date,
  paymentMethod: string | null,
  effectiveStatus: string
) {
  const meta = (transaction.metadata ?? {}) as PsikotesInviteMeta

  if (!transaction.parentProfileId) {
    console.error("[WEBHOOK_PSIKOTES_INVITE] parentProfileId kosong, transactionId:", transaction.id)
    return
  }

  const parentProfile = await prisma.parentProfile.findUnique({
    where: { id: transaction.parentProfileId },
    select: { userId: true, fullName: true, user: { select: { email: true } } },
  })
  if (!parentProfile) {
    console.error("[WEBHOOK_PSIKOTES_INVITE] parentProfile tidak ditemukan:", transaction.parentProfileId)
    return
  }

  let nannyProfileId: string | null = null
  let nannyName: string
  let nannyPhone: string
  let alreadyDone = false
  let isNewShellAccount = false

  if (meta.nannyProfileId) {
    const nanny = await prisma.nannyProfile.findUnique({
      where: { id: meta.nannyProfileId },
      select: {
        fullName: true,
        user: { select: { phone: true } },
        assessmentResults: { where: { layer: "LAYER_2", testType: "Capture Work Style" }, select: { id: true }, take: 1 },
      },
    })
    if (!nanny) {
      console.error("[WEBHOOK_PSIKOTES_INVITE] nannyProfile tidak ditemukan:", meta.nannyProfileId)
      await prisma.transaction.update({ where: { id: transaction.id }, data: { status: "SUCCESS", mayarStatus: effectiveStatus, paymentMethod, paidAt } })
      return
    }
    nannyProfileId = meta.nannyProfileId
    nannyName = nanny.fullName
    nannyPhone = nanny.user?.phone ? normalizePhone(nanny.user.phone) : ""
    alreadyDone = nanny.assessmentResults.length > 0
  } else if (meta.nannyName && meta.nannyPhone) {
    // Nanny off-platform (ADR-017): cek dulu apakah nomor ini kebetulan sudah punya akun
    // Nanny — kalau ya, reuse (samakan dengan jalur nanny sudah match di atas). Kalau belum,
    // buat akun "shell" (nama+HP saja, tanpa password) LANGSUNG saat ini — TIDAK menunggu dia
    // mendaftar sendiri lewat Flow A/Referral (itu akan salah menjadikannya kandidat matching
    // & memotong Kuota Koneksi Bunda, lihat ADR-017).
    nannyName = meta.nannyName
    nannyPhone = meta.nannyPhone
    const existingUser = await prisma.user.findUnique({ where: { phone: nannyPhone }, select: { id: true, role: true } })

    if (existingUser && existingUser.role !== "NANNY") {
      console.error("[WEBHOOK_PSIKOTES_INVITE] nomor HP sudah dipakai akun non-NANNY, tidak bisa buat akun shell:", nannyPhone)
    } else if (existingUser) {
      const existingNanny = await prisma.nannyProfile.findUnique({
        where: { userId: existingUser.id },
        select: { id: true, fullName: true, assessmentResults: { where: { layer: "LAYER_2", testType: "Capture Work Style" }, select: { id: true }, take: 1 } },
      })
      if (existingNanny) {
        nannyProfileId = existingNanny.id
        nannyName = existingNanny.fullName
        alreadyDone = existingNanny.assessmentResults.length > 0
      }
    }

    if (!nannyProfileId && !(existingUser && existingUser.role !== "NANNY")) {
      const newUser = await prisma.user.create({
        data: { name: nannyName, phone: nannyPhone, role: "NANNY" },
        select: { id: true },
      })
      const newNanny = await prisma.nannyProfile.create({
        data: { userId: newUser.id, fullName: nannyName, openToJob: false, isAvailable: false, psikotesOnlyOnboarding: true },
        select: { id: true },
      })
      nannyProfileId = newNanny.id
      isNewShellAccount = true
    }
  } else {
    console.error("[WEBHOOK_PSIKOTES_INVITE] metadata tidak lengkap, transactionId:", transaction.id)
    await prisma.transaction.update({ where: { id: transaction.id }, data: { status: "SUCCESS", mayarStatus: effectiveStatus, paymentMethod, paidAt } })
    return
  }

  const status = alreadyDone ? "COMPLETED" : "WAITING_COMPLETION"

  await prisma.$transaction([
    prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: "SUCCESS", mayarStatus: effectiveStatus, paymentMethod, paidAt },
    }),
    prisma.psikotesInvitation.create({
      data: {
        parentProfileId: transaction.parentProfileId,
        transactionId: transaction.id,
        nannyProfileId,
        nannyName,
        nannyPhone,
        status,
        invitedAt: paidAt,
        completedAt: alreadyDone ? paidAt : null,
      },
    }),
    // updateMany (bukan update) karena nanny off-platform yang "kebetulan sudah selesai"
    // belum tentu punya MatchResult dengan parent ini — jangan lempar error kalau tidak ada.
    ...(alreadyDone && nannyProfileId
      ? [
          prisma.matchResult.updateMany({
            where: { parentProfileId: transaction.parentProfileId, nannyProfileId },
            data: { psikotesUnlocked: true, psikotesUnlockedAt: paidAt },
          }),
        ]
      : []),
  ])

  const nannyFirstName = nannyName.split(" ")[0]
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  if (status === "COMPLETED") {
    const categories = nannyProfileId ? await getPsikotesCategories(nannyProfileId) : null
    if (categories) {
      await deliverPsikotesInviteResult(transaction.parentProfileId, nannyName, categories)
    }
  } else if (status === "WAITING_COMPLETION") {
    if (!nannyPhone) {
      console.error("[WEBHOOK_PSIKOTES_INVITE] nanny tidak punya nomor HP terdaftar, tidak bisa kirim WA:", nannyProfileId)
    } else if (isNewShellAccount) {
      // Akun baru dibuat (ADR-017) — belum ada password. Kirim OTP + link "atur kata sandi"
      // (pola sama dengan alur lupa kata sandi yang sudah ada di /auth/forgot-password).
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      await prisma.otpToken.deleteMany({ where: { phone: nannyPhone, type: "RESET_OTP" } })
      await prisma.otpToken.create({
        data: { phone: nannyPhone, code, type: "RESET_OTP", expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
      })
      await sendWhatsAppMessage(
        nannyPhone,
        `Halo ${nannyFirstName}! ${parentProfile.fullName} (orang tua di BundaYakin) mengundang Anda mengerjakan Psikotes Karakter Kerja Nanny — gratis untuk Anda. Kami sudah siapkan akun untuk Anda.\n\nKode verifikasi: *${code}*\nAtur kata sandi Anda di sini: ${appUrl}/auth/forgot-password?phone=${nannyPhone}\n\nBerlaku 10 menit.`
      )
    } else {
      await sendWhatsAppMessage(
        nannyPhone,
        `Halo ${nannyFirstName}! ${parentProfile.fullName} (orang tua di BundaYakin) mengundang Anda mengerjakan Psikotes Karakter Kerja Nanny — gratis, 90 pertanyaan singkat tentang gaya kerja Anda.\n\nKerjakan di sini: ${appUrl}/dashboard/nanny/tes-sikap-kerja`
      )
    }
    await prisma.notification.create({
      data: {
        userId: parentProfile.userId,
        type: "PAYMENT",
        title: "Undangan Psikotes terkirim",
        body: nannyPhone
          ? `Undangan sudah dikirim ke ${nannyFirstName} via WhatsApp. Kami akan mengingatkan dia sampai selesai.`
          : `Undangan untuk ${nannyFirstName} tersimpan, tapi dia belum punya nomor HP terdaftar — WA pengingat belum bisa dikirim.`,
      },
    })
  }

  revalidateTag(`parent-${parentProfile.userId}`)

  console.info("[WEBHOOK_PSIKOTES_INVITE]", transaction.parentProfileId, "→", nannyName, status)
}
