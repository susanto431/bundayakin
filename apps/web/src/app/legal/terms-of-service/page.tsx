import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Syarat & Ketentuan — BundaYakin",
  description: "Syarat dan ketentuan penggunaan platform BundaYakin untuk orang tua dan nanny.",
}

export const revalidate = false // SSG — statis

const EFFECTIVE_DATE = "20 Mei 2026"

export default function TermsOfServicePage() {
  return (
    <article className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E0D0F0] p-6">
        <p className="text-[12px] text-[#A97CC4] font-semibold uppercase tracking-wide mb-1">Dokumen Legal</p>
        <h1 className="font-[var(--font-dm-serif)] text-[24px] text-[#5A3A7A] leading-snug mb-2">
          Syarat &amp; Ketentuan
        </h1>
        <p className="text-[13px] text-[#666666]">
          Berlaku sejak <strong>{EFFECTIVE_DATE}</strong>
        </p>
      </div>

      {/* Intro */}
      <Section>
        <p className="text-[14px] text-[#666666] leading-relaxed">
          Dengan mendaftar dan menggunakan BundaYakin, kamu menyetujui syarat dan ketentuan ini.
          Baca dengan seksama — kami tulis sejelas mungkin supaya tidak ada yang mengejutkan.
        </p>
        <div className="mt-4 p-3 bg-[#F3EEF8] rounded-xl border border-[#E0D0F0]">
          <p className="text-[13px] text-[#5A3A7A] font-medium">
            💡 Satu hal penting yang perlu dipahami sejak awal:
          </p>
          <p className="text-[13px] text-[#666666] mt-1">
            BundaYakin menjamin <strong>kecocokan, bukan integritas</strong>. Kami adalah platform assessment psikologis,
            bukan agen yang memverifikasi kejujuran atau rekam jejak kriminal nanny. Penilaian akhir tetap ada di tanganmu.
          </p>
        </div>
      </Section>

      {/* 1. Deskripsi layanan */}
      <Section title="1. Tentang Layanan BundaYakin">
        <div className="text-[14px] text-[#666666] space-y-3 leading-relaxed">
          <p>
            BundaYakin adalah platform assessment dan kecocokan nanny berbasis psikologi, dikelola oleh
            <strong> Human Care Consulting (HCC)</strong>. Kami membantu keluarga dan nanny menemukan
            kecocokan terbaik melalui:
          </p>
          <ul className="pl-4 space-y-1.5 list-disc">
            <li><strong>Tes Kecocokan (Layer 1)</strong> — Survey psikologis + scoring AI Claude. Gratis dalam langganan.</li>
            <li><strong>Psikotes AI (Layer 2)</strong> — Analisis mendalam per aspek kepribadian dan sikap kerja. Rp 300.000/nanny.</li>
            <li><strong>Penilaian Psikolog HCC (Layer 3)</strong> — Review langsung oleh psikolog berpengalaman. Rp 1.200.000–1.500.000/nanny.</li>
          </ul>
          <p>
            Platform ini <strong>bukan marketplace jual-beli jasa nanny</strong>. Kami tidak mengerahkan,
            mempekerjakan, atau menjamin ketersediaan nanny tertentu. Penempatan nanny adalah kesepakatan
            langsung antara orang tua dan nanny.
          </p>
        </div>
      </Section>

      {/* 2. Hak dan kewajiban orang tua */}
      <Section title="2. Orang Tua — Hak & Kewajiban">
        <div className="space-y-4 text-[14px] text-[#666666]">
          <div>
            <h3 className="text-[#5A3A7A] font-semibold mb-2">Yang kamu dapatkan:</h3>
            <ul className="pl-4 space-y-1.5 list-disc leading-relaxed">
              <li>Akses penuh ke platform selama masa langganan aktif (Rp 500.000/tahun).</li>
              <li>Hasil Tes Kecocokan dengan nanny (laporan AI) termasuk dalam harga langganan.</li>
              <li>Kuota 10 koneksi nanny per 30 hari (3 via referral + 7 dari talent pool).</li>
              <li>Pemantauan nanny: check-in mingguan dan evaluasi berkala otomatis.</li>
              <li>Akses rekam jejak anonim nanny (dari keluarga sebelumnya yang opt-in).</li>
            </ul>
          </div>
          <div>
            <h3 className="text-[#5A3A7A] font-semibold mb-2">Yang kami harapkan dari kamu:</h3>
            <ul className="pl-4 space-y-1.5 list-disc leading-relaxed">
              <li>Mengisi profil keluarga dan profil anak secara jujur dan akurat.</li>
              <li>Menggunakan laporan kecocokan sebagai salah satu bahan pertimbangan, bukan satu-satunya.</li>
              <li>Mengisi evaluasi berkala dengan jujur — ini membantu nanny berkembang dan melindungi keluarga lain.</li>
              <li>Tidak membagikan laporan AI atau data nanny kepada pihak ketiga di luar proses rekrutmen.</li>
              <li>Melaporkan insiden serius (pencurian, kekerasan, dll.) ke platform sebelum menyebarluaskan di media sosial.</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* 3. Hak dan kewajiban nanny */}
      <Section title="3. Nanny — Hak & Ketentuan Pendaftaran">
        <div className="space-y-4 text-[14px] text-[#666666]">
          <p>
            Pendaftaran nanny di BundaYakin adalah <strong>gratis sepenuhnya</strong>.
            Dengan mendaftar, nanny menyetujui hal-hal berikut:
          </p>
          <div>
            <h3 className="text-[#5A3A7A] font-semibold mb-2">Penggunaan data oleh platform:</h3>
            <ul className="pl-4 space-y-1.5 list-disc leading-relaxed">
              <li>Profil, jawaban survey, dan hasil assessment nanny dapat digunakan oleh platform untuk proses matching dengan calon keluarga.</li>
              <li>Skor kecocokan ditampilkan kepada orang tua yang terlibat dalam sesi matching. Jawaban detail tidak dibagikan tanpa persetujuan.</li>
              <li>Rekam jejak kerja bersifat anonim secara default — nama keluarga tidak ditampilkan kecuali keluarga tersebut opt-in.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-[#5A3A7A] font-semibold mb-2">Yang nanny dapatkan:</h3>
            <ul className="pl-4 space-y-1.5 list-disc leading-relaxed">
              <li>Akses ke platform untuk mengisi profil dan survey kapan saja.</li>
              <li>Menerima hasil laporan kecocokan (skor area yang match/tidak) setelah matching selesai.</li>
              <li>Mode &ldquo;Open to Job&rdquo; untuk ditemukan oleh calon keluarga yang mencari nanny di talent pool.</li>
              <li>Program referral: mendapat bonus jika berhasil merekomendasikan nanny atau orang tua baru.</li>
            </ul>
          </div>
          <div>
            <h3 className="text-[#5A3A7A] font-semibold mb-2">Yang kami harapkan dari nanny:</h3>
            <ul className="pl-4 space-y-1.5 list-disc leading-relaxed">
              <li>Mengisi profil dan survey dengan jujur. Data yang tidak akurat merugikan semua pihak.</li>
              <li>Memberikan informasi riwayat kerja yang dapat diverifikasi jika diminta.</li>
              <li>Menjaga kerahasiaan informasi keluarga yang didapat selama proses matching.</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* 4. Jaminan produk */}
      <Section title="4. Apa yang Kami Jamin — dan Apa yang Tidak">
        <div className="space-y-4 text-[14px] text-[#666666] leading-relaxed">
          <div className="p-3 bg-[#F0FBF9] rounded-xl border border-[#5BBFB0]/30">
            <p className="font-semibold text-[#2C5F5A] mb-1">✓ Yang kami jamin:</p>
            <p>Proses matching berbasis metodologi psikologis yang dirancang oleh tim psikolog HCC. Laporan AI mencerminkan analisis jawaban survey sesuai kerangka kerja yang sudah teruji.</p>
          </div>
          <div className="p-3 bg-[#FEF3F2] rounded-xl border border-red-200">
            <p className="font-semibold text-red-700 mb-1">✗ Yang tidak kami jamin:</p>
            <ul className="space-y-1.5 list-disc pl-4">
              <li>Kejujuran atau integritas nanny. BundaYakin bukan lembaga verifikasi latar belakang kriminal.</li>
              <li>Bahwa nanny yang &ldquo;cocok&rdquo; di laporan akan selalu berperilaku baik di rumah.</li>
              <li>Hasil kerja atau performa nanny setelah mulai bekerja.</li>
            </ul>
          </div>
          <p className="text-[13px] italic text-[#999AAA]">
            Laporan AI bersifat indikatif — membantu kamu membuat keputusan lebih terinformasi, bukan menggantikan penilaian manusia dan due diligence kamu sendiri.
          </p>
        </div>
      </Section>

      {/* 5. Garansi tidak cocok */}
      <Section title="5. Garansi Tidak Cocok">
        <div className="text-[14px] text-[#666666] space-y-3 leading-relaxed">
          <p>
            Jika setelah matching ternyata tidak cocok, kami menyediakan <strong>1x kesempatan re-matching</strong> dengan nanny berbeda,
            dalam bentuk kredit platform — bukan pengembalian uang tunai.
          </p>
          <div className="border border-[#E0D0F0] rounded-xl overflow-hidden">
            <div className="bg-[#F3EEF8] px-4 py-2">
              <p className="text-[12px] font-semibold text-[#5A3A7A]">Syarat re-matching berlaku jika:</p>
            </div>
            <ul className="px-4 py-3 space-y-1.5 list-disc pl-8 text-[13px]">
              <li>Diminta dalam 30 hari setelah laporan kecocokan diterima.</li>
              <li>Alasan ketidakcocokan adalah terkait aspek yang diukur dalam survey (bukan alasan di luar scope platform).</li>
              <li>Orang tua belum pernah menggunakan fasilitas re-matching sebelumnya untuk periode langganan yang sama.</li>
            </ul>
          </div>
          <p className="text-[13px] text-[#999AAA] italic">
            Tidak ada refund tunai dalam kondisi apapun. Biaya layanan yang sudah dibayarkan dianggap sebagai biaya proses assessment yang sudah dijalankan.
          </p>
        </div>
      </Section>

      {/* 6. Kebijakan pembayaran */}
      <Section title="6. Pembayaran & Langganan">
        <div className="text-[14px] text-[#666666] space-y-3 leading-relaxed">
          <table className="w-full text-[12px] border-collapse">
            <thead>
              <tr className="bg-[#F3EEF8]">
                <th className="text-left p-2 border border-[#E0D0F0] text-[#5A3A7A] font-semibold">Layanan</th>
                <th className="text-left p-2 border border-[#E0D0F0] text-[#5A3A7A] font-semibold">Harga</th>
                <th className="text-left p-2 border border-[#E0D0F0] text-[#5A3A7A] font-semibold">Keterangan</th>
              </tr>
            </thead>
            <tbody className="text-[#666666]">
              <tr>
                <td className="p-2 border border-[#E0D0F0]">Langganan Tahunan</td>
                <td className="p-2 border border-[#E0D0F0]">Rp 500.000/tahun</td>
                <td className="p-2 border border-[#E0D0F0]">Termasuk Tes Kecocokan + kuota koneksi + monitoring</td>
              </tr>
              <tr className="bg-[#FAFAFA]">
                <td className="p-2 border border-[#E0D0F0]">Add-on Psikotes AI</td>
                <td className="p-2 border border-[#E0D0F0]">Rp 300.000/nanny</td>
                <td className="p-2 border border-[#E0D0F0]">Layer 2 — opsional per sesi matching</td>
              </tr>
              <tr>
                <td className="p-2 border border-[#E0D0F0]">Add-on Psikolog</td>
                <td className="p-2 border border-[#E0D0F0]">Rp 1.200.000–1.500.000/nanny</td>
                <td className="p-2 border border-[#E0D0F0]">Layer 3 — penilaian psikolog HCC</td>
              </tr>
              <tr className="bg-[#FAFAFA]">
                <td className="p-2 border border-[#E0D0F0]">Koneksi Tambahan</td>
                <td className="p-2 border border-[#E0D0F0]">Rp 100.000/nanny</td>
                <td className="p-2 border border-[#E0D0F0]">Setelah kuota bulanan habis</td>
              </tr>
              <tr>
                <td className="p-2 border border-[#E0D0F0]">Rekam Jejak Nanny</td>
                <td className="p-2 border border-[#E0D0F0]">Rp 50.000/nanny</td>
                <td className="p-2 border border-[#E0D0F0]">Akses riwayat kerja dari keluarga sebelumnya</td>
              </tr>
              <tr className="bg-[#FAFAFA]">
                <td className="p-2 border border-[#E0D0F0]">Placement Fee</td>
                <td className="p-2 border border-[#E0D0F0]">Sesuai kesepakatan</td>
                <td className="p-2 border border-[#E0D0F0]">Dibayar saat nanny mulai bekerja di rumah</td>
              </tr>
            </tbody>
          </table>
          <p className="text-[13px] leading-relaxed">
            Semua pembayaran diproses melalui <strong>Mayar</strong> (gateway pembayaran terpercaya di Indonesia).
            BundaYakin tidak menyimpan informasi kartu kredit atau rekening bankmu.
          </p>
        </div>
      </Section>

      {/* 7. Batas tanggung jawab */}
      <Section title="7. Batas Tanggung Jawab BundaYakin">
        <div className="text-[14px] text-[#666666] space-y-3 leading-relaxed">
          <p>BundaYakin tidak bertanggung jawab atas:</p>
          <ul className="pl-4 space-y-1.5 list-disc">
            <li>Tindakan, perilaku, atau kejadian yang dilakukan nanny setelah mulai bekerja di rumah.</li>
            <li>Kerugian finansial, fisik, atau emosional akibat penempatan yang tidak berhasil.</li>
            <li>Ketidakakuratan informasi yang diisi nanny dalam profil atau survey mereka.</li>
            <li>Gangguan layanan akibat force majeure (bencana alam, gangguan server pihak ketiga, dll.).</li>
          </ul>
          <p className="text-[13px] text-[#999AAA] italic">
            Tanggung jawab maksimal BundaYakin kepada satu pengguna dibatasi sebesar nilai biaya yang telah dibayarkan untuk periode layanan yang bersangkutan.
          </p>
        </div>
      </Section>

      {/* 8. Penyelesaian sengketa */}
      <Section title="8. Jika Ada Masalah">
        <div className="text-[14px] text-[#666666] space-y-3 leading-relaxed">
          <p>
            Kami mendorong penyelesaian masalah melalui jalur komunikasi resmi terlebih dahulu.
            Langkah yang kami rekomendasikan:
          </p>
          <ol className="pl-4 space-y-2 list-decimal">
            <li>
              <strong>Laporkan ke tim BundaYakin</strong> melalui email{" "}
              <a href="mailto:bantuan@bundayakin.com" className="text-[#5BBFB0] underline">
                bantuan@bundayakin.com
              </a>{" "}
              dengan deskripsi masalah yang jelas.
            </li>
            <li>
              <strong>Mediasi oleh tim HCC</strong> — kami akan berusaha memfasilitasi penyelesaian dalam 7–14 hari kerja.
            </li>
            <li>
              <strong>Jalur hukum</strong> — jika mediasi gagal, sengketa diselesaikan melalui Pengadilan Negeri Jakarta Selatan sesuai hukum Republik Indonesia.
            </li>
          </ol>
          <p className="text-[13px] text-[#999AAA] italic">
            Kami memohon untuk tidak menyebarkan informasi sensitif atau tuduhan yang belum terverifikasi di media sosial sebelum proses penyelesaian selesai. Ini melindungi semua pihak yang terlibat.
          </p>
        </div>
      </Section>

      {/* Footer */}
      <div className="text-center pt-4 border-t border-[#E0D0F0]">
        <p className="text-[12px] text-[#999AAA] mb-3">
          Dokumen ini berlaku sejak {EFFECTIVE_DATE}. Perubahan ketentuan akan diinformasikan melalui notifikasi dalam aplikasi minimal 7 hari sebelum berlaku.
        </p>
        <Link
          href="/legal/privacy-policy"
          className="text-[13px] text-[#A97CC4] underline"
        >
          Lihat Kebijakan Privasi →
        </Link>
      </div>
    </article>
  )
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E0D0F0] p-6">
      {title && (
        <h2 className="font-[var(--font-dm-serif)] text-[18px] text-[#5A3A7A] mb-4">{title}</h2>
      )}
      {children}
    </div>
  )
}
