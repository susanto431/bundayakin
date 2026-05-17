# FEATURE BREAKDOWN PER USER ROLE — BundaYakin
> Dokumen ini merinci semua fitur berdasarkan role pengguna beserta user journey lengkapnya.
> Sumber kebenaran: prisma/schema.prisma + src/app/dashboard/ + src/app/api/
>
> **Keputusan produk aktif (Mei 2026):**
> - Terminologi: "Survey Matching" → **"Tes Kecocokan"** di seluruh UI user-facing (route & kode internal tetap pakai `survey`)
> - KTP **tidak diminta** dari nanny — tidak ada background checking oleh platform
> - Model unlock: **Kuota Koneksi** (3 gratis/30 hari di referral flow, +7 dengan langganan)
> - Payment gateway: **Mayar** (menggantikan Midtrans)
> - Score threshold: ≥80% teal "sangat cocok" · 60–79% orange "cukup cocok" · <60% red "perlu dipertimbangkan"
> - Video portfolio nanny: **Cloudflare Stream** · Foto portfolio: **Cloudflare R2**

---

## Daftar Isi
1. [Gambaran Umum Role](#1-gambaran-umum-role)
2. [Role: PARENT](#2-role-parent)
3. [Role: NANNY](#3-role-nanny)
4. [Role: ADMIN](#4-role-admin)
5. [Shared Flows — Lintas Role](#5-shared-flows--lintas-role)
6. [State Diagram Matching](#6-state-diagram-matching)
7. [Matriks Fitur × Role](#7-matriks-fitur--role)

---

## 1. Gambaran Umum Role

| Role | Akses | Monetisasi | Route |
|------|-------|-----------|-------|
| **PARENT** | Dashboard orang tua, matching, monitoring, evaluasi | Rp 500.000/tahun + add-on | `/dashboard/parent/*` |
| **NANNY** | Dashboard nanny, profil, Tes Kecocokan, monitoring | Gratis selamanya | `/dashboard/nanny/*` |
| **ADMIN** | Internal HCC, bisa switch role untuk testing | — | `/dashboard/admin/*` |

---

## 2. Role: PARENT

### 2.1 Feature List

| # | Fitur | Status | Biaya |
|---|-------|--------|-------|
| P-1 | Registrasi & Login | Aktif | Gratis |
| P-2 | Profil Orang Tua | Aktif | Gratis |
| P-3 | Profil Anak | Aktif | Dalam langganan |
| P-4 | Langganan Tahunan (via Mayar) | API siap · UI menunggu verifikasi Mayar | Rp 500.000/tahun |
| P-5 | Tes Kecocokan Layer 1 | Aktif | Dalam langganan |
| P-6 | Direktori Nanny (Browse) | Aktif | Dalam langganan |
| P-7 | Hasil Matching AI | Aktif | Dalam langganan |
| P-8 | Kuota Koneksi (buka kontak nanny) | Aktif | 3/bln gratis (referral) · +7/bln dalam langganan · Rp 100.000/org setelah kuota habis |
| P-9 | Placement (Mulai Kerja Sama) | Aktif | Dalam langganan |
| P-10 | Check-in Mingguan (Week 1 & 2) | Aktif | Dalam langganan |
| P-11 | Evaluasi Bulanan (Bulan 1, 3, dst) | Aktif | Dalam langganan |
| P-12 | Laporan Evaluasi PDF | Aktif | Dalam langganan |
| P-13 | Tes Psikologi AI Layer 2 | Dalam pengembangan | +Rp 300.000/kandidat |
| P-14 | Review Psikolog Layer 3 | Dalam pengembangan | +Rp 1.200.000–1.500.000 |
| P-15 | Akses Rekam Jejak Nanny | Aktif | +Rp 50.000/nanny |
| P-16 | Program Referral | Aktif | Gratis (dapat bonus) |
| P-17 | Ekspor Data | Aktif | Dalam langganan |
| P-18 | Knowledge Transfer (ganti nanny) | Aktif | Dalam langganan |

---

### 2.2 User Journey — PARENT

#### Journey 1: Registrasi & Onboarding Pertama Kali

```
[Landing Page]
    │
    ├─ Klik "Daftar Sebagai Orang Tua"
    │
    ▼
[Halaman Register — /auth/register/parent/]
    │ Isi: nama, email, password
    │ Submit → API: POST /api/auth/register (role: PARENT)
    │
    ▼
[Login Otomatis & Redirect]
    │ Session dibuat dengan role PARENT
    │
    ▼
[Dashboard Orang Tua — /dashboard/parent/]
    │ Tampil banner: "Lengkapi profil Anda dulu"
    │
    ├─── [Isi Profil — /dashboard/parent/profile/]
    │       Isi: nama lengkap, nomor HP, alamat, kota/provinsi
    │       Upload foto profil
    │       PATCH /api/parent/profile
    │
    ├─── [Tambah Profil Anak — /dashboard/parent/children/]
    │       Isi: nama anak, tanggal lahir, kelompok usia
    │       Isi: catatan medis, alergi, jadwal harian
    │       Isi: daftar boleh / tidak boleh
    │       POST /api/parent/children
    │
    └─── [Langganan — /dashboard/parent/subscription/]
            Pilih: Berlangganan Rp 500.000/tahun
            → POST /api/payment/create → Mayar invoice + paymentUrl
            → Redirect ke halaman pembayaran Mayar
            → Bayar (transfer / QRIS / e-wallet)
            → Webhook: POST /api/payment/webhook (verifikasi HMAC-SHA256)
            → Subscription.status = ACTIVE
            → Kembali ke dashboard, fitur unlocked
            ⚠️  MayarButton sedang dikembangkan — menunggu verifikasi akun Mayar
```

---

#### Journey 2: Cari Nanny & Mulai Matching

```
[Dashboard Parent — Sudah Berlangganan]
    │
    ├─ Klik "Cari Nanny"
    │
    ▼
[Direktori Nanny — /dashboard/parent/cari-nanny/direktori/]
    │ Filter: kota, tipe nanny (live-in, live-out, dll)
    │ Tampil kartu nanny dengan: foto, usia, pengalaman, kota
    │ GET /api/nanny/directory?city=...&type=...
    │
    ├─── [Lihat Detail Nanny — Drawer/Modal]
    │       Tampil profil lengkap nanny
    │       Tampil skor matching (jika sudah dihitung)
    │       Tombol: "Mulai Matching" atau "Unlock Kontak"
    │
    ▼
[Tes Kecocokan — /dashboard/parent/matching/survey/]
    │ 53 pertanyaan di 9 subdomain (A1, A2, B1, B2, B3, C1, C2, C3, C4)
    │ Format: pilihan ganda + skala slider + free text
    │ Dapat menandai pertanyaan sebagai DEALBREAKER
    │ Jawaban disimpan lokal (localStorage) selama pengisian
    │ Submit → POST /api/survey/save
    │
    │ Hasil skor ditampilkan dengan threshold:
    │   ≥80%  → teal  "sangat cocok"
    │   60–79% → orange "cukup cocok"
    │   <60%  → red   "perlu dipertimbangkan"
    │
    ▼
[Kalkulasi Skor — Otomatis]
    │ POST /api/matching/calculate
    │   └─ Ambil jawaban parent + nanny
    │   └─ Bangun prompt matching
    │   └─ Panggil Claude API (claude-sonnet-4-20250514)
    │   └─ Claude return JSON: skor, kekuatan, kelemahan, tips
    │   └─ Simpan ke MatchResult (di-cache permanen)
    │
    ▼
[Hasil Matching — /dashboard/parent/matching/[id]/]
    │ Tampil: Skor keseluruhan (0–100) + per domain (A, B, C)
    │ Tampil: Area kekuatan bersama
    │ Tampil: Area mismatch & negosiasi
    │ Tampil: Tips untuk orang tua & nanny
    │ Jika ada dealbreaker → banner "Perlu dibicarakan"
    │
    ├─── Jika cocok: Klik "Lanjut ke Penempatan"
    │       → Journey 3: Placement
    │
    └─── Jika tidak cocok: Kembali ke direktori, cari nanny lain
```

---

#### Journey 3: Placement (Mulai Kerja Sama Resmi)

```
[Hasil Matching — Skor Memuaskan]
    │
    ├─ Klik "Mulai Kerja Sama"
    │
    ▼
[Halaman Placement — /dashboard/parent/matching/[id]/placement/]
    │ Isi: tanggal mulai kerja
    │ Isi: tipe nanny (live-in / live-out / infal / temporary)
    │ Isi: gaji yang disepakati
    │ Submit → POST /api/matching/placement
    │   └─ Buat NannyAssignment di database
    │   └─ Aktifkan jadwal monitoring otomatis
    │
    ▼
[Dashboard Parent — Tampil Banner Aktif]
    │ "Nanny [Nama] mulai bekerja sejak [tanggal]"
    │ Timer hitung mundur ke check-in pertama (Week 1)
    │
    └─── Lanjut ke Journey 4: Monitoring
```

---

#### Journey 4: Monitoring & Evaluasi Berkala

```
[Week 1 — 7 Hari Setelah Mulai]
    │
    ├─ Notifikasi: "Waktunya Check-in Minggu Pertama"
    │
    ▼
[Form Check-in — /dashboard/parent/monitoring/]
    │ 5 pertanyaan singkat: kondisi umum, komunikasi, kenyamanan
    │ Free text: catatan / kekhawatiran
    │ Submit → POST /api/parent/monitoring (type: WEEK_1)
    │
    ▼ (7 hari kemudian)

[Week 2 — Check-in Minggu Kedua]
    │ Proses sama seperti Week 1
    │ POST /api/parent/monitoring (type: WEEK_2)
    │
    ▼ (~30 hari setelah mulai)

[Bulan 1 — Evaluasi Penuh Pertama]
    │
    ├─ Notifikasi: "Waktunya Evaluasi Bulan Pertama"
    │
    ▼
[Form Evaluasi — /dashboard/parent/monitoring/]
    │ 10+ pertanyaan: ketepatan waktu, kebersihan, komunikasi,
    │                  adaptasi, hubungan dengan anak
    │ Skala penilaian + narasi teks
    │ Keputusan: Lanjut / Pertimbangkan Lagi
    │ Submit → POST /api/parent/monitoring (type: MONTH_1)
    │   └─ AI analisa gabungan (parent + nanny)
    │   └─ Generate ringkasan & rekomendasi
    │   └─ Optional: generate PDF laporan
    │
    ▼
[Ringkasan Evaluasi — /dashboard/parent/monitoring/summary/]
    │ Tampil: skor per aspek (0–10)
    │ Tampil: tren dari waktu ke waktu
    │ Tampil: rekomendasi AI
    │ Unduh PDF laporan (opsional)
    │
    ├─── Jika LANJUT: jadwal evaluasi Bulan 3 otomatis
    └─── Jika GANTI NANNY: → Journey 5: Knowledge Transfer
```

---

#### Journey 5: Ganti Nanny & Knowledge Transfer

```
[Evaluasi — Keputusan: Ganti Nanny]
    │
    ▼
[Knowledge Transfer — Otomatis]
    │ Sistem kompilasi:
    │   - Ringkasan evaluasi dari nanny lama
    │   - Catatan anak yang relevan
    │   - Tips & pola yang berhasil
    │   - Area yang perlu perhatian khusus
    │
    ▼
[Kembali ke Cari Nanny]
    │ Profil anak sudah ada → skip pengisian ulang
    │ Tes Kecocokan parent tersimpan → bisa di-reuse atau diperbarui
    │ Knowledge Transfer report tersedia untuk nanny baru
    │
    └─── Ulang dari Journey 2: Cari Nanny
```

---

#### Journey 6: Kuota Koneksi — Buka Kontak Nanny

Sistem Kuota Koneksi menggantikan model pay-per-unlock lama:

```
Model Kuota Koneksi:
  Pengguna gratis   : 3 koneksi/30 hari (Flow A — referral)
  Langganan 500rb/th: 3 referral + 7 talent pool = 10 koneksi/bulan
  Setelah kuota habis: Rp 100.000/koneksi tambahan (via Mayar)
  Kuota renew otomatis tiap 30 hari (bukan per bulan kalender)

[Flow A — Nanny yang Kamu Undang (Referral)]
    │ Tampil nanny yang sudah menyelesaikan Tes Kecocokan
    │   menggunakan kode referral parent
    │ Label kuota: "Kuota koneksi" / "Pakai kuota (sisa X)"
    │
    ├─── Jika kuota tersisa → Pakai kuota
    │       POST /api/matching/unlock (type: QUOTA)
    │       Kontak terbuka, kuota berkurang 1
    │
    └─── Jika kuota habis → Upgrade inline (tidak pindah halaman)
            Pilihan: Rp 100.000/nanny ini ATAU langganan Rp 500.000/tahun
            Bayar via Mayar → kuota/akses terbuka

[Flow B — Talent Pool (AI rekomendasikan)]
    │ Sistem pilihkan 10 nanny terbaik berdasarkan Tes Kecocokan
    │ Batch 10 sekaligus, ada "Cari 10 nanny berikutnya"
    │
    └─── Buka kontak → pakai kuota langganan (7 slot/bulan)
            atau bayar Rp 100.000/nanny jika kuota habis
```

---

#### Journey 7: Referral Orang Tua

```
[Menu Referral — /dashboard/parent/referral/]
    │ Tampil: kode referral unik + link berbagi
    │
    ├─ Bagikan ke teman → teman daftar pakai kode
    │
    ▼
[Tracking Referral]
    │ Status: PENDING → REGISTERED → DEAL → PAID
    │ Bonus: Rp TBD per referral berhasil
    │
    └─── Bonus dikreditkan ke akun parent setelah DEAL
```

---

## 3. Role: NANNY

### 3.1 Feature List

| # | Fitur | Status | Biaya |
|---|-------|--------|-------|
| N-1 | Registrasi & Login | Aktif | Gratis |
| N-2 | Setup Profil Lengkap (tanpa KTP) | Aktif | Gratis |
| N-3 | CV Digital | Aktif | Gratis |
| N-2b | Video Perkenalan & Keahlian (CF Stream) | API siap · UI dalam pengembangan | Gratis |
| N-2c | Foto Portfolio Masakan & Keahlian (CF R2) | API siap · UI dalam pengembangan | Gratis |
| N-4 | Toggle "Open to Job" | Aktif | Gratis |
| N-5 | Tes Kecocokan | Aktif | Gratis |
| N-6 | Lihat Hasil Matching | Aktif | Gratis |
| N-7 | Lihat Profil Anak (saat aktif) | Aktif | Gratis |
| N-8 | Check-in Mingguan | Aktif | Gratis |
| N-9 | Evaluasi Berkala | Aktif | Gratis |
| N-10 | Unduh Laporan Evaluasi | Aktif | Gratis |
| N-11 | Rekam Jejak Digital | Aktif | Gratis |
| N-12 | Program Referral Nanny | Aktif | Gratis (dapat bonus) |
| N-13 | Notifikasi | Aktif | Gratis |
| N-14 | Ekspor Profil (CV) | Aktif | Gratis |

---

### 3.2 User Journey — NANNY

#### Journey 1: Registrasi & Setup Profil

```
[Landing Page]
    │
    ├─ Klik "Daftar Sebagai Nanny"
    │
    ▼
[Halaman Register — /auth/register/nanny/]
    │ Isi: nama, email, password
    │ Submit → POST /api/auth/register (role: NANNY)
    │
    ▼
[Dashboard Nanny — /dashboard/nanny/]
    │ Tampil progress bar: "Profil kamu [X]% lengkap"
    │ Tampil prompt: "Setup profil untuk mulai matching"
    │
    ▼
[Setup Profil — /dashboard/nanny/setup-profil/]
    │
    ├─── Langkah 1: Data Diri (wajib)
    │       Isi: usia, pendidikan terakhir, kota domisili
    │       Upload: foto profil (wajib dari awal, bukan opsional)
    │       Isi: bio singkat
    │       ⚠️  KTP tidak diminta — platform tidak melakukan background checking
    │
    ├─── Langkah 2: Preferensi Kerja (wajib)
    │       Pilih: tipe nanny (live-in, live-out, infal, temporary)
    │       Pilih: kelompok usia anak (bayi 0–6 bln, toddler, dll)
    │       Isi: kisaran gaji yang diharapkan
    │       Pilih: lingkup tugas (anak saja / lansia / rumah tangga)
    │
    ├─── Langkah 3: Tes Kecocokan (wajib)
    │       53 pertanyaan tentang kondisi kerja, nilai, dan kemampuan
    │       Dari sini keluarga tahu seberapa cocok dengan nanny
    │       Submit → POST /api/survey/save
    │
    ├─── Langkah 4: Video Perkenalan (opsional — di akhir)
    │       Upload video max 3 menit via Cloudflare Stream
    │       Ada panduan topik di dalam form (tidak perlu bingung mau ngomong apa)
    │       Bisa take langsung dari kamera HP atau upload dari galeri
    │
    ├─── Langkah 5: Foto Masakan & Keahlian (opsional — kapan saja)
    │       Upload foto portfolio via Cloudflare R2
    │       Tampil seperti "Instagram mini" di profil nanny
    │       Max 9 foto, format JPG/PNG
    │
    └─── Submit → PATCH /api/nanny/profile
                └─ Profil tersimpan
                └─ Profil muncul di direktori jika Open to Job = ON
```

---

#### Journey 2: Tes Kecocokan

```
[Dashboard Nanny — Profil Sudah Diisi]
    │
    ├─ Klik "Isi Tes Kecocokan"
    │
    ▼
[Tes Kecocokan Nanny — /dashboard/nanny/survey/]
    │ 53 pertanyaan (framing dari sudut pandang nanny)
    │ Sama struktur dengan Tes Kecocokan orang tua, kalimat berbeda
    │ Subdomain: A1, A2, B1, B2, B3, C1, C2, C3, C4
    │ Simpan progress di localStorage (bisa lanjut besok)
    │
    ├─── Tandai pertanyaan sebagai DEALBREAKER (opsional)
    │       Contoh: "Tidak bisa menerima rokok di rumah" → dealbreaker
    │
    ▼
[Submit Tes Kecocokan]
    │ POST /api/survey/save
    │ Jawaban tersimpan di SurveyResponse
    │
    ▼
[Dashboard — Tes Kecocokan Selesai]
    │ Tampil: "Tes Kecocokan kamu sudah siap digunakan untuk matching"
    │ Profil muncul di direktori (jika Open to Job = ON)
    │
    └─── Menunggu orang tua initiate matching
```

---

#### Journey 3: Menerima & Melihat Hasil Matching

```
[Notifikasi Masuk]
    │ "Ada orang tua yang ingin matching dengan kamu"
    │
    ▼
[Dashboard Nanny]
    │ Tampil kartu: matching request dari [Nama Parent]
    │
    ├─── Jika Tes Kecocokan belum diisi → prompt untuk isi Tes Kecocokan
    │
    ▼
[Hasil Matching — Setelah Kedua Sisi Isi Tes Kecocokan]
    │ GET /api/matching/results
    │
    ▼
[Lihat Detail Hasil]
    │ Tampil: skor keseluruhan + per domain
    │ Tampil: area kekuatan bersama (apa yang cocok)
    │ Tampil: area mismatch + poin negosiasi
    │ Tampil: tips untuk nanny (dari AI)
    │ Jika ada dealbreaker → "Ada hal yang perlu dibicarakan dulu"
    │
    ├─── Jika cocok & parent konfirmasi → Journey 4: Aktif Bekerja
    └─── Jika tidak lanjut → tetap di pool, bisa matching lain
```

---

#### Journey 4: Aktif Bekerja & Monitoring

```
[NannyAssignment Dibuat oleh Parent]
    │ Notifikasi: "[Nama Parent] konfirmasi kamu mulai bekerja [tanggal]"
    │
    ▼
[Dashboard Nanny — Tampil Tugas Aktif]
    │ Tampil info: keluarga, anak yang diasuh, tipe kerja, gaji
    │
    ▼
[Lihat Profil Anak — /dashboard/nanny/children/]
    │ GET data anak dari NannyAssignment aktif
    │ Tampil: nama anak, usia, kelompok usia
    │ Tampil: catatan medis & alergi
    │ Tampil: jadwal harian anak
    │ Tampil: daftar boleh / tidak boleh dari parent
    │
    ▼ (7 hari setelah mulai)

[Week 1 — Check-in Nanny]
    │ Notifikasi: "Check-in Minggu Pertama"
    │ Buka form: /dashboard/nanny/monitoring/
    │ 5 pertanyaan: kondisi kerja, komunikasi, kenyamanan, kendala
    │ POST /api/nanny/monitoring (type: WEEK_1)
    │
    ▼ (Week 2, Bulan 1, Bulan 3, dst — proses sama)

[Evaluasi Bulan 1]
    │ 10+ pertanyaan dari sisi nanny
    │ Pertanyaan: perlakuan keluarga, kejelasan instruksi,
    │             kondisi anak, fasilitas, keputusan lanjut
    │ POST /api/nanny/monitoring (type: MONTH_1)
    │
    ▼
[Lihat Hasil Evaluasi Gabungan]
    │ Tampil: ringkasan AI (perspektif nanny + parent)
    │ Tampil: skor per aspek
    │ Unduh PDF laporan (opsional)
```

---

#### Journey 5: Toggle "Open to Job" (LinkedIn Mode)

```
[Profil Nanny — /dashboard/nanny/profile/]
    │
    ├─ Toggle: "Tampilkan profil saya di direktori"
    │   PATCH /api/nanny/open-to-job
    │
    ├─── ON → profil muncul di direktori untuk parent browse
    │         (kontak tersembunyi sampai parent unlock)
    │
    └─── OFF → profil tidak muncul (privat / sudah bekerja)
```

---

#### Journey 6: Program Referral Nanny

```
[Menu Referral — /dashboard/nanny/referral/]
    │ Tampil: kode referral unik nanny
    │ Tampil: status referral yang sedang berjalan
    │
    ├─ Bagikan kode ke nanny lain (teman, saudara)
    │
    ▼
[Tracking]
    │ Teman daftar → status: REGISTERED
    │ Teman dapat kerja via BundaYakin → status: HIRED → Rp 75.000
    │ Teman bekerja 1 bulan penuh → status: RETAINED → +Rp 75.000
    │
    └─── Total bonus per referral berhasil: Rp 150.000
```

---

## 4. Role: ADMIN

### 4.1 Feature List

| # | Fitur | Status |
|---|-------|--------|
| A-1 | Login sebagai Admin | Aktif |
| A-2 | Switch Role untuk Testing | Aktif |
| A-3 | Overview Matching Analytics | Aktif |
| A-4 | Dashboard Operasional | Dalam pengembangan |
| A-5 | Manajemen Pengguna | Dalam pengembangan |
| A-6 | Manajemen Konten Tes Kecocokan | Dalam pengembangan |

---

### 4.2 User Journey — ADMIN

#### Journey 1: Login & Switch Role untuk Testing

```
[Login — /auth/login/]
    │ Masuk dengan nomor admin (087888180363) + password
    │ Session role = ADMIN, canSwitchRoles = true
    │
    ▼
[Dashboard Admin — /dashboard/admin/]
    │ Tampil: pilihan "Lihat sebagai Parent / Nanny"
    │
    ├─ Klik "Switch ke PARENT"
    │   POST /api/user/switch-role { targetRole: "PARENT" }
    │   Session.role berubah sementara ke PARENT
    │   Redirect ke /dashboard/parent/
    │
    ├─ Klik "Switch ke NANNY"
    │   Session.role berubah ke NANNY
    │   Redirect ke /dashboard/nanny/
    │
    └─── Tombol "Kembali ke Admin" → restore originalRole
```

---

#### Journey 2: Melihat Matching Overview

```
[Dashboard Admin]
    │
    ├─ Buka Matching Overview — /dashboard/admin/matching-overview/
    │
    ▼
[Analytics Dashboard]
    │ Tampil: jumlah matching request (minggu ini / bulan ini)
    │ Tampil: distribusi skor (histogram)
    │ Tampil: tingkat penyelesaian Tes Kecocokan
    │ Tampil: jumlah placement aktif
    │ Tampil: flag dealbreaker yang sering muncul
```

---

## 5. Shared Flows — Lintas Role

### 5.1 Autentikasi (Semua Role)

```
[Lupa Password]
    │
    ▼
[/auth/forgot-password/]
    │ Masukkan nomor HP
    │ POST /api/auth/send-otp
    │ OTP dikirim via WhatsApp
    │
    ▼
[Verifikasi OTP]
    │ POST /api/auth/verify-otp
    │
    ▼
[Reset Password]
    │ Isi password baru (min 8 karakter)
    │ POST /api/auth/reset-password
    │ Redirect ke login
```

### 5.2 Ganti Email / Password (Semua Role)

```
[Settings — /dashboard/[role]/settings/]
    │
    ├─ Ganti Email
    │   PATCH /api/user/email
    │   Verifikasi email lama → konfirmasi email baru
    │
    └─ Ganti Password
        POST /api/auth/change-password
        Isi: password lama + password baru
```

### 5.3 Hapus Akun (Parent & Nanny)

```
[Settings — Hapus Akun]
    │ Konfirmasi intent: "Saya yakin ingin menghapus akun"
    │ DELETE /api/nanny/profile (untuk nanny)
    │ DELETE /api/parent/profile (untuk parent)
    │ Data dihapus / dianonimkan
    │ Session dihapus → redirect ke landing
```

---

## 6. State Diagram Matching

```
MatchingRequest States:

PENDING ──────────────────────────────────────────────────────────────────┐
   │                                                                        │
   │ Parent submit Tes Kecocokan                                            │
   ▼                                                                        │
PARENT_SURVEY_DONE                                                          │
   │                                                                        │
   │ Nanny submit Tes Kecocokan                                             │
   ▼                                                                        │
PROCESSING ──── Claude API calculate ─── error ──────────────────────────►│
   │                                                                        │
   │ Score returned                                                         │
   ▼                                                                        │
COMPLETED                                                                   │
   │                                                                        │
   ├─── Has dealbreaker → state tambahan: NEGOTIATING                       │
   │                                                                        │
   └─── Parent confirm placement → NannyAssignment created                 │
                                                                           │
                                                                    CANCELLED
```

```
EvaluationStatus States:

PENDING ──► PARENT_DONE ──► COMPLETED
         └──────────────► NANNY_DONE ──► COMPLETED
```

```
Subscription States:

INACTIVE ──► (bayar) ──► ACTIVE ──► (expired) ──► EXPIRED
                           │
                           └── (cancel) ──► CANCELLED
```

---

## 7. Matriks Fitur × Role

| Fitur | PARENT | NANNY | ADMIN |
|-------|--------|-------|-------|
| Registrasi | ✅ | ✅ | ✅ |
| Login | ✅ | ✅ | ✅ |
| Lupa Password (OTP WA) | ✅ | ✅ | ✅ |
| Edit Profil | ✅ | ✅ | — |
| Kelola Profil Anak | ✅ | — (baca saja) | — |
| Langganan Tahunan | ✅ | — | — |
| Tes Kecocokan | ✅ | ✅ | — |
| Lihat Hasil Matching | ✅ | ✅ | bisa via switch |
| Browse Direktori Nanny | ✅ | — | — |
| Toggle Open to Job | — | ✅ | — |
| Unlock Kontak Nanny | ✅ | — | — |
| Placement (Mulai Kerja Sama) | ✅ | — | — |
| Check-in Mingguan | ✅ (kirim) | ✅ (kirim) | — |
| Evaluasi Berkala | ✅ (kirim) | ✅ (kirim) | — |
| Lihat Rekam Jejak Nanny | ✅ (bayar) | ✅ (profil sendiri) | — |
| Layer 2 Psikotes AI | ✅ (bayar) | hasil dilihat | — |
| Layer 3 Review Psikolog | ✅ (bayar) | hasil dilihat | — |
| Unduh PDF Laporan | ✅ | ✅ | — |
| Program Referral | ✅ | ✅ | — |
| Ekspor Data / CV | ✅ | ✅ (CV) | — |
| Switch Role (testing) | — | — | ✅ |
| Matching Analytics | — | — | ✅ |
| Knowledge Transfer | ✅ | baca saja | — |
| Notifikasi | ✅ | ✅ | — |
| Ganti Email / Password | ✅ | ✅ | ✅ |
| Hapus Akun | ✅ | ✅ | — |

---

*Dokumen ini dihasilkan berdasarkan analisis codebase: prisma/schema.prisma, src/app/dashboard/, src/app/api/, dan docs/PRODUCT.md.*
*Terakhir diperbarui: 17 Mei 2026 — keputusan produk: hapus KTP, terminologi Tes Kecocokan, Kuota Koneksi, Mayar (pending verifikasi), Cloudflare Stream+R2.*
*API upload foto/video sudah siap. UI upload, Flow A, Flow B, MayarButton masih dalam pengembangan.*
