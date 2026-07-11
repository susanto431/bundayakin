# PRD — Pilar Tumbuh Kembang
## BundaYakin — Human Care Consulting

> Versi 1.3 · Juli 2026 · Hasil sesi keputusan bersama Kartika (grill-with-docs) — §7b ditambahkan 8 Juli 2026, §7d ditambahkan 11 Juli 2026
> Keputusan strategis yang mendasari: [ADR-007 Langganan Dua Pilar](08_adr/ADR-007_langganan-dua-pilar.md)
> Status: **Tahap 1 & 2 selesai dikoding, menunggu deploy** (Kurva Pertumbuhan, Jurnal Momen, Skrining Perkembangan, Konsultasi Psikolog Anak, Portal Psikolog) — Tahap 3–4 masih rencana
>
> ⚠️ **Catatan penting Tahap 1:** data acuan median WHO di `src/lib/growth-standards.ts` direkonstruksi dari pengetahuan umum kesehatan anak (bukan diunduh dari tabel LMS resmi WHO), dan dihitung dengan interpolasi linear antar titik acuan — bukan kurva LMS penuh. Cukup untuk kecenderungan umum, **belum cukup presisi untuk klaim persentil klinis**. Aplikasi sengaja hanya menampilkan kategori kasar (sesuai/perlu pantau/perlu perhatian) + disclaimer "bukan alat diagnosis". **Sebelum tayang ke publik/materi marketing, validasi tabel ini dengan psikolog/tenaga medis HCC** — perlakuan sama seperti instrumen Skrining Perkembangan (KPSP) di Tahap 2.

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
| 2 | **Skrining Perkembangan** | Isi checklist milestone sesuai usia (basis KPSP Kemenkes): motorik, bicara, sosial — **mengisi gratis untuk semua akun** | Hasil 3 tingkat (khusus pelanggan): *sesuai usia* / *perlu stimulasi* (+ ide stimulasi) / *sebaiknya konsultasi*. **Tombol Konsultasi Psikolog Anak kini ditawarkan di ketiga tingkat hasil** (bukan cuma yang bermasalah) — soft-selling, framing disesuaikan per tingkat supaya tidak terkesan "hasil buruk" (keputusan 11 Juli 2026, §7d) |
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
| Mengisi checklist Skrining Perkembangan | ✔ | ✔ |
| Melihat hasil skrining (kategori + rekomendasi stimulasi) | ✘ | ✔ |
| Perpustakaan edukasi penuh | 1 artikel contoh per terbitan (dua-mingguan) | ✔ semua |
| Pengingat imunisasi & skrining | ✘ | ✔ |
| Log Harian Nanny masuk ke rekam anak | ✘ | ✔ |
| Laporan PDF tumbuh kembang | ✘ | ✔ |

**Konsultasi Psikolog Anak** = add-on per sesi (di luar langganan) — **bisa dibeli baik oleh akun gratis maupun pelanggan**, tidak mensyaratkan langganan Tumbuh Kembang aktif. Harga **berjenjang mengikuti level psikolog** (ditetapkan Juli 2026):

| Level psikolog | Harga/sesi |
|---|---|
| Junior | Rp 500.000 |
| Mid | **Rp 1.000.000** ← harga peluncuran/default |
| Senior | Rp 2.000.000 |

**Strategi peluncuran (disetujui Kartika, Juli 2026):**
- Peluncuran memakai **harga mid (Rp 1jt)**, dan sesi juga dikerjakan langsung oleh psikolog **level Mid** (bukan disupervisi Senior — dikoreksi 11 Juli 2026, lihat §7c poin 6; kode `LAUNCH_ASSIGNMENT_LEVEL` sebelumnya salah di-hardcode ke Senior).
- Level **Junior dibuka belakangan**, setelah reputasi terbentuk — sebagai pintu masuk yang sensitif harga.
- Level **Senior** diposisikan sebagai "naik kelas": kasus kompleks & second opinion.
- **Harga khusus pelanggan: Rp 750–800rb** (diskon 20–25% dari mid) — **diputuskan Kartika, Juli 2026**. Angka operasional saat implementasi: Rp 750rb.

## 5. Urutan Pembangunan (bertahap, jangan sekaligus)

| Tahap | Isi | Kenapa duluan |
|---|---|---|
| **1** ✅ | Kurva Pertumbuhan + Jurnal Momen — **selesai dikoding Juli 2026** | Nilai terasa cepat, teknis paling ringan, langsung memakai profil anak yang sudah ada |
| **2** ✅ | Skrining Perkembangan + Konsultasi Psikolog Anak + **Portal Psikolog** (jadwal, kapasitas) — **selesai dikoding Juli 2026, menunggu deploy.** Antrean review konten Edukasi Terkurasi di Portal Psikolog menyusul Tahap 3 (butuh fitur Edukasi Terkurasi ada dulu) | Jantung cerita "didampingi psikolog"; hasil "sebaiknya konsultasi" kini langsung terhubung ke booking sungguhan, bukan lagi CS manual |
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
3. **Instrumen skrining: TERVALIDASI (Juli 2026)** — sumber resmi (Buku Panduan KPSP FK Unhas 2018, mengacu SDIDTK Depkes 2010) diterima dari Kartika, 158 soal/16 kelompok usia ditranskripsi ke `kpsp-instrument.ts` + `kpsp-scoring.ts`. Detail: [17_draft_instrumen_skrining_kpsp.md](17_draft_instrumen_skrining_kpsp.md). ✔ Prasyarat Tahap 2 terpenuhi.
4. **Ritme konten: dua-mingguan** untuk saat ini. ✔

## 7b. Keputusan Portal Psikolog & Konsultasi (Kartika, 8 Juli 2026 — sesi grill-with-docs)

1. **Akun psikolog**: jenis akun baru ("Psikolog") ditambahkan ke sistem. Dibuat **manual oleh tim HCC** setelah proses screening — sama seperti pola akun Admin, bukan pendaftaran mandiri lewat form publik. ✔
2. **Dibangun menyatu di `apps/web`** (bukan service terpisah) — lihat [ADR-010](08_adr/ADR-010_portal-psikolog-built-in.md). Rencana psikolog lintas-produk HCC (assessment center, psikogram, interview psikotes) masih rencana jangka panjang belum pasti; kalau nanti terwujud, keputusan ini di-revisit. ✔
3. **Diskon pelanggan hanya berlaku untuk tarif Mid** (Rp750rb) — Junior & Senior belum dijual sama sekali saat peluncuran (konsisten dengan §4/§5), jadi belum perlu mekanisme diskon untuk level lain. Didiskusikan lagi saat Junior/Senior resmi dibuka. ✔
4. **Panel Pengaturan Harga menyiapkan 4 harga sekaligus** (Junior/Mid/Senior/harga Pelanggan) walau Junior & Senior belum bisa dibeli user — hanya admin yang bisa melihat/mengatur ke-4 nya; orang tua hanya melihat pilihan yang sudah dibuka (saat ini: Mid & harga Pelanggan). Satu jenis transaksi umum untuk semua level, jumlah dicatat sesuai level yang dipilih saat itu. ✔
5. **Booking pakai slot jam tetap** ("Slot Konsultasi" — lihat glossary [CONTEXT.md](../../CONTEXT.md)): 3 jam baku yang sama untuk semua psikolog (09:00/13:00/16:00, mengikuti kuota 3 sesi/hari). Orang tua memilih tanggal DAN slot jam saat booking. ~~Psikolog belum atur jadwal masing-masing sendiri saat peluncuran~~ — **direvisi 11 Juli 2026, lihat §7c poin 5**: psikolog sekarang atur [[Jadwal Psikolog]] sendiri.

## 7c. Keputusan Alur Pilih Psikolog, Ulasan & Jadwal Individual (Kartika, 11 Juli 2026 — sesi grill-with-docs)

Dipicu oleh laporan Kartika: halaman booking parent-facing menampilkan semua slot "Penuh" terus-menerus, dan pertanyaan apakah nama psikolog perlu ditampilkan ke orang tua.

1. **Alasan menampilkan psikolog: kontinuitas + kecocokan pengalaman** — orang tua ingin bisa lanjut dengan psikolog yang sama, dan melihat pengalaman psikolog sebelum memilih. Bukan sekadar transparansi nama. ✔
2. **Dua pintu masuk booking, keduanya dibangun**: (a) orang tua pilih psikolog dulu (lihat profil, [[Jam Terbang Psikolog]], dan tanda "pernah menangani [anak ini]" kalau ada riwayat) → baru pilih tanggal/jam untuk psikolog itu; (b) orang tua pilih tanggal dulu → sistem tampilkan psikolog mana saja yang tersedia di jam-jam itu. Ujung dua alur ini sama. ✔
3. **Jam Terbang Psikolog**: dihitung dari jumlah sesi Konsultasi Psikolog Anak yang sudah selesai (1 sesi = 1 jam), **ditampilkan publik** ke semua orang tua saat memilih psikolog. Lihat glossary [[Jam Terbang Psikolog]]. ✔
4. **Ulasan Psikolog** (baru): setelah sesi selesai, orang tua diajak (bukan diwajibkan, dengan pesan ajakan yang halus/psikologis) mengisi rating + pilihan ganda + esai bebas tentang psikolog tsb. **Hanya untuk pemantauan kualitas internal HCC** — tidak pernah tampil ke orang tua lain, tidak ada skor publik/bintang. Lihat glossary [[Ulasan Psikolog]]. ✔
5. **Jadwal Psikolog individual** (baru): psikolog sekarang atur jam kerjanya sendiri di Portal Psikolog — pola mingguan berulang (menyalakan/mematikan mana dari 3 Slot Konsultasi baku yang ia buka tiap hari-dalam-minggu), plus tandai tanggal cuti. **Tetap 3 jam baku (09:00/13:00/16:00)** — psikolog tidak isi rentang jam bebas, supaya aturan kapasitas 3-5 sesi/hari tidak perlu diubah. Lihat glossary [[Jadwal Psikolog]]. Ini membatalkan keputusan §7b poin 5 yang lama (jam sama rata tanpa jadwal individual). ✔
6. **Koreksi bug/dokumen**: level psikolog yang benar-benar mengerjakan sesi peluncuran adalah **Mid** (sesuai harga yang dijual), BUKAN Senior seperti tertulis sebelumnya di §4. Kode `LAUNCH_ASSIGNMENT_LEVEL` yang hardcode ke `"SENIOR"` adalah bug — kemungkinan besar inilah penyebab semua slot booking tampil "Penuh" kalau akun psikolog yang sudah dibuat levelnya Mid. Perlu diperbaiki ke `"MID"`. ✔

## 7d. Soft-Selling Konsultasi Psikolog Anak di Skrining Perkembangan (Kartika, 11 Juli 2026)

Dipicu oleh laporan Kartika: (1) mengisi skrining sekali malah membuat 2 baris riwayat identik, dan (2) tombol Konsultasi Psikolog Anak sebaiknya ditawarkan di semua hasil skrining — bukan cuma yang bermasalah — supaya bisa jadi soft-selling apapun hasilnya.

1. **Bug duplikasi diperbaiki**: tombol "Lihat hasil" hanya di-disable lewat state React yang butuh satu siklus render untuk sampai ke DOM — dua tap cepat (umum di layar sentuh) bisa mengirim 2 permintaan simpan sebelum tombol sempat nonaktif. Ditambahkan penjaga sinkron di `ScreeningClient.tsx` yang memblokir permintaan kedua seketika. ✔
2. **Tombol Konsultasi Psikolog Anak kini muncul di ketiga tingkat hasil** (*sesuai usia* / *perlu stimulasi* / *sebaiknya konsultasi*), tidak hanya tingkat terakhir. Framing kalimat disesuaikan per tingkat supaya hasil bagus tidak terkesan "ada yang salah" — murni ajakan, bukan peringatan. ✔
3. **Ditawarkan juga ke akun gratis** (belum berlangganan): kartu hasil untuk non-pelanggan sekarang punya tombol kedua "Atau konsultasi psikolog anak" di samping ajakan langganan — konsisten dengan §4, karena Konsultasi Psikolog Anak memang tidak mensyaratkan langganan aktif. ✔

## 8. Risiko yang Sudah Diantisipasi

| Risiko | Penangkal |
|---|---|
| Terkesan memberi diagnosis → masalah hukum | Hasil skrining hanya 3 tingkat arahan; kata "diagnosis" dilarang di UI; disclaimer di setiap hasil |
| Konten mati → langganan terasa basi | Alur AI-draft + review psikolog dibuat ringan; ritme disepakati di keputusan terbuka #4 |
| Nanny terbebani mencatat | Log harian maksimal 1 menit, berbentuk ketuk-ketuk bukan mengetik |
| Bersaing dengan aplikasi gratis | Kita tidak menjual pencatatan (itu gratis juga di kita) — kita menjual interpretasi + psikolog sungguhan + mata kedua (nanny) |

---

*Rujukan: [ADR-007](08_adr/ADR-007_langganan-dua-pilar.md) · [Matriks Layanan](12_matriks_layanan.md) · [PRD Utama](06_prd.md) · Glossary: [CONTEXT.md](../../CONTEXT.md)*
