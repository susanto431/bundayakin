import Link from "next/link"

function BYLogo() {
  return (
    <svg width="44" height="44" viewBox="0 0 60 60" aria-hidden="true">
      <circle cx="22" cy="28" r="20" fill="#A97CC4" />
      <circle cx="38" cy="28" r="20" fill="#5BBFB0" />
      <circle cx="30" cy="20" r="9" fill="#fff" />
      <ellipse cx="30" cy="36" rx="12" ry="8" fill="#fff" opacity=".9" />
    </svg>
  )
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#FDFBFF] font-[var(--font-jakarta)]">
      <div className="max-w-[480px] mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-6">
          <Link href="/">
            <BYLogo />
          </Link>
          <div>
            <div className="font-[var(--font-dm-serif)] text-xl text-[#5A3A7A] leading-none">BundaYakin</div>
            <div className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mt-0.5">Online Nanny Assessment</div>
          </div>
        </div>

        <h1 className="font-[var(--font-dm-serif)] text-[22px] text-[#5A3A7A] leading-[1.25] mb-1">Harga & Biaya</h1>
        <p className="text-[13px] text-[#666666] leading-relaxed mb-6">
          Transparan dari awal — tidak ada biaya tersembunyi.
        </p>

        {/* Section: Langganan */}
        <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-3">Langganan orang tua</p>

        <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-3.5 mb-2">
          <div className="flex justify-between items-center mb-1.5">
            <div className="text-[14px] font-bold text-[#5A3A7A]">Coba dulu — gratis</div>
            <div className="font-[var(--font-dm-serif)] text-[18px] text-[#999AAA]">Rp 0</div>
          </div>
          <ul className="text-[12px] text-[#999AAA] pl-4 leading-[1.8] list-disc">
            <li>3 jatah pencocokan gratis per bulan</li>
            <li>Profil anak tersimpan</li>
            <li>Lihat skor kecocokan (identitas nanny belum terlihat)</li>
          </ul>
        </div>

        <div className="bg-[#E5F6F4] border border-[#A8DDD8] rounded-[16px] p-3.5 mb-2">
          <div className="flex justify-between items-center mb-1">
            <div className="text-[14px] font-bold text-[#1E4A45]">Berlangganan</div>
            <span className="text-[11px] font-semibold bg-[#E5F6F4] text-[#2C5F5A] border border-[#A8DDD8] px-2.5 py-0.5 rounded-full">Paling worth it</span>
          </div>
          <div className="font-[var(--font-dm-serif)] text-[22px] text-[#2C5F5A] mb-0.5">
            Rp 500.000<span className="text-[13px] font-normal text-[#999AAA] font-[var(--font-jakarta)]"> / tahun</span>
          </div>
          <div className="text-[11px] text-[#2C5F5A] mb-2">≈ Rp 42.000/bulan · all-in</div>
          <ul className="text-[12px] text-[#1E4A45] pl-4 leading-[1.8] list-disc">
            <li>Pencocokan nanny sepuasnya</li>
            <li>Pantau nanny lewat pemantauan otomatis tiap bulan</li>
            <li>Catatan anak tersimpan — tidak mulai dari nol saat ganti nanny</li>
            <li>Notifikasi langsung via WA</li>
          </ul>
        </div>

        {/* Section: Bayar saat perlu */}
        <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-3 mt-5">Layanan tambahan (bayar saat perlu)</p>

        <div className="bg-[#FEF0E7] border border-[#F5C4A0] rounded-[16px] p-3.5 mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <div className="text-[14px] font-bold text-[#A35320]">Pilih yang dibutuhkan</div>
          </div>
          <ul className="text-[12px] text-[#7A4018] pl-4 leading-[1.8] list-disc">
            <li>Lihat identitas nanny yang cocok → <strong>Rp 100.000</strong>/nanny</li>
            <li>Tes kepribadian &amp; sikap kerja → <strong>Rp 300.000</strong>/nanny</li>
            <li>Penilaian langsung psikolog → <strong>Rp 1.000.000</strong>/sesi</li>
          </ul>
        </div>

        {/* Section: Biaya penempatan */}
        <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-3">Biaya penempatan nanny</p>

        <div className="bg-[#EEF2FC] border border-[#BDD0F5] rounded-[16px] p-4 mb-3">
          <p className="text-[13px] text-[#3A5A9A] leading-relaxed mb-3">
            Biaya penempatan berlaku jika nanny resmi ditempatkan melalui proses BundaYakin — bukan sekadar ditemukan lewat platform.
          </p>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-white border border-[#BDD0F5] rounded-[12px] p-3">
              <div className="text-[10px] font-bold text-[#5B7EC9] uppercase tracking-wide mb-1">Jangka Panjang</div>
              <div className="font-[var(--font-dm-serif)] text-[20px] text-[#3A5A9A]">Rp 1.200.000</div>
              <div className="text-[11px] text-[#3A5A9A] mt-0.5">Kontrak ≥ 3 bulan</div>
            </div>
            <div className="bg-white border border-[#BDD0F5] rounded-[12px] p-3">
              <div className="text-[10px] font-bold text-[#5B7EC9] uppercase tracking-wide mb-1">Temporer</div>
              <div className="font-[var(--font-dm-serif)] text-[20px] text-[#3A5A9A]">Rp 600.000</div>
              <div className="text-[11px] text-[#3A5A9A] mt-0.5">Kontrak &lt; 3 bulan</div>
            </div>
          </div>

          <div className="border-t border-[#BDD0F5] pt-3">
            <div className="text-[12px] font-bold text-[#5B7EC9] mb-2">Biaya ini sudah termasuk:</div>
            <ul className="text-[12px] text-[#3A5A9A] pl-4 leading-[1.8] list-disc">
              <li><strong>Bonus retensi nanny</strong> — insentif agar nanny bertahan lebih lama bersama keluarga Anda</li>
              <li><strong>Fee referrer</strong> — apresiasi untuk yang merekomendasikan nanny ke BundaYakin</li>
              <li><strong>Dukungan penempatan</strong> — pendampingan awal masa kerja nanny</li>
            </ul>
          </div>
        </div>

        <div className="bg-[#F3EEF8] border border-[#E0D0F0] rounded-[16px] p-3.5 mb-6">
          <p className="text-[12px] text-[#5A3A7A] leading-relaxed">
            <strong>Catatan:</strong> Biaya penempatan dibayar sekali saat nanny resmi mulai bekerja — bukan biaya berulang. Jika nanny tidak bertahan hingga 30 hari kerja, kami akan bantu carikan pengganti tanpa biaya penempatan tambahan.
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/auth/register/parent"
          className="flex items-center justify-center w-full bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] mb-2 transition-all"
        >
          Mulai gratis — daftar sebagai orang tua
        </Link>
        <Link
          href="/"
          className="flex items-center justify-center w-full bg-transparent border-[1.5px] border-[#C8B8DC] hover:bg-[#F3EEF8] text-[#666666] font-semibold text-[14px] min-h-[48px] rounded-[10px] transition-all"
        >
          ← Kembali ke beranda
        </Link>

      </div>
    </main>
  )
}
