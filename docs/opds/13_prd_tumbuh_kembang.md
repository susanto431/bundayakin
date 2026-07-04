# PRD — Pilar Tumbuh Kembang
## BundaYakin — Human Care Consulting

> Versi 1.0 · Juli 2026 · Hasil sesi keputusan bersama Kartika (grill-with-docs)
> Keputusan strategis yang mendasari: [ADR-007 Langganan Dua Pilar](08_adr/ADR-007_langganan-dua-pilar.md)
> Status: **Disetujui untuk direncanakan — belum mulai dibangun**

---

## 1. Cerita Singkat (untuk siapa pun di tim)

Selama ini langganan Rp 500rb/tahun hanya menjawab satu pertanyaan: *"Bagaimana menemukan nanny yang cocok?"* Masalahnya: begitu nanny ketemu, alasan berlangganan tahun depan melemah.

Pilar **Tumbuh Kembang** menjawab pertanyaan kedua yang tidak pernah selesai sampai anak besar: *"Apakah anakku berkembang dengan baik?"* Orang tua mencatat (dan **nanny ikut mencatat** — ini yang tidak dimiliki aplikasi lain), aplikasi memantau dengan alat ukur resmi, psikolog HCC siap dipanggil saat dibutuhkan.

**Kalimat penjualan:** *"Nanny yang cocok mencatat, psikolog memantau, Bunda tenang."*
**Batas klaim (WAJIB dipatuhi marketing):** kita bilang *"didampingi psikolog"* — TIDAK PERNAH *"pengganti psikolog"* atau memberi kesan diagnosis.

---

## 2. Empat Fitur Inti (scope yang disetujui)

| # | Fitur | Apa yang dilakukan orang tua | Apa yang diberikan aplikasi |
|---|---|---|---|
| 1 | **Kurva Pertumbuhan** | Catat berat, tinggi, lingkar kepala | Plot otomatis ke kurva standar WHO + artinya ("di jalur sehat") |
| 2 | **Skrining Perkembangan** | Isi checklist milestone sesuai usia (basis KPSP Kemenkes): motorik, bicara, sosial | Hasil 3 tingkat: *sesuai usia* / *perlu stimulasi* (+ ide stimulasi) / *sebaiknya konsultasi* (+ tombol Konsultasi Psikolog Anak) |
| 3 | **Imunisasi** | Centang imunisasi yang sudah diberikan | Kalender jadwal IDAI + pengingat. *Disclaimer: bukan layanan medis, rujuk ke dokter/posyandu* |
| 4 | **Jurnal & Galeri Momen** | Tulis catatan + foto momen penting | Linimasa kenangan per anak; **Log Harian Nanny** otomatis masuk ke sini |

Ditambah **Edukasi Terkurasi**: artikel/tips **dua-mingguan** sesuai usia anak — draft ditulis AI, disetujui & diatasnamakan psikolog HCC.

## 3. Peran Nanny (pembeda utama)

Nanny aktif mencatat hal sederhana tiap hari: makan, tidur, aktivitas stimulasi, momen baru ("hari ini bisa berdiri sendiri!"). Catatan masuk ke Rekam Tumbuh Kembang yang dilihat orang tua. Fitur "log aktivitas harian nanny" yang tadinya rencana Fasa 2 **ditarik maju** ke pilar ini.

## 3b. Portal Psikolog (kebutuhan baru — lahir dari keputusan kapasitas)

Supaya kapasitas konsultasi terkendali dan bisa tumbuh dengan menambah psikolog, psikolog HCC mendapat **akses masuk sendiri** (role baru di aplikasi). Isi minimalnya:

| Kemampuan | Gunanya |
|---|---|
| Jadwal & antrean konsultasi | Terima/atur/tandai selesai sesi Konsultasi Psikolog Anak |
| Level psikolog | Tiap psikolog punya level (Junior/Mid/Senior) yang menentukan harga sesinya |
| Kapasitas otomatis | Sistem hanya membuka slot sesuai rasio: 3 sesi/hari/psikolog, maksimum 5 |
| Antrean review konten | Menyetujui draft Edukasi Terkurasi (ritme dua-mingguan) |
| Catatan hasil sesi | Pesan psikolog untuk orang tua — tidak boleh diubah sistem (aturan lama tetap berlaku) |

Portal ini juga kelak dipakai untuk Layer 3 (review psikolog nanny) — satu portal untuk semua pekerjaan psikolog.

## 4. Gratis vs Pelanggan (mengikuti filosofi 22 Mei 2026)

| | Gratis | Pelanggan Rp 500rb/tahun |
|---|---|---|
| Mencatat berat/tinggi, jurnal, imunisasi | ✔ | ✔ |
| Melihat angka mentah | ✔ | ✔ |
| Kurva WHO + interpretasi | ✘ | ✔ |
| Skrining + rekomendasi stimulasi | ✘ | ✔ |
| Perpustakaan edukasi penuh | 1 artikel contoh per terbitan (dua-mingguan) | ✔ semua |
| Pengingat imunisasi & skrining | ✘ | ✔ |
| Log Harian Nanny masuk ke rekam anak | ✘ | ✔ |
| Laporan PDF tumbuh kembang | ✘ | ✔ |

**Konsultasi Psikolog Anak** = add-on per sesi (di luar langganan). Harga **berjenjang mengikuti level psikolog** (ditetapkan Juli 2026):

| Level psikolog | Harga/sesi |
|---|---|
| Junior | Rp 500.000 |
| Mid | **Rp 1.000.000** ← harga peluncuran/default |
| Senior | Rp 2.000.000 |

**Strategi peluncuran (disetujui Kartika, Juli 2026):**
- Peluncuran memakai **harga mid (Rp 1jt)** — tapi sesi dikerjakan/disupervisi langsung psikolog **senior** selama 2–3 bulan pertama (volume masih kecil; sesi-sesi pertama menentukan reputasi fitur).
- Level **Junior dibuka belakangan**, setelah reputasi terbentuk — sebagai pintu masuk yang sensitif harga, dengan supervisi senior.
- Level **Senior** diposisikan sebagai "naik kelas": kasus kompleks & second opinion.
- **Harga khusus pelanggan: Rp 750–800rb** (diskon 20–25% dari mid) — **diputuskan Kartika, Juli 2026**. Angka operasional saat implementasi: Rp 750rb.

## 5. Urutan Pembangunan (bertahap, jangan sekaligus)

| Tahap | Isi | Kenapa duluan |
|---|---|---|
| **1** | Kurva Pertumbuhan + Jurnal Momen | Nilai terasa cepat, teknis paling ringan, langsung memakai profil anak yang sudah ada |
| **2** | Skrining Perkembangan + Konsultasi Psikolog Anak + **Portal Psikolog** (jadwal, kapasitas, review konten) | Jantung cerita "didampingi psikolog"; butuh validasi instrumen oleh psikolog HCC dulu; konsultasi tidak bisa jalan tanpa portal |
| **3** | Edukasi Terkurasi + pengingat + Imunisasi | Butuh alur kerja review psikolog yang rutin |
| **4** | Log Harian Nanny | Butuh desain agar tidak membebani nanny (target < 1 menit/hari) |

## 6. Ukuran Berhasil

| Metrik | Target |
|---|---|
| Pelanggan yang memakai fitur Tumbuh Kembang tiap bulan | > 60% |
| Perpanjangan langganan tahun ke-2 | naik dari target 60% → 70% |
| Akun gratis yang berlangganan setelah mencatat data anak | > 15% |
| Sesi Konsultasi Psikolog Anak per bulan | ≤ jumlah psikolog aktif × 3 sesi/hari (batas atas 5) — terpantau di Portal Psikolog |

## 7. Keputusan yang Sudah Dijawab (Kartika, Juli 2026)

1. **Harga Konsultasi Psikolog Anak: berjenjang per level psikolog** — Junior Rp 500rb · Mid Rp 1jt · Senior Rp 2jt. Peluncuran memakai harga mid (Rp 1jt). ✔
   **Harga khusus pelanggan: Rp 750rb** (diskon 25% dari mid) ✔ — tidak ada lagi keputusan yang menggantung di dokumen ini.
2. **Kapasitas psikolog dikelola lewat Portal Psikolog** (lihat §3b). ✔ Rasio kerja: **1 psikolog = 3 sesi konsultasi/hari** (nyaman), **maksimum 5 sesi/hari**. Kapasitas total platform = jumlah psikolog aktif × rasio tersebut, dan harus terlihat otomatis di portal.
3. **Instrumen skrining: disetujui** — psikolog HCC memvalidasi adaptasi KPSP sebelum Tahap 2 dibangun. ✔
4. **Ritme konten: dua-mingguan** untuk saat ini. ✔

## 8. Risiko yang Sudah Diantisipasi

| Risiko | Penangkal |
|---|---|
| Terkesan memberi diagnosis → masalah hukum | Hasil skrining hanya 3 tingkat arahan; kata "diagnosis" dilarang di UI; disclaimer di setiap hasil |
| Konten mati → langganan terasa basi | Alur AI-draft + review psikolog dibuat ringan; ritme disepakati di keputusan terbuka #4 |
| Nanny terbebani mencatat | Log harian maksimal 1 menit, berbentuk ketuk-ketuk bukan mengetik |
| Bersaing dengan aplikasi gratis | Kita tidak menjual pencatatan (itu gratis juga di kita) — kita menjual interpretasi + psikolog sungguhan + mata kedua (nanny) |

---

*Rujukan: [ADR-007](08_adr/ADR-007_langganan-dua-pilar.md) · [Matriks Layanan](12_matriks_layanan.md) · [PRD Utama](06_prd.md) · Glossary: [CONTEXT.md](../../CONTEXT.md)*
