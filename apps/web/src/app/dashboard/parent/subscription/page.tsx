import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import MidtransButton from "@/components/payment/MidtransButton"
import CancelSubscriptionButton from "@/components/payment/CancelSubscriptionButton"

export const metadata = { title: "Langganan — BundaYakin" }

function formatDate(d: Date) {
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
}

const FEATURES = [
  "Survey matching 53 pertanyaan",
  "AI scoring kecocokan orang tua ↔ nanny",
  "Lihat persentase kecocokan per domain",
  "Insight area match & mismatch",
  "Check-in mingguan & evaluasi bulanan",
  "Monitoring nanny selama 1 tahun",
]

export default async function SubscriptionPage() {
  const session = await auth()

  let subStatus: string = "INACTIVE"
  let endDate: Date | null = null
  let startDate: Date | null = null

  if (session?.user?.id) {
    const parentProfile = await prisma.parentProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        subscription: {
          select: { status: true, startDate: true, endDate: true },
        },
      },
    })
    if (parentProfile?.subscription) {
      subStatus = parentProfile.subscription.status
      startDate = parentProfile.subscription.startDate
      endDate = parentProfile.subscription.endDate
    }
  }

  const isActive = subStatus === "ACTIVE"
  const isExpired = subStatus === "EXPIRED"

  return (
    <div className="px-4 pt-10 max-w-lg mx-auto pb-10">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-bold tracking-widest uppercase text-[#999AAA] mb-0.5">Berlangganan</p>
        <h1 className="font-serif text-3xl text-[#5A3A7A]">Langganan BundaYakin</h1>
        <p className="text-sm text-[#666666] mt-1">
          Akses penuh untuk menemukan dan memonitor nanny terbaik
        </p>
      </div>

      {/* Active subscription card */}
      {isActive && endDate && (
        <div className="bg-[#E5F6F4] border border-[#A8DDD8] rounded-[16px] p-5 mb-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#5BBFB0] rounded-full flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-sm text-[#2C5F5A]">Langganan Aktif</p>
              <p className="text-xs text-[#2C5F5A]/70">BundaYakin Annual Plan</p>
            </div>
          </div>
          <div className="bg-white/60 rounded-[10px] p-3 space-y-1.5">
            {startDate && (
              <div className="flex justify-between text-xs">
                <span className="text-[#666666]">Mulai</span>
                <span className="font-medium text-[#2C5F5A]">{formatDate(startDate)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs">
              <span className="text-[#666666]">Berlaku hingga</span>
              <span className="font-semibold text-[#2C5F5A]">{formatDate(endDate)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Expired notice */}
      {isExpired && (
        <div className="bg-[#F3EEF8] border border-[#C8B8DC] rounded-[16px] p-4 mb-5 flex items-start gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A97CC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-[#5A3A7A]">Langganan sudah berakhir</p>
            <p className="text-xs text-[#666666] mt-0.5">
              {endDate ? `Berakhir pada ${formatDate(endDate)}. ` : ""}Perbarui untuk lanjut menggunakan BundaYakin.
            </p>
          </div>
        </div>
      )}

      {/* Pricing card */}
      {!isActive && (
        <div className="bg-[#5A3A7A] rounded-[24px] p-6 mb-5 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#A97CC4]/20 rounded-full" />
          <div className="absolute -bottom-8 -left-4 w-28 h-28 bg-[#5BBFB0]/10 rounded-full" />
          <div className="relative z-10">
            <span className="inline-flex items-center bg-[#5BBFB0]/20 text-[#A8DDD8] text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
              Annual Plan
            </span>
            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-white/60 text-sm">Rp</span>
                <span className="font-serif text-5xl text-white font-bold leading-none">500.000</span>
              </div>
              <p className="text-white/60 text-xs mt-1">per tahun · sekitar Rp 41.667/bulan</p>
            </div>
            <MidtransButton label="Aktifkan Sekarang — Rp 500.000" />
          </div>
        </div>
      )}

      {/* Feature list */}
      <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-5">
        <p className="font-semibold text-sm text-[#5A3A7A] mb-3">
          {isActive ? "Fitur yang Anda nikmati" : "Yang Anda dapatkan"}
        </p>
        <div className="space-y-2.5">
          {FEATURES.map((f, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isActive ? "bg-[#5BBFB0]" : "bg-[#F3EEF8] border border-[#C8B8DC]"}`}>
                {isActive ? (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C8B8DC]" />
                )}
              </div>
              <p className={`text-sm ${isActive ? "text-[#2C5F5A]" : "text-[#666666]"}`}>{f}</p>
            </div>
          ))}
        </div>

        {/* Renew button for active sub — shown near expiry (≤ 30 days) */}
        {isActive && endDate && endDate.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000 && (
          <div className="mt-4 pt-4 border-t border-[#E0D0F0]">
            <p className="text-xs text-[#A97CC4] mb-3">Langganan Anda hampir berakhir!</p>
            <MidtransButton label="Perpanjang Sekarang" />
          </div>
        )}

        {/* Cancel subscription */}
        {isActive && <CancelSubscriptionButton endDate={endDate} />}
      </div>

      {/* Guarantee note */}
      <p className="text-center text-xs text-[#999AAA] mt-4 leading-relaxed">
        Pembayaran aman melalui Midtrans · GoPay, transfer bank, kartu kredit tersedia
      </p>
    </div>
  )
}
