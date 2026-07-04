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
Cache skor kecocokan orang tua ↔ nanny untuk direktori, dihitung tanpa Sesi Matching formal.
_Avoid_: dirancukan dengan Hasil Matching

**Domain (A/B/C)**:
Tiga kelompok aspek kecocokan: A Kondisi Kerja, B Nilai & Gaya Hidup, C Pengalaman & Kemampuan. Total 9 aspek, 53 pertanyaan.

**Dealbreaker**:
Pertanyaan yang ditandai "wajib cocok" oleh salah satu pihak. Ketidakcocokan memicu negosiasi, bukan penolakan otomatis. Framing selalu "perlu dibicarakan".
_Avoid_: red flag, penolakan

**Layer (1/2/3)**:
Tingkat kedalaman assessment: Layer 1 survey kecocokan (gratis dalam langganan), Layer 2 + psikotes AI (add-on), Layer 3 + review Psikolog HCC (add-on premium).

**Periode Eksklusif**:
Masa 7 hari (bisa diperpanjang 1× +3 hari) saat nanny terikat pada satu orang tua selama Sesi Matching. Lewat tanpa keputusan → nanny kembali ke Talent Pool.

**Flow A (Referral)**:
Koneksi yang terjadi karena orang tua mengundang nanny tertentu via kode undangan.

**Flow B (Talent Pool)**:
Koneksi yang terjadi karena AI merekomendasikan nanny dari kumpulan nanny yang tersedia. Hanya untuk pelanggan aktif.

**Talent Pool**:
Kumpulan nanny yang tersedia dan bisa direkomendasikan AI ke orang tua berlangganan.

**Open to Job**:
Status nanny yang aktif mencari keluarga baru (gaya LinkedIn).

### Monetisasi

**Langganan**:
Paket tahunan Rp 500rb untuk orang tua — membuka matching, monitoring, dan Kuota Koneksi penuh.
_Avoid_: subscription (di UI), membership

**Kuota Koneksi**:
Jatah membuka kontak nanny per rolling 30 hari: gratis 3 (Flow A saja); berlangganan 3 Flow A + 7 Flow B. Habis → beli koneksi tambahan Rp 100rb.
_Avoid_: unlock, pay-per-unlock

**Placement Fee**:
Biaya penyaluran saat nanny resmi mulai bekerja: Rp 1,2jt (jangka panjang) / Rp 600rb (infal).

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
Area kerja khusus psikolog HCC di platform: jadwal & kapasitas konsultasi (3 sesi/hari/psikolog, maks 5), antrean review konten, dan catatan hasil sesi.
_Avoid_: dashboard admin (portal psikolog bukan admin)

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
