# Usability Walkthrough Putaran 2 — Alur Pembayaran & Langganan
## BundaYakin — Cognitive Walkthrough berbasis ui-ux-pro-max

> Versi 1.0 · Juli 2026
> Metode sama seperti putaran 1 ([15_usability_walkthrough.md](15_usability_walkthrough.md)): Claude berperan sebagai user, menelusuri kode aktual alur pembayaran/langganan/placement, menandai titik bingung dengan guideline UX.

**Skala keparahan:** 🔴 user buntu/tersesat · 🟠 user ragu tapi bisa lanjut · 🟡 kosmetik · ✅ sudah baik

---

## Skenario 1 — "Bunda baru daftar, langsung tap Aktifkan Langganan"

| Langkah | Yang terjadi | Penilaian |
|---|---|---|
| Tap "Aktifkan Sekarang — Rp 500.000" | `api/payment/create` mengecek email & nomor HP dulu | |
| Ternyata belum isi nomor HP | Response error: *"Nomor HP diperlukan untuk pembayaran. Tambahkan nomor HP di halaman profil."* — muncul sebagai teks merah kecil di bawah tombol | 🔴 **Temuan #1** |

**🔴 Temuan #1 — Error memberi instruksi tapi tidak memberi jalan.** Pesan sudah bagus (`error-clarity`: sebab + cara memperbaiki ada), tapi **tidak ada link** ke halaman profil tempat memperbaikinya (`error-recovery`). Bunda harus keluar sendiri dari halaman langganan, menebak menu profil ada di mana, lalu kembali. Sama persis terjadi untuk email kosong.
**Fix:** ubah pesan error jadi tautan langsung ke `/dashboard/parent/profile`.

## Skenario 2 — "Bunda sudah bayar di Mayar, kembali ke app, menunggu"

| Langkah | Yang terjadi | Penilaian |
|---|---|---|
| Redirect balik dari Mayar → `?payment=finish` | `PaymentReturnBanner` tampil: "Memeriksa ulang dalam 5 detik..." | ✔ pola loading yang baik |
| Webhook Mayar delay > 5 detik (jaringan lambat, hal wajar) | Countdown berhenti di **"0 detik..."** — selamanya. Tidak ada refresh otomatis kedua, tidak ada tombol coba lagi, tidak ada kontak CS | 🔴 **Temuan #2** |

**🔴 Temuan #2 — Banner berhenti di angka nol tanpa jalan keluar.** `PaymentReturnBanner.tsx` hanya menjadwalkan **satu kali** `router.refresh()`. Kalau webhook belum sampai saat itu (bisa terjadi — webhook bergantung Mayar, bukan instan), Bunda melihat pesan "sedang diproses" yang berhenti berdetak, padahal duitnya sudah keluar. Ini momen paling menegangkan dalam alur pembayaran — user butuh kepastian bahwa sistem masih bekerja.
**Fix:** setelah countdown habis dan status belum aktif, ganti ke tombol "Cek status pembayaran" (manual refresh) + link WhatsApp CS sebagai jaring pengaman.

## Skenario 3 — "Bunda SUDAH berlangganan, tapi kuota AI Talent Pool habis" ⚠️ paling tajam

| Langkah | Yang terjadi | Penilaian |
|---|---|---|
| Tap unlock kontak nanny ke-8 (kuota 7 habis) | `UnlockContactButton` menampilkan: *"Kuota koneksi habis... Upgrade langganan untuk mendapatkan lebih banyak koneksi"* + tombol ke `/dashboard/parent/subscription` | |
| Tap tombol itu | Sampai di halaman langganan → karena **sudah aktif**, halaman hanya menampilkan kartu "Langganan Aktif" + daftar fitur + tombol **Batalkan Langganan** — **tidak ada cara membeli koneksi tambahan** | 🔴 **Temuan #3** |

**🔴 Temuan #3 — Pelanggan yang SUDAH bayar diarahkan ke jalan buntu, bukan ke cara membayar lagi.** Root cause: `TransactionType.CONNECTION_ADDON` sudah ada di schema dan `EXTRA_CONNECTION_FEE_IDR` (Rp 100rb) sudah jadi konstanta — tapi **tidak ada API maupun halaman untuk benar-benar membelinya** (dikonfirmasi: hanya ada komentar `// belum diimplementasi` di `api/matching/unlock/route.ts`). Ini bukan cuma masalah UX teks — **fiturnya memang belum ada**. Bagi user, "upgrade langganan" untuk orang yang sudah berlangganan adalah kalimat yang tidak masuk akal — rasa percaya ke produk bisa turun di titik ini.
**Rekomendasi:** bukan quick-win teks — ini butuh keputusan produk: bangun alur pembayaran `CONNECTION_ADDON` (invoice Mayar + webhook handler baru, mengikuti pola `PLACEMENT_FEE`), ATAU untuk sementara ubah pesan agar jujur: arahkan ke WhatsApp CS untuk top-up manual, bukan link mati ke halaman yang tidak menawarkan apa pun.

## Skenario 4 — "Bunda ingin membatalkan langganan"

| Langkah | Yang terjadi | Penilaian |
|---|---|---|
| Tap "Batalkan Langganan" | Muncul konfirmasi jelas: apa yang terjadi, sampai kapan akses tetap aktif, apa yang hilang | ✅ |
| Konfirmasi | Status "done" menjelaskan ulang tanggal berakhir | ✅ |

**Tidak ada temuan.** Alur ini contoh yang baik: `confirmation-dialogs`, `destructive-emphasis` (warna merah, terpisah dari CTA utama), dan `error-clarity` semua terpenuhi.

## Skenario 5 — "Bunda konfirmasi penempatan & bayar placement fee"

Sudah diperkuat di paket Jaminan Kecocokan (badge gratis, harga dicoret). Satu catatan kecil: pesan idempotency *"Penempatan untuk matching ini sudah dikonfirmasi"* muncul sebagai error merah — padahal ini bukan kegagalan, melainkan sukses yang tertunda (biasanya terjadi kalau Bunda menekan tombol dua kali). 🟡 **Temuan #4** — kosmetik, ubah ke pesan netral/positif, bukan warna merah.

## Skenario 6 — Halaman pembayaran tidak punya jaring pengaman CS

Ditelusuri di seluruh `subscription/page.tsx`, `MayarButton`, `PlacementClient`: **tidak ada satu pun link WhatsApp/CS** untuk kasus pembayaran bermasalah — padahal halaman lain di app (unlock kontak, dsb.) rutin menyediakan link `wa.me`. 🟠 **Temuan #5.**

---

## Ringkasan & Rekomendasi

| # | Temuan | Keparahan | Sifat |
|---|---|---|---|
| 3 | Pelanggan aktif kehabisan kuota → jalan buntu (fitur CONNECTION_ADDON belum ada) | 🔴 | ✅ Selesai — checkout otomatis dibangun (keputusan Kartika, Juli 2026) |
| 2 | Banner "menunggu webhook" macet di 0 detik tanpa retry manual | 🔴 | Quick win |
| 1 | Error email/nomor HP kosong tanpa link ke profil | 🔴 | Quick win |
| 5 | Tidak ada jaring pengaman CS di halaman pembayaran | 🟠 | Quick win |
| 4 | Pesan idempotency placement diwarnai merah padahal bukan kegagalan | 🟡 | Quick win |

**Status implementasi (Juli 2026):**
- ✅ #1 — error email/HP kosong sekarang menautkan langsung ke halaman profil
- ✅ #2 — banner pembayaran menampilkan tombol "Cek status pembayaran" + link CS setelah auto-refresh pertama, tidak lagi macet di "0 detik"
- ✅ #3 (selesai penuh, Juli 2026) — **checkout Connection Add-on otomatis dibangun**, menggantikan CS manual sepenuhnya (keputusan Kartika): tombol "Bayar — buka kontak ini" saat kuota habis (Referral, Rp100rb) atau selalu (Talent Pool, Rp250rb — lihat [ADR-016](08_adr/ADR-016_talent-pool-kontak-selalu-berbayar.md), 11 Juli 2026), invoice Mayar via `api/payment/connection-addon`, webhook handler baru (`handleConnectionAddonSuccess`), dan polling otomatis pasca-redirect (5× percobaan, konsisten dengan pola temuan #2) sebelum menawarkan "Cek status pembayaran" manual
- ✅ #4 — idempotency placement mengarahkan ke dashboard (bukan menampilkan error merah)
- ✅ #5 — halaman langganan menambahkan link "Hubungi CS" untuk kendala pembayaran

---

*Rujukan: [Usability Walkthrough #1](15_usability_walkthrough.md) · [UI/UX Review](11_ui_ux_review.md) · [Feature Registry](05_feature_registry.md)*
