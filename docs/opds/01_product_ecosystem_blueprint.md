# Product Ecosystem Blueprint
## BundaYakin — Human Care Consulting

> Versi 1.0 · Mei 2026 · Dokumen Internal OPDS

---

## 1. Identitas Produk

| Atribut | Detail |
|---|---|
| Nama Produk | BundaYakin |
| Pemilik | Apin — Psikolog, Human Care Consulting (HCC) |
| Entitas Bisnis | BundaYakin (terpisah dari HCC, berbentuk CV) |
| Tagline | Platform kecocokan, pemantauan, dan pengasuhan — bukan sekadar penyalur nanny |
| Positioning | "Kami jamin kecocokan, bukan integritas" |
| Target Pengguna | Orang tua (SES B/B+, urban, anak 0–7 tahun atau keluarga dengan lansia) |
| Status | Pre-MVP → Development |

---

## 2. Ekosistem Aktor

### Aktor Utama (manusia)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        EKOSISTEM BUNDAYAKIN                         │
│                                                                     │
│   ┌──────────────┐        ┌──────────────────┐                     │
│   │  Orang Tua   │◄──────►│      Nanny        │                    │
│   │  (membayar)  │        │    (gratis)       │                    │
│   └──────┬───────┘        └────────┬──────────┘                    │
│          │                         │                                │
│          └───────────┬─────────────┘                               │
│                      ▼                                              │
│           ┌──────────────────────┐                                 │
│           │   Platform BundaYakin │                                 │
│           │   (Next.js + Prisma)  │                                 │
│           └───────────┬──────────┘                                 │
│                       │                                             │
│         ┌─────────────┼──────────────┐                             │
│         ▼             ▼              ▼                              │
│   ┌──────────┐  ┌──────────┐  ┌──────────────┐                    │
│   │ AI/Claude│  │ Psikolog │  │  Admin HCC   │                    │
│   │(matching)│  │  (Layer3)│  │  (eskalasi)  │                    │
│   └──────────┘  └──────────┘  └──────────────┘                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

| Aktor | Peran | Akses Platform |
|---|---|---|
| **Orang Tua** | User berbayar (Rp 500rb/tahun). Mencari, mengevaluasi, dan memantau nanny. | Dashboard, matching, monitoring, evaluasi |
| **Nanny** | User gratis. Mendaftar, mengisi survey, menerima laporan, membangun rekam jejak. | Profil, survey, media portfolio, evaluasi dua arah |
| **Admin BundaYakin** | Operasional platform — bukan HCC. Menangani eskalasi, verifikasi, sengketa. | Panel admin (Fasa 2) |
| **Psikolog HCC** | Reviewer Layer 3 — wawancara privat, laporan NannyCare Profile™. | Upload hasil assessment |
| **AI (Claude API)** | Engine matching Layer 1 & 2, scoring, ringkasan evaluasi, sosmed screening. | Internal API calls |

---

## 3. Aliran Nilai (Value Flow)

### Aliran Utama: Orang Tua → Platform → Nanny

```
Orang Tua membayar Rp 500rb/tahun
        │
        ▼
Akses ke platform:
  - Isi survey (Layer 1)
  - Terima laporan kecocokan AI
  - Pantau aktivitas nanny
  - Evaluasi berkala
        │
        ▼
Nanny mendapat:
  - Profil digital terverifikasi
  - Rekam jejak kerja
  - Bonus milestone (Rp 50–100rb)
  - Badge reputasi
```

### Aliran Add-on (bayar saat butuh)

```
Add-on Layer 2 (Rp 300rb)  ─► AI psikotes nanny ─► laporan detail
Add-on Layer 3 (Rp 1.2–1.5jt) ─► psikolog HCC ─► NannyCare Profile™ PDF
Track Record (Rp 50rb/nanny) ─► riwayat kerja dari keluarga sebelumnya
Sosmed Screening (Rp 100–125rb) ─► AI review profil publik nanny
Placement Fee (Rp 1,2jt, satu tarif flat) ─► penyaluran nanny
```

---

## 4. Tiga Fasa Bisnis

| Fasa | Nama | Status | Kapabilitas Utama |
|---|---|---|---|
| **Fasa 1** | Platform Kecocokan & Pemantauan | **Sekarang** | Matching, monitoring, evaluasi. Revenue: langganan + add-on + placement fee. |
| **Fasa 2** | Direktori Nanny Terverifikasi | Setelah data cukup | Orang tua browse & shortlist nanny dari pool. Nanny aktif di platform punya profil publik. |
| **Fasa 3** | Platform Penyalur Penuh | Jangka panjang | Matching aktif, referral fee, community, babysitter on-demand (hourly). |

---

## 5. Sistem Matching — 3 Layer

```
Layer 1 — Survey Kecocokan (default, gratis dalam langganan)
  │
  ├── Orang tua isi survey → database
  ├── Nanny isi survey → database
  └── Claude API → scoring → laporan (% kecocokan, match/mismatch, tips)

Layer 2 — + Psikotes AI (+Rp 300rb)
  │
  └── Nanny isi tes → Claude API → laporan lebih detail + breakdown kepribadian

Layer 3 — + Psikolog HCC (+Rp 1.2–1.5jt)
  │
  └── Psikolog wawancara nanny → upload hasil → NannyCare Profile™ PDF (ReportLab)
```

---

## 6. Alur Koneksi: Dua Flow

| Flow | Nama | Cara Kerja |
|---|---|---|
| **Flow A** | Referral | Orang tua undang nanny spesifik via kode referral. Nanny masuk sebagai kandidat eksklusif 7 hari. |
| **Flow B** | Talent Pool | Platform AI rekomendasikan nanny dari pool berdasarkan preferensi orang tua. Kuota: 7 koneksi/bulan (aktif langganan). |

---

## 7. Ekosistem Integrasi Eksternal

| Layanan | Peran | Posisi dalam Platform |
|---|---|---|
| **Neon PostgreSQL** | Database utama (hosted) | Prisma ORM → semua data platform |
| **Cloudflare R2** | Object storage foto | Foto profil, foto portfolio nanny |
| **Cloudflare Stream** | Video hosting | Video perkenalan & keahlian nanny (max 3 menit) |
| **Mayar** | Payment gateway | Invoice, pembayaran langganan + add-on (menunggu verifikasi akun) |
| **Claude API (Anthropic)** | AI engine | Scoring matching, psikotes AI, ringkasan evaluasi, sosmed screening |
| **Resend** | Email transaksional | Notifikasi, konfirmasi registrasi, laporan siap |
| **Vercel** | Deploy Next.js | Hosting web app, preview deployment per branch |
| **Railway** | Deploy Python | Hosting pdf-service (ReportLab) |
| **NextAuth v5** | Autentikasi | Session management, credentials + (rencana) Google OAuth |

---

## 8. Revenue Model

| Sumber | Harga | Frekuensi |
|---|---|---|
| Langganan orang tua | Rp 500.000 | Per tahun |
| Placement fee | Rp 1.200.000 (satu tarif flat, semua jenis penempatan) | Per penempatan |
| Add-on Layer 2 (psikotes AI) | Rp 300.000 | Per kandidat |
| Add-on Layer 3 (psikolog) | Rp 1.200.000–1.500.000 | Per sesi |
| Track record nanny | Rp 50.000 | Per nanny |
| Track record pemberi kerja | Rp 50.000 | Per keluarga |
| Sosmed screening | Rp 100.000–125.000 | Per nanny |
| Connection add-on (kuota extra) | Rp 100.000 | Per koneksi tambahan |

---

## 9. Monitoring & Evaluasi Berkala

Setelah nanny mulai kerja, platform otomatis jadwalkan:

| Titik Waktu | Tipe | Peserta |
|---|---|---|
| Minggu 1 | Check-in singkat (5 pertanyaan) | Orang tua + nanny |
| Minggu 2 | Check-in singkat (5 pertanyaan) | Orang tua + nanny |
| Bulan 1 | Evaluasi penuh | Orang tua + nanny |
| Bulan 3 | Evaluasi penuh | Orang tua + nanny |
| Setiap kuartal | Evaluasi berkala | Orang tua + nanny |

Output: AI summary per evaluasi + optional PDF laporan.

---

## 10. Jaminan Produk

> "Kami jamin kecocokan — bukan integritas atau keamanan nanny."

- **Garansi tidak cocok:** Kredit platform + 1x re-matching gratis (dalam 3 bulan pertama)
- **Tidak ada refund tunai** — hanya kredit platform
- **Tidak menjamin:** Kejujuran, moral, atau track record kriminal nanny

*Framing ini adalah keputusan legal dan etis yang sudah final.*

---

*Lihat juga: [Domain Registry](02_domain_registry.md) · [PRD](06_prd.md) · [apps/web/docs/PRODUCT.md](../../apps/web/docs/PRODUCT.md)*
