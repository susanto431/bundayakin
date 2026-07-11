# ADR-016 — AI Talent Pool: Buka Nomor WA Nanny Selalu Berbayar (Rp 250rb), Bukan Lagi Kuota Gratis

**Status:** Accepted
**Tanggal:** 2026-07-11
**Decider:** Kartika (produk) — dieksekusi Claude

---

## Konteks

Sejak model Kuota Koneksi dibangun (17 Mei 2026), pelanggan aktif (Rp 500rb/tahun) mendapat 7 buka-kontak Talent Pool gratis per 30 hari, sebagai bagian dari nilai langganan. Setelah kuota habis, baru ada opsi bayar Rp 100rb/kontak (Connection Add-on, ADR terkait di [Pricing Config Panel](ADR-008_pricing-config-panel.md)).

Kartika ingin ini diubah: nomor WhatsApp nanny di AI Talent Pool adalah data berharga milik bisnis — memberikannya gratis lewat kuota (walau dibatasi 7/bulan) dianggap terlalu murah/rugi. Prinsipnya sama seperti InMail LinkedIn: melihat profil & skor kecocokan tetap termasuk dalam langganan, tapi **membuka kontak nanny asing selalu perlu transaksi terpisah.**

Jalur Referral (Flow A — mengundang nanny yang sudah dikenal orang tua) **tidak termasuk** perubahan ini: 3 undangan gratis/30 hari tetap berlaku, karena orang tua sudah punya hubungan dengan nanny tersebut (bukan "mengambil data" nanny asing dari direktori).

## Opsi yang Dipertimbangkan

1. **Naikkan harga Connection Add-on dari Rp100rb → Rp250rb, kuota gratis tetap ada** — hanya menaikkan harga setelah kuota habis, tidak menyentuh nilai gratis 7/bulan. Ditolak: tidak menjawab keberatan Kartika bahwa kuota gratis itu sendiri yang dianggap merugikan.
2. **Rp250rb menggantikan seluruhnya untuk Talent Pool, kuota dihapus total (dipilih)** — setiap buka kontak dari AI Talent Pool selalu memicu pembayaran Rp250rb, tanpa jalur gratis, walau pelanggan aktif. Referral tidak terpengaruh.
3. **Rp250rb berlaku untuk semua flow (Referral + Talent Pool)** — ditolak, di luar cakupan yang diminta; mengundang nanny kenalan sendiri secara konsep berbeda dari "membeli akses ke data nanny asing".

## Keputusan

**Dipilih: Opsi 2.**

- Kunci pricing baru: `TALENT_POOL_CONTACT_FEE_IDR` (default Rp 250.000, dikelola lewat [Pricing Config Panel](ADR-008_pricing-config-panel.md) seperti key lain — tidak di-hardcode).
- `POST /api/matching/unlock` menolak unconditional untuk `flowType: TALENT_POOL` (kecuali pemegang Jaminan Kecocokan aktif — itu tetap gratis, tidak berubah) — tidak ada lagi jalur "pakai kuota" untuk Talent Pool.
- `POST /api/payment/connection-addon` sekarang membaca fee berdasarkan `flowType`: `TALENT_POOL_CONTACT_FEE_IDR` (Rp250rb) untuk Talent Pool, `CONNECTION_ADDON_FEE_IDR` (Rp100rb, tidak berubah) untuk Referral setelah kuota referralnya habis.
- `UnlockContactButton` sekarang selalu menampilkan tombol bayar untuk `flowType="TALENT_POOL"`, tidak pernah tombol "pakai kuota gratis".
- `TALENT_POOL_QUOTA` (7/30 hari) **tidak dihapus dari skema** — baris `ConnectionQuota` tetap dibuat untuk kompatibilitas historis/pelaporan, tapi nilainya tidak lagi dipakai untuk menggratiskan unlock kontak apa pun. Kalau nanti kuota ini mau dipakai ulang untuk hal lain (mis. membatasi berapa kali direktori bisa di-refresh), field-nya sudah tersedia.

## Konsekuensi

**Positif:** setiap buka kontak Talent Pool sekarang jadi pendapatan langsung, konsisten dengan intent bisnis "data kontak nanny adalah aset berbayar".

**Negatif / catatan:**
- **Copy marketing/UI belum disinkronkan penuh** — beberapa layar masih menampilkan "Sisa N× koneksi" untuk Talent Pool (Beranda parent, halaman Matching Jalur B, header AI Talent Pool) seolah masih ada kuota gratis. Ini murni salinan teks yang menyesatkan sekarang, **BELUM diperbaiki di perubahan ini** — perlu keputusan Kartika soal kalimat penggantinya sebelum diubah (lihat follow-up terpisah).
- **Halaman legacy `/dashboard/parent/cari-nanny/direktori`** (dipakai dari link admin `matching-overview` dan redirect pasca-bayar Psikotes Add-on) masih memakai jalur pembayaran lama yang hardcode "Rp 100.000" di `NannyDetailDrawer` (cabang non-`flowType`) — **belum ikut diperbaiki**, perlu review terpisah karena tidak jelas apakah halaman ini masih dipakai orang tua atau sudah jadi admin-only.
- **Skema Prisma bertambah satu nilai enum** (`TALENT_POOL_CONTACT_FEE_IDR` di `PricingConfigKey`) — `npx prisma generate` sudah dijalankan (aman, tidak menyentuh database), tapi `npx prisma db push`/`migrate` ke database **belum dijalankan**, menunggu konfirmasi eksplisit sebelum menyentuh skema production.
- Sesuai prinsip [ADR-008](ADR-008_pricing-config-panel.md): perubahan ini tidak retroaktif — kontak yang sudah terbuka sebelumnya tidak terpengaruh; hanya unlock BARU setelah perubahan ini live yang kena aturan baru.
