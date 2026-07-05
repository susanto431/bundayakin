import { cachedAuth } from "@/lib/auth-server"
import { getParentCariNanny } from "@/lib/queries/parent"
import { getEffectivePricing } from "@/lib/pricing-config"
import { d } from "@/lib/date"
import Link from "next/link"
import TalentPoolClient from "@/components/matching/TalentPoolClient"

export const metadata = { title: "AI Talent Pool — BundaYakin" }

export default async function CariNannyPage() {
  const session = await cachedAuth()
  const now = new Date()

  const profile = session?.user?.id
    ? await getParentCariNanny(session.user.id)
    : null

  const sub = profile?.subscription
  const isPaid = sub?.status === "ACTIVE" && sub?.endDate != null && d(sub.endDate)! > now
  const quota = profile?.connectionQuotas?.[0]
  const defaultQuota = await getEffectivePricing()
  const talentPoolRemaining = isPaid
    ? Math.max(0, (quota?.talentPoolLimit ?? defaultQuota.TALENT_POOL_QUOTA) - (quota?.talentPoolUsed ?? 0))
    : 0

  if (!isPaid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16" style={{ backgroundColor: "#FDFBFF" }}>
        <div className="w-full max-w-sm rounded-[24px] p-6 relative overflow-hidden" style={{ backgroundColor: "#5A3A7A" }}>
          <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-20" style={{ backgroundColor: "#A97CC4" }} />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full opacity-10" style={{ backgroundColor: "#5BBFB0" }} />
          <div className="relative z-10">
            <p className="text-[10px] font-bold tracking-[2px] uppercase mb-2" style={{ color: "#A8DDD8" }}>
              Fitur Pelanggan
            </p>
            <h1 className="text-[20px] font-bold text-white leading-tight mb-2">
              AI Talent Pool
            </h1>
            <p className="text-[13px] leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.65)" }}>
              Temukan nanny terverifikasi dengan skor kecocokan AI, filter lokasi & tipe kerja, dan buka kontak langsung — hanya untuk pelanggan aktif.
            </p>
            <Link
              href="/dashboard/parent/subscription"
              className="inline-flex items-center font-bold text-[14px] px-5 py-3 rounded-[12px] min-h-[48px] transition-all hover:opacity-90"
              style={{ backgroundColor: "#5BBFB0", color: "#fff" }}
            >
              Langganan Rp 500rb/tahun →
            </Link>
          </div>
        </div>
        {/* Escape route: jalur gratis tetap ditawarkan (usability walkthrough temuan #1) */}
        <div className="w-full max-w-sm mt-4 bg-white border border-[#E0D0F0] rounded-[16px] p-4 text-center">
          <p className="text-[13px] font-bold text-[#5A3A7A] mb-1">Belum siap berlangganan?</p>
          <p className="text-[13px] text-[#666666] leading-relaxed mb-3">
            Bunda tetap bisa mengundang nanny yang Bunda kenal untuk Tes Kecocokan — gratis 3× per 30 hari.
          </p>
          <Link
            href="/dashboard/parent/matching"
            className="inline-flex items-center justify-center w-full bg-transparent border-[1.5px] border-[#5BBFB0] text-[#2C5F5A] font-semibold text-[13px] min-h-[48px] rounded-[10px] hover:bg-[#E5F6F4] transition-all"
          >
            Undang nanny kenalan — gratis →
          </Link>
        </div>
        <p className="mt-5 text-[12px] text-center" style={{ color: "#999AAA" }}>
          Sudah langganan?{" "}
          <Link href="/dashboard/parent" className="underline" style={{ color: "#A97CC4" }}>
            Kembali ke dashboard
          </Link>
        </p>
      </div>
    )
  }

  const { prisma } = await import("@/lib/prisma")
  const guarantee = session?.user?.id
    ? await prisma.matchGuarantee.findFirst({
        where: { parentProfile: { userId: session.user.id }, status: "AVAILABLE" },
        select: { id: true },
      })
    : null

  return (
    <TalentPoolClient
      talentPoolRemaining={talentPoolRemaining}
      hasGuarantee={guarantee != null}
      connectionAddonFeeIDR={defaultQuota.CONNECTION_ADDON_FEE_IDR}
    />
  )
}
