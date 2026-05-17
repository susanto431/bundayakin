import RegisterNannyForm from "./RegisterNannyForm"

export const metadata = { title: "Daftar sebagai Nanny — BundaYakin" }

type Props = {
  searchParams: { ref?: string }
}

export default function RegisterNannyPage({ searchParams }: Props) {
  // Sanitasi: hanya terima format BY-XXXX (huruf/angka, 2–8 char setelah "BY-")
  const rawCode = searchParams.ref ?? ""
  const defaultCode = /^BY-[A-Z0-9]{2,8}$/i.test(rawCode) ? rawCode.toUpperCase() : ""

  return (
    <main className="min-h-screen bg-[#FDFBFF] font-[var(--font-jakarta)]">
      <div className="max-w-[480px] mx-auto px-4 py-6">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-4">
          <svg width="28" height="28" viewBox="0 0 60 60" aria-hidden="true">
            <circle cx="22" cy="28" r="20" fill="#A97CC4" />
            <circle cx="38" cy="28" r="20" fill="#5BBFB0" />
            <circle cx="30" cy="20" r="9" fill="#fff" />
            <ellipse cx="30" cy="36" rx="12" ry="8" fill="#fff" opacity=".9" />
          </svg>
          <span className="font-[var(--font-dm-serif)] text-[16px] text-[#5A3A7A]">BundaYakin</span>
        </div>

        {/* Header */}
        <div className="border-b border-[#E0D0F0] pb-3 mb-4">
          <h1 className="text-[16px] font-bold text-[#5A3A7A]">Daftar sebagai nanny</h1>
          <p className="text-[12px] text-[#999AAA] mt-0.5">Gratis · profil terverifikasi · rekam jejak terbentuk</p>
        </div>

        {/* Banner undangan — tampil hanya jika ada kode valid */}
        {defaultCode && (
          <div className="bg-[#E5F6F4] border border-[#A8DDD8] rounded-[16px] px-4 py-3 mb-4">
            <p className="text-[12px] font-bold text-[#1E4A45]">Anda diundang oleh sebuah keluarga</p>
            <p className="text-[12px] text-[#2C5F5A] mt-0.5 leading-relaxed">
              Kode <span className="font-mono font-bold">{defaultCode}</span> sudah terisi otomatis.
              Selesaikan pendaftaran untuk langsung terhubung.
            </p>
          </div>
        )}

        {/* Benefits card */}
        <div className="bg-[#F3EEF8] border border-[#E0D0F0] rounded-[16px] p-3.5 mb-4">
          <p className="text-[12px] font-bold text-[#5A3A7A] mb-1.5">Manfaat bergabung di BundaYakin</p>
          <ul className="text-[12px] text-[#5A3A7A] pl-4 leading-[1.8] list-disc">
            <li>Profil nanny terverifikasi platform</li>
            <li>Rekam jejak kerja terbentuk otomatis</li>
            <li>Bonus Rp 150.000 kalau bertahan 3 bulan</li>
            <li>Badge Terpercaya untuk nanny andalan</li>
          </ul>
        </div>

        <RegisterNannyForm defaultCode={defaultCode} />
      </div>
    </main>
  )
}
