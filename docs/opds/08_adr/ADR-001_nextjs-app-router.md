# ADR-001 — Next.js 14 App Router sebagai Framework Web

**Status:** Accepted  
**Tanggal:** Mei 2026  
**Decider:** Developer (konsultasi Apin)

---

## Konteks

BundaYakin membutuhkan framework web yang:
- Mendukung server-side rendering untuk SEO dan keamanan data sensitif
- Punya ekosistem komponen React yang matang
- Bisa di-deploy ke platform managed (tidak perlu setup server)
- Cocok untuk tim kecil dengan AI-assisted development
- Mendukung API routes (tidak butuh backend terpisah untuk sebagian besar operasi)

Platform adalah **web-first** untuk Fasa 1 (tidak ada native mobile app).

---

## Opsi yang Dipertimbangkan

1. **Next.js 14 App Router** — React + SSR + API routes dalam satu framework
2. **Next.js 13 Pages Router** — generasi sebelumnya, lebih mature
3. **Remix** — full-stack framework berbasis web standards
4. **SvelteKit** — lebih ringan, ekosistem lebih kecil
5. **Nuxt.js (Vue)** — ekosistem berbeda, kurang cocok dengan tim yang familier React

---

## Keputusan

**Dipilih: Next.js 14 App Router**

Alasan utama:
- **Server Components by default** — data sensitif (profil psikologis, evaluasi) tidak perlu di-expose ke client
- **API Routes** — bisa build endpoint API dalam satu codebase, tidak perlu Express terpisah
- **Vercel integration** — deploy mudah, preview per branch gratis
- **TypeScript support penuh** — type safety dari UI ke API ke database (via Prisma)
- **Familiaritas** — developer dan ekosistem AI coding tools (Claude Code) sangat familiar dengan React/Next.js

---

## Konsekuensi

**Positif:**
- Codebase lebih sederhana (UI + API dalam satu repo)
- Server Components → bundle JS lebih kecil, performa lebih baik
- Vercel hosting → auto-scaling, CDN, preview URLs gratis
- Middleware bisa proteksi route tanpa setup terpisah

**Negatif / Trade-off:**
- App Router masih relatif baru (Mei 2026) — beberapa library belum fully compatible
- Server Components punya learning curve — harus hati-hati batas server/client
- Tidak ada state management global yang obvious (harus pakai React Context, Zustand, atau server state)
- API routes di Vercel punya cold start (tapi minimal dengan Vercel Edge)

**Risiko yang perlu dimonitor:**
- Breaking changes di Next.js minor versions — pin versi di `package.json`
- Server/client boundary errors saat menambah komponen interaktif baru

---

## Catatan

- Semua halaman baru WAJIB default ke Server Component, tambah `"use client"` hanya jika membutuhkan interaktivitas atau browser API
- File `apps/web/CLAUDE.md` mendokumentasikan konvensi App Router untuk Claude Code
- Lihat [FOLDER_STRUCTURE.md](../../../apps/web/docs/FOLDER_STRUCTURE.md) untuk konvensi lokasi file
