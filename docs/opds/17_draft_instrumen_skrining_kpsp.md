# Instrumen Skrining Perkembangan (KPSP)
## Status, Sumber, dan Aturan Operasional

> Versi 1.0 · Juli 2026 · **STATUS: TERVALIDASI — sumber resmi diterima & ditranskripsi**
> Prasyarat Tahap 2 Tumbuh Kembang ([PRD 13 §7](13_prd_tumbuh_kembang.md)) — **terpenuhi**.

---

## Sumber

**"Buku Panduan Kuesioner Pra Skrining Perkembangan (KPSP)"**, disusun oleh Dr. dr. Martira Maddeppungeng Sp.A(K), Clinical Skill Lab Siklus Hidup CSL 5, Fakultas Kedokteran Universitas Hasanuddin, 2018. Mengacu pada **Pedoman Pelaksanaan Stimulasi Deteksi dan Intervensi Dini Tumbuh Kembang (SDIDTK), Depkes RI, 2010**.

Diserahkan oleh Kartika (HCC) — Juli 2026. Seluruh 16 formulir (usia 3–72 bulan, total 158 pertanyaan) sudah ditranskripsi ke `apps/web/src/lib/kpsp-instrument.ts`.

**Catatan transkripsi:** teks disalin dari hasil OCR buku panduan; beberapa artefak OCR (typo, pecahan header tabel yang nyasar ke tengah kalimat, penomoran ganda pada formulir 15 bulan) dirapikan agar terbaca wajar tanpa mengubah substansi pertanyaan. Kode telah diverifikasi: setiap kelompok usia berisi 9–10 pertanyaan sesuai rentang resmi.

## Aturan Operasional (dari buku panduan — dikodekan di `kpsp-scoring.ts`)

| Aturan | Detail |
|---|---|
| Kelompok usia | 3, 6, 9, 12, 15, 18, 21, 24, 30, 36, 42, 48, 54, 60, 66, 72 bulan |
| Pembulatan usia | Usia >16 hari melewati bulan penuh → dibulatkan ke atas 1 bulan |
| Usia koreksi (prematur) | Usia kehamilan ≤35 minggu DAN usia kronologis <24 bulan → usia dikoreksi. Field baru: `ChildProfile.gestationalWeeksAtBirth` |
| Pemilihan formulir | Kalau usia anak tidak tepat di salah satu titik skrining, pakai formulir **terdekat yang LEBIH MUDA** (bukan pembulatan/interpolasi) |
| Jadwal ulang | Setiap 3 bulan untuk usia <24 bulan; setiap 6 bulan untuk 24–72 bulan |
| Skor | Hitung jumlah "Ya": **9–10 = Sesuai · 7–8 = Meragukan · <6 = Penyimpangan** |

## Interpretasi ke Orang Tua (non-klinis)

Istilah resmi ("Meragukan", "Penyimpangan") tidak ditampilkan apa adanya ke orang tua — sesuai aturan lama proyek (istilah klinis tidak boleh muncul di UI orang tua, framing selalu ramah). Pemetaan yang dipakai (`KPSP_CATEGORY_LABEL`/`KPSP_CATEGORY_MESSAGE` di `kpsp-scoring.ts`), diadaptasi dari bagian INTERVENSI buku panduan:

| Kategori resmi | Label di app | Pesan (ringkas) |
|---|---|---|
| Sesuai | "Sesuai usia" | Pujian + anjuran lanjutkan stimulasi rutin |
| Meragukan | "Perlu distimulasi lebih" | Anjuran stimulasi lebih intensif 2 minggu, lalu skrining ulang |
| Penyimpangan | "Sebaiknya konsultasi" | Arahan ke Konsultasi Psikolog Anak — **selalu ditulis "arahan, bukan diagnosis"** |

## Yang Belum Selesai (di luar cakupan validasi instrumen ini)

- **Item dengan alat bantu visual** (gambar lingkaran, segi empat 4 warna, dua garis beda panjang, tanda silang/kotak, gambar 5 binatang, kubus) — ditandai `visualAid` di data, perlu dirender sebagai SVG/CSS sederhana di UI. Tidak butuh recognition otomatis — sama seperti formulir kertas, orang tua yang menilai sendiri hasil anaknya secara subjektif.
- **Alat bantu fisik** yang disebut buku panduan (bola, boneka, kubus 2,5 cm, benang wol merah, kertas, krayon, kismis, kerincingan, lonceng) — orang tua memakai barang rumah tangga yang mirip; tidak perlu kit khusus.
- **API/UI/Portal Psikolog** untuk Tahap 2 belum dibangun — instrumen & logikanya sudah siap, tinggal dirangkai jadi fitur.

---

*Rujukan: [PRD Tumbuh Kembang](13_prd_tumbuh_kembang.md) · [AI Governance](09_ai_governance.md) · `apps/web/src/lib/kpsp-instrument.ts` · `apps/web/src/lib/kpsp-scoring.ts`*
