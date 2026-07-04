# Domain Registry
## BundaYakin — Human Care Consulting

> Versi 1.0 · Mei 2026 · Dokumen Internal OPDS

Domain Registry mendefinisikan **bounded context** dari platform BundaYakin — batas tanggung jawab tiap domain, model data utama yang dimilikinya, dan relasi antar domain.

---

## Peta Domain

```
┌─────────────────────────────────────────────────────────────────────┐
│                          DOMAIN MAP                                  │
│                                                                      │
│  ┌─────────────┐    ┌─────────────────┐    ┌──────────────────┐    │
│  │  AUTH &     │    │    MATCHING     │    │   SUBSCRIPTION   │    │
│  │  IDENTITY   │───►│    ENGINE       │◄───│   & PAYMENT      │    │
│  └─────────────┘    └────────┬────────┘    └──────────────────┘    │
│                              │                                       │
│                    ┌─────────┴─────────┐                            │
│                    ▼                   ▼                             │
│           ┌──────────────┐   ┌──────────────────┐                  │
│           │  ASSESSMENT  │   │   MONITORING &   │                  │
│           │  (Layer 2/3) │   │   EVALUATION     │                  │
│           └──────────────┘   └──────────────────┘                  │
│                                                                      │
│  ┌─────────────────┐    ┌─────────────┐    ┌──────────────────┐    │
│  │  MEDIA &        │    │  REFERRAL & │    │   TRACK RECORD   │    │
│  │  PORTFOLIO      │    │  INCENTIVE  │    │   & REPUTATION   │    │
│  └─────────────────┘    └─────────────┘    └──────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    NOTIFICATION & ACTIVITY                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Domain 1 — Auth & Identity

**Tanggung jawab:** Autentikasi, otorisasi, dan identitas inti semua pengguna.

| Atribut | Detail |
|---|---|
| **Owner** | Platform Core |
| **Model Prisma** | `User`, `Account`, `Session`, `VerificationToken`, `OtpToken` |
| **Tech** | NextAuth v5, bcrypt credentials, OTP via WA untuk reset password |
| **Role yang dikelola** | `PARENT`, `NANNY`, `ADMIN` |

**Aturan domain:**
- Satu `User` bisa punya satu `ParentProfile` ATAU satu `NannyProfile`, tidak keduanya
  - *Pengecualian teknis:* fitur switch-role (`api/user/switch-role`) hanya untuk akun testing internal/ADMIN (`canSwitchRoles`), mengganti role di JWT tanpa mengubah DB — bukan pelanggaran aturan domain untuk user umum
- Admin dibuat manual (tidak ada UI registrasi admin)
- OTP reset password hanya via nomor WA (tidak via email) — `OtpToken`
- Email optional untuk nanny, wajib untuk orang tua

**Relasi ke domain lain:**
- Identity dikonsumsi oleh semua domain lain
- Matching, Payment, dan Evaluation butuh `userId` yang sudah terautentikasi

---

## Domain 2 — User Profile

**Tanggung jawab:** Data profil lengkap orang tua dan nanny, termasuk profil anak dan lansia.

| Atribut | Detail |
|---|---|
| **Owner** | Platform Core |
| **Model Prisma** | `ParentProfile`, `NannyProfile`, `ChildProfile`, `ElderlyProfile` |

**Aturan domain:**
- `ParentProfile` bisa punya banyak `ChildProfile` (multi-anak) dan `ElderlyProfile`
- `ChildProfile.nannyNotes` hanya bisa diisi/edit oleh nanny yang sedang aktif dalam assignment
- `ChildProfile.sortOrder` menentukan urutan tampil — bisa diatur manual
- `NannyProfile.nannyType` adalah array (bisa LIVE_IN + INFAL sekaligus)
- Foto profil disimpan di Cloudflare R2

**Sub-domain: Profil Anak**
- Setiap anak punya `ChildAgeGroup` yang menentukan pertanyaan popup matching
- `doList` dan `dontList` adalah array string — konvensi pengasuhan dari orang tua

---

## Domain 3 — Matching Engine

**Tanggung jawab:** Seluruh proses matching dari survey hingga laporan skor kecocokan.

| Atribut | Detail |
|---|---|
| **Owner** | Product Core |
| **Model Prisma** | `MatchingRequest`, `SurveyQuestion`, `SurveyResponse`, `CustomQuestion`, `Dealbreaker`, `MatchingResult`, `MatchResult` |
| **AI** | Claude API (scoring, laporan narrative) |

**Aturan domain:**
- Survey diisi **independen** oleh nanny dan orang tua — tidak saling melihat jawaban sebelum matching selesai
- Setiap pertanyaan bisa ditandai sebagai **dealbreaker** oleh salah satu pihak
- Dealbreaker tidak otomatis menolak — memicu notifikasi negosiasi
- `MatchingRequest` punya periode eksklusif 7 hari (bisa diperpanjang 1x +3 hari)
- Setelah `exclusiveUntil` lewat tanpa keputusan → status `EXPIRED` → nanny masuk talent pool
- `MatchResult` adalah cache skor direktori (tanpa `MatchingRequest`) — **sudah dipakai di Fasa 1** oleh direktori nanny internal (`cari-nanny/direktori`) dan Kuota Koneksi; jangan dirancukan dengan `MatchingResult` (output sesi matching formal)

**Flow matching:**
```
Orang Tua buka request → nanny diundang (Flow A) atau dipilih AI (Flow B)
    → Kedua pihak isi survey independen
    → parentSurveyDone = true AND nannySurveyDone = true
    → Claude API scoring → MatchingResult dibuat
    → Status → COMPLETED
    → Orang tua baca laporan → ACCEPTED / REJECTED / biarkan expired
```

**Domain Matching — 53 Pertanyaan:**

| Domain | Aspek | Kode |
|---|---|---|
| A — Kondisi Kerja | Gaji, libur & fasilitas | A1 |
| A — Kondisi Kerja | Lingkup & tugas kerja | A2 |
| B — Nilai & Gaya Hidup | Agama & kepercayaan | B1 |
| B — Nilai & Gaya Hidup | Pakaian & penampilan | B2 |
| B — Nilai & Gaya Hidup | Gaya pengasuhan | B3 |
| C — Pengalaman & Kemampuan | Rekam jejak pengalaman | C1 |
| C — Pengalaman & Kemampuan | Kemampuan praktis | C2 |
| C — Pengalaman & Kemampuan | Komunikasi | C3 |
| C — Pengalaman & Kemampuan | Lingkungan kerja | C4 |

---

## Domain 4 — Subscription & Payment

**Tanggung jawab:** Manajemen langganan orang tua dan semua transaksi pembayaran.

| Atribut | Detail |
|---|---|
| **Owner** | Monetisasi |
| **Model Prisma** | `Subscription`, `Transaction` |
| **Payment Gateway** | Mayar (invoice-based) |

**Aturan domain:**
- Setiap `ParentProfile` punya tepat satu `Subscription` (bisa INACTIVE)
- Semua pembayaran dibuat sebagai `Transaction` dengan `mayarInvoiceId` unik
- Payment gateway: Mayar — invoice dibuat di backend, redirect ke URL checkout Mayar
- Konfirmasi pembayaran via **Mayar webhook** → update `TransactionStatus` dan `SubscriptionStatus`
- Tidak ada refund tunai — hanya kredit platform

**Tipe transaksi:**
| `TransactionType` | Jumlah |
|---|---|
| SUBSCRIPTION | Rp 500.000 |
| ADDON_PSIKOTES | Rp 300.000 |
| ADDON_PSIKOLOG | Rp 1.200.000–1.500.000 |
| ADDON_TRACK_RECORD | Rp 50.000 |
| CONNECTION_ADDON | Rp 100.000 |
| PLACEMENT_FEE | Rp 600.000 / Rp 1.200.000 |

---

## Domain 5 — Connection Quota

**Tanggung jawab:** Mengatur kuota koneksi orang tua ke nanny per rolling 30-hari.

| Atribut | Detail |
|---|---|
| **Owner** | Platform Core |
| **Model Prisma** | `ConnectionQuota` |

**Aturan domain:**
- Rolling window 30 hari (bukan calendar month)
- Gratis (tanpa langganan): 3 referral/bulan, 0 talent pool
- Aktif langganan: 3 referral + 7 talent pool per bulan
- Kuota habis → bayar per koneksi (Rp 100rb) via Mayar

---

## Domain 6 — Monitoring & Evaluation

**Tanggung jawab:** Check-in dan evaluasi berkala setelah nanny mulai kerja.

| Atribut | Detail |
|---|---|
| **Owner** | Product Core |
| **Model Prisma** | `NannyAssignment`, `AssignmentChild`, `Checkin`, `Evaluation` |

**Aturan domain:**
- `NannyAssignment` adalah kontrak aktif antara orang tua dan nanny
- Satu assignment bisa punya banyak `AssignmentChild` (nanny jaga lebih dari 1 anak)
- Check-in dijadwalkan otomatis di Minggu 1 dan Minggu 2 setelah `startDate`
- Evaluasi penuh dijadwalkan di Bulan 1, Bulan 3, lalu tiap kuartal
- AI (Claude) membuat ringkasan per evaluasi — `aiSummary` dan `aiRecommendation`
- Output opsional: PDF laporan evaluasi (via pdf-service)

---

## Domain 7 — Assessment (Layer 2 & 3)

**Tanggung jawab:** Psikotes AI (Layer 2) dan laporan psikolog HCC (Layer 3).

| Atribut | Detail |
|---|---|
| **Owner** | HCC Psychology |
| **Model Prisma** | `AssessmentResult` |

**Aturan domain:**
- Layer 2: nanny isi tes → AI scoring → `AssessmentResult` dengan `interpretedBy = "AI"`
- Layer 3: psikolog wawancara privat (orang tua tidak hadir) → upload `clinicalNotes` dan `verdict`
- Output Layer 3: **NannyCare Profile™** — dokumen PDF rahasia via ReportLab (pdf-service)
- `psychologistId` di Layer 3 adalah `userId` psikolog HCC

---

## Domain 8 — Track Record & Reputation

**Tanggung jawab:** Rekam jejak dua arah antara nanny dan keluarga.

| Atribut | Detail |
|---|---|
| **Owner** | Community |
| **Model Prisma** | `TrackRecordEntry`, `TrackRecordAccess`, `NannyReference` |

**Aturan domain:**
- `TrackRecordEntry` ditambah setelah assignment selesai — hanya keluarga yang pernah kerja dengan nanny
- Review bisa anonim (`isPublic = false`) — opt-in dari pemberi kerja
- Orang tua beli akses rekam jejak satu nanny: Rp 50rb, berlaku selama `expiresAt`
- `NannyReference` adalah data kontak referensi manual dari nanny (bukan review platform)
- Badge `Terpercaya` diberikan saat nanny bertahan 3 bulan di satu keluarga

---

## Domain 9 — Media & Portfolio

**Tanggung jawab:** Foto dan video portfolio nanny.

| Atribut | Detail |
|---|---|
| **Owner** | Platform Core |
| **Model Prisma** | `NannyMedia`, `NannyPortfolio`, `NannyPortfolioMedia` |
| **Storage** | Cloudflare R2 (foto), Cloudflare Stream (video) |

**Aturan domain:**
- `NannyMedia.storageKey` untuk foto = R2 object key; untuk video = Cloudflare Stream UID
- Video max 3 menit (180 detik), max `storageMB` dimonitor untuk kuota R2
- `NannyPortfolio` adalah entri teks pengalaman kerja + foto opsional (mirip LinkedIn)
- Foto portfolio bisa multi-gambar per entri (`NannyPortfolioMedia`)

---

## Domain 10 — Referral & Incentive

**Tanggung jawab:** Sistem referral nanny dan pembayaran bonus milestone.

| Atribut | Detail |
|---|---|
| **Owner** | Growth |
| **Model Prisma** | `Referral`, `ParentReferral` |

**Aturan domain:**
- `Referral`: nanny mereferral nanny lain ke keluarga
- `ParentReferral`: orang tua merekomendasikan orang tua atau nanny baru ke platform
- Bonus dibayar manual oleh admin saat milestone tercapai
- Dana bonus: dari allocation placement fee dan admin fee (tidak dari kas langganan)

**Bonus milestone nanny:**
| Event | Referrer | Nanny |
|---|---|---|
| Diterima kerja | Rp 75.000 | Rp 50.000 + kredit platform |
| Bertahan 1 bulan | — | Rp 75.000 |
| Bertahan 3 bulan | Rp 125.000 | Rp 100.000 + badge Terpercaya |

---

## Domain 11 — Notification & Activity

**Tanggung jawab:** Semua notifikasi in-app dan audit log aktivitas.

| Atribut | Detail |
|---|---|
| **Owner** | Platform Core |
| **Model Prisma** | `Notification`, `ActivityLog` |

**Aturan domain:**
- `Notification` adalah in-app — belum ada push notification mobile
- `ActivityLog` adalah audit trail — tidak boleh dihapus
- `Notification.type` standar: `MATCHING_READY`, `EVALUATION_DUE`, `DEALBREAKER`, `PAYMENT`, `CHECKIN_DUE`

---

## Relasi Antar Domain

```
Auth & Identity
    │
    ├── User Profile ──────────────────────────────────┐
    │       │                                          │
    │       ├── Matching Engine ──► Assessment         │
    │       │       │                                  │
    │       │       └── Connection Quota               │
    │       │                                          │
    │       ├── Subscription & Payment                 │
    │       │                                          │
    │       ├── Monitoring & Evaluation                │
    │       │                                          │
    │       ├── Media & Portfolio                      │
    │       │                                          │
    │       ├── Track Record & Reputation              │
    │       │                                          │
    │       └── Referral & Incentive                   │
    │                                                  │
    └── Notification & Activity ◄──────────────────────┘
         (semua domain emit notifikasi)
```

---

*Lihat juga: [Product Ecosystem Blueprint](01_product_ecosystem_blueprint.md) · [TDD](07_technical_design_document.md) · [Prisma Schema](../../apps/web/prisma/schema.prisma)*
