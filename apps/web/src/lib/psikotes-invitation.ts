import { prisma } from "@/lib/prisma"
import { resend, EMAIL_FROM } from "@/lib/resend"
import { psikotesInviteResultHtml, psikotesInviteResultText } from "@/lib/emails/psikotes-invite-result"
import { getPsikotesCategories, type PsikotesCategoryResult } from "@/lib/psikotes"

// Email + notifikasi in-app ke SATU parent begitu hasil Psikotes nanny yang dia undang siap.
// Dipakai baik saat pembayaran Undangan Psikotes langsung "sudah selesai" (nanny kebetulan
// sudah isi tes duluan) maupun saat nanny baru menyelesaikan tesnya belakangan.
export async function deliverPsikotesInviteResult(
  parentProfileId: string,
  nannyName: string,
  categories: PsikotesCategoryResult[]
): Promise<void> {
  const parentProfile = await prisma.parentProfile.findUnique({
    where: { id: parentProfileId },
    select: { userId: true, fullName: true, user: { select: { email: true } } },
  })
  if (!parentProfile) return

  const nannyFirstName = nannyName.split(" ")[0]

  if (parentProfile.user.email) {
    resend.emails
      .send({
        from: EMAIL_FROM,
        to: parentProfile.user.email,
        subject: `Hasil Psikotes ${nannyFirstName} sudah siap`,
        html: psikotesInviteResultHtml(parentProfile.fullName, nannyName, categories),
        text: psikotesInviteResultText(parentProfile.fullName, nannyName, categories),
      })
      .catch(e => console.error("[PSIKOTES_INVITE] email gagal", e))
  }

  await prisma.notification.create({
    data: {
      userId: parentProfile.userId,
      type: "PAYMENT",
      title: "Hasil Psikotes AI terbuka",
      body: `${nannyFirstName} sudah menyelesaikan Psikotes Karakter Kerja Nanny — hasilnya sudah dikirim ke email Bunda.`,
    },
  })
}

// Dipanggil setelah nanny submit Capture Work Style (api/nanny/tes-sikap-kerja) — selesaikan
// SEMUA Undangan Psikotes yang menunggu nanny ini (bisa lebih dari satu parent mengundang nanny
// yang sama), buka MatchResult yang relevan (kalau ada), dan kirim hasil ke tiap parent tsb.
export async function resolvePsikotesInvitationsOnCompletion(nannyProfileId: string): Promise<void> {
  const invitations = await prisma.psikotesInvitation.findMany({
    where: { nannyProfileId, status: "WAITING_COMPLETION" },
    select: { id: true, parentProfileId: true, nannyName: true },
  })
  if (invitations.length === 0) return

  const now = new Date()

  await prisma.$transaction([
    prisma.psikotesInvitation.updateMany({
      where: { id: { in: invitations.map(i => i.id) } },
      data: { status: "COMPLETED", completedAt: now },
    }),
    // updateMany karena belum tentu semua parent yang mengundang punya MatchResult
    // dengan nanny ini (khusus jalur off-platform) — aman kalau 0 baris ter-update.
    prisma.matchResult.updateMany({
      where: { nannyProfileId, parentProfileId: { in: invitations.map(i => i.parentProfileId) } },
      data: { psikotesUnlocked: true, psikotesUnlockedAt: now },
    }),
  ])

  const categories = await getPsikotesCategories(nannyProfileId)
  if (!categories) return

  await Promise.all(invitations.map(inv => deliverPsikotesInviteResult(inv.parentProfileId, inv.nannyName, categories)))
}
