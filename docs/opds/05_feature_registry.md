# Feature Registry
## BundaYakin — Human Care Consulting

> Versi 1.2 · Dokumen Internal OPDS
> Diperbarui: Juli 2026 (audit kode vs dokumen — sinkron dengan commit terakhir 22 Mei 2026)

Feature Registry adalah **status snapshot** semua fitur platform. Berbeda dari backlog — ini mencatat apa yang sudah shipped, apa yang sedang berjalan, dan apa yang direncanakan.

Untuk detail implementasi tiap fitur, lihat [`apps/web/docs/FEATURES_BACKLOG.md`](../../apps/web/docs/FEATURES_BACKLOG.md).

---

## Legenda Status

| Status | Simbol | Arti |
|---|---|---|
| Shipped | ✅ | Sudah live di production |
| In Progress | 🔄 | Sedang dikerjakan |
| Planned | 📋 | Keputusan sudah ada, belum dikerjakan |
| Backlog | 🗂 | Diinginkan, belum diprioritaskan |
| Fasa 2+ | 🔮 | Direncanakan untuk Fasa 2 atau 3 |

---

## Area 1 — Auth & Onboarding

| Fitur | Status | Fasa | Catatan |
|---|---|---|---|
| Registrasi dengan email + password | ✅ | 1 | |
| Login credentials | ✅ | 1 | |
| Middleware route protection | ✅ | 1 | |
| Registrasi role PARENT vs NANNY | ✅ | 1 | |
| Reset password via OTP WA | ✅ | 1 | Nomor WA dinormalisasi sebelum disimpan (commit 2ac0858) |
| Auto-login setelah registrasi | ✅ | 1 | Commit 00885bc — registrasi langsung masuk dashboard tanpa login ulang |
| Onboarding flow setelah registrasi | ✅ | 1 | Pertanyaan tipe nanny (jangka panjang/infal/harian) |
| Switch role (testing/admin internal) | ✅ | 1 | `api/user/switch-role` + `RoleSwitcher.tsx` — **bukan fitur publik**: hanya akun dengan `canSwitchRoles` (nomor internal/ADMIN), JWT-only, tidak mengubah DB |
| Hapus akun (parent & nanny) | ✅ | 1 | `DeleteAccountButton.tsx` + `DeleteNannyAccountButton.tsx` |
| Google OAuth login | 🗂 | 1 | Nice-to-have |
| Email verifikasi saat registrasi | 📋 | 1 | Resend sudah terintegrasi, welcome email ada; verifikasi registrasi belum |

---

## Area 2 — Profil

### Profil Orang Tua

| Fitur | Status | Fasa | Catatan |
|---|---|---|---|
| Edit profil orang tua (nama, kota, dll) | ✅ | 1 | |
| Foto profil upload ke R2 | ✅ | 1 | |
| Pertanyaan onboarding wajib (tipe nanny dicari) | ✅ | 1 | |
| Export data profil orang tua | 📋 | 1 | API `api/parent/export` sudah ada; tombol di UI belum dikonfirmasi |

### Profil Anak (Multi-Anak)

> **Keputusan produk (22 Mei 2026):** Tambah & isi detail anak dibuka untuk **akun free**.
> Pertimbangan: orang tua yang sudah invest waktu mengisi profil anak lebih termotivasi subscribe.
> Data anak bukan fitur premium — yang premium adalah *berbagi ke nanny*. Memblok form isian terasa
> menghukum sebelum orang tua merasakan nilainya. Upsell ditampilkan sebagai banner lembut, bukan paywall.
> Yang tetap hanya untuk pelanggan: nanny bisa melihat & mengisi catatan dari sisi mereka.

| Fitur | Status | Fasa | Catatan |
|---|---|---|---|
| Tambah anak pertama | ✅ | 1 | Tersedia untuk akun free |
| Multi-anak dalam satu akun | ✅ | 1 | Tersedia untuk akun free; `ChildProfile.sortOrder` |
| Edit profil anak (alergi, jadwal, dll) | ✅ | 1 | Tersedia untuk akun free |
| Do-list dan don't-list per anak | ✅ | 1 | |
| Cara menenangkan anak | ✅ | 1 | |
| Nanny bisa lihat & isi catatan anak | ✅ | 1 | Hanya untuk pelanggan aktif; `NannyChildNotesForm` |
| Drag & drop urutan anak | 📋 | 1 | UX improvement; sortOrder sudah ada di schema |
| Foto profil anak | 📋 | 1 | |

### Profil Lansia

| Fitur | Status | Fasa | Catatan |
|---|---|---|---|
| Schema ElderlyProfile (Prisma) | ✅ | 1 | Schema disiapkan |
| UI tambah/edit profil lansia | 🔮 | 2 | Fasa 2 |

### Profil Nanny

| Fitur | Status | Fasa | Catatan |
|---|---|---|---|
| Edit profil dasar nanny | ✅ | 1 | |
| Foto profil upload ke R2 | ✅ | 1 | |
| Skills, bahasa, agama, dress code | ✅ | 1 | |
| Multi-tipe (LIVE_IN + INFAL) | ✅ | 1 | Array `nannyType` |
| Video perkenalan (CF Stream) | ✅ | 1 | Max 3 menit |
| Video keahlian (CF Stream) | ✅ | 1 | Max 3 menit; dengan polling status processing |
| Foto portfolio masakan & keahlian (R2) | ✅ | 1 | |
| Portfolio pengalaman kerja (teks + foto) | ✅ | 1 | `NannyPortfolio` |
| Mode "Open to Job" (LinkedIn-style) | ✅ | 1 | `openToJob` flag + `api/nanny/open-to-job` |
| Nanny notes di profil anak | ✅ | 1 | Hanya bisa diisi nanny aktif; `NannyChildNotesForm` |
| Preview profil nanny (preview sendiri) | ✅ | 1 | `dashboard/nanny/profile/preview` |
| Halaman profil nanny (view oleh parent) | ✅ | 1 | `dashboard/parent/nanny/[nannyId]` dengan SkillVideoFeed |
| Export data profil nanny | 📋 | 1 | API `api/nanny/export` sudah ada; tombol di UI belum dikonfirmasi |

---

## Area 3 — Matching Engine

| Fitur | Status | Fasa | Catatan |
|---|---|---|---|
| Bank soal 53 pertanyaan (Layer 1) | ✅ | 1 | Perlu validasi Apin & Tika |
| Survey paralel (nanny + orang tua independen) | ✅ | 1 | |
| Pertanyaan dealbreaker per pihak | ✅ | 1 | |
| Pertanyaan custom dari kedua pihak | ✅ | 1 | `CustomQuestion` |
| Popup follow-up berdasarkan usia anak | ✅ | 1 | `popupFollowUp` |
| AI scoring via Claude API | ✅ | 1 | `MatchingResult`; model claude-sonnet |
| Laporan % kecocokan per domain | ✅ | 1 | Domain A, B, C |
| Laporan highlight match/mismatch | ✅ | 1 | |
| Tips untuk orang tua dan nanny | ✅ | 1 | |
| PDF laporan matching (pdf-service) | ✅ | 1 | `api/report/[id]/pdf` → Railway PDF service |
| Periode eksklusif 7 hari | ✅ | 1 | `exclusiveUntil` |
| Perpanjangan eksklusif 1x +3 hari | ✅ | 1 | `extensionUsed` |
| Flow A — Referral (kode undangan) | ✅ | 1 | `api/matching/direct-invite` |
| Flow B — Talent Pool (AI rekomen) | ✅ | 1 | `TalentPoolClient`; hanya untuk pelanggan aktif |
| Notifikasi dealbreaker (negosiasi) | 📋 | 1 | Logic ada, notifikasi ke user belum dikonfirmasi |
| Jaminan Kecocokan (re-match gratis ≤30 hari) | 🔄 | 1 | **Selesai dikoding Juli 2026, menunggu deploy.** `MatchGuarantee` + akhiri penugasan (`api/assignment/[id]/end`) + bypass kuota di unlock + placement gratis via jaminan + UI banner/kartu |
| Psikotes AI Layer 2 | 📋 | 1 | Schema ready (`ADDON_PSIKOTES`), UI & implementasi belum. **Arah arsitektur terkunci (Juli 2026):** akan jadi service terpisah lintas produk HCC (bukan built-in di `apps/web`) — lihat [ADR-009](08_adr/ADR-009_psikotes-service-terpisah.md). Menunggu instrumen psikotes dari psikolog HCC sebelum implementasi dimulai |
| Review psikolog Layer 3 | 📋 | 1 | Schema ready (`ADDON_PSIKOLOG`), psikolog upload manual |

---

## Area 4 — Subscription & Payment

| Fitur | Status | Fasa | Catatan |
|---|---|---|---|
| Langganan Rp 500rb/tahun | ✅ | 1 | Halaman subscription + Mayar payment |
| Invoice via Mayar | ✅ | 1 | Akun Mayar sudah diverifikasi, production aktif |
| Mayar webhook handler | ✅ | 1 | `api/payment/webhook` (update subscription + quota); lookup transaksi via `productId` Mayar + `lookupId` (commit b3dc710, 5625743, 373774a) |
| Cloudflare Stream webhook handler | ✅ | 1 | `api/webhooks/cloudflare-stream` |
| Placement fee | ✅ | 1 | Rp 1,2jt — satu tarif flat, semua jenis penempatan (keputusan Juli 2026: tidak dibedakan per jenis); `api/payment/placement` + halaman placement |
| Halaman pricing publik | ✅ | 1 | `app/pricing/page.tsx` |
| Batalkan langganan | ✅ | 1 | `CancelSubscriptionButton` + `api/parent/subscription/cancel` |
| Add-on psikotes payment | 📋 | 1 | Transaksi type ada (`ADDON_PSIKOTES`), flow UI belum |
| Add-on psikolog payment | 📋 | 1 | Transaksi type ada (`ADDON_PSIKOLOG`), flow UI belum |
| Beli akses track record | 📋 | 1 | Schema ready (`TRACK_RECORD_ACCESS`) |
| Connection add-on (kuota extra) | 🔄 | 1 | **Selesai dikoding Juli 2026, menunggu deploy.** Checkout otomatis via Mayar (`api/payment/connection-addon` + webhook), tanpa CS manual — menutup walkthrough pembayaran (16) temuan #3 |
| Sosmed screening payment | 🗂 | 1 | Nice-to-have |
| Auto-renewal langganan | 🗂 | 2 | Fasa 2 |

---

## Area 5 — Connection Quota

| Fitur | Status | Fasa | Catatan |
|---|---|---|---|
| Schema ConnectionQuota | ✅ | 1 | Rolling 30-hari |
| Kuota gratis: 3 referral/bulan | ✅ | 1 | |
| Kuota langganan: 3 referral + 7 talent pool | ✅ | 1 | |
| UI visualisasi sisa kuota | ✅ | 1 | Ditampilkan di dashboard parent & halaman Cari Nanny |
| Beli koneksi extra via Mayar | 📋 | 1 | API logic ada, halaman payment belum |

---

## Area 6 — Monitoring & Evaluasi

| Fitur | Status | Fasa | Catatan |
|---|---|---|---|
| NannyAssignment saat nanny mulai kerja | ✅ | 1 | Multi-anak support |
| AssignmentChild (nanny jaga banyak anak) | ✅ | 1 | |
| Check-in minggu 1 & 2 | ✅ | 1 | `Checkin` model |
| Evaluasi bulan 1 & 3 | ✅ | 1 | `Evaluation` model |
| Evaluasi kuartalan | ✅ | 1 | |
| AI ringkasan evaluasi | ✅ | 1 | `aiSummary`, `aiRecommendation` |
| Akhiri penugasan oleh orang tua (+ alasan) | 🔄 | 1 | **Selesai dikoding Juli 2026, menunggu deploy.** `EndAssignmentCard` di monitoring; nanny kembali `isAvailable`; ≤30 hari → terbit Jaminan Kecocokan |
| Dashboard monitoring orang tua | ✅ | 1 | `dashboard/parent/monitoring` + halaman ringkasan evaluasi |
| Monitoring check-in nanny | ✅ | 1 | `dashboard/nanny/monitoring` + `MonitoringForm` |
| PDF laporan evaluasi | 📋 | 1 | Integrasi pdf-service belum ada khusus untuk evaluasi |
| Log aktivitas harian nanny | 🔮 | 2 | Fasa 2 |
| Knowledge transfer saat ganti nanny | 🔮 | 2 | Fasa 2 |

---

## Area 7 — Track Record & Reputasi

| Fitur | Status | Fasa | Catatan |
|---|---|---|---|
| Schema TrackRecordEntry | ✅ | 1 | |
| Schema TrackRecordAccess (beli akses Rp 50rb) | ✅ | 1 | |
| Input rekam jejak setelah assignment selesai | 🔄 | 1 | **Selesai dikoding Juli 2026, menunggu deploy.** `api/track-record` + `TrackRecordCard` di halaman monitoring; terverifikasi otomatis (terikat penugasan nyata), anonim kecuali opt-in |
| UI beli akses track record | 📋 | 1 | |
| Badge Terpercaya setelah 3 bulan | 📋 | 1 | Logic milestone ada di Referral |
| Track record pemberi kerja (dua arah) | 🔮 | 2 | Fasa 2 |
| Sosmed screening AI | 🗂 | 1 | Nice-to-have |

---

## Area 8 — Referral & Insentif

| Fitur | Status | Fasa | Catatan |
|---|---|---|---|
| Schema Referral (nanny refer nanny) | ✅ | 1 | |
| Schema ParentReferral | ✅ | 1 | |
| UI referral nanny (kode + tracking bonus) | ✅ | 1 | `dashboard/nanny/referral` — kode, referral berhasil, bonus earned/pending |
| UI referral parent (kode + tracking) | ✅ | 1 | `dashboard/parent/referral` — kode, referral parent & nanny, bonus |
| Tracking milestone referral | ✅ | 1 | Ditampilkan di halaman referral; filter status HIRED/MONTH_1/MONTH_3 |
| Pembayaran bonus manual oleh admin | 📋 | 1 | Panel admin perlu fitur ini |

---

## Area 9 — Notifikasi & UX

| Fitur | Status | Fasa | Catatan |
|---|---|---|---|
| Schema Notification | ✅ | 1 | |
| Schema ActivityLog | ✅ | 1 | |
| Notifikasi in-app nanny | ✅ | 1 | `dashboard/nanny/notifications` — MATCHING_READY, EVALUATION_DUE, PAYMENT, dll |
| Notifikasi in-app parent | 🔄 | 1 | **Selesai dikoding Juli 2026, menunggu deploy.** `/dashboard/parent/notifications` + lonceng berbadge unread di Beranda; buka halaman = tandai terbaca |
| Email transaksional via Resend | ✅ | 1 | Welcome email nanny & parent sudah aktif; template lain belum semua |
| FAQ statis | ✅ | 1 | `dashboard/parent/faq` — dikelompokkan per kategori (Langganan, Cara Kerja, dll) |
| PWA install prompt + offline page | ✅ | 1 | `InstallPrompt.tsx` + `ServiceWorkerRegister.tsx` + `app/offline` |
| Analytics PostHog | ✅ | 1 | `PostHogProvider.tsx` terintegrasi di root layout |
| Chatbot "Yaya" (bantuan) | 🗂 | 2 | Claude API tersedia; UI belum dimulai |
| Push notification mobile | 🔮 | 3 | |

---

## Area 10 — Panel Admin

| Fitur | Status | Fasa | Catatan |
|---|---|---|---|
| Panel admin — matching overview | ✅ | 1 | `dashboard/admin/matching-overview` — semua match per parent, skor, status |
| Direktori nanny (browse + filter) | ✅ | 1 | `dashboard/parent/cari-nanny/direktori` — filter kota & tipe; `NannyDetailDrawer` |
| Panel admin — Pricing Config (harga & kuota) | 🔄 | 1 | **Selesai dikoding Juli 2026, menunggu deploy.** `dashboard/admin/pricing-config` — jadwalkan perubahan harga (langganan, placement, connection add-on) & kuota (referral, talent pool), effective-dated (tidak retroaktif), log lengkap. Lihat [ADR-008](08_adr/ADR-008_pricing-config-panel.md) |
| Panel admin — manajemen pengguna | 🔮 | 2 | |
| Panel admin — pembayaran bonus referral | 🔮 | 2 | |
| Profil publik nanny (tanpa auth) | 🔮 | 2 | Profil nanny saat ini hanya bisa dilihat dalam dashboard (butuh auth) |
| Babysitter on-demand (hourly) | 🔮 | 3 | |
| Referral fee antar keluarga | 🔮 | 3 | |
| Community ekosistem | 🔮 | 3 | |

---

## Area 11 — Pilar Tumbuh Kembang (ADR-007, Juli 2026)

> Detail scope & tahapan: [PRD Tumbuh Kembang](13_prd_tumbuh_kembang.md). Semua item Planned.

| Fitur | Status | Tahap | Catatan |
|---|---|---|---|
| Kurva Pertumbuhan (WHO) | 🔄 | 1 | **Selesai dikoding Juli 2026, menunggu deploy.** `GrowthRecord` + kurva berat/tinggi vs median WHO; catat gratis, kurva & kategori (sesuai/perlu pantau/perlu perhatian) khusus pelanggan. ⚠️ Data referensi WHO perlu divalidasi psikolog/tenaga medis HCC sebelum diklaim akurat secara klinis (lihat `src/lib/growth-standards.ts`) |
| Jurnal & Galeri Momen anak | 🔄 | 1 | **Selesai dikoding Juli 2026, menunggu deploy.** `ChildJournalEntry` — teks + foto opsional, gratis untuk semua akun; parent-only (nanny menyusul di Log Harian Nanny Tahap 4) |
| Skrining Perkembangan (KPSP) | 🔄 | 2 | Instrumen tervalidasi + data soal & logika skoring selesai dikoding Juli 2026 (`kpsp-instrument.ts`, `kpsp-scoring.ts`, model `DevelopmentScreeningRecord`). API/UI belum dibangun |
| Konsultasi Psikolog Anak (add-on/sesi) | 📋 | 2 | Harga per level: Junior Rp 500rb · Mid Rp 1jt (peluncuran) · Senior Rp 2jt; pelanggan Rp 750rb (diskon 25%) |
| Portal Psikolog (role baru) | 📋 | 2 | Jadwal & kapasitas konsultasi (3/hari/psikolog, maks 5) + antrean review konten; kelak dipakai juga untuk Layer 3 |
| Edukasi Terkurasi (AI draft + review psikolog) | 📋 | 3 | Ritme dua-mingguan |
| Kalender & pengingat imunisasi | 📋 | 3 | Disclaimer non-medis |
| Log Harian Nanny | 📋 | 4 | Ditarik maju dari rencana Fasa 2 |

---

## Statistik Ringkas

| Kategori | Jumlah |
|---|---|
| ✅ Shipped | ~62 fitur |
| 🔄 In Progress | 0 |
| 📋 Planned (Fasa 1) | ~17 fitur |
| 🗂 Backlog | ~6 fitur |
| 🔮 Fasa 2+ | ~11 fitur |

---

*Lihat detail: [apps/web/docs/FEATURES_BACKLOG.md](../../apps/web/docs/FEATURES_BACKLOG.md) · [PRD](06_prd.md) · [Domain Registry](02_domain_registry.md)*
