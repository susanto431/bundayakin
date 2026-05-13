import Link from "next/link"

type Props = {
  featureName: string
  children: React.ReactNode
  isPaid: boolean
}

export function PaidOnlyGate({ featureName, children, isPaid }: Props) {
  if (isPaid) return <>{children}</>

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-10 pb-28 flex flex-col items-center text-center">
      <div className="w-16 h-16 bg-[#F3EEF8] rounded-full flex items-center justify-center mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A97CC4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <h2 className="text-[18px] font-bold text-[#5A3A7A] mb-2">{featureName}</h2>
      <p className="text-[13px] text-[#999AAA] leading-relaxed mb-6 max-w-[280px]">
        Fitur ini tersedia untuk pelanggan BundaYakin. Langganan Rp 500.000/tahun untuk akses penuh.
      </p>
      <Link
        href="/dashboard/parent/subscription"
        className="inline-flex items-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[14px] px-6 py-3 rounded-[10px] min-h-[48px] transition-all"
      >
        Mulai berlangganan →
      </Link>
      <p className="text-[11px] text-[#999AAA] mt-3">
        ≈ Rp 42.000/bulan · Bisa dibatalkan kapan saja
      </p>
    </div>
  )
}
