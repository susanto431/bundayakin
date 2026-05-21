# Product Operating Model
## BundaYakin — Human Care Consulting

> Versi 1.0 · Mei 2026 · Dokumen Internal OPDS

Dokumen ini mendefinisikan **bagaimana BundaYakin dibangun dan dijalankan** — struktur tim, cara mengambil keputusan, siklus pengembangan, dan proses release.

---

## 1. Struktur Tim

BundaYakin beroperasi dengan tim kecil yang sangat lean, didukung oleh AI-assisted development.

| Peran | Orang | Tanggung Jawab |
|---|---|---|
| **Founder / Product Owner** | Apin (Psikolog, HCC) | Visi produk, keputusan bisnis, konten psikologi, validasi UX, hubungan klien |
| **AI-Assisted Developer** | (satu orang) | Implementation, architecture, AI integration, deployment |
| **Admin BundaYakin** | TBD | Operasional harian, onboarding nanny, verifikasi, eskalasi |
| **Psikolog HCC** | Tim HCC | Review Layer 3 (NannyCare Profile™), bukan operasional platform |

**Prinsip operasi:**
- Keputusan produk = Apin
- Keputusan teknis = Developer (dengan konsultasi Apin untuk implikasi bisnis)
- Eskalasi sengketa = Admin BundaYakin (bukan HCC)
- Tidak ada komite — keputusan cepat, satu orang per domain

---

## 2. Prinsip Pengembangan

### AI-First Development
Platform ini dibangun dengan **AI-assisted development** sebagai metode utama — bukan sebagai pelengkap. Semua implementasi menggunakan Claude Code.

Implikasinya:
- Kode harus self-documenting dan mudah dibaca AI
- CLAUDE.md di tiap app wajib diperbarui saat ada konvensi baru
- Semua keputusan teknis yang tidak obvious wajib dicatat sebagai ADR

### Server Components by Default
Next.js 14 App Router — semua komponen adalah Server Component kecuali ada alasan eksplisit untuk `"use client"`. Ini menjaga bundle size kecil dan memudahkan data fetching.

### Schema as Contract
Prisma Schema (`apps/web/prisma/schema.prisma`) adalah **satu-satunya source of truth** untuk model data. Perubahan schema harus disertai migrasi — tidak ada perubahan data model di luar Prisma.

### Incremental Delivery
Tidak ada "big bang release". Semua fitur dikerjakan secara incremental — tiap perubahan bisa di-deploy ke Vercel preview branch sebelum masuk production.

---

## 3. Siklus Development

### Flow Kerja Normal

```
1. Identifikasi kebutuhan / bug
        │
        ▼
2. Klarifikasi dengan Apin (jika menyangkut UX atau bisnis)
        │
        ▼
3. Buat branch feature/fix dari main
        │
        ▼
4. Implementasi + test manual di Vercel preview
        │
        ▼
5. Review (self-review + opsional Apin)
        │
        ▼
6. Merge ke main → auto-deploy ke Vercel production
```

### Prioritisasi

Label prioritas yang digunakan (sesuai `FEATURES_BACKLOG.md`):

| Label | Arti | Action |
|---|---|---|
| 🔴 Blocker | Harus ada sebelum fitur lain bisa jalan | Kerjakan sekarang |
| 🟠 MVP | Scope MVP pertama | Kerjakan sprint ini |
| 🟡 Post-MVP | Penting tapi bisa menyusul | Planning sprint berikutnya |
| 🟢 Nice-to-have | Kapan saja tersedia | Backlog |

---

## 4. Branching Strategy

Menggunakan **trunk-based development** yang sederhana:

```
main ─────────────────────────────────── (production)
  │
  ├── feature/multi-child-profile
  ├── feature/placement-fee
  ├── fix/survey-save-bug
  └── (merge saat done)
```

- **main** = selalu production-ready
- Branch feature/fix dibuat dari main, merge kembali ke main
- Tidak ada develop/staging branch — Vercel preview per-branch sudah cukup
- Commit message: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`

---

## 5. Deployment Model

| App | Platform | Trigger Deploy | URL |
|---|---|---|---|
| `apps/web` (Next.js) | Vercel | Push ke `main` → auto-deploy production | bundayakin.com (production) |
| `apps/web` (preview) | Vercel | Push ke branch apapun → preview URL | \*.vercel.app |
| `apps/pdf-service` (Python) | Railway | Push ke `main` → auto-deploy | Internal URL (diakses Next.js) |

**Environment variables:**
- `.env` di tiap app (tidak di-commit)
- `.env.example` di-commit (tanpa nilai)
- Production env vars diatur di Vercel dashboard dan Railway dashboard

---

## 6. Decision-Making Framework

### Keputusan Produk (what to build)
**Owner: Apin**

Pertanyaan kunci:
- Apakah ini melindungi positioning "jamin kecocokan, bukan integritas"?
- Apakah ini sesuai dengan fasa bisnis yang sekarang (Fasa 1)?
- Apakah ini membantu orang tua atau nanny secara langsung?

### Keputusan Teknis (how to build)
**Owner: Developer**

Pertanyaan kunci:
- Apakah ini sesuai dengan stack yang ada?
- Apakah ini menambah kompleksitas yang tidak perlu?
- Apakah ada cara yang lebih simpel?
- Jika keputusan ini sulit dibalik nanti, catat sebagai ADR.

### Keputusan yang Butuh Diskusi Keduanya
- Perubahan pricing atau model monetisasi
- Penambahan integrasi eksternal baru
- Perubahan UX pada alur kritis (matching, payment, evaluasi)
- Perubahan data model yang affect user-visible behavior

---

## 7. Quality Standards

### Tidak Ada Test Otomatis (untuk saat ini)
Dengan tim sekecil ini dan kecepatan iterasi yang tinggi, automated test belum diterapkan. **Quality assurance dilakukan via:**
- Manual testing di Vercel preview sebelum merge
- Verifikasi alur kritis setelah setiap merge ke main
- Prisma type safety sebagai safety net untuk data layer

Ini akan berubah saat platform sudah punya user nyata.

### Alur Kritis yang Selalu Ditest Manual
1. Registrasi dan login (PARENT + NANNY)
2. Isi dan submit survey matching
3. Flow pembayaran via Mayar (sandbox)
4. Upload foto/video nanny
5. Submit dan lihat hasil evaluasi

---

## 8. Komunikasi & Dokumentasi

### Keputusan Produk
- Dicatat di `apps/web/docs/PRODUCT.md` atau `BundaYakin_MasterSummary_Mei2026.md`
- Jika menyangkut arsitektur teknis: ADR di `docs/opds/08_adr/`

### Backlog Fitur
- `apps/web/docs/FEATURES_BACKLOG.md` — sumber kebenaran untuk backlog
- Feature Registry OPDS ([05_feature_registry.md](05_feature_registry.md)) — status ringkas

### Bugs & Incidents
- Dilaporkan via komunikasi langsung (WA/chat)
- Hotfix langsung ke branch fix → merge ke main
- Tidak ada incident management formal saat ini (akan dibutuhkan post-launch)

---

## 9. Onboarding Engineer Baru

Urutan dokumen yang harus dibaca:

1. `apps/web/docs/PRODUCT.md` — konteks bisnis (15 menit)
2. `apps/web/docs/BundaYakin_MasterSummary_Mei2026.md` — keputusan final (10 menit)
3. [OPDS README](README.md) → [TDD](07_technical_design_document.md) — arsitektur teknis
4. `apps/web/CLAUDE.md` — instruksi Claude Code dan konvensi kode
5. `apps/web/docs/FOLDER_STRUCTURE.md` — struktur folder
6. `apps/web/prisma/schema.prisma` — model data (baca dengan hati-hati)
7. [ADR Index](08_adr/index.md) — keputusan arsitektur historis

Estimasi onboarding: 2–3 jam membaca, 1 hari implementasi fitur kecil pertama.

---

*Lihat juga: [Product Ecosystem Blueprint](01_product_ecosystem_blueprint.md) · [Feature Registry](05_feature_registry.md) · [ADR Index](08_adr/index.md)*
