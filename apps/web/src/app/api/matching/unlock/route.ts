import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { unlockNannyContact } from "@/lib/connection"
import { getEffectiveValue } from "@/lib/pricing-config"
import { revalidateTag } from "next/cache"
import { NextResponse } from "next/server"

// POST /api/matching/unlock
// Body: { nannyProfileId: string, flowType: "REFERRAL" | "TALENT_POOL" }
// Buka kontak nanny menggunakan Kuota Koneksi (atau Jaminan Kecocokan).
// Kalau kuota habis: lihat api/payment/connection-addon untuk beli koneksi tambahan berbayar.
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "PARENT") {
      return NextResponse.json({ success: false, error: "Hanya orang tua yang bisa membuka kontak nanny" }, { status: 403 })
    }

    const body = (await request.json()) as { nannyProfileId?: string; flowType?: string }
    const { nannyProfileId } = body
    const flowType = body.flowType as "REFERRAL" | "TALENT_POOL"

    if (!nannyProfileId) {
      return NextResponse.json({ success: false, error: "nannyProfileId diperlukan" }, { status: 400 })
    }
    if (!["REFERRAL", "TALENT_POOL"].includes(flowType)) {
      return NextResponse.json({ success: false, error: "flowType tidak valid" }, { status: 400 })
    }

    const parentProfile = await prisma.parentProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!parentProfile) {
      return NextResponse.json({ success: false, error: "Profil orang tua tidak ditemukan" }, { status: 404 })
    }

    // Cek apakah kontak sudah terbuka
    const existing = await prisma.matchResult.findUnique({
      where: { parentProfileId_nannyProfileId: { parentProfileId: parentProfile.id, nannyProfileId } },
      select: { id: true, kontakTerbuka: true },
    })
    if (existing?.kontakTerbuka) {
      return NextResponse.json({ success: true, data: { unlocked: true, alreadyOpen: true } })
    }

    const nanny = await prisma.nannyProfile.findUnique({
      where: { id: nannyProfileId },
      select: { id: true, openToJob: true },
    })
    if (!nanny) {
      return NextResponse.json({ success: false, error: "Profil nanny tidak ditemukan" }, { status: 404 })
    }
    if (!nanny.openToJob) {
      return NextResponse.json({ success: false, error: "Nanny tidak sedang mencari keluarga" }, { status: 400 })
    }

    const now = new Date()

    // Jaminan Kecocokan (PRD 06 §5): pemegang jaminan aktif membuka kontak TANPA memakai kuota
    const activeGuarantee = await prisma.matchGuarantee.findFirst({
      where: { parentProfileId: parentProfile.id, status: "AVAILABLE" },
      select: { id: true },
    })
    const viaGuarantee = activeGuarantee != null

    // Cek status langganan
    const sub = await prisma.subscription.findUnique({
      where: { parentProfileId: parentProfile.id },
      select: { status: true, endDate: true },
    })
    const isSubscriber = sub?.status === "ACTIVE" && sub?.endDate != null && sub.endDate > now

    // Cek atau buat ConnectionQuota periode aktif
    let quota = await prisma.connectionQuota.findFirst({
      where: { parentProfileId: parentProfile.id, periodEnd: { gt: now } },
      orderBy: { periodEnd: "desc" },
    })
    if (!quota) {
      const periodEnd = new Date(now)
      periodEnd.setDate(periodEnd.getDate() + 30)
      // Kuota efektif HARI INI (Pricing Config Panel) — periode yang sudah ada
      // sebelumnya tidak berubah walau kuota diubah nanti (dikunci saat dibuat).
      const referralLimit = await getEffectiveValue("REFERRAL_QUOTA")
      const talentPoolLimit = isSubscriber ? await getEffectiveValue("TALENT_POOL_QUOTA") : 0
      quota = await prisma.connectionQuota.create({
        data: {
          parentProfileId: parentProfile.id,
          periodStart: now,
          periodEnd,
          referralLimit,
          talentPoolLimit,
        },
      })
    }

    // Validasi ketersediaan kuota — dilewati jika via Jaminan Kecocokan
    if (!viaGuarantee) {
      if (flowType === "REFERRAL" && quota.referralUsed >= quota.referralLimit) {
        return NextResponse.json(
          { success: false, error: "Kuota referral habis untuk periode ini", code: "QUOTA_EXHAUSTED" },
          { status: 400 }
        )
      }
      if (flowType === "TALENT_POOL") {
        // Buka nomor WA dari AI Talent Pool SELALU berbayar per kontak (Rp 250rb,
        // TALENT_POOL_CONTACT_FEE_IDR) — tidak pernah gratis lewat kuota, kecuali
        // Jaminan Kecocokan (viaGuarantee, sudah dicek di atas). Lihat api/payment/connection-addon.
        return NextResponse.json(
          { success: false, error: "Buka kontak Talent Pool memerlukan pembayaran terpisah", code: "PAYMENT_REQUIRED" },
          { status: 403 }
        )
      }
    }

    // Buka kontak — create atau update MatchResult (helper dipakai bersama dengan Connection Add-on)
    await unlockNannyContact(parentProfile.id, nannyProfileId, flowType, { quotaUsed: !viaGuarantee, at: now })

    // Kurangi kuota — kecuali via Jaminan Kecocokan
    if (!viaGuarantee) {
      await prisma.connectionQuota.update({
        where: { id: quota.id },
        data:
          flowType === "REFERRAL"
            ? { referralUsed: quota.referralUsed + 1 }
            : { talentPoolUsed: quota.talentPoolUsed + 1 },
      })
    }

    const remaining = viaGuarantee
      ? (flowType === "REFERRAL" ? quota.referralLimit - quota.referralUsed : quota.talentPoolLimit - quota.talentPoolUsed)
      : (flowType === "REFERRAL"
          ? quota.referralLimit - quota.referralUsed - 1
          : quota.talentPoolLimit - quota.talentPoolUsed - 1)

    revalidateTag(`parent-${session.user.id}`)
    console.info("[UNLOCK]", parentProfile.id, "→", nannyProfileId, flowType, `remaining=${remaining}`, viaGuarantee ? "(jaminan)" : "")

    return NextResponse.json({ success: true, data: { unlocked: true, remaining, viaGuarantee } })
  } catch (error) {
    console.error("[UNLOCK]", error)
    return NextResponse.json({ success: false, error: "Gagal membuka kontak nanny" }, { status: 500 })
  }
}
