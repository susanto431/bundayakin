# ADR-002 — Neon PostgreSQL + Prisma sebagai Database Stack

**Status:** Accepted  
**Tanggal:** Mei 2026  
**Decider:** Developer

---

## Konteks

BundaYakin membutuhkan database yang:
- Menyimpan data relasional kompleks (user, profil, matching, evaluasi, transaksi)
- Serverless-friendly — tidak ada biaya idle saat tidak ada traffic
- Punya type safety yang baik di TypeScript
- Mudah di-manage oleh tim kecil tanpa DBA
- Mendukung migrasi database yang aman

Data platform bersifat **relasional** dan **saling terhubung** (matching request → survey response → matching result → evaluation → dst), sehingga NoSQL bukan pilihan yang baik.

---

## Opsi yang Dipertimbangkan

**Database:**
1. **Neon PostgreSQL** — serverless PostgreSQL, compatible penuh
2. **Supabase** — PostgreSQL + auth + storage dalam satu platform
3. **PlanetScale** — serverless MySQL, vitess-based
4. **Railway PostgreSQL** — managed PostgreSQL, bayar flat
5. **Self-hosted PostgreSQL** — kontrol penuh, operasional lebih berat

**ORM:**
1. **Prisma** — type-safe ORM, schema-first, migration tool
2. **Drizzle** — lebih lightweight, SQL-like syntax
3. **TypeORM** — mature, decorator-based, lebih verbose
4. **Raw SQL** — kontrol penuh, tidak ada type safety otomatis

---

## Keputusan

**Dipilih: Neon PostgreSQL + Prisma**

Alasan database (Neon):
- **Serverless** — tidak bayar saat idle, scale otomatis
- **PostgreSQL penuh** — semua fitur PostgreSQL tersedia (JSON fields, array types, full-text search)
- **Branching** — bisa buat branch database untuk preview (mirip git branch)
- **Vercel integration** — terintegrasi langsung dengan Vercel marketplace
- **Connection pooling** — built-in via Neon serverless driver, tidak perlu PgBouncer terpisah

Alasan ORM (Prisma):
- **Schema-first** — `schema.prisma` adalah single source of truth untuk model data
- **Type safety end-to-end** — TypeScript types digenerate dari schema, tidak bisa salah field name
- **Migration tool** — `prisma migrate` yang deterministik dan trackable
- **Excellent tooling** — Prisma Studio untuk browsing data, `prisma generate` untuk client
- **Komunitas besar** — dokumentasi dan AI tools (Claude Code) sangat familiar

---

## Konsekuensi

**Positif:**
- Schema `schema.prisma` jadi single source of truth yang mudah dibaca
- Type errors langsung ketahuan di compile time, bukan runtime
- Migrasi database di-track di version control
- Prisma Studio memudahkan debug data saat development

**Negatif / Trade-off:**
- Prisma bisa generate query yang tidak optimal untuk kasus kompleks → perlu audit N+1
- Neon cold start bisa lambat jika connection lama tidak dipakai (mitigasi: Neon serverless driver)
- Prisma tidak support semua fitur PostgreSQL advanced (mitigasi: raw query untuk kasus khusus)
- Prisma client perlu di-generate ulang setelah schema change (`prisma generate`)

**Risiko yang perlu dimonitor:**
- N+1 queries saat menggunakan `include` bersarang → gunakan `lib/queries/` sebagai abstraksi
- Connection pool exhaustion di Vercel serverless functions → gunakan Neon serverless driver (`@neondatabase/serverless`)

---

## Catatan

- Schema lengkap ada di `apps/web/prisma/schema.prisma`
- Jangan pernah edit schema tanpa membuat migrasi (`npx prisma migrate dev`)
- Query helpers ada di `apps/web/src/lib/queries/` untuk mencegah N+1
- Versi Prisma di-pin di `package.json` untuk stabilitas
- Supabase tidak dipilih meskipun lebih all-in-one karena lock-in yang lebih tinggi dan auth yang sudah diatasi dengan NextAuth
