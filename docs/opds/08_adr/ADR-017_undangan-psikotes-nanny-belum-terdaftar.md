# ADR-017 — Undangan Psikotes untuk Nanny Belum Terdaftar: Akun Mandiri, Bukan Flow A

**Status:** Accepted
**Tanggal:** 2026-07-12
**Decider:** Kartika (produk) — dieksekusi Claude

## Konteks

[ADR-014](ADR-014_undangan-psikotes.md) poin 3 menyebut alur Undangan Psikotes untuk Nanny yang belum terdaftar di platform "menumpang pada mekanisme kode undangan registrasi yang sudah ada (Flow A / Referral)" — tapi detail teknisnya belum dirinci saat itu, dan belum dikoding (`PsikotesInviteForm` sudah ada di UI tapi sengaja dimatikan lewat flag `PSIKOTES_INVITE_ENABLED = false`, endpoint `/api/payment/psikotes-invite` belum dibangun).

Saat dirinci untuk digarap, "menumpang Flow A" ternyata tidak tepat: Flow A otomatis menjadikan Nanny sebagai kandidat [[Sesi Matching]] Orang Tua yang mengundang, dan memotong [[Kuota Koneksi]]-nya. Tujuan Undangan Psikotes untuk Nanny belum terdaftar berbeda — Orang Tua sekadar ingin tahu karakter kerja nanny kenalan pribadinya (misalnya ART langganan keluarga), belum tentu berniat memulai proses matching dengannya lewat platform.

## Opsi yang Dipertimbangkan

1. **Piggyback Flow A penuh** (rencana awal ADR-014) — ditolak: Nanny otomatis jadi kandidat matching & memotong Kuota Koneksi Orang Tua, padahal Orang Tua belum tentu mau itu.
2. **Akun mandiri terpisah, tidak menyentuh Flow A** (dipilih) — sistem membuat catatan Nanny (nama + HP) sendiri saat pembayaran berhasil, tidak terhubung sebagai kandidat matching siapa pun.

## Keputusan

**Dipilih: Opsi 2.**

- Saat pembayaran, backend cek nomor HP calon Nanny dulu:
  - **Sudah ada NannyProfile dengan nomor itu** → tidak bikin akun baru dobel, langsung pakai logic yang sama seperti "Kirim Undangan Psikotes" pada Nanny terdaftar (reuse `api/payment/psikotes-addon`). Ini juga otomatis menyelesaikan kasus dua Orang Tua berbeda yang kebetulan mengundang nomor HP yang sama — siapa pun yang bayar duluan membuat catatan Nanny-nya, pembayaran berikutnya untuk nomor yang sama masuk ke cabang ini.
  - **Belum ada** → buat `User` + `NannyProfile` minimal (nama + HP saja, tanpa password, `openToJob: false`, `isAvailable: false`), baru jalankan logic trigger psikotes yang sama.
- **Aktivasi akun**: WA via Fonnte berisi link OTP/set-password (pola sama dengan reset password yang sudah ada). Begitu Nanny set password, dia langsung login dan diarahkan **langsung ke** `/dashboard/nanny/tes-sikap-kerja` — skip onboarding profil penuh (foto, pengalaman, dll), karena tujuan dia diundang murni psikotes.
- Nanny hasil jalur ini **tidak otomatis jadi kandidat [[Sesi Matching]] siapa pun** dan **tidak memotong Kuota Koneksi siapa pun** — tetap murni psikotes sampai Nanny sendiri nanti mengisi [[Tes Kecocokan]] (Layer 1). Baru setelah itu berlaku aturan [[Talent Pool]] yang sudah ada (`surveyCompletedAt` terisi, `openToJob`, `isAvailable`).
- Ini merevisi ADR-014 poin 3. Poin 1, 2, dan 4 ADR-014 (dua jalur berdampingan, satu harga untuk dua hasil, tidak ada refund/expiry, istilah "Undangan Psikotes") tetap berlaku tanpa perubahan.

## Konsekuensi

**Positif:** tidak ada risiko Orang Tua "mengambil" kandidat matching tanpa sengaja hanya karena penasaran dengan karakter kerja nanny kenalannya — Undangan Psikotes murni transaksi psikotes, terpisah bersih dari [[Sesi Matching]].

**Negatif / catatan:**
- Perlu akun Nanny "shell" (belum lengkap: tanpa password, tanpa profil) yang tersimpan di database sebelum Nanny sempat login — perlu dipastikan saat implementasi akun ini tidak pernah muncul di direktori/Talent Pool sebelum lengkap. Secara alami sudah terjaga oleh syarat `surveyCompletedAt` [[Talent Pool]] yang sudah ada, tapi wajib diverifikasi lewat test saat dibangun.
- ADR-014 poin 3 sekarang usang khusus soal mekanisme registrasi — dokumen ADR-014 sendiri **tidak diedit** (mengikuti konvensi repo ini, lihat ADR-012 vs ADR-010), tapi pembaca wajib mengikuti ADR-017 ini untuk detail mekanisme yang benar.

## Catatan

- Ide terpisah yang muncul saat diskusi ini (**belum digarap, dicatat untuk nanti**): hasil Psikotes (Capture Work Style) berpotensi dipakai sebagai sinyal sekunder di AI matching (Domain A/B/C) — memperkaya interpretasi karakter kerja Nanny dibanding norma umum nanny di Indonesia, di atas sinyal utama dari 50 item [[Tes Kecocokan]]. Di luar cakupan ADR ini; perlu ADR/desain terpisah kalau nanti digarap.
