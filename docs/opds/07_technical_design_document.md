# Technical Design Document (TDD)
## BundaYakin — Human Care Consulting

> Versi 1.0 · Mei 2026 · Dokumen Internal OPDS

---

## 1. Technology Stack

| Layer | Teknologi | Versi | Keterangan |
|---|---|---|---|
| **Frontend** | Next.js App Router | 14 | SSR + RSC by default |
| **Language** | TypeScript | 5+ | Strict mode |
| **Styling** | Tailwind CSS | 3 | Utility-first |
| **ORM** | Prisma | 5 | Type-safe database client |
| **Database** | PostgreSQL (Neon) | 15 | Serverless, connection pooling |
| **Auth** | NextAuth v5 (Auth.js) | 5 | Prisma adapter, JWT sessions |
| **AI** | Claude API (Anthropic) | claude-sonnet-4-6 | Matching + evaluasi |
| **Storage Foto** | Cloudflare R2 | — | S3-compatible object storage |
| **Storage Video** | Cloudflare Stream | — | Video CDN + adaptive bitrate |
| **Payment** | Mayar | — | Invoice gateway Indonesia |
| **Email** | Resend | — | Transaksional email |
| **Deploy Web** | Vercel | — | Edge network, preview per branch |
| **Deploy PDF** | Railway | — | Python FastAPI container |
| **PDF Generator** | ReportLab (Python) | — | NannyCare Profile™ PDF |

---

## 2. Arsitektur Sistem

### Overview

```
                    ┌─────────────────────────────────────┐
                    │          VERCEL EDGE                │
                    │                                     │
  Browser ─────────►│  Next.js 14 App Router             │
                    │  ├── React Server Components        │
                    │  ├── API Routes (Edge + Node)       │
                    │  └── Middleware (auth check)        │
                    └────────────────┬────────────────────┘
                                     │
          ┌──────────────────────────┼───────────────────────────┐
          │                          │                           │
          ▼                          ▼                           ▼
  ┌──────────────┐         ┌──────────────────┐       ┌─────────────────┐
  │ Neon         │         │ External APIs    │       │ apps/pdf-service│
  │ PostgreSQL   │         │ - Claude API     │       │ (Railway)       │
  │ (Prisma)     │         │ - Cloudflare R2  │       │ FastAPI +       │
  │              │         │ - CF Stream      │       │ ReportLab       │
  │              │         │ - Mayar          │       └─────────────────┘
  │              │         │ - Resend         │
  └──────────────┘         └──────────────────┘
```

### Next.js Rendering Strategy

| Halaman | Strategy | Alasan |
|---|---|---|
| Dashboard | Server Component (SSR) | Data fresh per request, auth di server |
| Survey matching | Client Component (`"use client"`) | Form interaktif, state lokal |
| Profil nanny | Server Component (ISR/SSR) | SEO + data cukup stabil |
| Laporan kecocokan | Server Component (SSR) | Data sensitif, tidak di-cache client |
| Upload media | Client Component | File upload butuh browser API |
| Halaman statis (landing, pricing) | Static (SSG) | Tidak berubah per user |

---

## 3. Data Architecture

### Database: Neon PostgreSQL

Neon dipilih karena:
- Serverless — tidak ada idle cost saat tidak ada traffic
- Compatible 100% dengan PostgreSQL
- Prisma support penuh (adapter tersedia)
- Auto-scaling connection pool via Neon serverless driver

### Model Data Utama

Lihat [`apps/web/prisma/schema.prisma`](../../apps/web/prisma/schema.prisma) untuk definisi lengkap.

**Hierarki model:**
```
User
├── ParentProfile
│   ├── ChildProfile (1..N)
│   ├── ElderlyProfile (0..N)
│   ├── Subscription (1..1)
│   ├── MatchingRequest (0..N)
│   ├── NannyAssignment (0..N)
│   ├── ConnectionQuota (0..N, rolling)
│   └── TrackRecordAccess (0..N)
│
└── NannyProfile
    ├── NannyMedia (0..N)
    ├── NannyPortfolio (0..N)
    ├── NannyReference (0..N)
    ├── MatchingRequest (0..N)
    ├── AssessmentResult (0..N)
    └── TrackRecordEntry (0..N)

MatchingRequest
├── SurveyResponse (N, dari parent atau nanny)
├── CustomQuestion (0..N)
├── Dealbreaker (0..N)
└── MatchingResult (0..1)
```

### Prisma Best Practices

1. **Hindari N+1** — gunakan `include` secara eksplisit, query helper di `lib/queries/`
2. **Denormalize dengan bijak** — `SurveyResponse.questionCode` di-denormalize untuk query efisien
3. **Soft delete tidak digunakan** — hapus data secara eksplisit, audit via ActivityLog
4. **JSON fields** — untuk data fleksibel (`parentScores`, `aiRawOutput`, `aspectBreakdown`) yang tidak perlu diquery per-field

---

## 4. Authentication & Authorization

### Flow Autentikasi

```
User input email + password
        │
        ▼
NextAuth Credentials Provider
        │
        ▼
Hash password check (bcrypt)
        │
        ▼
JWT session dibuat (tidak ada database session)
        │
        ▼
Middleware.ts cek session per request
        │
        ▼
API routes: auth-server.ts verifikasi role
```

### Role-Based Access Control (RBAC)

| Endpoint / Halaman | PARENT | NANNY | ADMIN |
|---|---|---|---|
| `/dashboard/parent/*` | ✅ | ❌ | ✅ |
| `/dashboard/nanny/*` | ❌ | ✅ | ✅ |
| `/api/parent/*` | ✅ | ❌ | ✅ |
| `/api/nanny/*` | ❌ | ✅ | ✅ |
| `/api/matching/*` | ✅ | ✅ | ✅ |
| `/api/webhooks/*` | ❌ (API key only) | ❌ | ❌ |

### Reset Password (OTP via WA)
```
User input nomor WA
        │
        ▼
Generate OTP (6 digit, TTL 5 menit) → simpan ke OtpToken
        │
        ▼
Kirim via WA (integrasi WA Business API atau manual)
        │
        ▼
User input OTP → validasi → buat reset session → ubah password
```

---

## 5. Matching Engine

### Flow Teknis

```
1. POST /api/matching/request
   └── Buat MatchingRequest (status: PENDING)

2. POST /api/survey/save
   └── Simpan SurveyResponse per pertanyaan
   └── Update parentSurveyDone / nannySurveyDone flag

3. Saat keduanya done → trigger AI scoring:
   POST /api/matching/[id]/score
   └── Fetch semua SurveyResponse untuk MatchingRequest ini
   └── Buat prompt → kirim ke Claude API
   └── Parse response JSON → simpan ke MatchingResult
   └── Update MatchingRequest.status → COMPLETED

4. GET /api/matching/[id]/result
   └── Return MatchingResult untuk ditampilkan ke kedua pihak
```

### Claude API Prompt Structure

Prompt matching ada di `lib/prompts/`. Input:
```json
{
  "parent_answers": [...],
  "nanny_answers": [...],
  "dealbreakers": [...],
  "child_profiles": [...],
  "domain_weights": {...}
}
```

Output yang diharapkan (via structured JSON):
```json
{
  "score_overall": 82,
  "score_domain_a": 90,
  "score_domain_b": 75,
  "score_domain_c": 85,
  "aspect_breakdown": {"A1": 95, "A2": 85, ...},
  "match_highlights": [...],
  "mismatch_areas": [...],
  "negotiation_points": [...],
  "tips_for_parent": [...],
  "tips_for_nanny": [...]
}
```

### Dealbreaker Logic

```
Jika dealbreaker tidak match:
    → isMatched = false
    → MatchingRequest.status = NEGOTIATING
    → Kirim notifikasi ke kedua pihak
    → Tidak auto-reject — kedua pihak bisa diskusi

Dealbreaker yang match:
    → isMatched = true
    → Tidak menghalangi proses matching
```

---

## 6. Payment Flow

### Alur Pembayaran (Mayar)

```
1. User klik "Bayar" di UI

2. POST /api/payment/create-invoice
   └── Buat Transaction (status: PENDING)
   └── Panggil Mayar API → buat invoice
   └── Simpan mayarInvoiceId + mayarPaymentUrl ke Transaction
   └── Return mayarPaymentUrl ke client

3. Client redirect ke mayarPaymentUrl (Mayar checkout page)

4. User bayar di Mayar

5. Mayar kirim webhook ke POST /api/webhooks/mayar
   └── Verifikasi signature (MAYAR_WEBHOOK_SECRET)
   └── Update Transaction.status → SUCCESS
   └── Update SubscriptionStatus / ConnectionQuota / dll
   └── Kirim email konfirmasi via Resend
```

### Keamanan Webhook
- Setiap webhook diverifikasi menggunakan HMAC signature dari Mayar
- Endpoint webhook tidak membutuhkan auth session (hanya API key validation)
- Semua webhook event di-log ke ActivityLog

---

## 7. Media Upload

### Foto (Cloudflare R2)

```
1. Client request signed upload URL:
   GET /api/upload/signed-url?type=avatar&contentType=image/jpeg

2. Server buat S3-compatible presigned PUT URL ke R2
   └── Key: nanny/{nannyId}/media/{uuid}.jpg
   └── TTL: 5 menit

3. Client upload langsung ke R2 (bypass server)

4. Client konfirmasi upload selesai:
   POST /api/upload/confirm
   └── Simpan storageKey ke NannyMedia atau ParentProfile/ChildProfile
```

### Video (Cloudflare Stream)

```
1. Client request direct creator upload URL:
   GET /api/upload/stream-url

2. Server panggil CF Stream API → dapat upload URL + Stream UID

3. Client upload video langsung ke Cloudflare Stream

4. Cloudflare Stream transcode video (async)

5. Client polling status:
   GET /api/upload/stream-status?uid={streamUid}
   └── Setelah ready → simpan UID ke NannyMedia.storageKey
```

---

## 8. PDF Generation

### Alur PDF

```
1. POST /api/report/generate
   └── Fetch data dari database (nanny, matching result, assessment)
   └── Format ke JSON payload
   └── POST ke apps/pdf-service dengan header x-api-key

2. pdf-service (Railway):
   └── FastAPI endpoint /generate-report
   └── ReportLab render PDF
   └── Return PDF binary

3. apps/web:
   └── Upload PDF ke Cloudflare R2
   └── Simpan URL ke MatchingResult.reportPdfUrl atau AssessmentResult.reportPdfUrl
   └── Notify user
```

### Keamanan antar Service
- pdf-service hanya bisa diakses dengan header `x-api-key: PDF_SERVICE_SECRET`
- Tidak ada auth session di pdf-service — ini internal service
- `PDF_SERVICE_SECRET` disimpan di Vercel env dan Railway env

---

## 9. Connection Quota System

### Logic Rolling Window

```
Saat parent mau koneksi ke nanny:
1. Cari ConnectionQuota aktif (periodEnd > now())

2. Jika tidak ada → buat window baru:
   periodStart = now()
   periodEnd = now() + 30 hari
   referralLimit = 3 (atau lebih jika berlangganan)
   talentPoolLimit = 0 (atau 7 jika berlangganan aktif)

3. Cek apakah quota masih ada:
   - Flow REFERRAL: referralUsed < referralLimit
   - Flow TALENT_POOL: talentPoolUsed < talentPoolLimit

4. Jika quota habis:
   - Tawarkan beli koneksi extra (Rp 100rb)
   - Atau tunggu sampai window reset

5. Setelah koneksi dibuka:
   - Increment referralUsed atau talentPoolUsed
   - Set MatchResult.kontakTerbuka = true
   - Set MatchResult.quotaUsed = true
```

---

## 10. API Design Conventions

### Response Format

```typescript
// Success
{ success: true, data: T }

// Error
{ success: false, error: string, code?: string }
```

### HTTP Status Codes

| Code | Arti |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request (validasi gagal) |
| 401 | Unauthorized (tidak login) |
| 403 | Forbidden (role salah / akses tidak diizinkan) |
| 404 | Not Found |
| 409 | Conflict (data duplikat) |
| 500 | Internal Server Error |

### Validasi Input

- Semua input dari user divalidasi di API route sebelum masuk ke database
- Gunakan `zod` atau manual validation — tidak ada trust pada client input
- File upload: validasi MIME type dan ukuran di server sebelum generate signed URL

---

## 11. Environment Variables

### apps/web

| Variable | Keterangan |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Secret untuk JWT signing |
| `NEXTAUTH_URL` | Base URL aplikasi |
| `ANTHROPIC_API_KEY` | Claude API key |
| `CLOUDFLARE_ACCOUNT_ID` | CF account ID |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | R2 access key |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | R2 secret key |
| `CLOUDFLARE_R2_BUCKET_NAME` | Nama bucket R2 |
| `CLOUDFLARE_STREAM_API_TOKEN` | CF Stream API token |
| `MAYAR_API_KEY` | Mayar API key |
| `MAYAR_WEBHOOK_SECRET` | Mayar webhook HMAC secret |
| `RESEND_API_KEY` | Resend email API key |
| `PDF_SERVICE_URL` | URL Railway pdf-service |
| `PDF_SERVICE_SECRET` | Shared secret untuk auth ke pdf-service |

### apps/pdf-service

| Variable | Keterangan |
|---|---|
| `PDF_SERVICE_SECRET` | Harus sama dengan apps/web |

---

## 12. Monitoring & Observability

### Saat Ini (Fasa 1)

- **Error monitoring:** Vercel logs + Railway logs (manual review)
- **Activity audit:** `ActivityLog` table di database
- **Payment audit:** `Transaction` table dengan semua event

### Yang Dibutuhkan (Post-Launch)

- Error tracking (Sentry atau Vercel Error Monitoring)
- Performance monitoring (Vercel Analytics atau custom)
- Database query performance (Prisma Accelerate atau Neon Insights)
- Alerting saat webhook gagal atau payment error

---

*Lihat juga: [Service Catalog](04_service_module_catalog.md) · [Domain Registry](02_domain_registry.md) · [ADR Index](08_adr/index.md) · [AI Governance](09_ai_governance.md)*
