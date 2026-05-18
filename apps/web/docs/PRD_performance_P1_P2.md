# PRD: Navigation Performance — P1 & P2

**Status**: Ready to implement  
**Date**: 2026-05-18  
**Scope**: `apps/web` (Next.js)

---

## Problem

Setiap navigasi antar halaman di dashboard memicu full server round-trip ke Neon database. Tidak ada caching sama sekali. 22 halaman dashboard semuanya memanggil Prisma langsung di Server Component, tanpa cache layer.

Efeknya: pindah tab terasa seperti loading halaman baru (500–1500ms per navigasi).

---

## Root Cause (dari investigasi)

| # | Masalah | File | Impact |
|---|---------|------|--------|
| 1a | Setiap halaman query Prisma fresh ke Neon | 22 page.tsx | 🔴 Tinggi |
| 1b | Prisma pakai `pg.Pool` tapi belum tentu via Neon PgBouncer | `lib/prisma.ts` | 🔴 Tinggi |
| 2 | `auth()` dipanggil 2–3× per request (middleware + layout + page) | layouts + pages | 🟡 Medium |

---

## P1a — Prisma Query Caching via `unstable_cache`

### Strategi

Buat layer query cached di `src/lib/queries/` yang membungkus Prisma dengan `unstable_cache` dari Next.js. Setiap fungsi di-tag per user, sehingga bisa diinvalidasi saat mutasi terjadi.

### File baru: `src/lib/queries/`

```
src/lib/queries/
├── parent.ts      ← cached queries untuk Parent dashboard
└── nanny.ts       ← cached queries untuk Nanny dashboard
```

### Fungsi yang di-cache

**`src/lib/queries/parent.ts`**
| Fungsi | Dipakai di | TTL | Cache Tag |
|--------|-----------|-----|-----------|
| `getParentProfile(userId)` | parent/page, matching/page, cari-nanny/page | 60s | `parent-{userId}` |
| `getParentSubscription(userId)` | subscription/page | 30s | `parent-{userId}` |
| `getParentChildren(userId)` | children/page | 60s | `parent-{userId}` |
| `getParentReferral(userId)` | referral/page | 60s | `parent-{userId}` |
| `getParentSettings(userId)` | settings/page | 60s | `parent-{userId}` |
| `getMatchingRequest(requestId)` | matching/[id]/page | 30s | `matching-{requestId}` |
| `getNannyDetail(nannyId)` | nanny/[nannyId]/page | 120s | `nanny-{nannyId}` |
| `getTalentPool(userId, city)` | cari-nanny/direktori/page | 120s | `talent-pool` |
| `getMonitoringSummary(userId, timing)` | monitoring/summary/page | 30s | `parent-{userId}` |

**`src/lib/queries/nanny.ts`**
| Fungsi | Dipakai di | TTL | Cache Tag |
|--------|-----------|-----|-----------|
| `getNannyProfile(userId)` | nanny/page, profile/page, referral/page | 60s | `nanny-{userId}` |
| `getNannyMedia(nannyId)` | media/page | 60s | `nanny-{userId}` |
| `getNannyChildren(assignmentId)` | children/page | 60s | `nanny-{userId}` |
| `getNannyMonitoring(assignmentId, timing)` | monitoring/page | 30s | `nanny-{userId}` |
| `getNannyNotifications(userId)` | notifications/page | 30s | `nanny-{userId}` |

### Tidak di-cache (data real-time / form submission)
- `matching/survey/page.tsx` — form wizard, butuh fresh state
- `admin/matching-overview/page.tsx` — admin view, selalu fresh

### Cache Invalidation

Setiap API route yang melakukan mutasi wajib memanggil `revalidateTag`:

```
Mutasi                  → Invalidate
─────────────────────────────────────────
POST /api/profile/*     → revalidateTag(`parent-{userId}`)
POST /api/profile/*     → revalidateTag(`nanny-{userId}`)
POST /api/matching/*    → revalidateTag(`parent-{userId}`)
POST /api/monitoring/*  → revalidateTag(`parent-{userId}`)
                        → revalidateTag(`nanny-{userId}`)
POST /api/payment/*     → revalidateTag(`parent-{userId}`)
POST /api/media/*       → revalidateTag(`nanny-{userId}`)
```

---

## P1b — Verifikasi Neon PgBouncer URL

### Background

`src/lib/prisma.ts` sudah menggunakan `pg.Pool` + `PrismaPg` adapter (bukan default Prisma TCP connection). Ini sudah lebih baik dari default.

Namun: jika `DATABASE_URL` masih pakai direct URL Neon (bukan pooled URL), setiap cold start Vercel function akan membangun koneksi baru ke Neon yang butuh 200–400ms.

### Perubahan

`src/lib/prisma.ts` perlu dikonfigurasi untuk menggunakan `DATABASE_URL` (pooled via PgBouncer) dan `DIRECT_URL` (direct) secara terpisah sesuai konteks:

- **Query/runtime** → `DATABASE_URL` (pooled, untuk Vercel serverless)
- **Migration/push** → `DIRECT_URL` (direct, tanpa PgBouncer)

Tambahkan `max: 1` pada `pg.Pool` karena serverless function hanya butuh 1 koneksi per invocation — pool lebih besar justru membuang-buang koneksi Neon.

---

## P2 — Dedulikasi `auth()` via `React.cache()`

### Background

Setiap request saat ini memanggil `auth()` minimal 2×:
1. `middleware.ts` (edge, JWT decode)
2. `layout.tsx` (`await auth()`)
3. `page.tsx` (`await auth()`)

Dengan JWT strategy, `auth()` hanya decode token (tidak hit DB). Tapi tetap redundant dan bisa jadi source of confusion.

### Solusi

Buat `src/lib/auth-server.ts` yang meng-export `cachedAuth`:

```typescript
import { cache } from "react"
import { auth } from "@/lib/auth"

export const cachedAuth = cache(auth)
```

`React.cache()` men-deduplicate semua panggilan `cachedAuth()` dalam satu request render tree menjadi satu eksekusi saja.

### File yang diubah

Ganti semua `import { auth } from "@/lib/auth"` → `import { cachedAuth } from "@/lib/auth-server"` di:
- `src/app/dashboard/parent/layout.tsx`
- `src/app/dashboard/nanny/layout.tsx`
- Semua 22 `page.tsx` yang memanggil `auth()`

**Catatan**: `middleware.ts` tetap import dari `next-auth` langsung karena berjalan di Edge runtime.

---

## Urutan Implementasi

1. `src/lib/auth-server.ts` — buat file baru (P2)
2. `src/lib/queries/parent.ts` — cached query functions (P1a)
3. `src/lib/queries/nanny.ts` — cached query functions (P1a)
4. Update layouts → pakai `cachedAuth` (P2)
5. Update semua 22 page.tsx → pakai `cachedAuth` + cached queries (P1a + P2)
6. Update API mutation routes → tambah `revalidateTag` (P1a)
7. Update `src/lib/prisma.ts` → `max: 1` pada Pool (P1b)

---

## Success Metric

- Navigasi antar tab setelah load pertama: **< 200ms** (saat ini ~800–1500ms)
- Load pertama (cold cache): tidak berubah
- Zero regression pada fitur mutasi (profile update, monitoring submit, dll)
