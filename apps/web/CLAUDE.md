# CLAUDE.md — BundaYakin Platform
> Instruksi wajib untuk Claude Code. Baca seluruh file ini sebelum menulis satu baris kode pun.
> File ini ada di `apps/web/CLAUDE.md` — berlaku untuk Next.js app saja.
> Untuk PDF service: lihat `apps/pdf-service/CLAUDE.md`

---

## 1. Konteks Produk

**BundaYakin** adalah platform kecocokan dan pemantauan nanny berbasis psikologi, dibangun oleh **Human Care Consulting (HCC)**. Bukan job board biasa — platform ini menggunakan AI scoring + psikotes + review psikolog untuk mencocokkan nanny dengan keluarga.

- **Target user**: Orang tua (SES B/B+, anak 0–7 tahun) & Nanny
- **Tagline**: Online Nanny Assessment
- **Sub-brand**: "Karena Si Kecil Layak Dapat yang Terbaik"
- **Domain**: bundayakin.com
- **Repo structure**: Monorepo — `apps/web` (Next.js → Vercel) + `apps/pdf-service` (Python → Railway)
- **Dokumen lengkap**: lihat `docs/PRODUCT.md`

---

## 2. Tech Stack — Tidak Boleh Diganti Tanpa Diskusi

| Layer | Teknologi | Versi |
|---|---|---|
| Framework | Next.js App Router | 14 |
| Database | Neon (PostgreSQL serverless) | - |
| ORM | Prisma | latest |
| Auth | NextAuth v5 (Auth.js beta) | beta |
| Styling | Tailwind CSS + shadcn/ui | - |
| Payment | **Mayar** (menggantikan Midtrans) | - |
| Email | Resend | - |
| AI | Anthropic Claude API (claude-sonnet-4-20250514) | - |
| Media Foto | **Cloudflare R2** (bucket: bundayakin-media) | - |
| Media Video | **Cloudflare Stream** (max 3 menit/video) | - |
| Deploy Next.js | Vercel | apps/web |
| Deploy PDF Service | Railway (Python) | apps/pdf-service |

**Jangan suggest alternatif** kecuali ada bug blocker. Stack ini sudah final.

> **Catatan arsitektur**: Next.js App Router sudah full-stack. `src/app/api/` adalah backend — jalan di server via Vercel serverless functions. Railway **hanya** untuk Python PDF service (ReportLab). Tidak ada Express/Node server terpisah.

> **Keputusan produk aktif (17 Mei 2026)**:
> - Terminologi user-facing: **"Tes Kecocokan"** (bukan "Survey Matching")
> - **KTP tidak diminta** dari nanny — hapus dari semua form dan schema
> - Payment gateway: **Mayar** — hapus semua referensi Midtrans
> - Model unlock kontak: **Kuota Koneksi** (3 gratis/30 hari referral + 7 langganan), bukan pay-per-unlock
> - Score threshold: ≥80% teal · 60–79% orange · <60% red
> - Foto upload: Cloudflare R2 via `src/lib/cloudflare.ts`
> - Video upload: Cloudflare Stream via `src/lib/cloudflare.ts`

> **Keputusan produk aktif (5 Juli 2026)** — lihat [ADR-007](../../docs/opds/08_adr/ADR-007_langganan-dua-pilar.md) & [ADR-008](../../docs/opds/08_adr/ADR-008_pricing-config-panel.md) untuk detail lengkap:
> - **Langganan dua pilar**: nanny (sudah ada) + **Tumbuh Kembang** (kurva WHO, jurnal momen — Tahap 1 selesai dikoding)
> - **Harga & kuota TIDAK boleh lagi di-hardcode** — semua titik charge/kuota wajib baca dari `src/lib/pricing-config.ts` (`getEffectiveValue`/`getEffectivePricing`), bukan konstanta. `src/constants/pricing.ts` sudah dihapus.
> - Perubahan harga/kuota **effective-dated, tidak retroaktif** — transaksi & periode `ConnectionQuota` yang sudah dibuat tidak pernah berubah; hanya transaksi/periode BARU yang kena nilai baru. Jangan bangun logika "grandfather per user" — pola snapshot yang ada sudah cukup.
> - **Placement fee = satu tarif flat Rp 1,2jt**, tidak dibedakan jangka panjang/infal (koreksi dari dokumen lama yang salah menyebut Rp 600rb untuk infal — itu tidak pernah benar-benar di-charge)
> - **Jaminan Kecocokan**: nanny berhenti ≤30 hari pertama → matching ulang + penempatan ulang gratis penuh, 1× per penempatan
> - **Connection Add-on** (beli koneksi tambahan setelah kuota habis): checkout otomatis via Mayar — **tidak ada lagi jalur CS manual**
> - Konsultasi Psikolog Anak (Tahap 2, belum dibangun): harga berjenjang Junior Rp 500rb / Mid Rp 1jt (peluncuran) / Senior Rp 2jt; harga pelanggan Rp 750rb
> - Role `ADMIN` sekarang juga berarti akses **Pricing Config Panel** (`/dashboard/admin/pricing-config`) — jangan pakai mekanisme `canSwitchRoles` untuk hal ini, itu backdoor testing terpisah

---

## 3. Struktur Folder — Wajib Diikuti

### 3.1 Monorepo Root
```
bundayakin/                    ← GitHub repo root
├── apps/
│   ├── web/                   ← Next.js → Vercel  (file ini ada di sini)
│   └── pdf-service/           ← Python → Railway
├── .gitignore                 ← root gitignore
└── README.md
```

### 3.2 apps/web/ — Next.js App (kamu sekarang di sini)
```
apps/web/
├── CLAUDE.md                  ← file ini
├── prisma/
│   └── schema.prisma          ← jangan ubah tanpa instruksi eksplisit
├── docs/
│   ├── PRODUCT.md
│   ├── DESIGN_SYSTEM.md
│   ├── FOLDER_STRUCTURE.md
│   └── API.md
├── src/
│   ├── app/                   ← Next.js App Router (semua halaman)
│   │   ├── api/               ← API routes (backend — jalan di Vercel serverless)
│   │   ├── auth/              ← login, register
│   │   ├── dashboard/
│   │   │   ├── parent/        ← hanya role PARENT
│   │   │   └── nanny/         ← hanya role NANNY
│   │   └── onboarding/
│   ├── components/
│   │   ├── ui/                ← shadcn/ui (jangan edit manual)
│   │   ├── layout/            ← Navbar, BottomNav, Sidebar
│   │   ├── matching/          ← SurveyForm, ResultCard, dll
│   │   ├── profile/           ← ChildProfileForm, NannyCard, dll
│   │   ├── payment/           ← tombol bayar Mayar, SubscriptionBanner
│   │   └── shared/            ← Logo, LoadingSpinner, EmptyState
│   ├── lib/
│   │   ├── prisma.ts          ← WAJIB singleton pattern
│   │   ├── auth.ts            ← NextAuth config
│   │   ├── claude.ts          ← Anthropic SDK
│   │   ├── mayar.ts           ← payment gateway Mayar
│   │   ├── cloudflare.ts      ← R2 (foto) + Stream (video)
│   │   └── resend.ts
│   ├── types/
│   │   └── next-auth.d.ts     ← extend Session dengan id & role
│   ├── hooks/
│   ├── constants/
│   │   ├── survey-questions.ts
│   │   ├── matching-weights.ts ← bobot domain A/B/C — configurable
│   │   └── routes.ts
│   └── middleware.ts          ← route guard per role
├── .env                       ← JANGAN commit
├── .env.example               ← commit ini (tanpa nilai)
├── package.json
└── next.config.js

### 3.3 apps/pdf-service/ — Python PDF Generator
```
apps/pdf-service/
├── CLAUDE.md                  ← instruksi khusus untuk service ini
├── main.py                    ← FastAPI entry point
├── requirements.txt
├── Dockerfile                 ← Railway butuh ini
├── .env                       ← JANGAN commit
├── .env.example
└── services/
    └── nanny_profile.py       ← ReportLab generator (dari TEMPLATE_NannyCareProfile.py)
```

**Cara komunikasi web → pdf-service:**
Next.js memanggil PDF service via HTTP POST ke Railway URL.
```typescript
// src/lib/pdf.ts
const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL // Railway URL
await fetch(`${PDF_SERVICE_URL}/generate-report`, {
  method: "POST",
  headers: { "x-api-key": process.env.PDF_SERVICE_SECRET },
  body: JSON.stringify(reportData)
})
```

---

## 4. Aturan Coding

### 4.1 TypeScript
- **Selalu TypeScript** — tidak ada file `.js` di `src/`
- Definisikan type/interface untuk semua props komponen
- Gunakan `type` bukan `interface` untuk union types
- Hindari `any` — gunakan `unknown` lalu narrow

### 4.2 Prisma
- **Selalu gunakan singleton** dari `src/lib/prisma.ts`
- Jangan `new PrismaClient()` di luar file tersebut
- Setiap query Prisma di API route wajib dibungkus `try/catch`
- Gunakan `select` untuk membatasi field yang dikembalikan (jangan return password/hashedPassword ke client)

### 4.3 API Routes
- Semua API route di `src/app/api/`
- Selalu validasi session dengan `auth()` di setiap protected route
- Format response selalu: `{ success: boolean, data?: any, error?: string }`
- Gunakan Next.js `NextResponse.json()` — bukan `Response.json()`

### 4.4 Auth & Role Guard
- Role check via `session.user.role` — nilai: `"PARENT"` atau `"NANNY"` atau `"ADMIN"`
- Middleware di `middleware.ts` handle redirect otomatis
- Jangan taruh role check di komponen — taruh di API route atau middleware

### 4.5 Komponen
- Server Component by default — tambah `"use client"` hanya saat perlu interaktivitas
- Pisahkan data fetching (Server) dari UI interaktif (Client)
- Gunakan shadcn/ui untuk komponen dasar — jangan buat dari nol jika sudah ada

---

## 5. Design System — Wajib Diikuti

Dokumen lengkap: `docs/DESIGN_SYSTEM.md`

### Warna Utama
```css
--green:        #5BBFB0   /* primary button, progress bar */
--green-dark:   #2C5F5A   /* hover state */
--purple:       #A97CC4   /* brand secondary */
--purple-dark:  #5A3A7A   /* heading, sidebar */
--purple-light: #F3EEF8   /* page background */
--ink:          #5A3A7A   /* teks heading */
--ink2:         #666666   /* teks body */
--border:       #E0D0F0   /* border default */
```

### Font
- **DM Serif Display** — hero, verdict, laporan, sapaan "Bunda"
- **Plus Jakarta Sans** — semua UI text, body, button, label

### Larangan Mutlak (HARD RULES)
- ❌ **Warna kuning dilarang keras** — background, teks, border, ikon, dalam kondisi apapun
- ❌ Istilah psikologi di konten yang dibaca orang tua (PAPI, raw score, dimensi, dll)
- ❌ Pesan psikolog tidak boleh diubah atau diparafrase oleh sistem
- ❌ Font size < 16px untuk teks yang dibaca nanny di mobile
- ❌ Touch target < 48px untuk elemen interaktif mobile

---

## 6. Bisnis Logic — Wajib Dipahami

### 6.1 User Roles
- **PARENT**: bayar Rp 500rb/tahun, akses matching + monitoring + evaluasi
- **NANNY**: gratis selamanya, isi profil + survey + terima hasil matching
- **ADMIN**: internal HCC, akses dashboard admin

### 6.2 Sistem Matching — 3 Layer
| Layer | Nama | Harga | Output |
|---|---|---|---|
| 1 | Survey Kecocokan | Gratis (dalam langganan) | % kecocokan, area match/mismatch |
| 2 | + Psikotes AI | +Rp 300.000 | Detail per aspek, gap analysis |
| 3 | + Psikolog HCC | +Rp 1.200.000–1.500.000 | Catatan psikolog, rekomendasi |

### 6.3 Domain Matching
- **Domain A** (Kondisi Kerja): A1 Gaji & fasilitas · A2 Lingkup tugas
- **Domain B** (Nilai & Gaya Hidup): B1 Agama · B2 Penampilan · B3 Gaya pengasuhan
- **Domain C** (Pengalaman & Kemampuan): C1 Rekam jejak · C2 Kemampuan praktis · C3 Komunikasi · C4 Lingkungan
- Bobot domain ada di `src/constants/matching-weights.ts` — configurable, jangan hardcode

### 6.4 Dealbreaker
- Setiap pertanyaan survey bisa dicentang sebagai dealbreaker
- Jika dealbreaker tidak match → notifikasi negosiasi, BUKAN penolakan otomatis
- Framing selalu: "perlu dibicarakan", bukan "tidak cocok"

### 6.5 Evaluasi Otomatis
- Week 1 & 2: check-in singkat (5 pertanyaan)
- Bulan 1 & 3: evaluasi penuh (10 pertanyaan)
- Setiap 3 bulan sesudahnya: evaluasi berkala

### 6.6 Payment — Mayar
- Semua pembayaran via **Mayar** (bukan Midtrans)
- Subscription: Rp 500.000/tahun
- Add-on koneksi: Rp 100.000/nanny setelah kuota habis
- Webhook Mayar: `/api/payment/webhook` — update status transaksi & subscription
- Jangan gunakan Midtrans — semua referensinya sudah dihapus

### 6.7 Kuota Koneksi
- Pengguna tanpa langganan: **3 koneksi/30 hari** (Flow A referral saja)
- Langganan Rp 500rb/tahun: **10 koneksi/bulan** (3 referral + 7 talent pool)
- Setelah kuota habis: Rp 100.000/koneksi tambahan via Mayar
- Kuota renew tiap 30 hari dari tanggal aktivasi (bukan awal bulan kalender)
- Logika kuota di `src/lib/queries/parent.ts` · harga di `src/constants/pricing.ts` (tidak ada file `quota.ts`)

### 6.8 Media Upload
- **Foto** (avatar, portfolio): upload ke Cloudflare R2 via `src/lib/cloudflare.ts`
  - Folder struktur: `users/{userId}/avatar/` dan `users/{userId}/portfolio/photos/`
  - Public URL via `media.bundayakin.com`
- **Video** (intro, keahlian): upload ke Cloudflare Stream via `src/lib/cloudflare.ts`
  - Max durasi: 180 detik (3 menit) — enforce di upload endpoint
  - Metadata wajib: `userId`, `nannyId`, `type` (INTRO/SKILL)
  - Disimpan di tabel `NannyMedia` di database

---

## 7. Cara Bekerja dengan Claude Code

### Ketika membuat file baru:
1. Cek `docs/FOLDER_STRUCTURE.md` dulu — pastikan file masuk ke folder yang benar
2. Ikuti naming convention yang sudah ada
3. Selalu tambah TypeScript types
4. Tambah komentar singkat di atas fungsi kompleks

### Ketika memodifikasi schema Prisma:
1. Diskusikan dulu — schema perubahan bisa break data yang ada
2. Setelah approve: `npx prisma db push` (dev) atau `npx prisma migrate dev` (prod)
3. Selalu `npx prisma generate` setelah push

### Ketika membuat API route:
```typescript
// Template wajib untuk protected API route
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    // logic...
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("[API_NAME]", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
```

### Ketika memanggil Claude API untuk matching:
- Model: `claude-sonnet-4-20250514`
- Selalu set `max_tokens: 2000`
- Prompt ada di `src/lib/claude.ts` — jangan inline di komponen
- Output harus JSON yang bisa diparsing — instruksikan di system prompt

---

## 8. Environment Variables

> File `.env` ada di `apps/web/.env` — jangan commit, sudah ada di `.gitignore`

```env
# Database
DATABASE_URL=              # Neon pooled connection
DIRECT_URL=                # Neon direct connection (untuk Prisma push)

# Auth
NEXTAUTH_URL=              # http://localhost:3000 (dev) / https://bundayakin.com (prod)
NEXTAUTH_SECRET=           # random 32-char string

# AI
ANTHROPIC_API_KEY=         # dari console.anthropic.com

# Payment — Mayar (bukan Midtrans)
MAYAR_API_KEY=             # dari dashboard Mayar
MAYAR_WEBHOOK_SECRET=      # dari dashboard Mayar (untuk verifikasi webhook)
NEXT_PUBLIC_MAYAR_PUBLIC_KEY=  # public key untuk client-side Mayar

# Email
RESEND_API_KEY=            # dari resend.com

# PDF Service (Railway)
PDF_SERVICE_URL=           # https://xxx.railway.app (isi setelah deploy Railway)
PDF_SERVICE_SECRET=        # shared secret untuk auth antar service

# Cloudflare R2 (foto: avatar, portfolio)
CLOUDFLARE_ACCOUNT_ID=     # dari Cloudflare dashboard
R2_ACCESS_KEY_ID=          # dari Manage R2 API Tokens
R2_SECRET_ACCESS_KEY=      # dari Manage R2 API Tokens
R2_TOKEN=                  # Cloudflare API Token (cadangan)
R2_BUCKET_NAME=bundayakin-media
R2_ENDPOINT=               # https://{account-id}.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://media.bundayakin.com

# Cloudflare Stream (video: intro, keahlian nanny)
CLOUDFLARE_STREAM_TOKEN=   # API Token dengan permission Account.Stream

# App
NEXT_PUBLIC_APP_URL=       # https://bundayakin.com
```

**Aturan env:**
- Prefix `NEXT_PUBLIC_` hanya untuk variabel yang aman dibaca di browser
- Jangan pernah expose `ANTHROPIC_API_KEY`, `MAYAR_API_KEY`, atau `DATABASE_URL` ke client
- `PDF_SERVICE_SECRET` dipakai sebagai `x-api-key` header saat Next.js memanggil Railway
- File `.env` ada di `.gitignore` — jangan pernah commit

---

## 9. Commands Penting

> Semua command dijalankan dari dalam `apps/web/` kecuali disebutkan lain.

```bash
# Pastikan kamu di folder yang benar
cd apps/web

# Development
npm run dev                    # start dev server localhost:3000

# Database
npx prisma db push             # sync schema ke NeonDB (dev)
npx prisma migrate dev         # buat migration file (prod-ready)
npx prisma generate            # regenerate Prisma client
npx prisma studio              # UI visual database localhost:5555

# Build
npm run build                  # production build
npm run lint                   # cek ESLint errors

# shadcn/ui (tambah komponen baru)
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
```

### Deploy
```bash
# Vercel — otomatis dari GitHub push ke main
# Setting di Vercel dashboard:
#   Root Directory: apps/web
#   Framework: Next.js

# Railway — otomatis dari GitHub push ke main
# Setting di Railway dashboard:
#   Root Directory: apps/pdf-service
#   Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

## 9b. Aturan Git — WAJIB

- **JANGAN PERNAH menulis Claude sebagai kontributor** di commit atau PR: tanpa `Co-Authored-By: Claude ...`, tanpa "Generated with Claude Code", tanpa atribusi AI dalam bentuk apa pun (keputusan pemilik produk, Juli 2026).
- Format commit message: conventional commit berbahasa Indonesia, konsisten dengan riwayat repo — contoh: `feat(matching): tambah jaminan kecocokan`, `fix(webhook): ...`
- Commit/push hanya saat diminta.

## 10. Status MVP saat ini

> **Sumber kebenaran status fitur: [`docs/opds/05_feature_registry.md`](../../docs/opds/05_feature_registry.md)** — jangan update checklist di sini, update Feature Registry.

Ringkasan per Juli 2026 (commit terakhir 22 Mei 2026):

### apps/web (Next.js) — MVP Fasa 1 sudah berjalan
- [x] Schema Prisma — 25+ model (v1.1: tanpa KTP, ConnectionQuota, Mayar, NannyMedia)
- [x] Auth lengkap — NextAuth v5, register/login, OTP WA reset password, auto-login pasca registrasi
- [x] Middleware route guard per role (PARENT / NANNY / ADMIN)
- [x] Dashboard parent & nanny lengkap (profil, anak multi-anak, monitoring, referral, settings)
- [x] Matching Engine Layer 1 — 53 soal, survey paralel, dealbreaker, AI scoring Claude API
- [x] Direktori nanny internal + Kuota Koneksi (cache `MatchResult`)
- [x] Payment Mayar production (subscription, placement fee, webhook)
- [x] Media nanny — foto R2, video Cloudflare Stream (max 3 menit)
- [x] PDF laporan matching via pdf-service
- [x] Deploy Vercel + domain bundayakin.com
- [ ] Layer 2 (psikotes AI) — schema ready, UI belum
- [ ] Layer 3 (psikolog) — schema ready, SOP operasional belum
- [ ] Notifikasi in-app parent, UI track record, payment add-on (lihat Feature Registry: ~17 item Planned)

### apps/pdf-service (Python — Railway)
- [x] FastAPI + ReportLab, endpoint generate report, Dockerfile, deploy Railway