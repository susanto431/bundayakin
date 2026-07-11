# BundaYakin

Platform kecocokan dan pemantauan nanny berbasis psikologi milik Human Care Consulting (HCC). Konteks ini mencakup seluruh monorepo (web + pdf-service). Glossary ini adalah bahasa kanonik — gunakan istilah di bawah secara konsisten di kode, dokumen, dan UI.

## Language

### Aktor

**Orang Tua (Parent)**:
Keluarga yang mencari nanny dan membayar langganan. Pemegang akun utama sisi demand.
_Avoid_: klien, customer, employer

**Nanny**:
Pengasuh anak yang membuat profil digital gratis dan mengikuti Tes Kecocokan. Sisi supply platform.
_Avoid_: babysitter, ART, pengasuh (di konteks formal)

**Psikolog HCC**:
Psikolog internal yang melakukan review Layer 3. Di marketing publik cukup disebut "psikolog" tanpa nama HCC.

**Anak (Child)**:
Subjek pengasuhan dengan profil terstruktur (alergi, jadwal, do-list/don't-list). Satu orang tua bisa punya banyak profil anak.

### Matching

**Tes Kecocokan**:
Istilah user-facing untuk seluruh proses survey + scoring kecocokan.
_Avoid_: Survey Matching, matching survey (di UI)

**Sesi Matching (MatchingRequest)**:
Satu proses matching formal antara satu orang tua dan satu nanny, dari survey sampai keputusan terima/tolak.

**Hasil Matching (MatchingResult)**:
Output AI scoring dari satu Sesi Matching formal: skor per domain, highlight, tips negosiasi.
_Avoid_: dirancukan dengan Skor Direktori

**Skor Direktori (MatchResult)**:
Cache skor kecocokan orang tua ↔ nanny untuk direktori, dihitung tanpa Sesi Matching formal. Ditampilkan bersama [[Komparasi Preferensi]] (terhitung terpisah, deterministik) di halaman profil nanny & drawer "Detail Nanny".
_Avoid_: dirancukan dengan Hasil Matching

**Domain (A/B/C)**:
Tiga kelompok aspek kecocokan: A Kondisi Kerja, B Nilai & Gaya Hidup, C Pengalaman & Kemampuan. Total 9 aspek, 53 pertanyaan.

**Dealbreaker**:
Pertanyaan yang ditandai "wajib cocok" oleh salah satu pihak, DAN kedua pihak sudah sama-sama mengisi jawabannya, tapi jawabannya berbeda. Ketidakcocokan memicu negosiasi, bukan penolakan otomatis. Framing selalu "perlu dibicarakan" (bukan "Tidak Cocok"). Orang tua tetap bisa membuka kontak nanny yang kena Dealbreaker untuk negosiasi — Kuota Koneksi tetap terpotong seperti pembukaan kontak biasa (keputusan 8 Juli 2026).
_Avoid_: red flag, penolakan, "Tidak Cocok"
_Catatan_: pihak yang belum mengisi Tes Kecocokan sama sekali BUKAN Dealbreaker — itu profil belum lengkap, lihat [[Talent Pool]].

**Layer (1/2/3)**:
Tingkat kedalaman assessment: Layer 1 survey kecocokan (gratis dalam langganan), Layer 2 + psikotes AI (add-on), Layer 3 + review Psikolog HCC (add-on premium). Layer 3 dibangun DI ATAS hasil Layer 2 (skor Capture Work Style), bukan proses terpisah — psikolog menambahkan bacaan tes grafis + catatan klinis di atas skor otomatis Layer 2.

**Capture Work Style**:
Instrumen kepribadian milik HCC sendiri (revisi dari PAPI Kostick, item & kunci jawaban buatan HCC) — dasar skoring otomatis Layer 2 (Psikotes AI). Skoring deterministik (rumus tetap), dibangun built-in di `apps/web` sebagai deviasi terkontrol dari ADR-009 (lihat [ADR-011](docs/opds/08_adr/ADR-011_capture-work-style-built-in.md)).
_Avoid_: PAPI Kostick (nama instrumen asli — bukan nama produk HCC yang dipakai user-facing)
_Catatan (11 Juli 2026)_: Nanny bisa mengerjakan Capture Work Style lewat dua jalur yang berdampingan — mandiri gratis dari dashboard-nya sendiri, atau dipicu lewat [[Undangan Psikotes]] dari Orang Tua. Mandiri sengaja dipertahankan meski ada Undangan Psikotes: setiap Nanny yang mengisi menambah data ke seluruh pool platform, bukan cuma jadi milik satu Orang Tua yang membayar. Lihat [ADR-014](docs/opds/08_adr/ADR-014_undangan-psikotes.md).

**Undangan Psikotes**:
Aksi Orang Tua membayar (harga diatur admin lewat panel harga, default Rp 300rb — sama dengan harga buka hasil) untuk seorang Nanny tertentu: kalau Nanny itu belum pernah mengerjakan Capture Work Style, pembayaran ini memicu dia mengerjakannya (Orang Tua otomatis dapat akses hasil begitu selesai, tanpa bayar kedua); kalau Nanny itu sudah pernah mengerjakan (baik mandiri maupun lewat Undangan Orang Tua lain), pembayaran yang sama langsung membuka hasil detailnya. Satu harga, satu tombol di NannyDetailDrawer yang teksnya berubah sesuai status Nanny ("Kirim Undangan Psikotes" vs "Lihat Hasil Psikotes"). Tidak ada batas waktu maupun refund kalau Nanny tidak kunjung mengerjakan — sistem hanya mengirim reminder WA berkala ke Nanny sampai selesai.
_Avoid_: Assignment Psikotes, Penugasan Psikotes — bentrok makna dengan Penugasan (NannyAssignment) yang berarti hubungan kerja aktif nanny-keluarga, bukan soal tes.

**Tester HCC**:
Admin HCC yang memandu sesi Zoom pengambilan tes grafis (DAP+BAUM) dengan nanny untuk Layer 3, lalu meng-upload hasil gambarnya ke sistem. Bukan peran/akun baru — memakai akun ADMIN yang sudah ada.
_Avoid_: psikolog (Tester bukan yang menginterpretasi hasil — itu tugas Psikolog HCC)

**Periode Eksklusif**:
Masa 7 hari (bisa diperpanjang 1× +3 hari) saat nanny terikat pada satu orang tua selama Sesi Matching. Lewat tanpa keputusan → nanny kembali ke Talent Pool.

**Flow A (Referral)**:
Koneksi yang terjadi karena orang tua mengundang nanny tertentu via kode undangan.

**Flow B (Talent Pool)**:
Koneksi yang terjadi karena AI merekomendasikan nanny dari kumpulan nanny yang tersedia. Hanya untuk pelanggan aktif.

**Talent Pool**:
Kumpulan nanny yang tersedia dan bisa direkomendasikan AI ke orang tua berlangganan. Syarat masuk: `openToJob`, `isAvailable`, DAN sudah menyelesaikan Tes Kecocokan (`surveyCompletedAt` terisi) — nanny yang belum isi survey tidak direkomendasikan dulu sampai profilnya lengkap (keputusan 8 Juli 2026, lihat [[Dealbreaker]]).
_Catatan (Juli 2026)_: tidak ada jalur "admin carikan nanny secara manual" — orang tua mencari sendiri lewat Talent Pool (Flow B) atau mengundang kandidat sendiri (Flow A). Keputusan produk: opsi bantu-cari-nanny via CS sengaja tidak dibuka.

**Open to Job**:
Status nanny yang aktif mencari keluarga baru (gaya LinkedIn).

**Komparasi Preferensi**:
Tampilan di halaman [[Skor Direktori]] yang membandingkan jawaban Tes Kecocokan Bunda vs Nanny per aspek (9 baris: A1, A2, B1, B2, B3, C1–C4), status per aspek: Cocok / Beda Preferensi / Perlu Dibicarakan / Belum Ada Data. Dihitung **deterministik** langsung dari `SurveyResponse` mentah (bukan dari AI) — sumber kebenaran terpisah dari skor domain A/B/C yang dihasilkan Claude API, bisa sesekali tidak sinkron dengan skor itu karena keduanya mengukur hal berbeda (lihat [ADR-015](docs/opds/08_adr/ADR-015_komparasi-preferensi-deterministik.md)). Gratis, tidak dikunci di balik Kuota Koneksi.
_Avoid_: skor per aspek (istilah ini bukan skor/angka, tapi status kecocokan jawaban)

**Beda Preferensi**:
Status di [[Komparasi Preferensi]] untuk aspek yang jawaban Bunda & Nanny berbeda TAPI tidak ada pihak yang menandainya wajib cocok — netral, bukan [[Dealbreaker]]. Dibedakan dari framing "Perlu Dibicarakan" yang khusus dipakai untuk Dealbreaker asli, supaya perbedaan preferensi kecil tidak terkesan seserius Dealbreaker.

### Monetisasi

**Langganan**:
Paket tahunan Rp 500rb untuk orang tua — membuka matching, monitoring, dan Kuota Koneksi penuh.
_Avoid_: subscription (di UI), membership

**Kuota Koneksi**:
Jatah membuka kontak nanny per rolling 30 hari: gratis 3 (Flow A saja); berlangganan 3 Flow A + 7 Flow B. Habis → beli koneksi tambahan Rp 100rb.
_Avoid_: unlock, pay-per-unlock

**Placement Fee**:
Biaya penyaluran saat nanny resmi mulai bekerja: satu tarif flat Rp 1,2jt untuk semua jenis penempatan (keputusan 5 Juli 2026 — Rp 600rb infal tidak pernah benar-benar di-charge, koreksi dari dokumen lama).

**Jaminan Kecocokan**:
Janji platform: jika nanny berhenti dalam 30 hari pertama penugasan, orang tua mendapat matching ulang dan penempatan ulang gratis penuh (tanpa kuota, tanpa placement fee kedua), berlaku satu kali per penempatan.
_Avoid_: garansi ganti orang, refund

### Pemantauan

**Penugasan (NannyAssignment)**:
Hubungan kerja aktif nanny ↔ keluarga, dimulai saat nanny mulai bekerja. Bisa mencakup lebih dari satu anak.
_Avoid_: kontrak, placement (untuk konsep ini)

**Check-in**:
Pemantauan singkat (5 pertanyaan, dua arah) di minggu ke-1 dan ke-2 penugasan.
_Avoid_: dirancukan dengan Evaluasi

**Evaluasi**:
Penilaian penuh dua arah (10 pertanyaan + narasi + ringkasan AI) di bulan ke-1, ke-3, lalu tiap kuartal.

### Tumbuh Kembang

**Tumbuh Kembang**:
Pilar kedua langganan (keputusan Juli 2026): pusat pencatatan dan pemantauan perkembangan anak. Pilar pertama tetap matching & pemantauan nanny.
_Avoid_: parenting hub, child development center (di UI)

**Rekam Tumbuh Kembang**:
Kumpulan data perkembangan satu anak: kurva pertumbuhan, hasil skrining, imunisasi, dan jurnal momen.
_Avoid_: rekam medis (kita bukan layanan medis)

**Kurva Pertumbuhan**:
Plot berat/tinggi/lingkar kepala anak terhadap standar WHO. Interpretasi kurva khusus pelanggan; pencatatan angka gratis.

**Skrining Perkembangan**:
Checklist milestone sesuai usia berbasis instrumen resmi (KPSP Kemenkes). Hasilnya arahan, bukan diagnosis: "sesuai usia" / "perlu stimulasi" / "sebaiknya konsultasi".
_Avoid_: tes psikologi anak, diagnosis

**Log Harian Nanny**:
Catatan singkat harian nanny aktif (makan, tidur, stimulasi, momen baru) yang masuk ke Rekam Tumbuh Kembang. Pembeda utama vs aplikasi parenting lain.

**Konsultasi Psikolog Anak**:
Sesi berbayar dengan psikolog HCC, pintu eskalasi dari hasil Skrining Perkembangan. Harga mengikuti Level Psikolog; pelanggan mendapat harga khusus.
_Avoid_: konsultasi gratis, chat psikolog

**Level Psikolog**:
Jenjang psikolog HCC yang menentukan harga sesi: Junior (Rp 500rb), Mid (Rp 1jt — harga peluncuran), Senior (Rp 2jt).
_Avoid_: grade, tier (di UI)

**Portal Psikolog**:
Area kerja khusus psikolog HCC di platform: atur [[Jadwal Psikolog]] & kapasitas konsultasi (3 sesi/hari/psikolog, maks 5), antrean review konten, dan catatan hasil sesi.
_Avoid_: dashboard admin (portal psikolog bukan admin)

**Slot Konsultasi**:
Tiga jam baku yang tersedia tiap hari untuk Konsultasi Psikolog Anak: 09:00/13:00/16:00 — sama untuk semua psikolog sebagai pilihan jam, tidak ada jam bebas/rentang. Orang tua memilih tanggal DAN slot jam saat booking, bukan hanya tanggal. Mana dari 3 jam ini yang benar-benar dibuka tiap psikolog diatur lewat [[Jadwal Psikolog]] masing-masing (keputusan 11 Juli 2026 — sebelumnya sama untuk semua psikolog tanpa pilihan individual).

**Jadwal Psikolog**:
Pola jam kerja mingguan berulang milik satu psikolog — psikolog menyalakan/mematikan mana dari 3 [[Slot Konsultasi]] baku yang ia buka di tiap hari-dalam-minggu, berlaku otomatis tiap minggu sampai diubah. Psikolog menandai tanggal cuti untuk mengecualikan tanggal tertentu dari pola ini. Diatur psikolog sendiri di Portal Psikolog (keputusan 11 Juli 2026 — sebelumnya tidak ada, semua psikolog dianggap buka jam yang sama).
_Avoid_: jam bebas, rentang jam (psikolog tidak isi rentang jam sendiri, hanya menyalakan/mematikan dari 3 jam baku)

**Ulasan Psikolog**:
Penilaian orang tua atas satu sesi Konsultasi Psikolog Anak (pilihan ganda + esai bebas), diisi opsional setelah sesi selesai — sistem mengajak dengan pesan yang mendorong (bukan mewajibkan). Hanya untuk pemantauan kualitas internal HCC (dilihat lewat Portal Admin) — TIDAK pernah ditampilkan ke orang tua lain.
_Avoid_: Evaluasi (istilah itu khusus pemantauan dua arah orang tua ↔ nanny, lihat [[Evaluasi]] — Ulasan Psikolog satu arah dan konteksnya beda)
_Avoid_: rating publik, ulasan publik, bintang (tidak pernah tampil ke orang tua lain)

**Jam Terbang Psikolog**:
Total pengalaman seorang psikolog HCC, dihitung dari jumlah sesi Konsultasi Psikolog Anak yang sudah ia selesaikan (1 sesi selesai = 1 jam). Ditampilkan publik ke orang tua saat memilih psikolog — beda dari [[Ulasan Psikolog]] yang internal.
_Avoid_: rating, skor kualitas (ini murni akumulasi pengalaman, bukan penilaian mutu)

**Edukasi Terkurasi**:
Konten parenting sesuai usia anak — draft ditulis AI, disetujui dan diatasnamakan psikolog HCC sebelum tayang.
_Avoid_: artikel AI (tanpa reviewer), tips otomatis

### Reputasi

**Rekam Jejak (Track Record)**:
Riwayat kerja nanny yang terverifikasi platform, berasal dari keluarga yang benar-benar pernah mempekerjakannya. Akses berbayar untuk orang tua.
_Avoid_: review, rating (sebagai istilah utama)

**Referensi (NannyReference)**:
Kontak keluarga sebelumnya yang diinput manual oleh nanny — bukan review platform, tidak terverifikasi otomatis.

**Badge Terpercaya**:
Penanda reputasi nanny yang bertahan ≥3 bulan di satu keluarga.

**NannyCare Profile™**:
Dokumen PDF rahasia hasil review Layer 3 oleh Psikolog HCC. Isi pesan psikolog tidak boleh diubah/diparafrase sistem.

**Referral**:
Program insentif: nanny mereferensikan nanny lain (bonus bertahap saat diterima/1 bulan/3 bulan), orang tua mereferensikan orang tua/nanny baru.
