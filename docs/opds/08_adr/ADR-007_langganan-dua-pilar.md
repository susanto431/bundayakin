# ADR-007 — Langganan Dua Pilar: Nanny + Tumbuh Kembang

**Status:** Accepted
**Tanggal:** 2026-07-04
**Decider:** Kartika (produk/HCC) — hasil sesi grill terstruktur dengan Claude

---

## Konteks

Nilai langganan Rp 500rb/tahun selama ini hanya bercerita tentang nanny: akses Talent Pool, monitoring, dan berbagi profil anak. Tim HCC melihat masalah retensi: setelah nanny yang cocok ketemu, alasan orang tua memperpanjang langganan melemah. Tim mengusulkan nilai baru: penyimpanan data anak, edukasi parenting, dan pemantauan tumbuh kembang "seolah punya psikolog anak" — terinspirasi aplikasi Tentang Anak.

Kendala yang membatasi keputusan:
- BundaYakin tidak boleh terkesan memberi diagnosis psikologis via aplikasi (AI Governance; pesan psikolog tidak boleh diubah sistem).
- Psikolog HCC jumlahnya sedikit — kapasitas konsultasi dan produksi konten terbatas.
- Kompetitor tumbuh kembang (Tentang Anak, PrimaKu) gratis dan sudah besar.

## Opsi yang Dipertimbangkan

1. **Dua pilar** — matching nanny tetap cerita utama; Tumbuh Kembang menjadi pilar kedua (retensi).
2. **Reposisi total** — BundaYakin dijual sebagai aplikasi tumbuh kembang, nanny jadi pelengkap.
3. **Dua paket terpisah** — langganan nanny dan langganan tumbuh kembang dijual sendiri-sendiri.

## Keputusan

**Dipilih: Dua pilar.** Langganan Rp 500rb/tahun = (1) cari & pantau nanny — pilar akuisisi, pembeda unik yang sudah terbukti jalan; (2) **Tumbuh Kembang** — pilar retensi, alasan bertahan di tahun ke-2+.

Keputusan turunan yang mengikat:
- **Bukan "seolah-olah psikolog"** — aplikasi melakukan skrining berbasis instrumen resmi (KPSP Kemenkes, kurva WHO) lalu **eskalasi ke psikolog HCC sungguhan** (Konsultasi Psikolog Anak, add-on per sesi, harga khusus pelanggan). Klaim pemasaran: *"didampingi psikolog"*, bukan *"pengganti psikolog"*.
- **Konten edukasi:** AI menulis draft → psikolog HCC menyetujui → nama reviewer dicantumkan.
- **Batas premium:** pencatatan data gratis; interpretasi, rekomendasi, perpustakaan konten, pengingat, dan laporan PDF khusus pelanggan (konsisten dengan filosofi 22 Mei 2026).
- **Nanny ikut mencatat** (Log Harian Nanny) — ditarik maju dari Fasa 2; menjadi pembeda yang tidak bisa ditiru aplikasi parenting biasa.

## Konsekuensi

**Positif:** alasan perpanjangan langganan menguat; sinergi dua pilar ("nanny mencatat, psikolog memantau"); sumber pemasukan baru (Konsultasi Psikolog Anak); aset psikolog HCC termanfaatkan.

**Negatif / biaya:** cakupan produk melebar (butuh disiplin bertahap); komitmen produksi konten berkelanjutan; beban review psikolog HCC; fitur imunisasi menyentuh ranah kesehatan (perlu disclaimer non-medis); marketing perlu menceritakan dua pilar tanpa membingungkan.

**Detail scope & tahapan:** lihat [PRD Tumbuh Kembang](../13_prd_tumbuh_kembang.md).
