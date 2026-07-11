# ADR-015 — Komparasi Preferensi: Perbandingan Deterministik, Terpisah dari Skor AI

**Status:** Accepted
**Tanggal:** 2026-07-11
**Decider:** Kartika (produk) — dieksekusi Claude

## Konteks

Halaman Skor Direktori (profil nanny & drawer "Detail Nanny" di `cari-nanny`) selama ini hanya menampilkan skor 3 domain (A/B/C) dan narasi (`kekuatan`, `potensiLemah`, dst) — semuanya dihasilkan sekali jalan oleh Claude API dari seluruh jawaban survey mentah (lihat `src/lib/prompts/matching.ts`). Orang tua tidak bisa melihat *jawaban per aspek* yang sebenarnya membentuk skor itu.

Fitur baru **Komparasi Preferensi** menambahkan tampilan 9 baris (satu per aspek: A1, A2, B1, B2, B3, C1–C4) yang membandingkan jawaban Bunda vs Nanny secara langsung, dengan status Cocok / Beda Preferensi / Perlu Dibicarakan / Belum Ada Data.

Saat menggali cara menghitung status ini, ditemukan bahwa definisi **Dealbreaker** di `CONTEXT.md` sudah presisi dan deterministik ("ditandai wajib cocok oleh **salah satu pihak**, DAN kedua pihak sudah mengisi jawaban, DAN jawabannya beda") — tapi implementasi yang ada (`buildMatchingPrompt`) tidak mengikuti definisi itu: prompt hanya mengecek dealbreaker dari sisi orang tua, dan keputusan "match atau tidak" diserahkan ke penilaian AI ("match jika nilai sama atau berdekatan"), bukan aturan tetap.

## Opsi yang Dipertimbangkan

1. **Komparasi Preferensi mengikuti hasil AI yang sudah ada** (`dealbreakerFlags`, skor domain) — selalu konsisten dengan skor keseluruhan, tapi ikut mewarisi keterbatasan (cuma cek sisi orang tua) dan butuh biaya API + skema tambahan (`aspectBreakdown`) yang tidak akan terisi untuk `MatchResult` yang sudah ada sebelumnya.
2. **Komparasi Preferensi dihitung ulang dari nol, deterministik, sesuai definisi asli di `CONTEXT.md`** (dipilih) — membandingkan `SurveyResponse` mentah per `questionCode` pakai peta kecocokan per pertanyaan (lihat Catatan), mengecek `isDealbreaker` dari KEDUA pihak. Instan, gratis, langsung jalan untuk semua laporan lama tanpa migrasi data.

## Keputusan

**Dipilih: Opsi 2.** Komparasi Preferensi adalah sumber kebenaran baru dan terpisah untuk "apakah jawaban Bunda & Nanny cocok per aspek" — dihitung deterministik di kode, bukan lewat AI, dan bukan turunan dari `MatchResult.dealbreakerFlags`/`skorDomainA/B/C` yang sudah ada.

Konsekuensi yang diterima sadar oleh Kartika: skor keseluruhan (AI, holistik) dan Komparasi Preferensi (deterministik, per-aspek) adalah **dua mekanisme berbeda yang bisa sesekali tidak 100% sinkron** untuk nanny tertentu — misalnya skor keseluruhan AI terlihat tinggi meski satu aspek berlabel "Perlu Dibicarakan" di Komparasi Preferensi (atau sebaliknya). Ini bukan bug — keduanya menjawab pertanyaan yang beda: skor AI adalah penilaian holistik, Komparasi Preferensi adalah fakta jawaban apa adanya.

## Konsekuensi

**Positif:** Tidak perlu ubah skema `MatchResult`, tidak perlu re-generate `MatchResult` lama, tidak nambah biaya Claude API per tampilan laporan. Definisi Dealbreaker yang dipakai akhirnya sesuai `CONTEXT.md` (cek kedua pihak), lebih ketat dari sebelumnya.

**Negatif / catatan:** Kemungkinan orang tua melihat skor keseluruhan tinggi tapi ada 1 aspek "Perlu Dibicarakan" (atau sebaliknya) — perlu framing UI yang jelas bahwa keduanya mengukur hal berbeda, supaya tidak terkesan sistem kontradiktif. `buildMatchingPrompt`/`dealbreakerFlags` (skor keseluruhan AI) TIDAK diubah oleh keputusan ini — tetap seperti sekarang, di luar scope Komparasi Preferensi.

## Catatan

Peta kecocokan per pertanyaan (compatibility mapping — termasuk kasus seperti opsi "Bebas" yang cocok dengan jawaban apa pun) didefinisikan per pertanyaan di `src/constants/survey-questions.ts`, bukan asumsi "sama persis = cocok" (`answerValue` bisa berbeda kode tapi tetap kompatibel, atau sebaliknya).
