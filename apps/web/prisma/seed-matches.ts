// seed-matches.ts — Pre-fill MatchResult dengan data dummy untuk demo direktori nanny
// Jalankan: npm run seed:matches

import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Matrix skor sesuai spec Sprint 2:
// Nanny A (Siti)  ↔ Bunda A (Ria)    = 100%
// Nanny A (Siti)  ↔ Bunda B (Sandra) = 55%
// Nanny A (Siti)  ↔ Bunda C (Mega)   = 0%  (dealbreaker)
// Nanny B (Dewi)  ↔ Bunda A (Ria)    = 82%
// Nanny B (Dewi)  ↔ Bunda B (Sandra) = 91%
// Nanny B (Dewi)  ↔ Bunda C (Mega)   = 45%
// Nanny C (Ratna) ↔ Bunda A (Ria)    = 60%
// Nanny C (Ratna) ↔ Bunda B (Sandra) = 38%
// Nanny C (Ratna) ↔ Bunda C (Mega)   = 70%

type SeedMatch = {
  parentEmail: string
  nannyEmail: string
  skorKeseluruhan: number
  skorDomainA: number
  skorDomainB: number
  skorDomainC: number
  adaDealbreaker: boolean
  dealbreakerFlags: Array<{ questionId: string; issue: string }>
  kekuatan: string[]
  potensiLemah: string[]
  potensiKonflik: string[]
  caraMengatasi: string[]
  tipsOrangTua: string[]
  tipsNanny: string[]
}

const MATCHES: SeedMatch[] = [
  // Nanny A ↔ Bunda A — 100%
  {
    parentEmail: "ria.putri@demo.bundayakin.com",
    nannyEmail: "siti.rahayu@demo.bundayakin.com",
    skorKeseluruhan: 100, skorDomainA: 100, skorDomainB: 100, skorDomainC: 98,
    adaDealbreaker: false,
    dealbreakerFlags: [],
    kekuatan: [
      "Harapan gaji Siti sesuai persis dengan anggaran Bunda Ria",
      "Keduanya mengutamakan gaya pengasuhan yang hangat dan konsisten",
      "Siti berpengalaman merawat anak usia Kira — 1 sampai 3 tahun",
    ],
    potensiLemah: ["Belum punya pengalaman khusus menangani alergi makanan"],
    potensiKonflik: ["Komunikasi awal tentang jadwal harian perlu disepakati bersama"],
    caraMengatasi: ["Buat jadwal tertulis di minggu pertama dan evaluasi setiap Jumat"],
    tipsOrangTua: ["Kenalkan Siti pada rutinitas Kira secara bertahap", "Percayakan keputusan kecil pada Siti"],
    tipsNanny: ["Tanyakan hal yang tidak yakin, jangan tebak-tebak sendiri"],
  },

  // Nanny A ↔ Bunda B — 55%
  {
    parentEmail: "sandra.dewi@demo.bundayakin.com",
    nannyEmail: "siti.rahayu@demo.bundayakin.com",
    skorKeseluruhan: 55, skorDomainA: 60, skorDomainB: 55, skorDomainC: 50,
    adaDealbreaker: false,
    dealbreakerFlags: [],
    kekuatan: [
      "Siti terbuka terhadap anak dengan kebutuhan khusus seperti Naila yang kolik",
      "Gaya pengasuhan keduanya cukup kompatibel di area nilai dasar",
    ],
    potensiLemah: [
      "Harapan gaji Siti sedikit di atas anggaran Bunda Sandra",
      "Pengalaman Siti belum mencakup anak usia sekolah seperti Rafi",
    ],
    potensiKonflik: ["Perbedaan ekspektasi gaji bisa menjadi titik ketegangan di awal"],
    caraMengatasi: ["Diskusikan struktur gaji fleksibel — misalnya bonus kinerja 3 bulan"],
    tipsOrangTua: ["Jelaskan kebutuhan unik dua anak sekaligus sejak wawancara"],
    tipsNanny: ["Tanyakan detail tentang kondisi Naila sebelum hari pertama kerja"],
  },

  // Nanny A ↔ Bunda C — 0% (DEALBREAKER)
  {
    parentEmail: "mega.sari@demo.bundayakin.com",
    nannyEmail: "siti.rahayu@demo.bundayakin.com",
    skorKeseluruhan: 0, skorDomainA: 0, skorDomainB: 0, skorDomainC: 0,
    adaDealbreaker: true,
    dealbreakerFlags: [{
      questionId: "C1.1",
      issue: "Siti tidak memiliki pengalaman merawat bayi di bawah 1 tahun — Bunda Mega menetapkan ini sebagai dealbreaker untuk Zayn yang baru lahir",
    }],
    kekuatan: [],
    potensiLemah: ["Tidak ada pengalaman bayi di bawah 1 tahun"],
    potensiKonflik: [],
    caraMengatasi: [],
    tipsOrangTua: ["Pertimbangkan nanny Dewi Lestari yang punya latar belakang keperawatan"],
    tipsNanny: [],
  },

  // Nanny B ↔ Bunda A — 82%
  {
    parentEmail: "ria.putri@demo.bundayakin.com",
    nannyEmail: "dewi.lestari@demo.bundayakin.com",
    skorKeseluruhan: 82, skorDomainA: 75, skorDomainB: 88, skorDomainC: 85,
    adaDealbreaker: false,
    dealbreakerFlags: [],
    kekuatan: [
      "Dewi punya kemampuan medis yang akan bermanfaat jika Kira sakit",
      "Nilai pengasuhan keduanya sangat selaras",
      "Dewi berpengalaman 7 tahun — dapat diandalkan",
    ],
    potensiLemah: [
      "Harapan gaji Dewi lebih tinggi dari nanny Siti",
      "Dewi live-out — tidak bisa menginap jika Bunda punya keperluan mendadak",
    ],
    potensiKonflik: ["Perbedaan harapan gaji perlu dinegosiasi"],
    caraMengatasi: ["Hitung total biaya termasuk benefit — mungkin lebih hemat daripada terlihat"],
    tipsOrangTua: ["Manfaatkan keahlian medis Dewi untuk kondisi Kira yang spesifik"],
    tipsNanny: ["Konfirmasi jam kerja dan hari libur secara tertulis"],
  },

  // Nanny B ↔ Bunda B — 91%
  {
    parentEmail: "sandra.dewi@demo.bundayakin.com",
    nannyEmail: "dewi.lestari@demo.bundayakin.com",
    skorKeseluruhan: 91, skorDomainA: 88, skorDomainB: 95, skorDomainC: 90,
    adaDealbreaker: false,
    dealbreakerFlags: [],
    kekuatan: [
      "Latar belakang keperawatan Dewi sangat relevan untuk Naila yang kolik",
      "Dewi berpengalaman menangani lebih dari satu anak sekaligus",
      "Nilai dan gaya hidup keduanya sangat cocok",
    ],
    potensiLemah: ["Jadwal Rafi yang sekolah memerlukan koordinasi transportasi tambahan"],
    potensiKonflik: ["Hari libur Dewi perlu disesuaikan dengan aktivitas weekend keluarga"],
    caraMengatasi: ["Buat jadwal mingguan bersama setiap Minggu malam"],
    tipsOrangTua: ["Minta Dewi kenalkan teknik penanganan kolik yang sudah dia kuasai"],
    tipsNanny: ["Pelajari jadwal Rafi di sekolah agar bisa merencanakan aktivitas Naila"],
  },

  // Nanny B ↔ Bunda C — 45%
  {
    parentEmail: "mega.sari@demo.bundayakin.com",
    nannyEmail: "dewi.lestari@demo.bundayakin.com",
    skorKeseluruhan: 45, skorDomainA: 50, skorDomainB: 42, skorDomainC: 43,
    adaDealbreaker: false,
    dealbreakerFlags: [],
    kekuatan: [
      "Dewi punya latar medis yang berguna untuk bayi Zayn dengan alergi susu sapi",
    ],
    potensiLemah: [
      "Perbedaan nilai pengasuhan cukup signifikan di beberapa aspek",
      "Harapan gaji Dewi jauh di atas anggaran Bunda Mega",
    ],
    potensiKonflik: ["Perbedaan pendekatan pengasuhan bayi yang cukup mendasar"],
    caraMengatasi: ["Diskusikan prinsip pengasuhan bayi secara terbuka sebelum memutuskan"],
    tipsOrangTua: ["Pertimbangkan nanny lain yang lebih sesuai budget dan nilai pengasuhan"],
    tipsNanny: ["Pastikan harapan kerja selaras sebelum berkomitmen"],
  },

  // Nanny C ↔ Bunda A — 60%
  {
    parentEmail: "ria.putri@demo.bundayakin.com",
    nannyEmail: "ratna.wulandari@demo.bundayakin.com",
    skorKeseluruhan: 60, skorDomainA: 65, skorDomainB: 58, skorDomainC: 55,
    adaDealbreaker: false,
    dealbreakerFlags: [],
    kekuatan: [
      "Budget Bunda Ria sesuai harapan gaji Ratna",
      "Ratna terbuka terhadap anak usia Kira",
    ],
    potensiLemah: [
      "Pengalaman Ratna baru 1 tahun — mungkin butuh pendampingan lebih di awal",
      "Beberapa nilai pengasuhan sedikit berbeda",
    ],
    potensiKonflik: ["Ratna mungkin masih perlu bimbingan dalam situasi anak rewel"],
    caraMengatasi: ["Sediakan panduan singkat tertulis tentang cara menenangkan Kira"],
    tipsOrangTua: ["Pantau lebih intens di bulan pertama — berikan feedback langsung"],
    tipsNanny: ["Jangan ragu bertanya jika ada situasi yang belum pernah dihadapi"],
  },

  // Nanny C ↔ Bunda B — 38%
  {
    parentEmail: "sandra.dewi@demo.bundayakin.com",
    nannyEmail: "ratna.wulandari@demo.bundayakin.com",
    skorKeseluruhan: 38, skorDomainA: 40, skorDomainB: 35, skorDomainC: 38,
    adaDealbreaker: false,
    dealbreakerFlags: [],
    kekuatan: ["Ratna bersedia live-out maupun live-in sesuai kebutuhan"],
    potensiLemah: [
      "Pengalaman Ratna belum cukup untuk menangani dua anak dengan kebutuhan berbeda",
      "Perbedaan nilai pengasuhan cukup banyak",
      "Belum pernah menangani anak kolik seperti Naila",
    ],
    potensiKonflik: ["Pengalaman terbatas bisa menjadi sumber stres bagi kedua pihak"],
    caraMengatasi: ["Pertimbangkan nanny dengan pengalaman lebih untuk kebutuhan Bunda Sandra"],
    tipsOrangTua: ["Pilihan yang lebih cocok tersedia — lihat Dewi Lestari"],
    tipsNanny: ["Tingkatkan pengalaman dengan anak berkebutuhan khusus terlebih dahulu"],
  },

  // Nanny C ↔ Bunda C — 70%
  {
    parentEmail: "mega.sari@demo.bundayakin.com",
    nannyEmail: "ratna.wulandari@demo.bundayakin.com",
    skorKeseluruhan: 70, skorDomainA: 72, skorDomainB: 70, skorDomainC: 65,
    adaDealbreaker: false,
    dealbreakerFlags: [],
    kekuatan: [
      "Budget Bunda Mega sesuai harapan gaji Ratna",
      "Nilai pengasuhan dasar keduanya cukup selaras",
    ],
    potensiLemah: [
      "Ratna belum punya pengalaman bayi di bawah 1 tahun secara khusus",
      "Pengalaman keseluruhan baru 1 tahun",
    ],
    potensiKonflik: ["Penanganan alergi susu sapi Zayn memerlukan pengetahuan khusus"],
    caraMengatasi: ["Berikan pelatihan singkat tentang penanganan alergi Zayn sebelum mulai"],
    tipsOrangTua: ["Pastikan Ratna memahami protokol formula khusus Zayn"],
    tipsNanny: ["Pelajari tanda-tanda reaksi alergi dan cara merespons dengan cepat"],
  },
]

async function main() {
  console.log("Seeding MatchResult (9 kombinasi)…\n")

  for (const m of MATCHES) {
    // Cari parentProfile dan nannyProfile
    const parentUser = await prisma.user.findUnique({
      where: { email: m.parentEmail },
      include: { parentProfile: { select: { id: true } } },
    })
    const nannyUser = await prisma.user.findUnique({
      where: { email: m.nannyEmail },
      include: { nannyProfile: { select: { id: true } } },
    })

    if (!parentUser?.parentProfile?.id) {
      console.warn(`  ⚠ ParentProfile tidak ditemukan untuk ${m.parentEmail} — skip`)
      continue
    }
    if (!nannyUser?.nannyProfile?.id) {
      console.warn(`  ⚠ NannyProfile tidak ditemukan untuk ${m.nannyEmail} — skip`)
      continue
    }

    const parentProfileId = parentUser.parentProfile.id
    const nannyProfileId = nannyUser.nannyProfile.id

    await prisma.matchResult.upsert({
      where: { parentProfileId_nannyProfileId: { parentProfileId, nannyProfileId } },
      update: {
        skorKeseluruhan: m.skorKeseluruhan,
        skorDomainA: m.skorDomainA,
        skorDomainB: m.skorDomainB,
        skorDomainC: m.skorDomainC,
        adaDealbreaker: m.adaDealbreaker,
        dealbreakerFlags: m.dealbreakerFlags,
        kekuatan: m.kekuatan,
        potensiLemah: m.potensiLemah,
        potensiKonflik: m.potensiKonflik,
        caraMengatasi: m.caraMengatasi,
        tipsOrangTua: m.tipsOrangTua,
        tipsNanny: m.tipsNanny,
        generatedAt: new Date(),
      },
      create: {
        parentProfileId,
        nannyProfileId,
        skorKeseluruhan: m.skorKeseluruhan,
        skorDomainA: m.skorDomainA,
        skorDomainB: m.skorDomainB,
        skorDomainC: m.skorDomainC,
        adaDealbreaker: m.adaDealbreaker,
        dealbreakerFlags: m.dealbreakerFlags,
        kekuatan: m.kekuatan,
        potensiLemah: m.potensiLemah,
        potensiKonflik: m.potensiKonflik,
        caraMengatasi: m.caraMengatasi,
        tipsOrangTua: m.tipsOrangTua,
        tipsNanny: m.tipsNanny,
      },
    })

    const label = m.adaDealbreaker ? "0% DEALBREAKER" : `${m.skorKeseluruhan}%`
    console.log(`  ✅ ${m.parentEmail.split("@")[0]} ↔ ${m.nannyEmail.split("@")[0]} → ${label}`)
  }

  console.log("\n✅ Seed selesai — 9 MatchResult tersimpan.")
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
