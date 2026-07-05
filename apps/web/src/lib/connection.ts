import { prisma } from "@/lib/prisma"

export type ConnectionFlow = "REFERRAL" | "TALENT_POOL"

/**
 * Buka kontak nanny untuk satu parent — dipakai oleh unlock berbasis kuota
 * (api/matching/unlock) maupun setelah pembayaran Connection Add-on sukses
 * (webhook Mayar). `quotaUsed` membedakan sumbernya untuk pelaporan/analitik,
 * bukan untuk validasi (validasi kuota/pembayaran dilakukan oleh pemanggil).
 */
export async function unlockNannyContact(
  parentProfileId: string,
  nannyProfileId: string,
  flowType: ConnectionFlow,
  opts: { quotaUsed: boolean; at?: Date }
) {
  const now = opts.at ?? new Date()

  const matchingResult = await prisma.matchingResult.findFirst({
    where: { nannyProfileId, matchingRequest: { parentProfileId } },
    select: { scoreOverall: true },
  })
  const skorKeseluruhan = Math.round(matchingResult?.scoreOverall ?? 0)

  await prisma.matchResult.upsert({
    where: { parentProfileId_nannyProfileId: { parentProfileId, nannyProfileId } },
    create: {
      parentProfileId,
      nannyProfileId,
      skorKeseluruhan,
      kontakTerbuka: true,
      flowType,
      quotaUsed: opts.quotaUsed,
      koneksiDilakukanAt: now,
    },
    update: {
      kontakTerbuka: true,
      flowType,
      quotaUsed: opts.quotaUsed,
      koneksiDilakukanAt: now,
    },
  })
}

/** Halaman tujuan redirect Mayar setelah Connection Add-on dibayar — konsisten
 * dengan tempat tombol unlock dipanggil (matching detail untuk Jalur A/REFERRAL,
 * profil nanny untuk Jalur B/TALENT_POOL — termasuk saat dibuka dari drawer). */
export function connectionAddonReturnPath(
  flowType: ConnectionFlow,
  nannyProfileId: string,
  matchingRequestId?: string | null
): string {
  if (flowType === "REFERRAL" && matchingRequestId) {
    return `/dashboard/parent/matching/${matchingRequestId}?connection=success`
  }
  return `/dashboard/parent/nanny/${nannyProfileId}?connection=success`
}
