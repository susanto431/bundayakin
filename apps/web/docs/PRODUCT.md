# PRODUCT.md — BundaYakin
> Konteks bisnis & produk lengkap. Dibaca Claude Code saat butuh konteks domain.

---

## Apa itu BundaYakin?

Platform kecocokan, psikotes, dan pemantauan nanny yang dibangun oleh **Human Care Consulting (HCC)** — perusahaan psikologi di Jakarta. Bukan job board. Bukan marketplace biasa.

BundaYakin membantu orang tua menemukan nanny yang benar-benar cocok — secara praktis (gaji, jadwal, tugas) maupun nilai (agama, gaya pengasuhan, kepribadian) — menggunakan survey paralel + AI scoring + opsional psikotes dan review psikolog.

---

## Tiga Fasa Bisnis

| Fasa | Status | Deskripsi |
|---|---|---|
| **Fasa 1** | Sekarang | Platform kecocokan & pemantauan. Orang tua langganan, nanny gratis. |
| **Fasa 2** | Setelah data cukup | Direktori nanny terverifikasi. Orang tua bisa browse & shortlist. |
| **Fasa 3** | Jangka panjang | Platform penyalur penuh. Matching aktif, referral fee, community. |

---

## User Roles & Monetisasi

### Nanny — GRATIS selamanya
- Buat profil & CV digital
- Isi survey matching
- Terima laporan kecocokan
- Lihat feedback dari keluarga

### Orang Tua — Rp 500.000/tahun
- Matching survey Layer 1 (gratis dalam langganan)
- Profil anak/lansia
- Log aktivitas harian nanny (Phase 2)
- Evaluasi berkala otomatis (bulan 1, 3, dst)
- Knowledge transfer saat ganti nanny

### Add-on (bayar saat butuh)
- Layer 2 Psikotes AI: +Rp 300.000/kandidat
- Layer 3 Review Psikolog: +Rp 1.200.000–1.500.000
- Akses rekam jejak nanny: Rp 50.000/nanny

---

## Sistem Matching — 3 Layer

### Layer 1 — Survey Kecocokan (default, gratis dalam langganan)
- Survey paralel: nanny dan orang tua isi form **secara independen**
- Format: pilihan ganda praktis + bar skala + free text untuk kondisi khusus
- AI scoring menghasilkan % kecocokan per domain
- Output: laporan kecocokan, area match/mismatch, pertanyaan negosiasi, tips kedua pihak

### Layer 2 — + Psikotes AI (+Rp 300rb)
- Nanny isi tes IQ/daya tangkap, kepribadian, sikap kerja
- Output lebih detail: breakdown per aspek, kekuatan, gap, poin negosiasi

### Layer 3 — + Psikolog HCC (+Rp 1.2–1.5 juta)
- Psikolog interview nanny secara privat (orang tua tidak hadir)
- Bisa tambah tes grafis (DAM/BAUM), tes klinis
- Bukan diagnostik — tujuannya antisipasi risiko pengasuhan
- Output: NannyCare Profile™ PDF (dokumen rahasia)

---

## Domain Matching & Bobot

### Domain A — Kondisi Kerja (bobot: tinggi)
- A1: Gaji, libur & fasilitas
- A2: Lingkup & tugas kerja

### Domain B — Nilai & Gaya Hidup (bobot: tinggi)
- B1: Agama & kepercayaan
- B2: Pakaian & penampilan
- B3: Gaya pengasuhan

### Domain C — Pengalaman & Kemampuan (bobot: tinggi)
- C1: Rekam jejak pengalaman
- C2: Kemampuan praktis
- C3: Komunikasi
- C4: Lingkungan

Bobot per domain: lihat `src/constants/matching-weights.ts`

---

## Sistem Dealbreaker

- Setiap pertanyaan bisa dicentang sebagai dealbreaker oleh orang tua ATAU nanny
- Tidak ada batas minimum/maksimum dealbreaker
- Kedua pihak bisa menambah pertanyaan custom — juga bisa jadi dealbreaker
- Jika dealbreaker tidak match → **notifikasi negosiasi**, BUKAN penolakan otomatis
- Framing: "perlu dibicarakan lebih lanjut", bukan "tidak cocok"
- Orang tua bisa adjust bobot domain sesuai prioritas

---

## Pertanyaan Age-Related (Otomatis)

Muncul otomatis berdasarkan usia anak yang diinput orang tua:

| Usia | Pertanyaan tambahan |
|---|---|
| 0–6 bulan | Susu formula, mandikan bayi, ganti popok, bayi kolik |
| 6–12 bulan | MPASI, bantu duduk/merangkak |
| 1–3 tahun | Toilet training, bermain sesuai usia |
| 3–6 tahun | Baca/tulis dasar, antar jemput sekolah |

---

## Timeline Evaluasi Otomatis

| Waktu | Jenis | Output |
|---|---|---|
| Minggu ke-1 | Check-in singkat (5 pertanyaan) | Adaptasi awal |
| Minggu ke-2 | Check-in singkat (5 pertanyaan) | Deteksi dini masalah |
| Bulan ke-1 | Evaluasi penuh (10+1 opsional) | Dashboard + PDF + notifikasi WA/email |
| Bulan ke-3 | Evaluasi penuh (10+1 opsional) | Momen keputusan: lanjut atau ganti |
| Setiap 3 bulan | Evaluasi berkala | Selama kerja sama berlanjut |

---

## Sistem Flag & Eskalasi

| Level | Trigger | Aksi |
|---|---|---|
| 🔴 Merah | Gaji belum dibayar, insiden keselamatan, nanny tidak bisa dihubungi | Notif tim BundaYakin + banner dashboard + WA |
| 🟡 Kuning | Ketidaknyamanan kerja, minta difasilitasi komunikasi | Banner dashboard saja |

Tim yang menerima flag = tim admin BundaYakin — BUKAN divisi HCC psikologi.

---

## Value Proposition Langganan Rp 500rb/tahun

| Momen | Value |
|---|---|
| Hari 1 | Profil anak langsung ada value sebelum nanny masuk |
| Minggu 1–4 | Log harian menggantikan WA group |
| Bulan 1 & 3 | Evaluasi terstruktur otomatis — insight dua arah |
| Saat ganti nanny | Knowledge transfer instan — semua data tersimpan ✅ |

---

## Sistem Referral Nanny

| Event | Bonus Referrer | Bonus Nanny |
|---|---|---|
| Nanny diterima kerja | Rp 75.000 | Rp 50.000 + kredit platform |
| Bertahan 1 bulan | — | Rp 75.000 + evaluasi kesejahteraan |
| Bertahan 3 bulan | Rp 125.000 | Rp 100.000 + badge Terpercaya |

---

## NannyCare Profile™ (Layer 3 Output)

Laporan PDF psikologis yang diinterpretasi psikolog HCC. Berisi:
- 8 aspek pengasuhan (A1–A8) dari PAPI Kostick
- Skor komposit vs benchmark HCC
- Narasi dalam bahasa awam (sapaan "Bunda")
- Catatan klinis psikolog
- Verdict & rekomendasi

**Aturan:**
- Laporan bersifat RAHASIA — hanya untuk keluarga dan agency
- Footer: "diinterpretasikan oleh psikolog" — bukan "berlisensi HCC"
- Nama instrumen tes tidak ditampilkan di header laporan
- Pesan psikolog tidak boleh diubah satu kata pun oleh sistem

---

## Screens MVP (P0)

| Screen | User | Route |
|---|---|---|
| Landing page | Semua | `/` |
| Register Orang Tua | Parent | `/auth/register/parent` |
| Register Nanny | Nanny | `/auth/register/nanny` |
| Login | Semua | `/auth/login` |
| Onboarding | Semua | `/onboarding` |
| Dashboard Orang Tua | Parent | `/dashboard/parent` |
| Dashboard Nanny | Nanny | `/dashboard/nanny` |
| Data Anak | Parent | `/dashboard/parent/children` |
| Form Survey | Keduanya | `/dashboard/*/matching/survey` |
| Laporan Kecocokan | Parent | `/dashboard/parent/matching/result` |
| Langganan & Payment | Parent | `/dashboard/parent/subscription` |
