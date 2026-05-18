# Sprint Planning — Nanny Media Profile
> Fitur: Upload Foto, Video Perkenalan, Skill Showcase, Portofolio
> Total: 4 Sprint × 2 minggu = ~8 minggu
> Versi: 1.0 | Tanggal: 18 Mei 2026

---

## Prinsip Sprint

- Setiap sprint menghasilkan **sesuatu yang bisa dicoba** (working software, bukan hanya komponen)
- Sprint 1–2 fokus pada **nanny side** (upload)
- Sprint 3 fokus pada **parent side** (view)
- Sprint 4 fokus pada **polish & edge case**
- Dependensi kritis: Cloudflare Stream harus sudah bisa diakses sebelum Sprint 1 mulai

---

## Ringkasan Sprint

| Sprint | Tema | Deliverable Utama |
|---|---|---|
| **Sprint 7** | Fondasi Upload | Upload infrastruktur, kamera in-app, video intro nanny bisa upload |
| **Sprint 8** | Skill & Portofolio | Video skill dengan kategori, portofolio text+media, nanny profil media lengkap |
| **Sprint 9** | Parent View | Halaman profil nanny dengan player, swipe skill feed |
| **Sprint 10** | Polish & Edge Case | Resumable upload, error handling, notifikasi, optimasi performa |

---

## Sprint 7 — Fondasi Upload
> Tema: "Nanny bisa upload video perkenalan dari HP"
> Durasi: 2 minggu

### Goal
Parent dan QA bisa melihat video perkenalan nanny yang diupload dari HP.
Upload sudah lewat Cloudflare Stream, bisa pakai kamera langsung.

### Tasks

#### Backend
- [ ] **S7-BE-01** Install & konfigurasi Uppy server (atau gunakan CF Stream direct upload via tus)
- [ ] **S7-BE-02** API Route: `POST /api/nanny/video/upload-url` — generate CF Stream direct upload URL (tus endpoint)
- [ ] **S7-BE-03** API Route: `POST /api/nanny/video` — simpan metadata setelah upload selesai
- [ ] **S7-BE-04** Prisma migration: tambah tabel `NannyVideo` (schema sesuai SRS §4.3)
- [ ] **S7-BE-05** API Route: `POST /api/webhooks/cloudflare-stream` — terima webhook `ready` dari CF Stream, update status video di DB
- [ ] **S7-BE-06** Verifikasi webhook signature dari CF Stream (security)

#### Frontend
- [ ] **S7-FE-01** Install dependencies: `@uppy/core`, `@uppy/tus`, `@uppy/react`, `react-media-recorder`, `vidstack`
- [ ] **S7-FE-02** Komponen `VideoRecorder` — akses kamera HP in-app, rekam, preview, konfirmasi (pakai `react-media-recorder`)
- [ ] **S7-FE-03** Komponen `VideoUploader` — Uppy + Tus, progress bar, handle resumable (pakai Uppy)
- [ ] **S7-FE-04** Halaman `/nanny/profile/media` — section "Video Perkenalan" dengan tombol Rekam/Pilih File
- [ ] **S7-FE-05** Status indicator: "Mengunggah..." → "Sedang Diproses..." → "Aktif" (polling atau webhook SSE)
- [ ] **S7-FE-06** Komponen `VideoPlayer` untuk preview video yang sudah aktif (Vidstack, portrait 9:16)
- [ ] **S7-FE-07** Validasi client-side: durasi video (reject jika > 3 menit sebelum upload)

#### Testing
- [ ] **S7-TST-01** Manual test: rekam dari kamera HP Android & iOS, upload, cek muncul di profil
- [ ] **S7-TST-02** Simulasi koneksi terputus saat upload, cek resume bekerja
- [ ] **S7-TST-03** Cek webhook CF Stream diterima dan status DB terupdate

### Definition of Done Sprint 7
- Nanny bisa rekam video dari kamera HP (tanpa keluar app) atau pilih dari galeri
- Video terupload ke CF Stream dan tampil dengan status yang benar di profil
- Resumable upload sudah bekerja (test manual)
- Webhook CF Stream sudah terhubung ke DB

---

## Sprint 8 — Skill Video & Portofolio
> Tema: "Profil nanny lengkap dengan keahlian dan pengalaman"
> Durasi: 2 minggu

### Goal
Nanny bisa mengisi profil media secara lengkap: video intro + skill videos + portofolio.
Profil sudah bisa dipreview sendiri oleh nanny.

### Tasks

#### Backend
- [ ] **S8-BE-01** API Routes skill video: `PUT /api/nanny/video/:id`, `DELETE /api/nanny/video/:id`
- [ ] **S8-BE-02** API Route reorder video: `PUT /api/nanny/video/reorder` (simpan field `order`)
- [ ] **S8-BE-03** Prisma migration: tambah tabel `NannyPortfolio` dan `NannyPortfolioMedia`
- [ ] **S8-BE-04** API Routes portofolio: `POST`, `PUT`, `DELETE /api/nanny/portfolio`
- [ ] **S8-BE-05** API Route upload foto portofolio: `POST /api/nanny/photo/upload-url` (signed URL ke R2)
- [ ] **S8-BE-06** Limit enforcement: max 10 skill video, max 10 portofolio (return 400 jika melebihi)

#### Frontend
- [ ] **S8-FE-01** Komponen `SkillVideoSection` — daftar skill video yang sudah diupload + tombol tambah
- [ ] **S8-FE-02** Modal `AddSkillVideo` — pilih kategori (dropdown preset + isian manual), lalu VideoRecorder/Uploader
- [ ] **S8-FE-03** `CategoryPicker` — daftar 8 kategori preset + "Lainnya", tampil sebagai chip/tag selector
- [ ] **S8-FE-04** Drag & drop reorder skill video (pakai `@dnd-kit/core`)
- [ ] **S8-FE-05** Komponen `PortfolioSection` — daftar entri portofolio + tombol tambah
- [ ] **S8-FE-06** Modal `AddPortfolio` — form judul, deskripsi, periode, upload foto/video (max 3)
- [ ] **S8-FE-07** Halaman preview profil nanny (readonly view dari sudut pandang nanny) — "Lihat Profil Saya"

#### Testing
- [ ] **S8-TST-01** Upload 10 skill video, cek limit di video ke-11 error dengan baik
- [ ] **S8-TST-02** Reorder skill video, cek order tersimpan setelah refresh
- [ ] **S8-TST-03** Upload foto di portofolio, cek tampil di preview

### Definition of Done Sprint 8
- Nanny bisa tambah, hapus, dan reorder skill video
- Nanny bisa tambah entri portofolio dengan foto
- Nanny bisa preview profilnya sendiri sebelum parent lihat
- Semua limit (10 skill, 10 portofolio) enforced di FE + BE

---

## Sprint 9 — Parent View: Profil Nanny
> Tema: "Parent bisa lihat profil nanny lengkap dengan video"
> Durasi: 2 minggu

### Goal
Parent membuka profil nanny dan mendapat pengalaman seperti melihat "video CV" — video intro autoplay, bisa swipe skill videos fullscreen.

### Tasks

#### Backend
- [ ] **S9-BE-01** API Route: `GET /api/nanny/:id/profile-media` — return semua media profil (intro video, skill videos ordered, portfolio)
- [ ] **S9-BE-02** Pastikan route ini accessible oleh parent yang sudah login (RBAC check)
- [ ] **S9-BE-03** Thumbnail URL dari CF Stream sudah tersimpan di DB dan direturn di API

#### Frontend
- [ ] **S9-FE-01** Update halaman `/nanny/:id` — integrasi `NannyProfileMedia` component
- [ ] **S9-FE-02** Komponen `VideoIntroPlayer` — Vidstack, portrait 9:16, autoplay muted, tap untuk unmute + fullscreen
- [ ] **S9-FE-03** Komponen `SkillVideoFeed` — horizontal scroll card dengan thumbnail + label kategori
- [ ] **S9-FE-04** `SkillVideoFullscreen` — saat card di-tap, buka fullscreen portrait. Gunakan Swiper.js vertical snap untuk swipe ke skill video berikutnya
- [ ] **S9-FE-05** Komponen `PortfolioList` — daftar card entri portofolio, expand untuk lihat detail + foto
- [ ] **S9-FE-06** Placeholder state: tampilkan pesan yang tepat jika nanny belum isi video intro / skill / portofolio
- [ ] **S9-FE-07** Loading skeleton untuk semua section media (saat API belum return)

#### Testing
- [ ] **S9-TST-01** Buka profil nanny dari akun parent, cek video autoplay muted
- [ ] **S9-TST-02** Tap skill video card → fullscreen → swipe ke video berikutnya (test di HP fisik)
- [ ] **S9-TST-03** Test di Android dan iOS Safari (PWA)
- [ ] **S9-TST-04** Cek layout di layar kecil (< 375px) dan layar normal

### Definition of Done Sprint 9
- Parent bisa lihat profil nanny lengkap dengan semua media
- Video intro autoplay muted saat profil dibuka
- Skill video bisa di-swipe fullscreen seperti TikTok
- Sudah ditest di HP fisik Android + iOS

---

## Sprint 10 — Polish, Edge Case & Optimasi
> Tema: "Siap production — tidak ada jalan buntu untuk user"
> Durasi: 2 minggu

### Goal
Fitur production-ready: error handling lengkap, notifikasi, performa video optimal, dan moderation dasar.

### Tasks

#### Upload Reliability
- [ ] **S10-BE-01** Cleanup: hapus video dari CF Stream jika nanny hapus dari profil (CF Stream API delete)
- [ ] **S10-BE-02** Cron job: tandai video dengan status `PROCESSING` > 10 menit sebagai `FAILED` (CF Stream kadang silent fail)
- [ ] **S10-FE-01** Error state UI yang jelas: "Upload gagal — Coba lagi" dengan tombol retry
- [ ] **S10-FE-02** Indikator offline: jika nanny tidak ada koneksi, tampilkan banner "Koneksi terputus, upload akan dilanjutkan otomatis"

#### Notifikasi
- [ ] **S10-BE-03** Push notification ke nanny saat video selesai diproses CF Stream (status ACTIVE)
- [ ] **S10-FE-03** In-app notification badge di tab profil saat video baru selesai diproses

#### Performa
- [ ] **S10-FE-04** Lazy load Vidstack dan Swiper.js (dynamic import) — jangan load di halaman yang tidak butuh
- [ ] **S10-FE-05** Intersection Observer: video skill hanya di-render saat scroll ke section itu (virtual list sederhana)
- [ ] **S10-FE-06** Thumbnail blur placeholder (LQIP) saat thumbnail belum load

#### Moderation Dasar
- [ ] **S10-BE-04** Checkbox "Saya menyatakan konten ini sesuai panduan BundaYakin" wajib dicentang sebelum upload (simpan di DB sebagai flag `agreedToPolicy`)
- [ ] **S10-BE-05** Admin panel: halaman daftar video terbaru dengan status + tombol "Nonaktifkan" (ACTIVE → SUSPENDED)
- [ ] **S10-FE-07** Video dengan status SUSPENDED tidak tampil di profil parent (tampil placeholder)

#### Testing Akhir
- [ ] **S10-TST-01** Full user journey test: nanny baru → isi profil lengkap → parent lihat → parent approve matching
- [ ] **S10-TST-02** Test koneksi lambat (3G throttle di DevTools), cek semua loading state benar
- [ ] **S10-TST-03** Test upload video 3 menit penuh, cek tidak ada timeout
- [ ] **S10-TST-04** Security test: cek signed URL tidak bisa digunakan oleh nanny lain

### Definition of Done Sprint 10
- Tidak ada jalan buntu (dead end) untuk nanny saat upload gagal
- Nanny mendapat notifikasi saat video selesai diproses
- Video yang tidak pantas bisa di-suspend oleh admin
- Performa Lighthouse score > 85 untuk halaman profil nanny

---

## Dependencies & Prerequisites

Harus selesai sebelum Sprint 7 mulai:

| Item | Status | Catatan |
|---|---|---|
| Akun Cloudflare Stream aktif | Perlu dicek | Terpisah dari R2, perlu enable |
| CF Stream webhook URL dikonfigurasi | Perlu setup | Di dashboard CF Stream |
| Environment variable CF Stream API key | Perlu setup | `CLOUDFLARE_STREAM_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` |
| Prisma DB migration pipeline ready | Sudah ada | Gunakan yang existing |

---

## Estimasi Effort Per Sprint

| Sprint | Backend | Frontend | Testing | Total |
|---|---|---|---|---|
| Sprint 7 | 5 hari | 6 hari | 2 hari | ~13 hari |
| Sprint 8 | 4 hari | 6 hari | 2 hari | ~12 hari |
| Sprint 9 | 2 hari | 7 hari | 3 hari | ~12 hari |
| Sprint 10 | 4 hari | 4 hari | 4 hari | ~12 hari |

> Estimasi asumsi 1 developer full-stack. Jika ada FE dan BE terpisah, sprint bisa diparallel lebih agresif.
