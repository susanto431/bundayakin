# FOLDER_STRUCTURE.md — BundaYakin
> Referensi lengkap struktur folder. Setiap file baru wajib mengikuti ini.

---

## Prinsip Utama

- **Monorepo** — satu GitHub repo, dua apps: `apps/web` dan `apps/pdf-service`
- **App Router** — semua halaman Next.js di `src/app/`
- **Server Components by default** — tambah `"use client"` hanya saat perlu
- **Co-location** — komponen yang hanya dipakai satu halaman, taruh di folder halaman itu
- **Barrel exports** — setiap folder komponen punya `index.ts`

---

## Monorepo Root

```
bundayakin/                            ← GitHub repo root
├── .gitignore                         ← root gitignore (cover semua apps)
├── README.md
└── apps/
    ├── web/                           ← Next.js → deploy Vercel
    └── pdf-service/                   ← Python → deploy Railway
```

---

## apps/pdf-service/ — Python PDF Generator

```
apps/pdf-service/
├── CLAUDE.md                          ← instruksi Claude Code untuk service ini
├── main.py                            ← FastAPI entry point
├── requirements.txt
├── Dockerfile                         ← wajib untuk Railway
├── .env                               ← JANGAN commit
├── .env.example
└── services/
    └── nanny_profile.py               ← ReportLab generator
```

**Endpoint:**
- `POST /generate-report` — terima JSON data nanny, return PDF binary
- `GET /health` — health check untuk Railway

**Auth antar service:** Next.js kirim header `x-api-key: PDF_SERVICE_SECRET`.
PDF service validasi key sebelum generate. Nilai secret disimpan di `.env` kedua apps.

---

## apps/web/ — Next.js App (kamu bekerja di sini)

```
apps/web/
│
├── CLAUDE.md                          ← instruksi Claude Code
│
├── prisma/
│   ├── schema.prisma                  ← 17 model, jangan edit sembarangan
│   └── migrations/                    ← auto-generated
│
├── docs/                              ← dokumentasi project
│   ├── PRODUCT.md                     ← konteks bisnis lengkap
│   ├── DESIGN_SYSTEM.md               ← panduan visual (gunakan file asli BundaYakin_DesignSystem.md)
│   ├── FOLDER_STRUCTURE.md            ← file ini
│   └── API.md                         ← dokumentasi endpoint API
│
├── public/
│   ├── images/
│   │   ├── logo.svg
│   │   └── illustrations/             ← ilustrasi per screen
│   └── fonts/                         ← jika self-host font
│
├── .env                               ← JANGAN commit
├── .env.example                       ← commit ini (tanpa nilai)
├── package.json
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── middleware.ts                      ← route guard per role (di root apps/web/)
│
└── src/
    │
    ├── app/                           ← Next.js App Router
    │   │
    │   ├── layout.tsx                 ← root layout (font, providers, metadata)
    │   ├── page.tsx                   ← S01 Landing page
    │   ├── globals.css                ← CSS variables design system
    │   ├── not-found.tsx              ← halaman 404
    │   ├── loading.tsx                ← global loading UI
    │   │
    │   ├── auth/                      ← halaman autentikasi (public)
    │   │   ├── login/
    │   │   │   └── page.tsx           ← S04 Login
    │   │   ├── register/
    │   │   │   ├── page.tsx           ← pilih role: Orang Tua / Nanny
    │   │   │   ├── parent/
    │   │   │   │   └── page.tsx       ← S02 Register Orang Tua
    │   │   │   └── nanny/
    │   │   │       └── page.tsx       ← S03 Register Nanny + T&C
    │   │   └── verify/
    │   │       └── page.tsx           ← email verification
    │   │
    │   ├── onboarding/
    │   │   └── page.tsx               ← S06 Onboarding setelah register
    │   │
    │   ├── dashboard/
    │   │   │
    │   │   ├── parent/                ← PROTECTED: role PARENT only
    │   │   │   ├── layout.tsx         ← layout dengan bottom nav parent
    │   │   │   ├── page.tsx           ← S08 Dashboard Orang Tua
    │   │   │   ├── children/
    │   │   │   │   ├── page.tsx       ← S19 Daftar profil anak
    │   │   │   │   ├── new/
    │   │   │   │   │   └── page.tsx   ← form tambah anak baru
    │   │   │   │   └── [id]/
    │   │   │   │       └── page.tsx   ← detail/edit profil anak
    │   │   │   ├── matching/
    │   │   │   │   ├── page.tsx       ← S10 Mulai matching
    │   │   │   │   ├── survey/
    │   │   │   │   │   └── page.tsx   ← form survey Layer 1 (parent)
    │   │   │   │   └── result/
    │   │   │   │       ├── page.tsx   ← S12 Laporan kecocokan
    │   │   │   │       └── [id]/
    │   │   │   │           └── page.tsx
    │   │   │   ├── monitoring/
    │   │   │   │   └── page.tsx       ← S17 Pemantauan nanny aktif
    │   │   │   ├── evaluation/
    │   │   │   │   ├── page.tsx
    │   │   │   │   └── [id]/
    │   │   │   │       └── page.tsx
    │   │   │   ├── subscription/
    │   │   │   │   └── page.tsx       ← S14 Langganan & upgrade
    │   │   │   └── settings/
    │   │   │       └── page.tsx       ← S22 Settings Orang Tua
    │   │   │
    │   │   └── nanny/                 ← PROTECTED: role NANNY only
    │   │       ├── layout.tsx         ← layout dengan bottom nav nanny
    │   │       ├── page.tsx           ← S15 Dashboard Nanny
    │   │       ├── profile/
    │   │       │   └── page.tsx       ← edit profil & CV nanny
    │   │       ├── survey/
    │   │       │   └── page.tsx       ← form survey dari sisi nanny
    │   │       ├── assessment/
    │   │       │   └── page.tsx       ← S21 Psikotes Layer 2
    │   │       ├── referral/
    │   │       │   └── page.tsx       ← S21 Referral sistem
    │   │       └── settings/
    │   │           └── page.tsx       ← S24 Settings Nanny
    │   │
    │   └── api/                       ← API Routes (server-only, jalan di Vercel serverless)
    │       ├── auth/
    │       │   └── [...nextauth]/
    │       │       └── route.ts       ← NextAuth v5 handler
    │       ├── user/
    │       │   └── profile/
    │       │       └── route.ts       ← GET/PATCH profil user aktif
    │       ├── parent/
    │       │   └── children/
    │       │       └── route.ts       ← CRUD profil anak
    │       ├── nanny/
    │       │   └── profile/
    │       │       └── route.ts       ← GET/PATCH profil nanny
    │       ├── matching/
    │       │   ├── start/
    │       │   │   └── route.ts       ← POST buat MatchingRequest baru
    │       │   ├── survey/
    │       │   │   └── route.ts       ← POST simpan SurveyResponse
    │       │   └── result/
    │       │       └── route.ts       ← POST trigger AI scoring → Claude API
    │       ├── evaluation/
    │       │   └── route.ts           ← GET/POST evaluasi
    │       ├── payment/
    │       │   ├── midtrans/
    │       │   │   └── route.ts       ← POST buat transaksi Midtrans Snap
    │       │   └── webhook/
    │       │       └── route.ts       ← POST webhook notifikasi Midtrans
    │       ├── notifications/
    │       │   └── route.ts           ← GET & PATCH mark-read
    │       └── email/
    │           └── route.ts           ← POST kirim email via Resend
    │
    ├── components/
    │   ├── ui/                        ← shadcn/ui (jangan edit manual)
    │   ├── layout/
    │   │   ├── Navbar.tsx
    │   │   ├── BottomNav.tsx          ← bottom nav mobile
    │   │   ├── ParentLayout.tsx
    │   │   └── NannyLayout.tsx
    │   ├── matching/
    │   │   ├── SurveyForm.tsx
    │   │   ├── SurveyQuestion.tsx
    │   │   ├── MatchingResultCard.tsx
    │   │   ├── DomainScoreBar.tsx
    │   │   ├── DealbreakerAlert.tsx
    │   │   └── NegotiationTips.tsx
    │   ├── profile/
    │   │   ├── ChildProfileForm.tsx
    │   │   ├── NannyProfileForm.tsx
    │   │   ├── NannyCard.tsx
    │   │   └── AgeGroupBadge.tsx
    │   ├── payment/
    │   │   ├── SubscriptionBanner.tsx
    │   │   ├── MidtransButton.tsx
    │   │   └── PricingCard.tsx
    │   ├── evaluation/
    │   │   ├── EvaluationForm.tsx
    │   │   ├── CheckinForm.tsx
    │   │   └── EvaluationSummary.tsx
    │   └── shared/
    │       ├── Logo.tsx
    │       ├── LoadingSpinner.tsx
    │       ├── EmptyState.tsx
    │       ├── ErrorBoundary.tsx
    │       ├── ToastProvider.tsx
    │       └── ConfirmDialog.tsx
    │
    ├── lib/
    │   ├── prisma.ts                  ← Prisma singleton (WAJIB pakai ini)
    │   ├── auth.ts                    ← NextAuth v5 config lengkap
    │   ├── claude.ts                  ← Anthropic SDK + matching prompt
    │   ├── midtrans.ts                ← Midtrans Snap client
    │   ├── resend.ts                  ← Resend email client
    │   ├── pdf.ts                     ← HTTP client ke apps/pdf-service di Railway
    │   └── utils/
    │       ├── matching-score.ts
    │       ├── date.ts
    │       └── format-currency.ts
    │
    ├── types/
    │   ├── next-auth.d.ts             ← extend Session: id + role
    │   └── index.ts                   ← shared TypeScript types
    │
    ├── hooks/
    │   ├── useSession.ts
    │   ├── useProfile.ts
    │   ├── useMatching.ts
    │   └── useNotifications.ts
    │
    └── constants/
        ├── survey-questions.ts        ← 53 pertanyaan Layer 1
        ├── matching-weights.ts        ← bobot domain A/B/C (configurable)
        └── routes.ts                  ← semua URL path dalam satu file
```

---

## Deploy Settings

### Vercel (apps/web)
```
Root Directory:  apps/web
Framework:       Next.js
Build Command:   npm run build
Output Dir:      .next
```

### Railway (apps/pdf-service)
```
Root Directory:  apps/pdf-service
Start Command:   uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

## Naming Convention

| Tipe | Convention | Contoh |
|---|---|---|
| Komponen React | PascalCase | `NannyCard.tsx` |
| Hooks | camelCase dengan `use` | `useProfile.ts` |
| Utilities | kebab-case | `matching-score.ts` |
| Constants | kebab-case | `survey-questions.ts` |
| API routes | `route.ts` | `route.ts` |
| Types | PascalCase | `NannyProfile`, `MatchingResult` |
| Enums | SCREAMING_SNAKE_CASE | `UserRole.PARENT` |

---

## File yang TIDAK BOLEH diedit tanpa diskusi eksplisit

- `apps/web/prisma/schema.prisma` — perubahan schema bisa break data production
- `apps/web/src/lib/auth.ts` — perubahan auth bisa lock out semua user
- `apps/web/middleware.ts` — perubahan route guard bisa expose protected routes
- `apps/web/src/components/ui/*` — shadcn/ui components, update via CLI saja
- `apps/pdf-service/services/nanny_profile.py` — template PDF yang sudah dikunci HCC
