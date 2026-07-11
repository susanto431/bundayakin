# Proof of Concept (POC)
## BundaYakin — Platform Kecocokan & Pemantauan Nanny

> Versi 1.1 · Diperbarui 10 Juli 2026 · Dokumen Internal OPDS
> Disusun dari audit kode aktual (commit terakhir 22 Mei 2026) — bukan dari rencana.
> Fungsi dokumen: bukti bahwa konsep inti **sudah terbukti berjalan end-to-end**, sebagai baseline pengembangan lanjutan.
> **Catatan pembaruan:** §1/§6 sudah direvisi mengikuti kode Juli 2026 (Layer 2 Psikotes AI, pilar Tumbuh Kembang Tahap 1–2); §2–§5 tetap potret arsitektur per commit 22 Mei 2026 kecuali disebutkan lain.

---

## 1. Hipotesis yang Dibuktikan

POC ini menjawab empat pertanyaan konsep yang menjadi taruhan produk:

| # | Hipotesis | Status | Bukti |
|---|---|---|---|
| H1 | Kecocokan nanny ↔ keluarga bisa diukur objektif lewat survey paralel + AI scoring | ✅ Terbukti | 53 soal · 3 domain · Claude API menghasilkan skor 0–100 + narasi terstruktur |
| H2 | Model bisnis langganan + Kuota Koneksi bisa dijalankan otomatis (tanpa admin manual) | ✅ Terbukti | Mayar production: invoice → webhook → aktivasi subscription & kuota otomatis |
| H3 | Nanny mau/bisa punya profil digital multimedia (foto, video, portfolio) | ✅ Terbukti secara teknis | Upload R2 + Cloudflare Stream jalan; adopsi user riil belum diukur |
| H4 | Pemantauan pasca-penempatan bisa dijadwalkan & diringkas AI | ✅ Terbukti | Check-in W1/W2 + Evaluasi M1/M3/kuartalan + `aiSummary` |

Yang **belum** dibuktikan (bukan kegagalan — belum dikerjakan): Layer 3 review psikolog operasional, konversi berbayar di pasar riil. **Layer 2 psikotes AI selesai dikoding 10 Juli 2026** (lihat §6) — dipindah dari daftar ini. Lihat §6.

---

## 2. Arsitektur yang Terbukti

```
┌──────────────────────────────────────────────────────────────┐
│  apps/web — Next.js 14 App Router (Vercel)                   │
│                                                              │
│  UI (React + Tailwind + shadcn/ui)                           │
│    └── src/app/dashboard/{parent,nanny,admin}                │
│  Backend (Vercel serverless)                                 │
│    └── src/app/api/* — 40+ endpoint                          │
│                                                              │
│  ├─► Neon PostgreSQL (Prisma, 25+ model)                     │
│  ├─► Claude API (scoring & narasi — src/lib/claude.ts)       │
│  ├─► Mayar (payment — src/lib/mayar.ts + webhook)            │
│  ├─► Cloudflare R2 (foto) + Stream (video ≤3 menit)          │
│  ├─► Resend (email transaksional)                            │
│  └─► apps/pdf-service — FastAPI + ReportLab (Railway)        │
│        POST /generate-report (auth: x-api-key)               │
└──────────────────────────────────────────────────────────────┘
```

Keputusan arsitektur tercatat di [ADR index](08_adr/index.md) (6 ADR: App Router, Neon+Prisma, Mayar, R2/Stream, Claude API, PDF Python).

---

## 3. Alur End-to-End yang Terbukti Berjalan

### 3.1 Tes Kecocokan (alur inti — H1)

```
Registrasi (auto-login) → onboarding → orang tua undang nanny (Flow A, kode)
  atau pilih dari direktori/Talent Pool (Flow B, pelanggan)
→ kedua pihak isi survey 53 soal secara independen (save & resume)
→ kedua flag survey done → Claude API scoring
→ MatchingResult: skor keseluruhan + per domain A/B/C, highlight, mismatch,
  poin negosiasi, tips dua arah
→ dealbreaker mismatch → framing "perlu dibicarakan" (bukan tolak otomatis)
→ periode eksklusif 7 hari (+3 hari 1×) → ACCEPTED / REJECTED / EXPIRED
→ laporan PDF via pdf-service
```

Kode kunci: `src/lib/claude.ts` (prompt & parsing), `src/constants/matching-weights.ts` (bobot configurable, dealbreaker penalty 0.3), `src/app/api/matching/*`.

### 3.2 Monetisasi (H2)

- Langganan Rp 500rb/tahun: halaman subscription → invoice Mayar → redirect checkout → webhook `api/payment/webhook` (lookup via `productId` + `lookupId`) → status ACTIVE + kuota talent pool terbuka.
- Placement fee Rp 1,2jt (satu tarif flat) via `api/payment/placement`; harga & kuota kini bisa diatur admin lewat Pricing Config Panel ([ADR-008](08_adr/ADR-008_pricing-config-panel.md)).
- Kuota Koneksi rolling 30 hari (3 referral gratis; +7 talent pool bila berlangganan) — logika di `src/lib/queries/parent.ts`.

### 3.3 Profil digital nanny (H3)

Profil dasar + skills/bahasa/agama, video perkenalan & keahlian (Cloudflare Stream, polling status processing), foto portfolio (R2), entri pengalaman kerja gaya LinkedIn, mode Open to Job, preview profil sendiri, dan tampilan untuk orang tua (`dashboard/parent/nanny/[nannyId]`).

### 3.4 Pemantauan (H4)

`NannyAssignment` (multi-anak via `AssignmentChild`) → Check-in minggu 1 & 2 → Evaluasi bulan 1, 3, kuartalan → ringkasan & rekomendasi AI → dashboard monitoring dua sisi.

---

## 4. Cara Menjalankan POC

```bash
# Web (dari root repo)
cd apps/web && npm install
cp .env.example .env   # isi kredensial: Neon, Anthropic, Mayar, Cloudflare, Resend
npx prisma generate && npx prisma db push
npm run dev            # localhost:3000

# PDF service
cd apps/pdf-service && pip install -r requirements.txt
uvicorn main:app --reload   # health check: GET /health
```

Seed data: `npx prisma db seed` (soal survey) · `prisma/seed-matches.ts` (contoh match).
Produksi: Vercel (root `apps/web`) + Railway (root `apps/pdf-service`), domain bundayakin.com.

---

## 5. Ukuran Sistem Saat Ini

| Dimensi | Nilai |
|---|---|
| Model Prisma | 25+ (schema v1.1) |
| Endpoint API | 40+ route serverless |
| Bank soal Layer 1 | 53 pertanyaan, 9 aspek, 3 domain |
| Fitur shipped | ±63 (lihat [Feature Registry](05_feature_registry.md)) |
| Halaman dashboard | Parent 12 area · Nanny 9 area · Admin 1 area |
| Model AI | claude-sonnet-4-20250514 (catatan upgrade di §6) |

---

## 6. Batas POC & Risiko untuk Pengembangan Lanjutan

Hal yang **belum terbukti** dan menjadi pekerjaan fase berikutnya:

1. **Layer 3 belum operasional** — Layer 2 (Psikotes AI, instrumen Capture Work Style) **selesai dikoding 10 Juli 2026** (nanny isi tes, orang tua bayar Rp300rb buka interpretasi bahasa awam per nanny — lihat [ADR-011](08_adr/ADR-011_capture-work-style-built-in.md)). Layer 3 (review psikolog, Nanny Care Profile™) SOP-nya sudah final tapi belum dikoding — lihat [18_spec_nanny_care_profile_layer3.md](18_spec_nanny_care_profile_layer3.md). Ini pembeda utama vs kompetitor, prioritas tinggi.
2. **Monetisasi belum teruji pasar** — semua pipa pembayaran jalan, tetapi target 100 pelanggan berbayar (PRD §7) belum tervalidasi dengan user riil.
3. **Loop reputasi belum tertutup** — Track Record & badge Terpercaya baru schema; tanpa UI input rekam jejak, janji "rekam jejak dua arah" belum terwujud.
4. **Notifikasi belum simetris** — nanny punya halaman notifikasi, parent belum (baru placeholder di settings).
5. **Tidak ada automated test** — perubahan matching engine berisiko regresi senyap; minimal butuh test untuk scoring & webhook payment.
6. **Model AI perlu evaluasi upgrade** — masih `claude-sonnet-4-20250514`; keluarga Claude terbaru (Sonnet 5 dst.) berpotensi memperbaiki kualitas narasi & konsistensi JSON dengan biaya setara. Perlu A/B kecil sebelum ganti.
7. **Scheduler evaluasi** — penjadwalan check-in/evaluasi bergantung request user (belum ada cron); evaluasi bisa terlewat bila user tidak membuka aplikasi.

Rekomendasi arah UI/UX untuk fase berikutnya: lihat [11_ui_ux_review.md](11_ui_ux_review.md).

**Arah pengembangan terbaru (Juli 2026):** langganan kini dua pilar — pilar kedua "Tumbuh Kembang" (kurva WHO, skrining KPSP, Konsultasi Psikolog Anak, Portal Psikolog, log harian nanny) sudah diputuskan di [ADR-007](08_adr/ADR-007_langganan-dua-pilar.md) dan dispesifikasikan di [PRD Tumbuh Kembang](13_prd_tumbuh_kembang.md). Positioning & USP resmi ada di [14_positioning.md](14_positioning.md), termasuk keputusan **Jaminan Kecocokan** (matching ulang gratis jika nanny berhenti ≤30 hari — lihat PRD §5).

**Update status per 10 Juli 2026 (sudah dibangun, di luar snapshot 22 Mei di atas):**
- Tumbuh Kembang Tahap 1 (Kurva Pertumbuhan, Jurnal Momen) & Tahap 2 (Skrining Perkembangan/KPSP, Konsultasi Psikolog Anak, Portal Psikolog) — selesai dikoding, menunggu deploy. Lihat [13_prd_tumbuh_kembang.md](13_prd_tumbuh_kembang.md) §7b, [ADR-010](08_adr/ADR-010_portal-psikolog-built-in.md).
- Matching Engine Layer 2 (Psikotes AI) — selesai dikoding, menunggu deploy. Lihat [ADR-011](08_adr/ADR-011_capture-work-style-built-in.md).
- Layer 3 (review psikolog, Nanny Care Profile™) — keputusan produk & SOP final, belum dikoding. Lihat [18_spec_nanny_care_profile_layer3.md](18_spec_nanny_care_profile_layer3.md).

**Update status per 11 Juli 2026:**
- **Bug diperbaiki**: booking Konsultasi Psikolog Anak sempat selalu tampil "Penuh" karena kode salah mencari psikolog level Senior, padahal peluncuran seharusnya level Mid — sudah dikoreksi.
- **Fitur baru selesai dikoding, menunggu deploy**: orang tua sekarang bisa pilih psikolog spesifik (untuk kontinuitas & lihat Jam Terbang/pengalaman psikolog), psikolog atur Jadwal Psikolog sendiri (pola mingguan + cuti) di Portal Psikolog, tampilan kalender booking jadi bulan/minggu berwarna, dan ada Ulasan Psikolog (internal-only, untuk pemantauan kualitas HCC — tidak pernah tampil ke orang tua lain). Lihat [ADR-012](08_adr/ADR-012_pilih-psikolog-dan-jadwal-individual.md) & [PRD §7c](13_prd_tumbuh_kembang.md).

POC arsitektur (§2–§5) tetap potret sistem per commit terakhir 22 Mei 2026 — status fitur terkini selalu rujuk [Feature Registry](05_feature_registry.md).

---

*Lihat juga: [PRD](06_prd.md) · [Domain Registry](02_domain_registry.md) · [TDD](07_technical_design_document.md) · [CONTEXT.md](../../CONTEXT.md) (glossary domain kanonik)*
