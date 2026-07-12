import { prisma } from "@/lib/prisma"
import { sendWhatsAppMessage } from "@/lib/fonnte"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const maxDuration = 60

// GET /api/cron/psikotes-reminders
// Dipanggil harian oleh Vercel Cron (lihat vercel.json) — kirim pengingat WA ke nanny yang
// diundang tapi belum menyelesaikan Psikotes Karakter Kerja Nanny (ADR-014). Setiap hari
// sampai selesai (keputusan produk 12 Juli 2026) — tidak ada refund/expiry (ADR-014).
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  // Jaga-jaga kalau cron sempat retry/jalan dobel — jangan kirim 2x dalam <20 jam.
  const minGapMs = 20 * 60 * 60 * 1000

  const pending = await prisma.psikotesInvitation.findMany({
    where: {
      status: "WAITING_COMPLETION",
      nannyProfileId: { not: null },
      OR: [{ lastReminderAt: null }, { lastReminderAt: { lt: new Date(Date.now() - minGapMs) } }],
    },
    select: { id: true, nannyName: true, nannyPhone: true, nannyProfileId: true },
  })

  let sent = 0
  for (const inv of pending) {
    if (!inv.nannyPhone || !inv.nannyProfileId) continue

    const nanny = await prisma.nannyProfile.findUnique({
      where: { id: inv.nannyProfileId },
      select: { user: { select: { hashedPassword: true } } },
    })
    const nannyFirstName = inv.nannyName.split(" ")[0]
    let message: string

    if (!nanny?.user.hashedPassword) {
      // Akun shell (ADR-017) belum pernah atur kata sandi — kirim OTP baru + link set password
      // (pola sama dengan aktivasi pertama kali, lihat handlePsikotesInviteSuccess).
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      await prisma.otpToken.deleteMany({ where: { phone: inv.nannyPhone, type: "RESET_OTP" } })
      await prisma.otpToken.create({
        data: { phone: inv.nannyPhone, code, type: "RESET_OTP", expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
      })
      message = `Halo ${nannyFirstName}, pengingat dari BundaYakin — akun Anda untuk Psikotes Karakter Kerja Nanny masih menunggu kata sandi diatur.\n\nKode verifikasi: *${code}*\nAtur di sini: ${appUrl}/auth/forgot-password?phone=${inv.nannyPhone}\n\nBerlaku 10 menit.`
    } else {
      message = `Halo ${nannyFirstName}, pengingat dari BundaYakin — Psikotes Karakter Kerja Nanny (90 pertanyaan singkat tentang gaya kerja Anda) masih menunggu dikerjakan.\n\nKerjakan di sini: ${appUrl}/dashboard/nanny/tes-sikap-kerja`
    }

    const result = await sendWhatsAppMessage(inv.nannyPhone, message)
    if (result.success) {
      sent++
      await prisma.psikotesInvitation.update({
        where: { id: inv.id },
        data: { lastReminderAt: new Date(), reminderCount: { increment: 1 } },
      })
    } else {
      console.error("[CRON_PSIKOTES_REMINDERS] gagal kirim WA", inv.id, result.error)
    }
  }

  console.info("[CRON_PSIKOTES_REMINDERS] terkirim:", sent, "/", pending.length)
  return NextResponse.json({ success: true, data: { total: pending.length, sent } })
}
