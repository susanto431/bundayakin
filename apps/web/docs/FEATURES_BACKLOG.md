# BundaYakin — Feature Backlog
**Versi:** Juni 2026 · Dokumen Internal · Human Care Consulting

> Backlog ini diparse dari dokumen feature request "BY" terbaru.
> Prioritas ditentukan berdasarkan kesiapan MVP dan ketergantungan antar fitur.

---

## Cara Baca Dokumen Ini

| Label | Arti |
|---|---|
| 🔴 Blocker | Harus ada sebelum fitur lain bisa jalan |
| 🟠 MVP | Masuk scope MVP pertama |
| 🟡 Post-MVP | Penting tapi bisa menyusul setelah launch |
| 🟢 Nice-to-have | Bisa masuk kapan saja |
| ⚙️ Kompleksitas | L = Low · M = Medium · H = High |

---

## AREA 1 — Profil Anak Multi-Anak

**Lokasi:** Halaman Akun → Tab Profil Anak
**Prioritas:** 🟠 MVP
**Kompleksitas:** ⚙️ M

### Yang Dibutuhkan
- Orang tua bisa menambah lebih dari 1 anak dalam satu akun
- Setiap anak punya profil sendiri (nama, usia, detail kebutuhan)
- Tombol "Cari Nanny untuk [nama anak]" muncul per anak
- Data profil anak terintegrasi 2 arah dengan halaman Catatan Anak
- Saat berlangganan diaktifkan → data profil anak otomatis masuk ke Catatan Anak (tidak perlu isi ulang)

### Schema Database Baru / Perubahan
```
Child {
  id
  parentId         → relasi ke User (orang tua)
  nama
  tanggalLahir
  jenisKelamin
  alergi
  kondisiKhusus
  ...field lainnya
}
```

### Catatan
- Urutan anak bisa diatur (drag & drop atau panah naik/turun)
- Profil anak ini menjadi sumber data untuk matching engine (baca Area 5)

---

## AREA 2 — FAQ + Chatbot "Yaya"

**Lokasi:** Halaman tersendiri `/faq` + `/bantuan`
**Prioritas:** 🟡 Post-MVP
**Kompleksitas:** ⚙️ H

### 2A. FAQ Statis
- Halaman `/faq` berisi pertanyaan umum yang dikelompokkan per topik:
  - Tentang BundaYakin
  - Cara kerja matching
  - Biaya & langganan
  - Untuk nanny
  - Privasi & keamanan data
- Konten bisa dikelola dari panel admin (tidak hardcode)

### 2B. Chatbot AI — Persona "Yaya"
**Nama persona:** **Yaya** *(singkatan BundaYakin Assistant — terasa hangat, mudah diucapkan)*

**Karakter Yaya:**
- Hangat, sabar, tidak sok formal
- Berbicara seperti teman yang tahu banyak, bukan robot helpdesk
- Bisa menjawab pertanyaan soal platform, fitur, harga, proses nanny
- Bisa menjawab pertanyaan umum parenting dasar

**Alur eskalasi:**
1. Yaya coba jawab → jika tidak bisa → kata kunci "eskalasi"
2. Sistem otomatis buat tiket di admin panel
3. Yaya bilang ke user: *"Pertanyaan Bunda sudah saya catat dan akan dijawab oleh tim BundaYakin dalam 1×24 jam. Bunda akan dapat notifikasi begitu ada balasan."*
4. Admin panel: tiket muncul dengan label **PERLU REPLY MANUSIA**, bisa dibalas langsung dari dashboard

### Schema Tiket Eskalasi
```
SupportTicket {
  id
  userId
  role           → 'parent' | 'nanny'
  pertanyaan
  konteks        → ringkasan percakapan sebelumnya
  status         → 'open' | 'in_progress' | 'resolved'
  replyAdmin
  createdAt
  resolvedAt
}
```

### Catatan
- Yaya dibangun di atas Claude API (model claude-sonnet)
- System prompt Yaya perlu dibuat terpisah — mencakup knowledge base BY, batasan topik, dan gaya bicara
- Widget chatbot bisa muncul floating di semua halaman (bukan hanya `/bantuan`)

---

## AREA 3 — Direktori Nanny & Akses Kontak Berbayar

**Lokasi:** Halaman Cari Nanny → sub-halaman `/cari-nanny/direktori`
**Prioritas:** 🟡 Post-MVP (Fasa 2 — setelah data nanny cukup)
**Kompleksitas:** ⚙️ H

### Alur
1. Orang tua klik tombol "Minta Bantu Cari Nanny"
2. Jika profil matching belum diisi → dorong isi dulu (modal/redirect)
3. Jika profil sudah ada → tampilkan direktori nanny "open to work"
4. Setiap card nanny menampilkan:
   - Foto + nama inisial
   - Usia, kota, pendidikan
   - % kecocokan dengan orang tua ini
   - Badge (jika ada: Terpercaya, Psikotes Selesai)
5. Untuk buka data lengkap / kontak nanny → bayar **Rp 100.000/nanny** via **Mayar**
6. Setelah bayar → kontak terbuka + catatan kecocokan detail tampil

### Catatan
- Direktori hanya tampil jika data nanny terdaftar sudah cukup (threshold: misal ≥ 10 nanny aktif di area)
- Jika belum cukup → tombol tetap ke WA admin (sementara)
- Filter: kota, tipe kerja (menginap/tidak), pengalaman, dengan/tanpa psikotes

### Keputusan Payment Gateway
**Dipilih: Mayar** (bukan Midtrans)
- Alasan: Midtrans mensyaratkan foto toko/kantor fisik — belum terpenuhi di tahap awal
- Mayar hanya butuh KTP — lebih mudah untuk registrasi awal
- Status: menunggu API key dari Mayar (proses registrasi sedang berjalan)
- Sementara API key belum ada → gunakan **"Simulasi Bayar (Demo)"** di Sprint 2
- Sprint 3 baru integrasi Mayar sesungguhnya setelah API key didapat

---

## AREA 4 — Profil Nanny (Registrasi & Direktori)

**Lokasi:** Onboarding nanny + Dashboard nanny
**Prioritas:** 🟠 MVP
**Kompleksitas:** ⚙️ M

### Yang Dibutuhkan
- Form profil dasar nanny saat registrasi:
  - Nama, usia, foto (upload atau ambil dari kamera)
  - Kota domisili, tipe kerja yang diinginkan
  - Pengalaman (tahun + narasi singkat)
  - Ketersediaan (open to work / sedang bekerja)
- Nanny didorong (bukan diwajibkan) untuk mengisi psikotes dengan penjelasan manfaatnya:
  - *"Nanny yang punya hasil psikotes 3× lebih cepat dapat kecocokan dengan keluarga yang tepat"*
- Status profil nanny: `draft` → `submitted` → `verified` → `active`

### Catatan
- Foto disimpan di object storage (Cloudflare R2 atau S3-compatible)
- Psikotes bersifat gratis selama fase awal
- Nanny yang sudah selesai psikotes → dapat badge di direktori

---

## AREA 5 — Matching Engine (Enhanced)

**Lokasi:** Backend + output di halaman laporan kecocokan
**Prioritas:** 🟠 MVP (Layer 1) · 🟡 Post-MVP (Layer 2 & 3 detail)
**Kompleksitas:** ⚙️ H

### Sumber Data Matching (4 sumber)
1. Form isian orang tua (53 pertanyaan — sudah ada)
2. Data Catatan Anak (usia, kondisi, kebutuhan khusus)
3. Profil nanny (data diri, ketersediaan, preferensi)
4. Psikotes nanny (jika ada — Layer 2)

### Output Laporan Kecocokan (Enhanced)
Selain skor % dan area match/tidak match, tambahkan:
- **Kekuatan:** Apa yang membuat mereka cocok
- **Potensi Lemah:** Area yang perlu diperhatikan
- **Potensi Konflik:** Situasi yang mungkin memicu masalah
- **Cara Mengatasinya:** Tips konkret, bahasa awam

### Format Output
```json
{
  "skor_keseluruhan": 78,
  "skor_per_domain": { "A": 85, "B": 72, "C": 80 },
  "kekuatan": ["..."],
  "potensi_lemah": ["..."],
  "potensi_konflik": ["..."],
  "cara_mengatasi": ["..."],
  "dealbreaker_flags": [],
  "tips_orang_tua": ["..."],
  "tips_nanny": ["..."]
}
```

### Catatan
- Claude API dipakai untuk generate narasi (bukan hanya skor numerik)
- Prompt Claude untuk matching perlu dibuat terpisah dan disimpan di `lib/prompts/matching.ts`

---

## AREA 6 — Data Dummy untuk Trial Platform

**Prioritas:** 🔴 Blocker (untuk testing matching engine)
**Kompleksitas:** ⚙️ L

### Spesifikasi

#### 3 Nanny
| | Nanny A | Nanny B | Nanny C |
|---|---|---|---|
| Nama | Siti Rahayu | Dewi Lestari | Ratna Wulandari |
| Usia | 28 thn | 35 thn | 24 thn |
| Pendidikan | SMA | D3 Keperawatan | SMA |
| Pengalaman | 4 tahun | 7 tahun | 1 tahun |
| Psikotes | Selesai | Selesai | Belum |
| Tipe | Menginap | Tidak menginap | Fleksibel |

#### 3 Bunda
| | Bunda A | Bunda B | Bunda C |
|---|---|---|---|
| Nama | Ria Putri | Sandra Dewi | Mega Sari |
| Anak | 1 anak, 2 thn | 2 anak, 4 & 1 thn | 1 anak, 6 bln |
| Kebutuhan khusus | Tidak ada | Anak bungsu kolik | Alergi susu sapi |

#### Matrix Kecocokan
| | Bunda A | Bunda B | Bunda C |
|---|---|---|---|
| Nanny A | **100%** (sempurna) | 55% (cukup cocok) | **0%** (dealbreaker tidak terpenuhi) |
| Nanny B | 82% | 91% | 45% |
| Nanny C | 60% | 38% | 70% |

**Catatan Nanny A ↔ Bunda C (0%):**
- Bunda C mensyaratkan: pengalaman ≥ 3 tahun + pengalaman bayi < 1 tahun → Nanny A tidak memenuhi keduanya sebagai dealbreaker

### Cara Seed
- Buat file `prisma/seed.ts` dengan data dummy ini
- Jalankan `npx prisma db seed` untuk populate ke NeonDB

---

## AREA 7 — Catatan Anak (Enhanced)

**Lokasi:** Halaman `/catatan-anak`
**Prioritas:** 🟡 Post-MVP
**Kompleksitas:** ⚙️ M

### Tambahan Hook (di atas yang sudah ada)

**Sudah ada sebelumnya:**
- Jadwal les, seragam, mainan & makanan kesukaan
- Alergi, cara menenangkan saat tantrum
- Do & don'ts pengasuhan
- Open text dari nanny dan orang tua

**Tambahan baru:**
1. **Checklist Tumbuh Kembang** per usia & jenis kelamin
   - Sumber: WHO Child Growth Standards + Kemenkes RI (SDIDTK)
   - Tampil per milestone usia: 0–3 bln, 3–6 bln, 6–9 bln, dst.
   - Bisa dicentang saat anak sudah capai milestone
   - Jika ada milestone yang terlambat → muncul saran ringan (bukan diagnosis)

2. **Tips Stimulasi Anak**
   - Konten berdasarkan usia anak saat ini
   - Bisa diperbarui otomatis saat usia anak bertambah

3. **Chatbot Parenting Interaktif**
   - Sama dengan Yaya, tapi khusus topik parenting & tumbuh kembang
   - Bisa jadi satu persona dengan Yaya (mode "parenting mode")
   - Semua histori disimpan → jadi data untuk meningkatkan matching di masa depan

### Catatan
- Semua data catatan anak tersimpan permanen (tidak dihapus saat ganti nanny)
- Data ini dipakai sebagai sumber matching engine (Area 5)
- Perlu disclaimer: konten tips bukan pengganti konsultasi dokter/psikolog

---

## Urutan Pengerjaan yang Disarankan

```
Sprint 1 (MVP Core):
  ✅ Area 4 — Profil Nanny (registrasi dasar + foto)
  ✅ Area 1 — Profil Anak multi-anak
  ✅ Area 6 — Data dummy (seed database)

Sprint 2 (Matching):
  ✅ Area 5 — Matching Engine Layer 1 (enhanced output)
  ✅ Area 3 — Direktori Nanny (preview, kontak masih via WA)

Sprint 3 (Post-MVP):
  ✅ Area 2 — FAQ + Chatbot Yaya
  ✅ Area 7 — Catatan Anak enhanced
  ✅ Area 3 — Direktori penuh + payment Rp 100rb/nanny
```

---

*BundaYakin · Human Care Consulting · Dokumen Internal · Tidak untuk distribusi publik*
