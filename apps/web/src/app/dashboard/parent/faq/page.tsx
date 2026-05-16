"use client"

import { useState } from "react"
import Link from "next/link"

const WA_CONTACT = "https://wa.me/6287888180363?text=Halo%20tim%20BundaYakin%2C%20saya%20butuh%20bantuan"

const FAQS = [
  {
    category: "Langganan & Pembayaran",
    items: [
      {
        q: "Berapa biaya langganan BundaYakin?",
        a: "Langganan BundaYakin untuk orang tua seharga Rp 500.000/tahun. Ini sudah mencakup akses penuh ke fitur pencocokan (matching), pemantauan nanny, catatan anak, dan evaluasi berkala.",
      },
      {
        q: "Bagaimana cara membatalkan paket berlangganan?",
        a: "Masuk ke Akun → Langganan, lalu scroll ke bawah dan pilih 'Batalkan Langganan'. Sistem akan meminta konfirmasi. Setelah dikonfirmasi, akses Bunda tetap aktif hingga akhir periode yang sudah dibayar — tidak ada biaya tambahan dan tidak ada pemotongan. Setelah periode berakhir, akun beralih ke paket gratis (3 matching/bulan, tanpa catatan anak & monitoring).",
      },
      {
        q: "Apakah ada pengembalian dana jika saya batalkan sebelum tahun habis?",
        a: "Saat ini BundaYakin belum menyediakan pro-rate refund. Pembatalan akan menghentikan perpanjangan otomatis, namun akses tetap aktif sampai tanggal berakhir yang tertera. Jika ada situasi khusus, hubungi tim BY via WhatsApp untuk dibantu.",
      },
      {
        q: "Apakah ada biaya tambahan jika saya dapat nanny dari penyalur / kenalan sendiri?",
        a: "Tidak ada biaya tambahan. Jika nanny sudah Bunda dapatkan sendiri dari penyalur atau kenalan, Bunda tetap bisa menggunakan fitur pencocokan dan pemantauan BY secara gratis. Biaya penempatan BY hanya berlaku jika deal terjadi lewat platform kami.",
      },
      {
        q: "Bagaimana cara memperpanjang langganan?",
        a: "Masuk ke menu Akun → Langganan, lalu pilih Perpanjang. Pembayaran tersedia via GoPay, transfer bank, dan kartu kredit.",
      },
      {
        q: "Bagaimana cara mengedit atau mengganti rekening bank?",
        a: "Informasi rekening bank dapat diperbarui di halaman Akun → Pengaturan → Rekening Bank. Saat ini fitur ini masih dalam pengembangan. Hubungi tim BY jika ada kebutuhan mendesak.",
      },
    ],
  },
  {
    category: "Pencocokan (Matching)",
    items: [
      {
        q: "Bagaimana cara kerja pencocokan nanny di BundaYakin?",
        a: "Bunda dan nanny masing-masing mengisi survei preferensi. Sistem akan mencocokkan jawaban keduanya dan menghasilkan laporan kecocokan per aspek — mulai dari kondisi kerja, nilai, hingga kemampuan praktis.",
      },
      {
        q: "Berapa lama proses pencocokan berlangsung?",
        a: "Setelah kedua belah pihak selesai mengisi survei, hasil pencocokan biasanya tersedia dalam beberapa menit.",
      },
      {
        q: "Apakah nanny bisa diundang tanpa daftar di BundaYakin?",
        a: "Nanny perlu mendaftar dan mengisi survei preferensi di BundaYakin. Bunda cukup kirim link undangan ke nanny — prosesnya gratis dan mudah untuk nanny.",
      },
      {
        q: "Apa itu 'dealbreaker' dalam survei?",
        a: "Dealbreaker adalah preferensi yang tidak bisa dikompromikan. Jika ada dealbreaker yang tidak cocok antara Bunda dan nanny, sistem akan memberi tahu — bukan langsung menolak, tapi menandai poin yang perlu dibicarakan.",
      },
    ],
  },
  {
    category: "Catatan Anak",
    items: [
      {
        q: "Siapa yang bisa melihat catatan tentang si Kecil?",
        a: "Catatan anak hanya bisa dilihat oleh Bunda dan nanny yang aktif. Saat ganti nanny, catatan dikompilasi dan dibagikan ke nanny baru tanpa menyebut nama nanny sebelumnya.",
      },
      {
        q: "Bagaimana cara memperbarui profil anak?",
        a: "Di halaman Catatan Anak, ketuk bagian yang ingin diperbarui (misalnya 'Profil si Kecil' atau 'Aturan rumah'). Bunda akan langsung diarahkan ke form edit bagian tersebut.",
      },
      {
        q: "Seberapa sering saya harus memperbarui catatan anak?",
        a: "BY menyarankan pembaruan setiap 3 bulan, atau kapan saja ada perubahan penting pada kondisi / kebutuhan si Kecil. Sistem akan mengirim pengingat otomatis.",
      },
    ],
  },
  {
    category: "Akun & Keamanan",
    items: [
      {
        q: "Bagaimana cara mengganti kata sandi?",
        a: "Masuk ke Akun → Pengaturan → Ganti Kata Sandi.",
      },
      {
        q: "Bagaimana cara menghapus akun saya?",
        a: "Di halaman Pengaturan, scroll ke bawah dan pilih Hapus Akun. Data Bunda akan dihapus permanen sesuai kebijakan privasi kami.",
      },
      {
        q: "Data saya disimpan di mana dan seberapa aman?",
        a: "Data disimpan di server yang terenkripsi (PostgreSQL Neon, berbasis AWS). Kami tidak pernah menjual data pengguna ke pihak ketiga.",
      },
    ],
  },
]

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<string | null>(null)

  function toggle(key: string) {
    setOpenIdx(prev => (prev === key ? null : key))
  }

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-28">

      {/* Header */}
      <div className="border-b border-[#E0D0F0] pb-3 mb-4">
        <Link
          href="/dashboard/parent/settings"
          className="inline-flex items-center text-[12px] text-[#999AAA] hover:text-[#5A3A7A] mb-2 transition-colors"
        >
          ← Kembali ke pengaturan
        </Link>
        <h1 className="text-[16px] font-bold text-[#5A3A7A]">Pertanyaan Umum (FAQ)</h1>
        <p className="text-[12px] text-[#999AAA] mt-0.5">Jawaban untuk pertanyaan yang sering ditanyakan</p>
      </div>

      {/* FAQ sections */}
      {FAQS.map(section => (
        <div key={section.category} className="mb-5">
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">
            {section.category}
          </p>
          <div className="bg-white border border-[#E0D0F0] rounded-[16px] overflow-hidden">
            {section.items.map((item, i) => {
              const key = `${section.category}-${i}`
              const isOpen = openIdx === key
              return (
                <div key={i} className={i < section.items.length - 1 ? "border-b border-[#E0D0F0]" : ""}>
                  <button
                    type="button"
                    onClick={() => toggle(key)}
                    className="w-full flex items-center justify-between gap-3 p-3.5 text-left hover:bg-[#FDFBFF] transition-colors"
                  >
                    <span className="text-[13px] font-semibold text-[#5A3A7A] leading-snug">{item.q}</span>
                    <svg
                      width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="#C8B8DC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      className={`flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="px-3.5 pb-3.5">
                      <p className="text-[12px] text-[#666666] leading-relaxed">{item.a}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Contact CTA */}
      <div className="bg-[#F3EEF8] border border-[#C8B8DC] rounded-[16px] p-4 text-center">
        <p className="text-[13px] font-semibold text-[#5A3A7A] mb-1">Tidak menemukan jawaban?</p>
        <p className="text-[12px] text-[#999AAA] mb-3">Tim kami siap membantu Bunda via WhatsApp</p>
        <a
          href={WA_CONTACT}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[13px] px-5 py-2.5 rounded-[10px] min-h-[44px] transition-all"
        >
          Chat tim BundaYakin
        </a>
      </div>

    </div>
  )
}
