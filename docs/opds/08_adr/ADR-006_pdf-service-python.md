# ADR-006 — Service PDF Terpisah (Python/ReportLab) di Railway

**Status:** Accepted  
**Tanggal:** Mei 2026  
**Decider:** Developer

---

## Konteks

BundaYakin menghasilkan dokumen PDF untuk:
1. **NannyCare Profile™** — laporan psikolog Layer 3, dokumen formal berformat profesional
2. **Laporan matching** — output Layer 1 & 2, ringkasan skor dan rekomendasi
3. **Laporan evaluasi berkala** — summary evaluasi per periode

PDF ini bukan sekadar teks — membutuhkan **layout profesional**, tabel, logo, typography yang konsisten, dan kemungkinan grafik/chart.

Tantangan teknis:
- Node.js / JavaScript tidak punya PDF library sehandal Python untuk layout kompleks
- Vercel serverless functions punya batas execution time (10 detik) — render PDF kompleks bisa melebihi batas ini
- PDF rendering adalah compute-intensive — lebih baik dijalankan di dedicated service

---

## Opsi yang Dipertimbangkan

1. **Python + ReportLab di Railway (service terpisah)** — dedicated PDF microservice
2. **Puppeteer / Playwright (Node.js)** — headless browser render HTML ke PDF
3. **PDFKit (Node.js)** — library PDF untuk Node.js
4. **React-pdf** — render React components ke PDF
5. **Third-party API** (DocRaptor, PDFShift) — layanan berbayar per-PDF

---

## Keputusan

**Dipilih: Python + ReportLab sebagai microservice terpisah di Railway**

Alasan:
- **ReportLab adalah gold standard** untuk PDF generation programatik — dipakai di industri psikologi, hukum, dan medis
- **Kontrol layout penuh** — bisa buat template yang sangat presisi dan profesional untuk NannyCare Profile™
- **Python tidak ada di Next.js** — ini alasan utama kenapa jadi service terpisah
- **Railway cocok untuk Python container** — deploy Docker container Python sederhana
- **Tidak terikat Vercel timeout** — Railway bisa run lebih lama untuk rendering PDF kompleks
- **Isolasi** — bug di PDF service tidak crash Next.js app

Kenapa bukan Puppeteer:
- Puppeteer (headless Chrome) sangat berat untuk Vercel serverless (200MB+ dependencies)
- Timeout lebih sering terjadi
- Output visual bergantung pada CSS rendering yang bisa berbeda antar environment

Kenapa bukan third-party API:
- Lock-in ke layanan eksternal untuk dokumen yang sangat sensitif (NannyCare Profile™)
- Biaya per-PDF tidak predictable dengan scale
- Data psikologis tidak boleh dikirim ke layanan pihak ketiga

---

## Konsekuensi

**Positif:**
- PDF layout sangat fleksibel dan profesional
- Tidak ada timeout Vercel untuk rendering
- Data psikologis tidak keluar dari infrastruktur sendiri
- Isolasi service — bisa diupgrade/deploy independen

**Negatif / Trade-off:**
- **Dua deployment** — harus manage Vercel (Next.js) dan Railway (Python) terpisah
- **Latency tambahan** — HTTP call antar service menambah ~100–500ms
- **Auth antar service** — harus maintain shared secret (`PDF_SERVICE_SECRET`)
- **Debugging lebih kompleks** — error bisa di sisi Next.js atau pdf-service

**Keamanan:**
- pdf-service tidak bisa diakses publik — hanya dari apps/web dengan header `x-api-key`
- Tidak ada auth user di pdf-service — validasi hanya berdasarkan API key
- PDF setelah digenerate langsung di-upload ke R2 oleh Next.js (pdf-service tidak menyimpan data)

---

## Catatan

- Service ada di `apps/pdf-service/`
- Entry point: `apps/pdf-service/main.py`
- PDF generator: `apps/pdf-service/services/nanny_profile.py`
- Deploy via Dockerfile di Railway
- Health check: `GET /health` (dimonitor Railway untuk restart otomatis)
- Komunikasi dari apps/web: `apps/web/src/lib/pdf.ts`
- `PDF_SERVICE_SECRET` wajib sama di kedua environment (Vercel dan Railway)
