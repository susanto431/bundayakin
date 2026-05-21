# Service & Module Catalog
## BundaYakin — Human Care Consulting

> Versi 1.0 · Mei 2026 · Dokumen Internal OPDS

Inventaris lengkap semua service, modul internal, dan integrasi eksternal yang membentuk platform BundaYakin.

---

## Arsitektur Tinggi

```
                         ┌─────────────────────┐
   Browser / Mobile ────►│   apps/web          │
                         │   (Next.js 14)      │
                         │   Vercel            │
                         └──────────┬──────────┘
                                    │
              ┌─────────────────────┼──────────────────────┐
              │                     │                      │
              ▼                     ▼                      ▼
    ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
    │  Neon PostgreSQL │  │  apps/pdf-service│  │  Ext. Services   │
    │  (via Prisma)    │  │  (Python/FastAPI)│  │  (lihat bawah)   │
    │                  │  │  Railway         │  │                  │
    └──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## Service 1 — apps/web (Next.js 14)

**Peran:** Aplikasi web utama — UI, API routes, business logic, autentikasi.

| Atribut | Detail |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Runtime** | Node.js |
| **Deploy** | Vercel |
| **Database** | Neon PostgreSQL via Prisma ORM |
| **Auth** | NextAuth v5 |
| **Styling** | Tailwind CSS |
| **Language** | TypeScript |

### Struktur API Routes (`src/app/api/`)

| Route Prefix | Domain | Tanggung Jawab |
|---|---|---|
| `/api/auth/` | Auth | NextAuth handler, registrasi, OTP reset password |
| `/api/user/` | Identity | Profil user (parent + nanny) |
| `/api/parent/` | User Profile | Profil orang tua, anak, lansia |
| `/api/nanny/` | User Profile | Profil nanny, referensi, badges |
| `/api/matching/` | Matching Engine | Buat matching request, submit survey, laporan |
| `/api/survey/` | Matching Engine | Bank soal, save jawaban |
| `/api/payment/` | Payment | Buat invoice Mayar, status pembayaran |
| `/api/webhooks/` | Payment | Mayar webhook handler |
| `/api/report/` | Assessment | Download PDF laporan |
| `/api/upload/` | Media | Upload foto/video ke Cloudflare |

### Struktur Source (`src/`)

```
src/
├── app/                    ← Next.js App Router pages & API routes
│   ├── (auth)/             ← halaman login, register
│   ├── dashboard/          ← dashboard utama
│   ├── onboarding/         ← flow onboarding setelah registrasi
│   ├── matching/           ← halaman matching & laporan
│   ├── monitoring/         ← halaman monitoring nanny aktif
│   ├── payment/            ← checkout & konfirmasi pembayaran
│   ├── profile/            ← halaman profil (parent & nanny)
│   ├── settings/           ← pengaturan akun
│   └── api/                ← semua API routes
│
├── components/             ← React components
│   ├── children/           ← komponen profil anak
│   ├── layout/             ← layout, navbar, footer
│   ├── matching/           ← komponen matching & survey
│   ├── monitoring/         ← komponen evaluasi & check-in
│   ├── payment/            ← komponen pembayaran
│   ├── profile/            ← komponen profil
│   ├── settings/           ← komponen settings
│   ├── shared/             ← komponen lintas-halaman
│   └── ui/                 ← komponen UI primitif (Button, Input, dll)
│
├── lib/                    ← utilities & service integrations
│   ├── auth.ts             ← NextAuth config & session helpers
│   ├── auth-server.ts      ← server-side auth utilities
│   ├── auth.config.ts      ← NextAuth adapter config
│   ├── prisma.ts           ← Prisma client singleton
│   ├── claude.ts           ← Claude API integration
│   ├── cloudflare.ts       ← Cloudflare R2 + Stream integration
│   ├── mayar.ts            ← Mayar payment integration
│   ├── resend.ts           ← Resend email integration
│   ├── pdf.ts              ← komunikasi ke pdf-service
│   ├── subscription.ts     ← logika subscription & quota
│   ├── survey-save.ts      ← logika save survey responses
│   ├── activity.ts         ← audit log helpers
│   ├── date.ts             ← date utilities
│   ├── utils.ts            ← general utilities
│   ├── prompts/            ← prompt templates untuk Claude API
│   ├── queries/            ← Prisma query helpers (N+1 prevention)
│   ├── emails/             ← email template builders
│   └── utils/              ← utilitas spesifik (validation, formatting)
│
├── hooks/                  ← React custom hooks
├── types/                  ← TypeScript type definitions
├── constants/              ← konstanta aplikasi (survey questions, dll)
└── middleware.ts            ← Next.js middleware (auth protection)
```

### Module Utama

#### `lib/claude.ts` — AI Integration
- Memanggil Claude API untuk scoring matching, psikotes AI, ringkasan evaluasi
- Menggunakan prompt templates dari `lib/prompts/`
- Output di-cache di database (MatchingResult, MatchResult, AssessmentResult)

#### `lib/cloudflare.ts` — Media Storage
- Upload foto ke Cloudflare R2 (signed URL upload)
- Upload video ke Cloudflare Stream (direct creator upload)
- Generate signed URL untuk akses foto private

#### `lib/mayar.ts` — Payment
- Buat invoice Mayar
- Verifikasi webhook signature
- Update status transaksi setelah payment confirmed

#### `lib/subscription.ts` — Subscription & Quota Logic
- Cek status langganan user
- Hitung kuota koneksi (rolling 30-hari)
- Validasi akses fitur berdasarkan status langganan

#### `lib/survey-save.ts` — Survey Logic
- Simpan jawaban survey per pertanyaan
- Track completion status (parentSurveyDone, nannySurveyDone)
- Trigger matching setelah kedua pihak selesai

---

## Service 2 — apps/pdf-service (Python/FastAPI)

**Peran:** Generator PDF untuk laporan NannyCare Profile™ (Layer 3) dan laporan evaluasi.

| Atribut | Detail |
|---|---|
| **Language** | Python 3 |
| **Framework** | FastAPI |
| **PDF Library** | ReportLab |
| **Deploy** | Railway |
| **Auth** | API key header (`x-api-key: PDF_SERVICE_SECRET`) |

### Endpoints

| Endpoint | Method | Input | Output |
|---|---|---|---|
| `/generate-report` | POST | JSON data nanny + assessment | PDF binary |
| `/health` | GET | — | `{"status": "ok"}` |

### Komunikasi dengan apps/web
- `apps/web/lib/pdf.ts` memanggil pdf-service dengan HTTP POST
- Header wajib: `x-api-key: PDF_SERVICE_SECRET`
- Response: PDF binary → disimpan ke Cloudflare R2 → URL disimpan di database

---

## Integrasi Eksternal

### Database — Neon PostgreSQL

| Atribut | Detail |
|---|---|
| **Provider** | Neon (serverless PostgreSQL) |
| **ORM** | Prisma v5 |
| **Connection** | Connection pooling via Neon serverless driver |
| **Config** | `DATABASE_URL` di environment variables |

**Catatan penting:**
- Jangan query N+1 — gunakan `include` Prisma dengan hati-hati
- Migrasi via `npx prisma migrate dev` (development) / `npx prisma migrate deploy` (production)
- Schema di `apps/web/prisma/schema.prisma`

---

### Payment — Mayar

| Atribut | Detail |
|---|---|
| **Provider** | Mayar (platform invoice Indonesia) |
| **Model** | Invoice-based — buat invoice, redirect ke URL checkout |
| **Status** | Akun belum diverifikasi (per Mei 2026, estimasi 3 hari) |
| **Sandbox** | Tersedia untuk testing |
| **Webhook** | `POST /api/webhooks/mayar` → verifikasi signature → update transaksi |

**Environment variables yang dibutuhkan:**
- `MAYAR_API_KEY`
- `MAYAR_WEBHOOK_SECRET`

**Integrasi di:** `apps/web/src/lib/mayar.ts`

---

### AI — Claude API (Anthropic)

| Atribut | Detail |
|---|---|
| **Provider** | Anthropic |
| **Model** | claude-sonnet-4-6 (default) |
| **Use cases** | Matching scoring, psikotes AI, ringkasan evaluasi, sosmed screening |
| **Output** | JSON structured (via tool use / response format) |

**Environment variables yang dibutuhkan:**
- `ANTHROPIC_API_KEY`

**Integrasi di:** `apps/web/src/lib/claude.ts`

**Catatan:** Lihat [AI Governance Document](09_ai_governance.md) untuk constraint dan kebijakan penggunaan AI.

---

### Media — Cloudflare R2 & Stream

| Layanan | Peran | Tipe File |
|---|---|---|
| **Cloudflare R2** | Object storage | Foto profil, foto portfolio, PDF laporan |
| **Cloudflare Stream** | Video hosting + CDN | Video perkenalan & keahlian nanny |

**Environment variables yang dibutuhkan:**
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_R2_ACCESS_KEY_ID`
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
- `CLOUDFLARE_R2_BUCKET_NAME`
- `CLOUDFLARE_STREAM_API_TOKEN`

**Integrasi di:** `apps/web/src/lib/cloudflare.ts`

**Keputusan desain:**
- R2 key untuk foto = `nanny/{nannyId}/media/{mediaId}`
- Stream UID untuk video = disimpan di `NannyMedia.storageKey`
- Video max 180 detik (3 menit), dikonfirmasi saat upload

---

### Email — Resend

| Atribut | Detail |
|---|---|
| **Provider** | Resend |
| **Use cases** | Konfirmasi registrasi, notifikasi laporan siap, reminder evaluasi |
| **Template** | React Email components di `lib/emails/` |

**Environment variables yang dibutuhkan:**
- `RESEND_API_KEY`

**Integrasi di:** `apps/web/src/lib/resend.ts`

---

### Auth — NextAuth v5

| Atribut | Detail |
|---|---|
| **Provider** | NextAuth v5 (Auth.js) |
| **Adapters** | Prisma adapter |
| **Auth methods** | Credentials (email+password), OTP WA (reset password) |
| **Session** | JWT strategy |

**Config di:**
- `apps/web/src/lib/auth.ts`
- `apps/web/src/lib/auth.config.ts`
- `apps/web/src/middleware.ts` (route protection)

**Route yang dilindungi:**
- `/dashboard/*` — butuh login
- `/api/*` (kecuali `/api/auth/*` dan webhook) — butuh login + role check

---

### Deploy — Vercel

| Atribut | Detail |
|---|---|
| **Target** | `apps/web` (Next.js) |
| **Trigger** | Push ke branch mana saja → preview; push ke `main` → production |
| **Region** | Asia (Singapore) — untuk latency minimal ke user Indonesia |

---

### Deploy — Railway

| Atribut | Detail |
|---|---|
| **Target** | `apps/pdf-service` (Python) |
| **Config** | Dockerfile di `apps/pdf-service/Dockerfile` |
| **Health check** | `GET /health` |

---

## Dependency Map

```
apps/web
  ├── Neon PostgreSQL (Prisma)     ← data storage
  ├── NextAuth v5                  ← authentication
  ├── Claude API                   ← AI features
  ├── Cloudflare R2                ← foto
  ├── Cloudflare Stream            ← video
  ├── Mayar                        ← pembayaran
  ├── Resend                       ← email
  └── apps/pdf-service             ← PDF generation

apps/pdf-service
  └── (tidak ada external dependencies selain Python packages)
```

---

*Lihat juga: [TDD](07_technical_design_document.md) · [ADR Index](08_adr/index.md) · [Domain Registry](02_domain_registry.md)*
