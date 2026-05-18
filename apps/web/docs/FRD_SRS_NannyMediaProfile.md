# FRD & SRS — Nanny Media Profile
> Fitur: Upload Foto, Video Perkenalan, Skill Showcase, dan Portofolio Nanny
> Versi: 1.0 | Tanggal: 18 Mei 2026 | Status: Draft

---

## Daftar Isi
1. [Latar Belakang](#1-latar-belakang)
2. [Stakeholder](#2-stakeholder)
3. [FRD — Functional Requirements Document](#3-frd--functional-requirements-document)
4. [SRS — Software Requirements Specification](#4-srs--software-requirements-specification)
5. [Out of Scope](#5-out-of-scope)
6. [Risiko & Mitigasi](#6-risiko--mitigasi)

---

## 1. Latar Belakang

Saat ini nanny di BundaYakin hanya bisa mengisi profil berbasis teks. Orang tua (parent) yang mencari nanny tidak bisa menilai keterampilan dan kepribadian nanny secara langsung sebelum proses matching.

Fitur ini memungkinkan nanny untuk:
- Memperkenalkan diri lewat video pendek
- Menunjukkan keahlian praktis lewat video tutorial
- Membangun portofolio pengalaman

Tujuan bisnis: meningkatkan **kepercayaan parent** terhadap nanny, mempercepat keputusan matching, dan mendukung transisi ke **Fasa 2** (direktori nanny terverifikasi).

---

## 2. Stakeholder

| Pihak | Peran |
|---|---|
| **Nanny** | Pembuat konten — upload video & portofolio |
| **Parent (Orang Tua)** | Konsumen konten — lihat profil nanny |
| **Admin BundaYakin** | Moderator konten (opsional, lihat risiko) |
| **HCC (Human Care Consulting)** | Pemilik produk |

---

## 3. FRD — Functional Requirements Document

### 3.1 Overview Use Case

```
UC-01  Nanny upload video perkenalan diri
UC-02  Nanny upload video skill showcase
UC-03  Nanny isi portofolio pengalaman (text + opsional media)
UC-04  Parent lihat profil lengkap nanny (termasuk semua konten media)
UC-05  Parent swipe/browse video skill nanny
```

---

### 3.2 UC-01 — Video Perkenalan Diri (Self-Introduction)

**Aktor:** Nanny

**Deskripsi:** Nanny merekam atau mengupload satu video pendek yang memperkenalkan dirinya kepada calon parent.

**Trigger:** Nanny membuka tab "Profil Saya" dan bagian "Video Perkenalan" belum diisi.

**Precondition:** Nanny sudah login dan akun terverifikasi.

**Flow Utama:**
1. Nanny tap tombol "Rekam Video" atau "Pilih dari Galeri"
2. Jika "Rekam Video": app membuka kamera belakang HP secara in-app
3. Nanny merekam, preview, lalu konfirmasi upload
4. Jika "Pilih dari Galeri": file picker terbuka, nanny pilih video
5. Sistem menampilkan progress upload
6. Setelah selesai, video tampil di profil dengan status "Sedang Diproses" (Cloudflare Stream transcoding)
7. Setelah transcoding selesai (~1-2 menit), status berubah ke "Aktif"

**Flow Alternatif:**
- Koneksi terputus saat upload → upload dilanjutkan otomatis saat koneksi kembali (resumable)
- File terlalu besar atau durasi > 3 menit → sistem tampilkan pesan error sebelum upload dimulai

**Postcondition:** Video perkenalan tampil di profil nanny dan bisa dilihat parent.

**Business Rules:**
- BR-01: Hanya 1 video perkenalan per nanny (bisa diganti, yang lama dihapus)
- BR-02: Durasi maksimum 3 menit (180 detik)
- BR-03: Format yang diterima: MP4, MOV, WEBM
- BR-04: Ukuran maksimum file: 500 MB (sebelum kompresi client-side)
- BR-05: Resolusi minimum: 480p; sistem tidak menolak tapi kualitas rendah akan ada notifikasi

---

### 3.3 UC-02 — Video Skill Showcase

**Aktor:** Nanny

**Deskripsi:** Nanny mengupload video-video pendek yang menunjukkan keahlian spesifik dalam merawat bayi/anak.

**Trigger:** Nanny tap "Tambah Video Keahlian" di profil.

**Precondition:** Nanny sudah login.

**Flow Utama:**
1. Nanny tap "Tambah Video Keahlian"
2. Nanny pilih kategori dari daftar preset (atau isi manual)
3. Nanny rekam atau pilih video dari galeri
4. Nanny isi judul/keterangan singkat (opsional)
5. Upload dengan progress bar
6. Video muncul di bagian "Keahlian" profil nanny

**Kategori Preset:**
| ID | Label |
|---|---|
| SKL-01 | Cara Membuat Susu Formula |
| SKL-02 | Cara Menggendong Bayi |
| SKL-03 | Cara Memandikan Bayi |
| SKL-04 | Cara Membuat MPASI |
| SKL-05 | Stimulasi Tumbuh Kembang |
| SKL-06 | Cara Menenangkan Bayi Menangis |
| SKL-07 | Pertolongan Pertama pada Anak |
| SKL-08 | Aktivitas Bermain & Edukasi |
| SKL-99 | Lainnya (isi manual) |

**Business Rules:**
- BR-06: Maksimum 10 video skill per nanny
- BR-07: Durasi maksimum per video: 3 menit
- BR-08: Nanny bisa menghapus atau mengganti video skill kapan saja
- BR-09: Urutan video skill bisa diatur oleh nanny (drag & drop)

---

### 3.4 UC-03 — Portofolio Pengalaman

**Aktor:** Nanny

**Deskripsi:** Nanny mengisi entri pengalaman kerja dengan format terstruktur, dilengkapi foto/video opsional sebagai bukti.

**Trigger:** Nanny tap "Tambah Pengalaman" di tab Portofolio.

**Flow Utama:**
1. Nanny tap "Tambah Pengalaman"
2. Nanny mengisi form:
   - Judul pengalaman (contoh: "Merawat Bayi Kembar 6 Bulan")
   - Deskripsi singkat (max 500 karakter)
   - Periode waktu (bulan/tahun mulai – selesai)
   - Foto/video opsional (max 3 media per entri)
3. Nanny simpan
4. Entri muncul di tab Portofolio profil nanny

**Business Rules:**
- BR-10: Maksimum 10 entri portofolio per nanny
- BR-11: Setiap entri bisa berisi max 3 file media (foto atau video)
- BR-12: Foto: format JPG/PNG, max 10 MB per file
- BR-13: Video dalam portofolio: max 1 menit (berbeda dengan video skill)

---

### 3.5 UC-04 & UC-05 — Parent Lihat Profil Nanny

**Aktor:** Parent

**Deskripsi:** Parent membuka profil nanny lengkap termasuk video perkenalan, video skill, dan portofolio.

**Layout Profil Nanny (urutan dari atas):**

```
┌─────────────────────────────────┐
│  [Foto Profil]  Nama Nanny      │
│  Rating ⭐ | Lokasi | Gaji      │
├─────────────────────────────────┤
│  VIDEO PERKENALAN               │
│  [Player portrait 9:16]         │
│  Autoplay, muted by default     │
├─────────────────────────────────┤
│  KEAHLIAN                       │
│  [Card] [Card] [Card] → swipe  │
│  Tap card → fullscreen video    │
├─────────────────────────────────┤
│  PORTOFOLIO                     │
│  [Entri 1] [Entri 2] ...        │
├─────────────────────────────────┤
│  HASIL MATCHING (jika sudah)    │
└─────────────────────────────────┘
```

**Business Rules:**
- BR-14: Video perkenalan autoplay saat profil dibuka (muted), parent tap untuk unmute
- BR-15: Video skill ditampilkan sebagai card horizontal scrollable
- BR-16: Tap card skill → video fullscreen portrait dengan kontrol play/pause
- BR-17: Parent bisa swipe ke skill video berikutnya saat fullscreen (TikTok-style)
- BR-18: Jika nanny belum punya video perkenalan, tampilkan placeholder "Belum ada video"

---

## 4. SRS — Software Requirements Specification

### 4.1 Tech Stack

| Komponen | Teknologi | Alasan |
|---|---|---|
| Framework | Next.js (PWA) | Sudah dipakai |
| Storage video/stream | Cloudflare Stream | Sudah ada kontrak, HLS output otomatis |
| Storage foto/file | Cloudflare R2 | Sudah ada kontrak |
| Upload resumable | **Uppy + Tus.js** | Kritis untuk jaringan HP yang tidak stabil |
| Camera in-app | **react-media-recorder** | Access kamera langsung tanpa keluar app |
| Video player | **Vidstack** | Modern, HLS-native, portrait-friendly |
| Skill swipe | **Swiper.js** | Vertical snap, persis TikTok feel |
| Kompresi video client | Native (browser limits) | Tidak kompresi berat di client — serahkan ke Cloudflare Stream |

### 4.2 Arsitektur Upload

```
[Nanny HP Camera]
      ↓
[react-media-recorder]  ←  rekam in-app
      │
      ↓
[Uppy + Tus.js]         ←  resumable, progress tracking
      │
      ↓ POST /api/upload/video (signed URL)
      │
[Cloudflare Stream]     ←  transcoding otomatis → HLS
      │
      ↓
[Webhook → API Route]   ←  update status video di DB
      │
[Prisma → DB]           ←  simpan metadata (url, status, kategori)
```

```
[Nanny HP Gallery / Camera — Foto]
      ↓
[Uppy]
      ↓ POST /api/upload/image (signed URL)
      │
[Cloudflare R2]
      │
[API Route]  →  [Prisma → DB]
```

### 4.3 Database Schema (Prisma)

```prisma
model NannyVideo {
  id           String   @id @default(cuid())
  nannyId      String
  nanny        Nanny    @relation(fields: [nannyId], references: [id])
  type         VideoType  // INTRO | SKILL | PORTFOLIO
  category     String?    // null jika type = INTRO
  categoryCustom String?  // jika kategori manual
  title        String?
  description  String?
  cfStreamId   String?    // Cloudflare Stream video ID
  cfStreamUrl  String?    // HLS manifest URL
  cfThumbnail  String?    // auto-generated thumbnail URL
  status       VideoStatus // PROCESSING | ACTIVE | FAILED
  duration     Int?        // detik
  order        Int         @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([nannyId, type])
}

model NannyPortfolio {
  id          String   @id @default(cuid())
  nannyId     String
  nanny       Nanny    @relation(fields: [nannyId], references: [id])
  title       String
  description String   @db.VarChar(500)
  startMonth  Int
  startYear   Int
  endMonth    Int?
  endYear     Int?
  isOngoing   Boolean  @default(false)
  media       NannyPortfolioMedia[]
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model NannyPortfolioMedia {
  id           String   @id @default(cuid())
  portfolioId  String
  portfolio    NannyPortfolio @relation(fields: [portfolioId], references: [id])
  type         MediaType  // IMAGE | VIDEO
  url          String     // R2 URL atau CF Stream URL
  cfStreamId   String?
  status       VideoStatus?
  order        Int        @default(0)
}

enum VideoType {
  INTRO
  SKILL
  PORTFOLIO
}

enum VideoStatus {
  PROCESSING
  ACTIVE
  FAILED
}

enum MediaType {
  IMAGE
  VIDEO
}
```

### 4.4 API Routes

| Method | Path | Deskripsi |
|---|---|---|
| POST | `/api/nanny/video/upload-url` | Generate signed URL untuk upload ke CF Stream |
| POST | `/api/nanny/video` | Simpan metadata setelah upload selesai |
| PUT | `/api/nanny/video/:id` | Update judul, kategori, urutan |
| DELETE | `/api/nanny/video/:id` | Hapus video (dari DB + CF Stream) |
| POST | `/api/nanny/photo/upload-url` | Generate signed URL untuk upload foto ke R2 |
| POST | `/api/nanny/portfolio` | Buat entri portofolio baru |
| PUT | `/api/nanny/portfolio/:id` | Update entri portofolio |
| DELETE | `/api/nanny/portfolio/:id` | Hapus entri portofolio |
| POST | `/api/webhooks/cloudflare-stream` | Terima webhook status video dari CF Stream |
| GET | `/api/nanny/:id/profile-media` | Ambil semua media profil nanny (untuk parent) |

### 4.5 Halaman & Komponen

**Halaman Nanny (edit profil):**
```
/nanny/profile/media
  ├── VideoIntroSection       ← UC-01
  │     ├── VideoRecorder     (react-media-recorder)
  │     ├── VideoUploader     (Uppy)
  │     └── VideoPlayer       (Vidstack, preview)
  ├── SkillVideoSection       ← UC-02
  │     ├── SkillVideoCard[]
  │     ├── AddSkillModal
  │     └── CategoryPicker
  └── PortfolioSection        ← UC-03
        ├── PortfolioCard[]
        └── AddPortfolioModal
```

**Halaman Parent (lihat profil nanny):**
```
/nanny/:id
  ├── NannyProfileHeader      ← foto, nama, rating
  ├── VideoIntroPlayer        ← UC-04 (Vidstack, autoplay muted)
  ├── SkillVideoFeed          ← UC-05 (Swiper.js horizontal)
  │     └── SkillVideoFullscreen (Swiper.js vertical snap)
  └── PortfolioList           ← UC-04
```

### 4.6 Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-01 | Video player harus load dalam < 3 detik di koneksi 4G (HLS adaptive bitrate via CF Stream) |
| NFR-02 | Upload harus resumable — jika koneksi putus, lanjut dari titik terakhir |
| NFR-03 | UI harus mobile-first, portrait orientation, touch-friendly |
| NFR-04 | Semua video ter-encode HLS oleh CF Stream sebelum ditampilkan ke parent |
| NFR-05 | Signed URL untuk upload hanya valid 60 menit |
| NFR-06 | Webhook dari CF Stream harus diverifikasi dengan signature key |
| NFR-07 | Video perkenalan menampilkan thumbnail auto-generated dari CF Stream |
| NFR-08 | Nanny mendapat notifikasi push/in-app saat video selesai diproses |

### 4.7 Batasan Teknis

- **Tidak ada encoding/kompresi video di sisi client** — diserahkan ke Cloudflare Stream. Client hanya upload raw.
- **Tidak ada fitur edit/trim video** — di luar scope, nanny harus rekam ulang jika salah.
- **Tidak ada real-time streaming** — ini upload & playback, bukan live streaming.
- **CF Stream direct upload** menggunakan `tus` protocol yang sudah didukung natively oleh CF Stream.

---

## 5. Out of Scope

- Live streaming nanny ke parent
- Edit/trim video dalam app
- Filter/efek kamera
- Komentar/likes pada video
- Moderasi konten otomatis (AI content moderation) — di fase ini manual jika perlu
- Download video oleh parent

---

## 6. Risiko & Mitigasi

| Risiko | Probabilitas | Dampak | Mitigasi |
|---|---|---|---|
| Nanny HP low-end, kamera kualitas buruk | Tinggi | Rendah | Tidak ada batasan kualitas minimum; edukasi nanny via tooltip |
| Koneksi internet nanny tidak stabil | Tinggi | Tinggi | **Wajib** implementasi Tus resumable upload |
| Video nanny berisi konten tidak pantas | Sedang | Tinggi | Tambah checkbox konfirmasi "konten sesuai panduan" saat upload; review manual oleh admin jika ada laporan |
| CF Stream transcoding lambat | Rendah | Sedang | Tampilkan status "Sedang Diproses" yang jelas; webhook update otomatis |
| Biaya CF Stream membengkak | Rendah | Sedang | Monitor usage; batas 10 video skill + 1 intro + 3×10 portofolio per nanny = max ~41 video/nanny |
| Parent tidak mau lihat video, skip langsung | Sedang | Sedang | A/B test autoplay vs thumbnail click di iterasi berikutnya |
