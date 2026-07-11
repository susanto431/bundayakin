# ADR-014: Undangan Psikotes — jalur berbayar berdampingan dengan self-service

**Status**: accepted (11 Juli 2026)

## Konteks

Sebelum ADR ini, Nanny mengerjakan Capture Work Style (Psikotes Sikap Kerja, Layer 2) murni self-service gratis — Orang Tua hanya bisa bayar Rp300rb untuk *membuka hasil* Nanny yang sudah selesai isi. Orang Tua tidak punya cara memicu Nanny tertentu (terutama yang belum aktif di platform) untuk mengerjakannya.

Permintaan produk: Orang Tua ingin bisa mengklik dari profil Nanny, membayar, dan itu men-trigger Nanny mengerjakan psikotes — termasuk untuk Nanny yang baru dikenal Orang Tua secara personal (belum tentu terdaftar lengkap).

## Keputusan

1. **Dua jalur berdampingan, bukan saling gantikan.** Sempat dipertimbangkan mematikan self-service sepenuhnya (psikotes wajib lewat undangan berbayar), tapi dibatalkan — self-service dipertahankan karena tiap Nanny yang mengisi mandiri menambah data ke seluruh pool platform (kualitas Talent Pool, materi marketing), bukan cuma bernilai untuk satu Orang Tua yang kebetulan membayar.
2. **Satu harga untuk dua hasil berbeda.** "Undangan Psikotes" (Rp300rb, sinkron dengan setting harga admin yang sama dengan buka-hasil) dipicu dari satu tombol di `NannyDetailDrawer` yang teksnya berubah sesuai status Nanny: "Kirim Undangan Psikotes" (Nanny belum isi — pembayaran memicu dia mengerjakan, Orang Tua otomatis dapat akses begitu selesai) atau "Lihat Hasil Psikotes" (Nanny sudah isi — pembayaran langsung membuka hasil).
3. **Tidak ada refund/expiry**, karena waktu Nanny menyelesaikan tes tidak bisa dijamin platform. Untuk mengurangi risiko "uang menggantung", sistem mengirim reminder WA berkala (via Fonnte, integrasi yang sudah dipakai untuk OTP) ke Nanny sampai ia menyelesaikan.
4. Istilah **"Undangan Psikotes"** dipilih (bukan "Assignment"/"Penugasan Psikotes") karena "Penugasan (NannyAssignment)" sudah dipakai untuk konsep berbeda — hubungan kerja aktif nanny-keluarga.

## Konsekuensi

- Orang Tua bisa membayar Rp300rb untuk Nanny yang ternyata tidak pernah menyelesaikan tes, tanpa kepastian waktu atau jalan refund — risiko keluhan CS perlu dipantau pasca-launch; copy UI wajib menyampaikan ini secara jujur di titik pembayaran.
- Skema harga tunggal untuk dua hasil berbeda (instan vs menunggu) disengaja demi kesederhanaan; kalau data pasca-launch menunjukkan keluhan signifikan soal jalur "menunggu", opsi lanjutan adalah membedakan harga atau menambah SLA/refund — dibahas ulang saat itu terjadi, bukan diantisipasi sekarang.
- Alur untuk Nanny yang belum terdaftar di platform (dikenal personal oleh Orang Tua) menumpang pada mekanisme kode undangan registrasi yang sudah ada (Flow A / Referral) — bukan sistem terpisah.
