# Architecture Decision Records — Index
## BundaYakin — Human Care Consulting

> ADR adalah log keputusan arsitektur yang sudah dibuat, alasannya, dan konsekuensinya.
> Setiap keputusan teknis besar yang sulit dibalik atau berimplikasi luas WAJIB dicatat di sini.

---

## Cara Membuat ADR Baru

1. Buat file baru: `ADR-00N_nama-keputusan.md` (N = nomor urut)
2. Gunakan template di bawah
3. Tambahkan entry ke tabel ini

**Template ADR:**
```markdown
# ADR-00N — Judul Keputusan
**Status:** Accepted | Superseded by ADR-00X | Deprecated
**Tanggal:** YYYY-MM-DD
**Decider:** [nama / peran]

## Konteks
[Apa masalah atau kebutuhan yang memicu keputusan ini?]

## Opsi yang Dipertimbangkan
1. [Opsi A]
2. [Opsi B]
3. [Opsi C]

## Keputusan
[Pilihan yang diambil dan alasan utamanya]

## Konsekuensi
[Trade-off, risiko, dan implikasi dari keputusan ini]

## Catatan
[Konteks tambahan, link referensi, hal yang perlu dimonitor]
```

---

## Daftar ADR

| ID | Judul | Status | Tanggal |
|---|---|---|---|
| [ADR-001](ADR-001_nextjs-app-router.md) | Next.js 14 App Router sebagai framework web | Accepted | Mei 2026 |
| [ADR-002](ADR-002_neon-postgresql-prisma.md) | Neon PostgreSQL + Prisma sebagai database stack | Accepted | Mei 2026 |
| [ADR-003](ADR-003_mayar-payment.md) | Mayar sebagai payment gateway | Accepted | Mei 2026 |
| [ADR-004](ADR-004_cloudflare-r2-stream.md) | Cloudflare R2 + Stream untuk media storage | Accepted | Mei 2026 |
| [ADR-005](ADR-005_claude-api-matching.md) | Claude API sebagai AI engine untuk matching | Accepted | Mei 2026 |
| [ADR-006](ADR-006_pdf-service-python.md) | Service PDF terpisah (Python/ReportLab) di Railway | Accepted | Mei 2026 |
| [ADR-007](ADR-007_langganan-dua-pilar.md) | Langganan dua pilar: nanny + Tumbuh Kembang | Accepted | Juli 2026 |
| [ADR-008](ADR-008_pricing-config-panel.md) | Pricing Config Panel: harga & kuota effective-dated (tidak retroaktif) | Accepted | Juli 2026 |
| [ADR-009](ADR-009_psikotes-service-terpisah.md) | Psikotes (Layer 2) sebagai service terpisah lintas produk HCC | Accepted (arah) | Juli 2026 |
| [ADR-010](ADR-010_portal-psikolog-built-in.md) | Portal Psikolog & Konsultasi Psikolog Anak built-in di `apps/web` | Accepted | Juli 2026 |
| [ADR-011](ADR-011_capture-work-style-built-in.md) | Capture Work Style (instrumen Layer 2) built-in di `apps/web`, deviasi terkontrol dari ADR-009 | Accepted | Juli 2026 |
| [ADR-012](ADR-012_pilih-psikolog-dan-jadwal-individual.md) | Orang tua bisa pilih psikolog spesifik & psikolog atur Jadwal Psikolog sendiri (revisi sebagian ADR-010/PRD §7b) | Accepted | Juli 2026 |
| [ADR-014](ADR-014_undangan-psikotes.md) | Undangan Psikotes: jalur berbayar dari Orang Tua berdampingan dengan self-service Nanny, satu harga untuk lihat-hasil/kirim-undangan | Accepted | Juli 2026 |
| [ADR-015](ADR-015_komparasi-preferensi-deterministik.md) | Komparasi Preferensi: perbandingan jawaban deterministik per aspek, terpisah dari skor AI | Accepted | Juli 2026 |
| [ADR-016](ADR-016_talent-pool-kontak-selalu-berbayar.md) | AI Talent Pool: buka nomor WA nanny selalu berbayar (Rp250rb), kuota gratis dihapus (Referral tidak terpengaruh) | Accepted | Juli 2026 |

---

*Lihat juga: [TDD](../07_technical_design_document.md) · [Service Catalog](../04_service_module_catalog.md)*
