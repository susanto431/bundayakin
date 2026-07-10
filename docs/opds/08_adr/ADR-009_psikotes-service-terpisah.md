# ADR-009 — Psikotes (Layer 2) sebagai Service Terpisah Lintas Produk HCC

**Status:** Accepted (prinsip umum) — **pengecualian untuk instrumen Capture Work Style, lihat [ADR-011](ADR-011_capture-work-style-built-in.md)**
**Tanggal:** 2026-07-05
**Decider:** Kartika

> **Catatan 10 Juli 2026:** instrumen yang ditunggu (§ "Belum ada tanggal mulai pengerjaan") kini ada — namanya **Capture Work Style** (revisi HCC dari PAPI Kostick). Kartika memutuskan instrumen ini dibangun **built-in di `apps/web` dulu** (bukan service terpisah), sebagai deviasi terkontrol dan sadar dari arah ADR ini — lihat [ADR-011](ADR-011_capture-work-style-built-in.md) untuk alasannya. Prinsip umum ADR-009 (instrumen aset lintas produk HCC → service terpisah) tetap berlaku untuk instrumen HCC lain di masa depan.

---

## Konteks

Layer 2 (Psikotes AI) sudah direncanakan sejak awal proyek: nanny mengisi tes (IQ, kepribadian, sikap kerja), sistem menskor otomatis, hasil masuk `AssessmentResult` (`interpretedBy: "AI"`), dijual sebagai add-on Rp 300rb. Belum ada satu baris kode pun untuk fitur ini — baru schema (`AssessmentResult`, `AssessmentLayer.LAYER_2`) dan tipe transaksi (`ADDON_PSIKOTES`).

Pertanyaan yang perlu dijawab sebelum membangun: apakah instrumen psikotes (bank soal + algoritma skoring) ini murni bagian BundaYakin, atau aset HCC yang akan dipakai lintas produk (HCC adalah entitas konsultan yang lebih besar dari BundaYakin — lihat Product Ecosystem Blueprint)?

**Jawaban Kartika: lintas produk HCC** — psikotes ini bukan hanya untuk menilai nanny di BundaYakin, tapi instrumen milik HCC yang berpotensi dipakai produk HCC lain.

## Opsi yang Dipertimbangkan

1. **Built-in di `apps/web`** (satu API route Next.js baru, seperti fitur lain) — paling sederhana dioperasikan tim satu orang, tapi mengunci instrumen psikotes di dalam codebase BundaYakin; produk HCC lain tidak bisa memakainya tanpa duplikasi kode atau bongkar-pasang.
2. **Service terpisah dengan API sendiri** (dipilih) — mengikuti pola `apps/pdf-service` (ADR-006): satu layanan dedicated yang menyimpan bank soal, menjalankan skoring, diekspos sebagai API. BundaYakin memanggilnya seperti memanggil pdf-service — konsumen, bukan pemilik logika.

## Keputusan

**Dipilih: Opsi 2 — service terpisah.** Berbeda dengan ADR-006 (Python dipisah karena butuh ReportLab, bukan filosofi "pisah semua"), alasan pemisahan di sini murni **kepemilikan aset lintas produk**: instrumen psikotes adalah milik HCC, bukan BundaYakin — pemisahan mencerminkan batas kepemilikan itu, bukan kebutuhan teknis bahasa/library tertentu.

**Implikasi konkret (untuk implementasi nanti):**
- BundaYakin (`apps/web`) memanggil service ini via HTTP, menyimpan hasilnya ke `AssessmentResult` — pola sama seperti `PDF_SERVICE_URL`/`PDF_SERVICE_SECRET` di `src/lib/pdf.ts`.
- Bank soal, algoritma skoring, dan hasil mentah **tidak boleh disimpan di database BundaYakin** — hanya hasil interpretasi/skor akhir yang relevan untuk BundaYakin yang disimpan lokal. Sumber kebenaran instrumen ada di service psikotes.
- Stack service ini belum ditentukan (bisa Python/Node/apa pun) — akan diputuskan saat implementasi dimulai, mempertimbangkan kebutuhan produk HCC lain yang akan memakainya juga.
- Belum ada tanggal mulai pengerjaan — menunggu instrumen psikotes tersedia dari psikolog HCC (sama seperti KPSP: perlu sumber resmi/tervalidasi dulu, lihat [17_draft_instrumen_skrining_kpsp.md](../17_draft_instrumen_skrining_kpsp.md) sebagai pola prasyarat serupa).

## Konsekuensi

**Positif:** instrumen psikotes bisa dipakai ulang produk HCC lain tanpa duplikasi; batas kepemilikan aset jelas sejak awal (tidak perlu migrasi menyakitkan nanti kalau baru dipisah setelah terlanjur built-in).

**Negatif / catatan:** tim kecil (satu developer) kini berpotensi mengoperasikan **dua** service terpisah (pdf-service + psikotes-service) selain `apps/web` — beban operasional harus dipertimbangkan saat implementasi (monitoring, deploy, biaya hosting). Detail teknis (nama service, lokasi repo, stack) menyusul saat pengerjaan dimulai — dokumen ini hanya mengunci **arah arsitektur**, bukan implementasi.
