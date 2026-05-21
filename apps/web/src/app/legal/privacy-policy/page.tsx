import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Kebijakan Privasi — BundaYakin",
  description: "Kebijakan privasi BundaYakin terkait pengumpulan, pemrosesan, dan perlindungan data pengguna sesuai UU PDP No. 27 Tahun 2022.",
}

export const revalidate = false // SSG — statis

const EFFECTIVE_DATE = "20 Mei 2026"

export default function PrivacyPolicyPage() {
  return (
    <article className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E0D0F0] p-6">
        <p className="text-[12px] text-[#A97CC4] font-semibold uppercase tracking-wide mb-1">Dokumen Legal</p>
        <h1 className="font-[var(--font-dm-serif)] text-[24px] text-[#5A3A7A] leading-snug mb-2">
          Kebijakan Privasi
        </h1>
        <p className="text-[13px] text-[#666666]">
          Berlaku sejak <strong>{EFFECTIVE_DATE}</strong> · Sesuai UU PDP No. 27 Tahun 2022
        </p>
      </div>

      {/* Intro */}
      <Section>
        <p className="text-[14px] text-[#666666] leading-relaxed">
          BundaYakin dikelola oleh <strong>Human Care Consulting (HCC)</strong>. Kami serius dalam menjaga
          privasi kamu. Dokumen ini menjelaskan data apa yang kami kumpulkan, untuk apa, dan siapa saja
          yang bisa mengaksesnya — dalam bahasa yang mudah dipahami.
        </p>
      </Section>

      {/* 1. Data yang dikumpulkan */}
      <Section title="1. Data yang Kami Kumpulkan">
        <div className="space-y-4 text-[14px] text-[#666666] leading-relaxed">
          <DataRow
            label="Data Profil"
            desc="Nama, nomor HP, lokasi (kota/kecamatan), foto profil, dan preferensi kerja."
          />
          <DataRow
            label="Data Survey Kecocokan"
            desc='Jawaban kuesioner psikologis yang kamu isi saat "Tes Kecocokan". Data ini bersifat sensitif dan kami lindungi dengan ketat.'
          />
          <DataRow
            label="Data Psikotes (opsional)"
            desc="Hasil tes psikologi tambahan jika kamu membeli layanan Layer 2. Diproses oleh AI dan disimpan sebagai laporan terenkripsi."
          />
          <DataRow
            label="Catatan Psikolog (opsional)"
            desc="Penilaian dari psikolog HCC pada layanan Layer 3. Hanya bisa dibaca oleh orang tua yang membeli layanan ini dan psikolog yang bersangkutan."
          />
          <DataRow
            label="Media Nanny"
            desc="Foto profil, foto portofolio, dan video perkenalan/keahlian yang nanny unggah secara sukarela."
          />
          <DataRow
            label="Data Teknis"
            desc="Log aktivitas (login, pengisian survey, download laporan) untuk keperluan audit dan keamanan. Tidak mencakup konten percakapan."
          />
        </div>
      </Section>

      {/* 2. Tujuan pemrosesan */}
      <Section title="2. Untuk Apa Data Ini Digunakan?">
        <ul className="space-y-3 text-[14px] text-[#666666]">
          <li className="flex gap-2">
            <span className="text-[#5BBFB0] mt-0.5">✓</span>
            <span><strong>Matching AI</strong> — Jawaban survey dikirim ke Claude API (Anthropic) untuk menghasilkan laporan kecocokan antara orang tua dan nanny.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#5BBFB0] mt-0.5">✓</span>
            <span><strong>Evaluasi Berkala</strong> — Data evaluasi bulanan/triwulan untuk memantau perkembangan hubungan kerja.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#5BBFB0] mt-0.5">✓</span>
            <span><strong>Rekam Jejak Nanny</strong> — Riwayat kerja dan penilaian anonim dari keluarga sebelumnya, dengan persetujuan nanny.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#5BBFB0] mt-0.5">✓</span>
            <span><strong>Notifikasi & Komunikasi</strong> — Pemberitahuan hasil matching, jadwal evaluasi, dan pembaruan platform via aplikasi atau email.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#5BBFB0] mt-0.5">✓</span>
            <span><strong>Kepatuhan Hukum</strong> — Menyimpan log audit sesuai kewajiban regulasi.</span>
          </li>
        </ul>
      </Section>

      {/* 3. Siapa yang bisa akses */}
      <Section title="3. Siapa yang Bisa Mengakses Datamu?">
        <p className="text-[13px] text-[#666666] mb-4">
          Akses data dibatasi berdasarkan peran dan konteks. Berikut rincinya:
        </p>
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full text-[12px] border-collapse">
            <thead>
              <tr className="bg-[#F3EEF8]">
                <th className="text-left p-2 border border-[#E0D0F0] text-[#5A3A7A] font-semibold">Pihak</th>
                <th className="text-left p-2 border border-[#E0D0F0] text-[#5A3A7A] font-semibold">Data yang Bisa Diakses</th>
                <th className="text-left p-2 border border-[#E0D0F0] text-[#5A3A7A] font-semibold">Kondisi</th>
              </tr>
            </thead>
            <tbody className="text-[#666666]">
              <tr>
                <td className="p-2 border border-[#E0D0F0]">Orang tua</td>
                <td className="p-2 border border-[#E0D0F0]">Laporan kecocokan, profil nanny, hasil evaluasi</td>
                <td className="p-2 border border-[#E0D0F0]">Hanya nanny yang terlibat dalam matching mereka</td>
              </tr>
              <tr className="bg-[#FAFAFA]">
                <td className="p-2 border border-[#E0D0F0]">Nanny</td>
                <td className="p-2 border border-[#E0D0F0]">Profil mereka sendiri, hasil matching (skor & area)</td>
                <td className="p-2 border border-[#E0D0F0]">Tidak bisa akses jawaban survey orang tua secara detail</td>
              </tr>
              <tr>
                <td className="p-2 border border-[#E0D0F0]">Psikolog HCC</td>
                <td className="p-2 border border-[#E0D0F0]">Hasil psikotes + jawaban survey nanny (Layer 3)</td>
                <td className="p-2 border border-[#E0D0F0]">Hanya untuk kasus yang ditugaskan, terikat kerahasiaan profesi</td>
              </tr>
              <tr className="bg-[#FAFAFA]">
                <td className="p-2 border border-[#E0D0F0]">Admin HCC</td>
                <td className="p-2 border border-[#E0D0F0]">Log aktivitas, data transaksi, status matching</td>
                <td className="p-2 border border-[#E0D0F0]">Untuk keperluan operasional & penyelesaian sengketa</td>
              </tr>
              <tr>
                <td className="p-2 border border-[#E0D0F0]">Claude API (Anthropic)</td>
                <td className="p-2 border border-[#E0D0F0]">Jawaban survey (tanpa nama/kontak) untuk proses scoring</td>
                <td className="p-2 border border-[#E0D0F0]">Data dikirim terenkripsi; <strong>tidak digunakan untuk training AI</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-[#999AAA] mt-3 italic">
          * Sesuai kebijakan penggunaan API Anthropic, data yang dikirim ke Claude API tidak digunakan untuk melatih model AI mereka.
        </p>
      </Section>

      {/* 4. Hak pengguna */}
      <Section title="4. Hak-Hakmu atas Data Pribadi">
        <p className="text-[13px] text-[#666666] mb-3">Sesuai UU PDP No. 27 Tahun 2022, kamu berhak:</p>
        <div className="space-y-3 text-[14px] text-[#666666]">
          <RightRow
            icon="👁"
            title="Akses"
            desc="Melihat data pribadi apa saja yang kami simpan tentang kamu, kapan saja."
          />
          <RightRow
            icon="✏️"
            title="Koreksi"
            desc="Meminta perbaikan jika ada data yang tidak akurat atau tidak lengkap."
          />
          <RightRow
            icon="🗑"
            title="Penghapusan"
            desc="Meminta penghapusan akunmu beserta seluruh data terkait. Catatan: rekam jejak anonim yang sudah dikonfirmasi keluarga lain tidak dapat dihapus karena melindungi integritas riwayat nanny."
          />
          <RightRow
            icon="🚫"
            title="Penarikan Consent"
            desc="Mencabut persetujuan pemrosesan data kapan saja. Namun ini berarti kamu tidak dapat lagi menggunakan layanan matching BundaYakin."
          />
        </div>
        <div className="mt-4 p-3 bg-[#F3EEF8] rounded-xl border border-[#E0D0F0]">
          <p className="text-[13px] text-[#5A3A7A]">
            Untuk menggunakan hak-hak di atas, hubungi kami di{" "}
            <a href="mailto:privasi@bundayakin.com" className="text-[#5BBFB0] underline font-medium">
              privasi@bundayakin.com
            </a>
            . Kami akan merespons dalam 14 hari kerja.
          </p>
        </div>
      </Section>

      {/* 5. Keamanan & retensi */}
      <Section title="5. Keamanan & Penyimpanan Data">
        <ul className="space-y-2 text-[14px] text-[#666666]">
          <li className="flex gap-2">
            <span className="text-[#5BBFB0] mt-0.5">✓</span>
            <span>Data disimpan di server PostgreSQL (Neon) dengan enkripsi at-rest dan in-transit.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#5BBFB0] mt-0.5">✓</span>
            <span>Foto dan video nanny disimpan di Cloudflare R2/Stream yang berlokasi di infrastruktur global Cloudflare.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#5BBFB0] mt-0.5">✓</span>
            <span>Akses ke database dibatasi dengan role-based permissions dan dicatat dalam audit log.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#5BBFB0] mt-0.5">✓</span>
            <span>Data akun yang tidak aktif lebih dari 3 tahun akan dihapus secara otomatis, kecuali ada kewajiban hukum untuk menyimpannya.</span>
          </li>
        </ul>
      </Section>

      {/* 6. Kontak */}
      <Section title="6. Kontak Privasi">
        <p className="text-[14px] text-[#666666] leading-relaxed mb-3">
          Pertanyaan, keluhan, atau permintaan terkait data pribadi dapat disampaikan ke:
        </p>
        <div className="space-y-1 text-[14px] text-[#666666]">
          <p><strong>Human Care Consulting</strong></p>
          <p>Email: <a href="mailto:privasi@bundayakin.com" className="text-[#5BBFB0] underline">privasi@bundayakin.com</a></p>
          <p>Website: <span className="text-[#5BBFB0]">bundayakin.com</span></p>
        </div>
      </Section>

      {/* Footer */}
      <div className="text-center pt-4 border-t border-[#E0D0F0]">
        <p className="text-[12px] text-[#999AAA] mb-3">
          Dokumen ini berlaku sejak {EFFECTIVE_DATE}. Perubahan kebijakan akan diinformasikan melalui notifikasi dalam aplikasi minimal 7 hari sebelum berlaku.
        </p>
        <Link
          href="/legal/terms-of-service"
          className="text-[13px] text-[#A97CC4] underline"
        >
          Lihat Syarat &amp; Ketentuan →
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

function DataRow({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="border-b border-[#F3EEF8] pb-3 last:border-0 last:pb-0">
      <p className="font-semibold text-[#5A3A7A] mb-0.5">{label}</p>
      <p>{desc}</p>
    </div>
  )
}

function RightRow({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-[18px] mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="font-semibold text-[#5A3A7A]">{title}</p>
        <p className="text-[13px] mt-0.5">{desc}</p>
      </div>
    </div>
  )
}
