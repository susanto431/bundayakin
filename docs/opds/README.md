# Operational Product Development System (OPDS)
## BundaYakin — Human Care Consulting

> Versi 1.0 · Mei 2026 · Dokumen Internal

Folder ini adalah **single source of truth** untuk seluruh dimensi produk dan teknologi BundaYakin. Setiap dokumen di sini bersifat lintas-aplikasi (monorepo-wide) dan melengkapi, bukan menggantikan, dokumentasi operasional yang ada di `apps/web/docs/`.

---

## Dokumen dalam Sistem Ini

| # | Dokumen | Deskripsi Singkat |
|---|---------|-------------------|
| 1 | [Product Ecosystem Blueprint](01_product_ecosystem_blueprint.md) | Peta besar ekosistem produk — semua aktor, sistem, dan aliran nilai |
| 2 | [Domain Registry](02_domain_registry.md) | Daftar domain bisnis & bounded context yang membentuk platform |
| 3 | [Product Operating Model](03_product_operating_model.md) | Bagaimana produk dijalankan: tim, keputusan, siklus development |
| 4 | [Service & Module Catalog](04_service_module_catalog.md) | Inventaris semua service, modul internal, dan integrasi eksternal |
| 5 | [Feature Registry](05_feature_registry.md) | Status semua fitur: shipped, in-progress, planned, backlog |
| 6 | [PRD — Product Requirements Document](06_prd.md) | Vision, persona, user stories, success metrics, constraints |
| 7 | [Technical Design Document](07_technical_design_document.md) | Arsitektur teknis, stack, pola desain, deployment |
| 8 | [ADR — Architecture Decision Records](08_adr/index.md) | Log semua keputusan arsitektur besar beserta konteksnya |
| 9 | [AI Governance Document](09_ai_governance.md) | Panduan penggunaan AI, privasi data psikologis, dan batas sistem |

---

## Relasi dengan Docs Lama (`apps/web/docs/`)

Dokumen OPDS ini bersifat **strategic & cross-cutting**. Untuk detail operasional, lihat:

| Dokumen Lama | Isi |
|---|---|
| `apps/web/docs/PRODUCT.md` | Konteks bisnis lengkap (baca saat onboarding sesi baru) |
| `apps/web/docs/BundaYakin_MasterSummary_Mei2026.md` | Master summary semua keputusan bisnis yang sudah final |
| `apps/web/docs/API.md` | Referensi endpoint API |
| `apps/web/docs/FEATURES_BACKLOG.md` | Backlog detail per area |
| `apps/web/docs/DESIGN_SYSTEM.md` | Panduan visual dan komponen UI |
| `apps/web/docs/FOLDER_STRUCTURE.md` | Konvensi struktur folder kode |

---

## Cara Menggunakan Sistem Ini

- **Mulai baru?** Baca [PRD](06_prd.md) → [Product Ecosystem Blueprint](01_product_ecosystem_blueprint.md)
- **Engineer baru?** Baca [TDD](07_technical_design_document.md) → [Service Catalog](04_service_module_catalog.md) → [ADR Index](08_adr/index.md)
- **Mau tambah fitur?** Cek [Feature Registry](05_feature_registry.md) dan [Domain Registry](02_domain_registry.md)
- **Keputusan arsitektur baru?** Buat ADR baru di `08_adr/` dengan format yang ada

---

*Dokumen OPDS diperbarui setiap ada keputusan produk atau teknis yang signifikan.*
