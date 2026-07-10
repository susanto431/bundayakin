# ADR-010 — Portal Psikolog & Konsultasi Psikolog Anak: Built-in di `apps/web`

**Status:** Accepted
**Tanggal:** 2026-07-08
**Decider:** Kartika (produk) — dieksekusi Claude

---

## Konteks

ADR-009 memisahkan Psikotes (Layer 2) jadi service tersendiri karena instrumennya adalah aset HCC lintas produk. Portal Psikolog + Konsultasi Psikolog Anak (Tahap 2 pilar Tumbuh Kembang) belum punya keputusan serupa — perlu dikonfirmasi apakah preseden yang sama berlaku, mengingat psikolog HCC yang sama berpotensi juga terlibat di produk HCC lain (assessment center, psikogram, interview psikotes).

## Opsi yang Dipertimbangkan

1. **Service terpisah lintas produk HCC** (mengikuti pola ADR-009) — satu jadwal & kapasitas psikolog untuk semua pekerjaan HCC, tidak ada risiko bentrok jadwal antar produk. Tapi butuh aplikasi/infrastruktur baru sekarang, padahal produk HCC lain yang disebut (assessment center, psikogram, interview psikotes) belum konkret dibangun/berjalan.
2. **Built-in di `apps/web`** (dipilih) — mengikuti pola KPSP: konsultasi ini konteksnya spesifik "anak dari pelanggan BundaYakin", jadwal & data psikolog cukup menyatu dengan profil anak/orang tua yang sudah ada.

## Keputusan

**Dipilih: Opsi 2 — built-in di `apps/web`.**

Rencana psikolog melayani produk HCC lain (assessment center, psikogram, interview psikotes) masih rencana jangka panjang yang belum pasti jalannya dalam waktu dekat — membangun infrastruktur terpisah sekarang untuk kebutuhan yang belum konkret tidak sepadan, terutama karena tim (satu developer) sudah akan mengoperasikan pdf-service + rencana psikotes-service. Prinsip: lebih mudah memisahkan fitur nanti kalau memang dibutuhkan, daripada menyatukan kembali fitur yang sudah kadung dipisah.

## Konsekuensi

**Positif:** jauh lebih cepat & murah dibangun; data konsultasi langsung terikat ke `ChildProfile` yang sudah ada tanpa sinkronisasi antar sistem.

**Negatif / catatan:** kalau di masa depan psikolog HCC memang jadi bertugas lintas produk, jadwal & kapasitasnya akan terpecah antar sistem (BundaYakin vs produk HCC lain) sampai ada keputusan pemisahan baru — risiko ini diterima sadar oleh Kartika, bukan diabaikan. Kalau rencana lintas-produk itu terwujud, revisit ADR ini.
