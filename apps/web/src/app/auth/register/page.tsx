import Link from "next/link"

export default function RegisterRolePage() {
  return (
    <main className="min-h-screen bg-[#FDFBFF] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl text-[#5A3A7A] mb-1">BundaYakin</h1>
          <p className="text-sm text-[#999AAA] mt-1">Daftar sebagai apa?</p>
        </div>

        <div className="space-y-3">
          {/* Card Orang Tua */}
          <Link href="/auth/register/parent">
            <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-5 hover:border-[#5BBFB0] hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#E5F6F4] rounded-[12px] flex items-center justify-center flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="9" cy="7" r="4" fill="#5BBFB0" />
                    <path d="M2 21v-1a7 7 0 0 1 7-7h0a7 7 0 0 1 7 7v1" stroke="#5BBFB0" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="18" cy="9" r="2.5" fill="#A97CC4" />
                    <path d="M22 21v-.5a3.5 3.5 0 0 0-2.5-3.36" stroke="#A97CC4" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-[#5A3A7A] text-base mb-0.5">Saya Orang Tua</h2>
                  <p className="text-sm text-[#666666] leading-relaxed">
                    Cari nanny terbaik untuk si kecil dengan sistem matching berbasis psikologi
                  </p>
                  <p className="text-xs text-[#5BBFB0] font-semibold mt-2">Rp 500.000 / tahun</p>
                </div>
                <svg className="w-5 h-5 text-[#C8B8DC] group-hover:text-[#5BBFB0] transition-colors mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Card Nanny */}
          <Link href="/auth/register/nanny">
            <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-5 hover:border-[#A97CC4] hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#F3EEF8] rounded-[12px] flex items-center justify-center flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="7" r="4" fill="#A97CC4" />
                    <path d="M5 21v-1a7 7 0 0 1 7-7h0a7 7 0 0 1 7 7v1" stroke="#A97CC4" strokeWidth="2" strokeLinecap="round" />
                    <path d="M9 14.5c0 0 1 2 3 2s3-2 3-2" stroke="#5BBFB0" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-[#5A3A7A] text-base mb-0.5">Saya Nanny</h2>
                  <p className="text-sm text-[#666666] leading-relaxed">
                    Buat profil profesional dan temukan keluarga yang paling cocok dengan Anda
                  </p>
                  <p className="text-xs text-[#A97CC4] font-semibold mt-2">Gratis selamanya</p>
                </div>
                <svg className="w-5 h-5 text-[#C8B8DC] group-hover:text-[#A97CC4] transition-colors mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        <p className="text-center text-sm text-[#666666] mt-8">
          Sudah punya akun?{" "}
          <Link href="/auth/login" className="text-[#5BBFB0] font-semibold hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </main>
  )
}
