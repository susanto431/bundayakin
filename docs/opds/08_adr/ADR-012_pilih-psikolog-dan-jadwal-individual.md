# ADR-012 — Orang Tua Bisa Pilih Psikolog Spesifik & Psikolog Atur Jadwal Sendiri
**Status:** Accepted
**Tanggal:** 2026-07-11
**Decider:** Kartika (produk) — sesi grill-with-docs

## Konteks

Peluncuran awal Konsultasi Psikolog Anak (PRD §7b, 8 Juli 2026) sengaja menyembunyikan pilihan psikolog: jam sama untuk semua psikolog (Slot Konsultasi 09:00/13:00/16:00), orang tua hanya pilih tanggal+jam, sistem menugaskan psikolog di belakang layar tanpa nama tampil. Psikolog juga belum atur jadwal masing-masing — semua dianggap punya jam yang sama, hanya kapasitas/hari yang beda.

Kartika melaporkan halaman booking menampilkan semua slot "Penuh" terus, dan mempertanyakan apakah nama psikolog perlu ditampilkan. Investigasi menemukan dua hal sekaligus:
1. Kode (`LAUNCH_ASSIGNMENT_LEVEL = "SENIOR"`) tidak sinkron dengan keputusan harga (peluncuran pakai level Mid) — kemungkinan besar penyebab bug "selalu Penuh".
2. Alasan Kartika ingin menampilkan psikolog adalah **kontinuitas** (orang tua mau lanjut dengan psikolog yang sama) dan **kecocokan pengalaman** (lihat jam terbang sebelum memilih) — bukan sekadar transparansi nama.

## Opsi yang Dipertimbangkan
1. **Tetap anonim** (status quo) — paling sederhana, tapi tidak mendukung kontinuitas/kecocokan pengalaman yang jadi kebutuhan nyata.
2. **Pilih psikolog dulu, baru tanggal** — mendukung kontinuitas, tapi menyulitkan orang tua yang cuma mau tanggal tertentu tanpa peduli siapa psikolognya.
3. **Pilih tanggal dulu, baru lihat psikolog tersedia** — mendukung orang yang fleksibel soal psikolog, tapi menyulitkan orang yang sudah punya psikolog langganan.
4. **Dua-duanya sekaligus** (dipilih) — dua pintu masuk, ujung sama (tanggal+jam+psikolog terpilih).

## Keputusan

**Dipilih: Opsi 4 — dua pintu masuk booking.** Orang tua bisa mulai dari "pilih psikolog" (lihat profil, Jam Terbang Psikolog, tanda "pernah menangani anak ini" bila ada riwayat) atau mulai dari "pilih tanggal" (lihat psikolog mana yang tersedia di jam-jam itu).

Konsekuensi turunan yang ikut diputuskan di sesi yang sama:
- **Jadwal Psikolog individual** dibangun: psikolog atur pola mingguan berulang (on/off per hari-dalam-minggu dari 3 Slot Konsultasi baku) + tanggal cuti, lewat Portal Psikolog. Jam tetap dibatasi ke 3 jam baku (09:00/13:00/16:00) — tidak ada rentang jam bebas — supaya aturan kapasitas 3-5 sesi/hari tidak perlu berubah.
- **Jam Terbang Psikolog** (jumlah sesi selesai = jam pengalaman) ditampilkan publik ke orang tua.
- **Ulasan Psikolog** (rating + pilihan ganda + esai, opsional dengan ajakan halus) ditambahkan, tapi hanya untuk pemantauan kualitas internal HCC — tidak pernah tampil ke orang tua lain.
- **Bug level assignment**: `LAUNCH_ASSIGNMENT_LEVEL` harus `"MID"`, bukan `"SENIOR"` — diperbaiki mengikuti keputusan ini.

Detail lengkap: [PRD Tumbuh Kembang §7c](../13_prd_tumbuh_kembang.md), glossary [CONTEXT.md](../../../CONTEXT.md) (Jadwal Psikolog, Ulasan Psikolog, Jam Terbang Psikolog).

## Konsekuensi

**Positif:** booking terasa lebih personal & mendukung hubungan jangka panjang orang tua–psikolog; kapasitas platform makin akurat karena availability dihitung per-psikolog (bukan pool level), yang sekaligus memperbaiki bug availability yang dilaporkan.

**Negatif / catatan:** menggantikan sebagian keputusan §7b poin 5 (jam sama rata tanpa jadwal individual) — kompleksitas booking naik (perlu UI kalender per-psikolog, data riwayat psikolog per anak, dan form Jadwal Psikolog di Portal Psikolog yang sebelumnya tidak ada). Kapasitas 3-5 sesi/hari/psikolog tetap berlaku sebagai batas atas, sekarang lebih relevan karena tiap psikolog bisa punya hari aktif yang berbeda-beda.
