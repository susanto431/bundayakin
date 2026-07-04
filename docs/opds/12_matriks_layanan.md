# Matriks Layanan & Panduan Alur BundaYakin
## Dokumen Bahasa Sederhana — untuk Pemilik Produk

> Versi 1.0 · Juli 2026
> Dokumen ini sengaja ditulis TANPA istilah teknis. Tujuannya: siapa pun di HCC bisa membaca ini dan paham aplikasi BundaYakin itu apa, bagaimana jalannya, dan apa yang sudah/belum ada.
> Untuk meminta perbaikan atau fitur baru, cukup rujuk dokumen ini + PRD — lihat cara di bagian paling bawah.

---

## 1. BundaYakin Itu Apa? (satu paragraf)

BundaYakin adalah **"biro jodoh" antara keluarga dan nanny** — tapi berbasis ilmu psikologi, bukan sekadar daftar lowongan. Kedua pihak mengisi kuesioner yang sama secara terpisah (53 pertanyaan), lalu AI menilai seberapa cocok mereka: soal gaji, agama, gaya pengasuhan, pengalaman, dan sebagainya. Setelah nanny mulai bekerja, aplikasi tidak berhenti — ia terus "menemani" dengan check-in dan evaluasi berkala supaya hubungan kerja awet. Janji BundaYakin bukan *"nanny ini pasti jujur"* melainkan *"nanny ini cocok dengan keluarga Anda"*.

---

## 2. Siapa Saja Penggunanya?

| Pengguna | Bayar? | Apa yang mereka lakukan di aplikasi |
|---|---|---|
| **Orang Tua** | Ya — langganan Rp 500rb/tahun (ada juga mode gratis terbatas) | Membuat profil anak, mencari & mengetes kecocokan dengan nanny, memantau nanny yang sudah bekerja |
| **Nanny** | Gratis selamanya | Membuat "CV digital" (foto, video perkenalan, pengalaman), ikut Tes Kecocokan, membangun rekam jejak |
| **Admin (HCC)** | Internal | Memantau semua proses matching lewat panel admin |

---

## 3. Alur Besar Aplikasi (5 Babak)

Bayangkan seperti proses perjodohan:

```
BABAK 1          BABAK 2           BABAK 3          BABAK 4            BABAK 5
Kenalan     →    Isi Kuesioner →   Dipertemukan →   AI Menilai &   →   Didampingi
(daftar &        (Tes Kecocokan    (lewat undangan  Ortu Memutuskan    (check-in &
 isi profil)      53 soal,          atau              (7 hari)          evaluasi
                  sendiri-sendiri)  rekomendasi)                        berkala)
```

### Babak 1 — Kenalan (Registrasi & Profil)
- **Orang tua** daftar → langsung masuk (tanpa perlu login ulang) → mengisi data keluarga dan **profil anak**: alergi, jadwal, pantangan, hal yang boleh & tidak boleh dilakukan nanny, cara menenangkan saat rewel. Boleh lebih dari satu anak. **Ini gratis** — keputusan kita: biarkan orang tua merasakan nilainya dulu sebelum diminta bayar.
- **Nanny** daftar → membuat profil digital: foto, video perkenalan & video keahlian (maksimal 3 menit), daftar keterampilan, riwayat kerja gaya CV, ekspektasi gaji. Bisa menyalakan status **"Siap Kerja"** agar mudah ditemukan.

### Babak 2 — Isi Kuesioner (Tes Kecocokan)
- 53 pertanyaan dalam 3 kelompok besar: **(A) Kondisi Kerja** (gaji, libur, lingkup tugas), **(B) Nilai & Gaya Hidup** (agama, penampilan, gaya pengasuhan), **(C) Pengalaman & Kemampuan**.
- Orang tua dan nanny menjawab versi masing-masing, **tidak bisa saling mengintip jawaban**.
- Pertanyaan tertentu bisa ditandai *"ini wajib cocok buat saya"* (dealbreaker). Kalau tidak cocok, sistem TIDAK menolak otomatis — ia bilang *"ini perlu dibicarakan"*.
- Jawaban tersimpan otomatis — boleh berhenti di tengah dan lanjut nanti.

### Babak 3 — Dipertemukan (2 jalur)
- **Jalur A — Undangan:** Orang tua sudah kenal/dapat calon nanny (dari saudara, tetangga, agen) → mengundang nanny itu lewat kode undangan. Tersedia untuk semua akun, jatah 3 undangan per 30 hari.
- **Jalur B — Rekomendasi:** Orang tua belum punya calon → sistem merekomendasikan nanny dari kumpulan nanny yang tersedia, plus ada **direktori nanny** yang bisa di-browse dan difilter (kota, tipe). **Hanya untuk pelanggan**, jatah 7 koneksi per 30 hari.
- Jatah ini disebut **Kuota Koneksi**. Habis kuota? Bisa beli tambahan Rp 100rb per koneksi.

### Babak 4 — AI Menilai & Orang Tua Memutuskan
- Begitu kedua pihak selesai mengisi, AI membandingkan semua jawaban → keluar **laporan kecocokan**: skor keseluruhan (0–100), skor per kelompok A/B/C, daftar hal yang cocok, hal yang berpotensi gesekan, dan **tips negosiasi** untuk kedua pihak. Bisa diunduh sebagai PDF.
- Skor ≥80 hijau (sangat cocok) · 60–79 oranye (cocok dengan catatan) · <60 merah (banyak yang perlu dibicarakan).
- Orang tua punya **7 hari masa eksklusif** untuk memutuskan (bisa diperpanjang 1× +3 hari). Lewat batas tanpa keputusan → nanny bebas dilirik keluarga lain.
- Kalau lanjut sampai nanny resmi bekerja → ada **biaya penyaluran**: Rp 1,2jt (nanny tetap) / Rp 600rb (nanny pengganti/infal).

### Babak 5 — Didampingi (Setelah Nanny Mulai Kerja)
- Minggu ke-1 & ke-2: **check-in singkat** (5 pertanyaan ke kedua pihak: "kondisinya bagaimana? ada kendala?").
- Bulan ke-1 & ke-3, lalu tiap 3 bulan: **evaluasi lengkap** dua arah, dan AI membuat ringkasan + rekomendasinya.
- Nanny yang sedang bekerja bisa membaca profil anak dan **menambahkan catatan** ("hari ini makannya susah, tapi mau kalau sambil…") — catatan ini tidak bisa diubah orang tua. *(Fitur berbagi profil anak ke nanny ini khusus pelanggan.)*
- Nanny yang bertahan ≥3 bulan mendapat **badge "Terpercaya"** — modal reputasi untuk keluarga berikutnya.

---

## 4. Matriks Layanan — Apa yang Ada, Untuk Siapa, Sudah Jalan atau Belum

**Legenda status:** ✅ sudah jalan · ⚠️ setengah jalan (pondasi ada, belum bisa dipakai user) · ❌ belum ada (baru rencana)

### 4a. Layanan untuk Orang Tua

| Layanan | Gunanya | Harga | Status |
|---|---|---|---|
| Akun + profil keluarga & anak | Menyimpan semua info anak secara terstruktur, siap dibagikan ke nanny | Gratis | ✅ |
| Tes Kecocokan (Layer 1) | Tahu seberapa cocok dengan satu nanny sebelum memutuskan | Termasuk langganan | ✅ |
| Undang nanny sendiri (Jalur A) | Mengetes nanny yang sudah dikenal | Gratis (3×/30 hari) | ✅ |
| Direktori & rekomendasi nanny (Jalur B) | Menemukan calon nanny baru | Langganan (7×/30 hari) | ✅ |
| Langganan tahunan | Membuka Jalur B, monitoring penuh, berbagi profil anak ke nanny | Rp 500rb/tahun | ✅ |
| Beli koneksi tambahan | Kalau kuota bulanan habis | Rp 100rb/koneksi | ⚠️ hitungannya sudah ada, halaman belinya belum |
| Laporan kecocokan PDF | Dokumen untuk dibahas berdua/keluarga | Termasuk | ✅ |
| Monitoring & evaluasi berkala | Deteksi masalah sejak dini setelah nanny bekerja | Termasuk langganan | ✅ (PDF laporan evaluasi belum) |
| Jaminan Kecocokan | Nanny berhenti ≤30 hari pertama → matching ulang **dan penempatan ulang gratis penuh** (1× per penempatan, tanpa placement fee kedua) | Termasuk | ⚠️ selesai dikoding Juli 2026, menunggu tayang |
| Tulis rekam jejak nanny | Setelah penugasan berakhir, orang tua menilai nanny (bintang + cerita, anonim kecuali izin) — terverifikasi platform | Gratis | ⚠️ selesai dikoding Juli 2026, menunggu tayang |
| **Psikotes AI (Layer 2)** | Nanny dites psikotes, hasil lebih dalam per aspek | +Rp 300rb | ❌ pondasi ada, layar & alurnya belum dibuat |
| **Review Psikolog HCC (Layer 3)** | Psikolog mewawancara nanny, keluar dokumen NannyCare Profile™ | +Rp 1,2–1,5jt | ❌ menunggu SOP psikolog |
| Beli akses rekam jejak nanny | Melihat riwayat & ulasan dari keluarga sebelumnya | Rp 50rb | ❌ baru rangka |
| Halaman notifikasi | Pengingat evaluasi jatuh tempo, hasil matching siap, dll | — | ❌ nanny sudah punya, orang tua belum |
| Referral (ajak teman) | Bonus kalau mengajak orang tua/nanny baru | — | ✅ (pembayaran bonus masih manual oleh admin) |

### 4b. Layanan untuk Nanny (semua gratis)

| Layanan | Gunanya | Status |
|---|---|---|
| Profil digital ("CV online") | Foto, video perkenalan & keahlian, keterampilan, riwayat kerja | ✅ |
| Status "Siap Kerja" | Menandai diri sedang mencari keluarga baru | ✅ |
| Tes Kecocokan | Dinilai berdasarkan kecocokan, bukan sekadar tawar-menawar gaji | ✅ |
| Catatan anak | Menulis catatan harian/penting tentang anak yang dijaga | ✅ |
| Check-in & evaluasi | Suaranya didengar dua arah — nanny juga menilai kondisi kerja | ✅ |
| Notifikasi | Kabar hasil matching, jadwal evaluasi | ✅ |
| Referral nanny | Bonus bertingkat kalau merekomendasikan nanny lain (diterima kerja → 1 bulan → 3 bulan) | ✅ |
| Badge "Terpercaya" & rekam jejak | Reputasi yang terbawa ke keluarga berikutnya | ⚠️ layar pengisian rekam jejak (oleh orang tua) selesai dikoding Juli 2026; badge masih rencana |

### 4c. Gratis vs Langganan Rp 500rb/tahun — Apa Bedanya?

| Kemampuan | Akun Gratis | Pelanggan (Rp 500rb/tahun ≈ Rp 42rb/bulan) |
|---|---|---|
| Profil keluarga + profil anak lengkap (alergi, jadwal, do & don't) | ✔ | ✔ |
| Undang nanny sendiri + Tes Kecocokan + laporan (Jalur A) | ✔ 3 undangan/30 hari | ✔ 3 undangan/30 hari |
| **AI Talent Pool & Direktori Nanny (Jalur B)** — browse, filter kota/tipe, skor kecocokan AI, buka kontak | ✘ terkunci penuh | ✔ 7 koneksi/30 hari (total jadi 10 koneksi/bulan) |
| **Monitoring & evaluasi** setelah nanny bekerja (check-in, evaluasi berkala, ringkasan AI) | ✘ | ✔ |
| **Berbagi profil anak ke nanny** — nanny aktif bisa membaca profil anak & menulis catatan harian | ✘ (data tetap bisa diisi, hanya tidak bisa dibagikan) | ✔ |
| Bisa dibatalkan kapan saja | — | ✔ |

**Yang TIDAK termasuk langganan** (dibayar terpisah, terlepas dari status langganan):
biaya penyaluran saat nanny resmi bekerja (Rp 1,2jt/600rb), koneksi tambahan setelah kuota habis (Rp 100rb), dan add-on Psikotes/Psikolog/rekam jejak (yang tiga terakhir ini memang belum jalan — lihat 4a).

### 4d. Pilar Baru: Tumbuh Kembang (disetujui Juli 2026 — belum dibangun)

Langganan kini bercerita **dua pilar**: (1) cari & pantau nanny — sudah jalan; (2) **Tumbuh Kembang** — pusat pemantauan perkembangan anak, semuanya masih ❌ (rencana). Detail lengkap: [PRD Tumbuh Kembang](13_prd_tumbuh_kembang.md).

| Fitur | Ringkas | Status |
|---|---|---|
| Kurva Pertumbuhan | Berat/tinggi anak diplot ke standar WHO + artinya | ⚠️ Tahap 1 selesai dikoding, menunggu tayang |
| Jurnal & Galeri Momen | Linimasa kenangan per anak | ⚠️ Tahap 1 selesai dikoding, menunggu tayang |
| Skrining Perkembangan | Checklist milestone (KPSP) → arahan, bukan diagnosis | ❌ Tahap 2 |
| Konsultasi Psikolog Anak | Harga per level psikolog: Junior Rp 500rb · **Mid Rp 1jt (peluncuran)** · Senior Rp 2jt; **pelanggan: Rp 750rb** (diskon 25%) | ❌ Tahap 2 |
| Portal Psikolog | Ruang kerja psikolog: jadwal konsultasi (3 sesi/hari/psikolog, maks 5) + review konten | ❌ Tahap 2 |
| Edukasi Terkurasi + Imunisasi | Artikel dua-mingguan disetujui psikolog + kalender imunisasi & pengingat | ❌ Tahap 3 |
| Log Harian Nanny | Nanny mencatat harian → masuk rekam anak (pembeda utama) | ❌ Tahap 4 |

### 4e. Dari Mana Uang Masuk (Model Bisnis)

| Sumber | Nilai | Status |
|---|---|---|
| Langganan orang tua | Rp 500rb/tahun | ✅ jalan otomatis |
| Biaya penyaluran (placement) | Rp 1,2jt / Rp 600rb | ✅ jalan otomatis |
| Koneksi tambahan | Rp 100rb | ⚠️ |
| Add-on Psikotes (Layer 2) | Rp 300rb | ❌ |
| Add-on Psikolog (Layer 3) | Rp 1,2–1,5jt | ❌ |
| Akses rekam jejak | Rp 50rb | ❌ |
| Konsultasi Psikolog Anak | Rp 500rb–2jt/sesi sesuai level psikolog (peluncuran: Rp 1jt) | ❌ |

> **Cara pembayaran:** semua lewat **Mayar** (transfer/QRIS). Orang tua klik bayar → diarahkan ke halaman Mayar → begitu lunas, sistem otomatis mengaktifkan layanannya. Tidak ada campur tangan manual.

---

## 5. Bagaimana Aplikasi Ini "Hidup"? (teknis dalam bahasa awam)

- Aplikasi berbentuk **website di bundayakin.com** yang bisa dipasang di HP seperti aplikasi biasa (muncul ikon di layar, bisa dibuka walau sinyal jelek).
- **Data** (profil, jawaban, transaksi) tersimpan di database cloud yang otomatis membesar sesuai kebutuhan — tidak perlu beli server.
- **Penilaian kecocokan** dilakukan oleh AI (Claude, buatan Anthropic) yang membaca jawaban kedua pihak dan menulis laporan dalam bahasa Indonesia.
- **Foto & video** nanny disimpan di layanan khusus (Cloudflare) supaya cepat dibuka di HP.
- **PDF laporan** dibuat oleh "mesin cetak" terpisah.
- Biaya operasional model AI & layanan cloud dibayar per pemakaian — makin ramai, makin naik, tapi mulai dari sangat kecil.
- Kondisi kode per Juli 2026: **sehat** — semua pemeriksaan otomatis lulus, aplikasi bisa di-build tanpa error. Perubahan kode terakhir 22 Mei 2026.

---

## 6. Cara Meminta Perbaikan Lewat Dokumen (untuk Bunda Kartika)

Anda tidak perlu bicara teknis. Cukup rujuk dokumen + nomor bagiannya:

| Ingin apa | Rujuk dokumen | Contoh kalimat ke Claude |
|---|---|---|
| Menambah/mengubah fitur | PRD (`06_prd.md`) + matriks ini | *"Di Matriks 4a, Psikotes Layer 2 masih ❌ — tolong buat rencananya dan kerjakan."* |
| Tahu apa yang sudah terbukti jalan | POC (`10_proof_of_concept.md`) | *"Di POC bagian 6 nomor 3, loop reputasi belum tertutup — prioritaskan itu."* |
| Perbaikan tampilan/kenyamanan | UI/UX Review (`11_ui_ux_review.md`) | *"Kerjakan Sprint 1 dari roadmap UI/UX review."* |
| Cek status fitur tertentu | Feature Registry (`05_feature_registry.md`) | *"Update status fitur X di Feature Registry jadi shipped."* |
| Istilah yang membingungkan | Glossary (`CONTEXT.md` di root) | *"Apa bedanya Hasil Matching dan Skor Direktori?"* |

Aturan mainnya sederhana: **matriks ini adalah peta**, PRD adalah **daftar keinginan resmi**, Feature Registry adalah **papan status**. Setiap ada keputusan baru, ketiganya diperbarui bersama.

---

*Dokumen ini dirangkum dari kode aktual per Juli 2026 — bukan dari rencana. Kalau ada yang tidak sesuai kenyataan aplikasi, laporkan: itu bug dokumentasi.*
