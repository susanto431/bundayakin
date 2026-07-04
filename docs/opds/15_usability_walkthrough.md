# Usability Walkthrough — Skenario "User Bingung Klik ke Mana?"
## BundaYakin — Cognitive Walkthrough berbasis ui-ux-pro-max

> Versi 1.0 · Juli 2026
> Metode: **cognitive walkthrough** — Claude berperan sebagai user dengan skenario nyata, menelusuri layar demi layar di kode aktual, menandai titik bingung memakai guideline UX (navigasi, discoverability, escape route, empty state).
> Catatan jujur: ini *bukan pengganti* usability testing dengan user sungguhan — ini versi pakar yang menangkap ±70% masalah paling fatal. Untuk sisanya, uji dengan 5 ibu sungguhan (cukup 5; riset Nielsen menunjukkan 5 user menemukan ~85% masalah).

**Skala keparahan:** 🔴 user buntu/tersesat · 🟠 user ragu tapi bisa lanjut · 🟡 kosmetik

---

## Skenario 1 — "Bunda Sari (akun GRATIS) baru daftar, mau cari nanny"

| Langkah | Yang dilihat user | Penilaian |
|---|---|---|
| Buka app → tab **Cari Nanny** | Halaman matching: form undang nanny + kartu AI Talent Pool (terkunci) | ✔ Jalur A terlihat jelas |
| Penasaran, tap **AI Talent Pool** → halaman langganan | Kartu ungu "Fitur Pelanggan" + tombol langganan + link "Kembali ke dashboard" | 🔴 **Temuan #1** |

**🔴 Temuan #1 — Paywall Talent Pool adalah jalan buntu.** Bunda datang ingin *nanny*, bukan ingin *langganan*. Halaman paywall (`cari-nanny/page.tsx`) hanya menawarkan dua pintu: bayar, atau kembali. Tidak ada satu kalimat pun: *"Belum siap langganan? Bunda tetap bisa mengundang nanny yang Bunda kenal — gratis 3×/bulan"* + tombol ke halaman undangan. Melanggar guideline `escape-routes` & `empty-nav-state`.
**Fix:** tambah satu link sekunder di bawah tombol langganan → ke `/dashboard/parent/matching`.

## Skenario 2 — "Bunda Sari mengundang nanny kenalannya, lalu menunggu hasilnya"

| Langkah | Yang dilihat user | Penilaian |
|---|---|---|
| Bagikan kode undangan via WA | Form + kode jelas | ✔ |
| Nanny mengisi survey… beberapa hari berlalu | **Tidak ada apa-apa.** Sistem membuat notifikasi `MATCHING_READY` — tapi **parent tidak punya halaman notifikasi** | 🔴 **Temuan #2** |
| Bunda kebetulan buka tab Cari Nanny lagi | Daftar "Nanny yang sudah diundang" + status | ✔ kalau dia tahu harus ke sana |

**🔴 Temuan #2 — Momen paling penting tidak sampai ke user.** Hasil matching adalah puncak nilai produk, tapi Bunda hanya tahu kalau *kebetulan* membuka halaman yang tepat. Notifikasi tersimpan di database tapi tidak ada lonceng/halaman untuk membacanya (nanny punya, parent tidak — asimetri yang sudah tercatat di UI/UX review §4.3).
**Fix (prioritas tertinggi):** halaman notifikasi parent + badge angka di bottom nav. Nilai bonus: kirim juga via WhatsApp (user Indonesia hidup di WA).

## Skenario 3 — "Sus Yanti (nanny baru) daftar, lalu bertanya: sekarang apa?"

| Langkah | Yang dilihat user | Penilaian |
|---|---|---|
| Selesai daftar → beranda nanny | Ada ajakan Tes Kecocokan + daftar manfaatnya (badge, dll) | ✔ arah jelas |
| Selesai survey, belum ada yang mengundang | Beranda + tombol bagikan ke WA | 🟠 **Temuan #3** |

**🟠 Temuan #3 — Setelah survey, nanny masuk "ruang tunggu" tanpa kepastian.** Tidak ada penjelasan *apa yang terjadi sekarang*: apakah profilku sudah bisa ditemukan keluarga? Harus nyalakan "Siap Kerja" dulu? (Ya — tapi tidak ada yang memberitahunya di momen itu.)
**Fix:** setelah survey selesai, tampilkan kartu "Langkah terakhir: nyalakan *Siap Kerja* supaya keluarga bisa menemukan Sus" + toggle langsung di situ.

## Skenario 4 — "Nanny Bunda Rina berhenti di hari ke-20" (alur baru Jaminan Kecocokan)

| Langkah | Yang dilihat user | Penilaian |
|---|---|---|
| Ingin melapor nanny berhenti… ke mana? | Bottom nav: Beranda · Cari Nanny · Catatan · Akun — **tidak ada "Pemantauan"** | 🟠 **Temuan #4** |
| (Kalau ketemu) halaman Pemantauan | Kartu "Nanny sudah tidak bekerja?" → alasan → jaminan terbit → form rekam jejak → "Cari nanny lagi — gratis" | ✔ alur baru runtut |
| Buka kontak nanny baru (kuota tidak terpotong) | Tidak ada penanda bahwa ini berkat jaminan | 🟡 **Temuan #5** |

**🟠 Temuan #4 — Pemantauan tidak ada di navigasi utama.** Ia hanya muncul sebagai kartu di Beranda saat ada check-in pending. Bunda yang panik karena nanny-nya kabur tidak berpikir "check-in" — dia mencari menu. **Fix:** tautan "Pemantauan" permanen di Beranda (bukan hanya saat ada jadwal), atau pertimbangkan masuk bottom nav (masih muat: 4→5 item).
**🟡 Temuan #5:** tampilkan badge kecil "Gratis — Jaminan Kecocokan" saat unlock kontak agar user sadar sedang memakai haknya.

## Skenario 5 — "Bunda ingin tahu kenapa harus bayar 500rb"

Halaman langganan & pricing sudah ada dan bisa dijangkau dari beberapa pintu (settings, paywall, banner) ✔. Tidak ada temuan besar.

---

## Ringkasan & Urutan Perbaikan

| # | Temuan | Keparahan | Status |
|---|---|---|---|
| 2 | Parent tidak punya halaman notifikasi → hasil matching tidak pernah "sampai" | 🔴 | ✅ **Diperbaiki Juli 2026** — halaman `/dashboard/parent/notifications` + lonceng berbadge angka di Beranda |
| 1 | Paywall Talent Pool buntu — tidak menawarkan jalur gratis (undangan) | 🔴 | ✅ Diperbaiki — kartu "Belum siap berlangganan?" + link undang nanny gratis |
| 4 | Pemantauan tersembunyi dari navigasi | 🟠 | ✅ Diperbaiki — link "Kelola penugasan →" permanen di Beranda |
| 3 | Nanny pasca-survey tidak dituntun menyalakan "Siap Kerja" | 🟠 | ✅ Diperbaiki — kartu "Langkah terakhir" + tombol aktivasi langsung |
| 5 | Pemakaian jaminan tidak diberi penanda saat unlock | 🟡 | ✅ Diperbaiki — label tombol & badge "Gratis — Jaminan Kecocokan" |

Bonus perbaikan: emoji 🔔 di beranda nanny diganti ikon SVG (konsistensi ikon, temuan UI/UX review).

## Cara Melakukan Usability Testing Sungguhan (nanti, murah)

1. Ajak **5 ibu** yang sesuai ICP (bukan teman kantor yang sudah tahu produknya).
2. Beri tugas tanpa petunjuk: *"Coba temukan nanny lewat aplikasi ini"*, *"Nanny kamu berhenti — apa yang kamu lakukan di aplikasi?"*
3. Aturan emas: **jangan menolong, jangan menjelaskan** — hanya amati di mana mereka berhenti/salah klik.
4. Catat per tugas: berhasil/gagal, berapa lama, di mana ragu. 5 orang × 30 menit = cukup untuk menemukan mayoritas masalah nyata.

---

*Rujukan: [UI/UX Review](11_ui_ux_review.md) · [Matriks Layanan](12_matriks_layanan.md) · [Positioning](14_positioning.md)*
