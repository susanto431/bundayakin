# ADR-011 — Capture Work Style (Instrumen Layer 2): Built-in di `apps/web`, Deviasi Terkontrol dari ADR-009

**Status:** Accepted
**Tanggal:** 2026-07-10
**Decider:** Kartika (produk) — dieksekusi Claude

---

## Konteks

ADR-009 mengunci arah arsitektur: instrumen Psikotes (Layer 2) harus jadi **service terpisah** dari `apps/web`, karena saat itu instrumennya belum ada dan diasumsikan akan jadi aset HCC lintas produk (dipakai produk HCC lain di luar BundaYakin) — mengikuti prinsip "pemisahan mencerminkan batas kepemilikan aset lintas produk".

Instrumen itu kini sudah ada: **Capture Work Style** — revisi HCC sendiri dari PAPI Kostick (item & kunci jawaban milik HCC). Ini instrumen yang sama yang selama ini ditunggu untuk memulai Layer 2, dan juga jadi salah satu bahan input untuk laporan Layer 3 (Nanny Care Profile™) yang sedang direncanakan.

## Opsi yang Dipertimbangkan

1. **Ikuti ADR-009 apa adanya — bangun service terpisah sekarang** untuk Capture Work Style (bank soal + skoring), sebelum menyentuh Layer 3. Konsisten dengan keputusan lama, tapi menambah beban: tim kecil harus membangun & mengoperasikan service baru sebelum fitur yang sudah lama ditunggu (Layer 3) bisa mulai jalan.
2. **Built-in di `apps/web` dulu** (dipilih) — mengikuti pola KPSP: skoring Capture Work Style deterministik (rumus raw score → skor aspek sudah pasti, lihat dokumen skill laporan), tidak butuh AI/service eksternal. Dipisah **belakangan** kalau memang ada produk HCC lain di luar BundaYakin yang benar-benar mau memakainya.

## Keputusan

**Dipilih: Opsi 2 — built-in di `apps/web`, untuk sementara.**

Kartika secara eksplisit memutuskan mengubah arah ADR-009 khusus untuk Capture Work Style: praktis dan cepat jalan lebih diutamakan sekarang, karena belum ada produk HCC lain yang konkret akan memakai instrumen ini di luar BundaYakin. Prinsip yang dipakai sama dengan ADR-010 (Portal Psikolog): **lebih mudah memisahkan fitur nanti kalau memang dibutuhkan, daripada menyatukan kembali fitur yang sudah kadung dipisah.**

**Ini BUKAN pembatalan ADR-009 secara umum** — prinsip "instrumen aset lintas produk HCC → service terpisah" tetap berlaku untuk instrumen HCC lain di masa depan. Ini adalah pengecualian khusus untuk Capture Work Style, dicatat sadar sebagai deviasi terkontrol, bukan penyimpangan diam-diam.

## Konsekuensi

**Positif:** Layer 2 (Psikotes AI) dan Layer 3 (Nanny Care Profile™) bisa mulai dibangun jauh lebih cepat — tidak perlu infrastruktur/deploy service baru dulu. Bank soal, kunci jawaban, dan skoring Capture Work Style hidup sebagai kode & data di `apps/web` (mirip `kpsp-instrument.ts`/`kpsp-scoring.ts`).

**Negatif / catatan:** Kalau di masa depan HCC benar-benar ingin memakai Capture Work Style di produk lain, perlu proyek migrasi terpisah untuk mengeluarkannya jadi service sendiri (duplikasi kode dihindari sampai saat itu tiba). Risiko ini diterima sadar oleh Kartika. Revisit ADR ini kalau rencana lintas-produk itu terwujud.
