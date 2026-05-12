import Link from "next/link"

export const metadata = { title: "Syarat & Ketentuan Referral — BundaYakin" }

export default function TermsReferralPage() {
  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-28">

      {/* Modal sheet style */}
      <div className="bg-white rounded-[20px] border border-[#E0D0F0] overflow-hidden">
        <div className="p-4 border-b border-[#E0D0F0]">
          <div className="w-10 h-1 bg-[#E0D0F0] rounded-full mx-auto mb-4" />
          <p className="font-[var(--font-dm-serif)] text-[16px] text-[#5A3A7A]">
            Syarat &amp; Ketentuan Program Referral BundaYakin
          </p>
        </div>

        <div className="p-4 text-[12px] text-[#666666] leading-[1.7]">

          <h4 className="text-[12px] font-bold text-[#5A3A7A] mb-1 mt-3">Siapa yang bisa ikut?</h4>
          <p className="mb-3">
            Semua pengguna terdaftar BundaYakin — baik orang tua maupun nanny — otomatis mendapat kode rekomendasi unik (BY-REF-XXXX) yang bisa dibagikan ke siapa saja.
          </p>

          <h4 className="text-[12px] font-bold text-[#5A3A7A] mb-1">Kapan fee cair?</h4>
          <ul className="pl-4 mb-3 space-y-1 list-disc">
            <li><strong>Merekomendasikan orang tua (jangka panjang):</strong> Rp 100.000 cair setelah OT deal dengan nanny, placement fee sudah dibayar, dan OT konfirmasi nanny tiba di rumah lewat platform.</li>
            <li><strong>Merekomendasikan orang tua (temporer/infal):</strong> Rp 75.000 dengan syarat yang sama.</li>
            <li><strong>Merekomendasikan nanny (jangka panjang):</strong> Rp 75.000 saat kondisi di atas terpenuhi. Tambahan Rp 125.000 jika nanny masih bekerja di keluarga yang sama setelah 3 bulan.</li>
            <li><strong>Merekomendasikan nanny (temporer/infal):</strong> Rp 75.000 saat kondisi terpenuhi. Tidak ada tambahan.</li>
          </ul>

          <h4 className="text-[12px] font-bold text-[#5A3A7A] mb-1">Cara terima fee</h4>
          <p className="mb-3">
            Ditransfer otomatis ke rekening atau e-wallet terdaftar dalam 3–5 hari kerja setelah syarat terpenuhi. Tidak perlu minta manual ke admin.
          </p>

          <h4 className="text-[12px] font-bold text-[#5A3A7A] mb-1">Yang perlu diperhatikan</h4>
          <ul className="pl-4 mb-3 space-y-1 list-disc">
            <li>Penempatan harus terjadi dan terkonfirmasi lewat platform BY. Tidak berlaku jika transaksi di luar platform.</li>
            <li>Pengguna yang sama tidak bisa pakai kode yang sama lebih dari sekali.</li>
            <li>BundaYakin berhak verifikasi keabsahan referral sebelum mencairkan fee.</li>
          </ul>

          <p className="text-[11px] text-[#999AAA] italic mt-4 pt-3 border-t border-[#E0D0F0] leading-relaxed">
            Ketentuan program referral ini dapat berubah sewaktu-waktu sesuai kebijakan manajemen BundaYakin. Perubahan akan diinformasikan melalui notifikasi dalam aplikasi.
          </p>
        </div>
      </div>

      <Link
        href="/dashboard/parent/referral"
        className="mt-4 w-full flex items-center justify-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] transition-all"
      >
        Mengerti, tutup
      </Link>

    </div>
  )
}
