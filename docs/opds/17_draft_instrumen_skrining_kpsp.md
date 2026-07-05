# Draft Instrumen Skrining Perkembangan (basis KPSP)
## Untuk Validasi Psikolog / Tenaga Medis HCC

> Versi 0.1 · Juli 2026 · **STATUS: DRAFT — BELUM DIVALIDASI, BELUM DIBANGUN**
> Prasyarat wajib sebelum Tahap 2 Tumbuh Kembang mulai dikoding (lihat [PRD Tumbuh Kembang §7](13_prd_tumbuh_kembang.md)).

---

## ⚠️ Yang Perlu Bunda/Psikolog HCC Tahu Sebelum Membaca Ini

**Dokumen ini BUKAN salinan resmi KPSP.** Saya (AI) tidak memiliki akses ke teks resmi Kuesioner Pra Skrining Perkembangan (KPSP) milik Kementerian Kesehatan RI dengan cara yang bisa saya jamin kata-per-kata akurat. Isi contoh pertanyaan di bawah adalah **ilustrasi struktur** berdasarkan pengetahuan umum tentang bagaimana KPSP bekerja (format, kelompok usia, jenis pertanyaan) — bukan kutipan resmi yang siap pakai.

**Yang harus dilakukan tim HCC sebelum instrumen ini dipakai di aplikasi:**
1. Peroleh salinan resmi dari **Pedoman Pelaksanaan SDIDTK (Stimulasi, Deteksi, dan Intervensi Dini Tumbuh Kembang) Kemenkes RI**, atau dari **Buku KIA (Kesehatan Ibu dan Anak)** edisi terbaru — keduanya memuat lembar KPSP resmi per kelompok usia.
2. Psikolog/tenaga medis HCC mentranskripsi ulang pertanyaan **persis** dari sumber resmi tersebut ke dalam format yang saya siapkan di bagian "Struktur Data" di bawah.
3. Psikolog HCC menentukan: apakah interpretasi 3-tingkat yang saya usulkan (sesuai/perlu stimulasi/perlu konsultasi) sudah sesuai kaidah klinis KPSP asli (biasanya KPSP resmi punya ambang "9-10 Ya = sesuai", "7-8 Ya = meragukan", "≤6 Ya = kemungkinan penyimpangan" — angka ini juga perlu dikonfirmasi ulang, jangan saya yang menetapkan).

Setelah itu baru saya bisa membangun fiturnya dengan percaya diri bahwa isinya benar.

---

## 1. Apa itu KPSP (untuk konteks)

KPSP adalah kuesioner skrining perkembangan anak yang dipakai luas di Posyandu/Puskesmas Indonesia, bagian dari SDIDTK Kemenkes. Formatnya:
- Ada **satu lembar kuesioner per kelompok usia**: umumnya 3, 6, 9, 12, 15, 18, 21, 24, 30, 36, 42, 48, 54, 60, 66, 72 bulan (16 kelompok usia — perlu dikonfirmasi jumlah persis ke sumber resmi).
- Tiap lembar berisi **9–10 pertanyaan Ya/Tidak**, mencakup domain: motorik kasar, motorik halus, bicara & bahasa, sosialisasi & kemandirian.
- Cara skor (perlu dikonfirmasi ke sumber resmi, ini pemahaman umum): jumlah jawaban "Ya" menentukan kategori — makin sedikit "Ya", makin perlu perhatian.

## 2. Struktur Data yang Saya Usulkan (kerangka, isi masih kosong/ilustratif)

Ini format yang saya siapkan di kode (`GrowthStandards`/skrining nanti) — psikolog HCC tinggal isi kolom "Pertanyaan Resmi" dengan teks asli dari sumber Kemenkes:

| Usia (bulan) | Domain | Kode | Pertanyaan Resmi (ISI DARI SUMBER RESMI) | Ya/Tidak |
|---|---|---|---|---|
| 3 | Motorik Kasar | MK-3.1 | *(kosong — isi dari KPSP resmi)* | |
| 3 | Motorik Halus | MH-3.1 | *(kosong)* | |
| 3 | Bicara & Bahasa | BB-3.1 | *(kosong)* | |
| 3 | Sosialisasi | SM-3.1 | *(kosong)* | |
| ... | ... | ... | *(9–10 baris per kelompok usia, 16 kelompok usia)* | |

**Contoh ilustratif** (bentuk pertanyaan seperti apa yang biasanya muncul di instrumen semacam ini — **bukan kutipan resmi**, hanya supaya psikolog HCC tahu format yang saya maksud):
- *"Dapatkah bayi mengangkat kepalanya setinggi 45 derajat saat ditelungkupkan?"* (ilustrasi motorik kasar usia dini)
- *"Dapatkah anak mengucapkan paling sedikit 3 kata yang mempunyai arti selain 'mama'/'papa'?"* (ilustrasi bicara & bahasa)

Psikolog HCC yang menentukan isi baris sebenarnya per kelompok usia.

## 3. Interpretasi Hasil (usulan — perlu konfirmasi klinis)

| Kategori Usulan | Ambang (contoh, PERLU KONFIRMASI) | Pesan ke Orang Tua |
|---|---|---|
| Sesuai usia | 9–10 "Ya" | "Perkembangan {nama} sesuai usianya. Terus stimulasi rutin ya, Bunda." |
| Perlu stimulasi | 7–8 "Ya" | "Ada beberapa hal yang perlu distimulasi lebih. Berikut ide stimulasinya..." + rencana ulang dalam 2 minggu |
| Sebaiknya konsultasi | ≤6 "Ya" | "Sebaiknya {nama} didampingi psikolog untuk penilaian lebih lanjut." + tombol Konsultasi Psikolog Anak |

**Penting:** hasil ini akan ditampilkan sebagai **arahan, bukan diagnosis** (sudah jadi prinsip tetap sejak awal proyek — lihat AI Governance doc). Kata "diagnosis" tidak boleh muncul di UI.

## 4. Yang Saya Butuhkan dari Psikolog HCC

Kalau memungkinkan, kirim ke saya (lewat dokumen/foto/scan) atau isi langsung ke tabel di bagian 2:
1. Teks resmi kuesioner per kelompok usia (idealnya semua 16, tapi bisa bertahap — mulai dari 3–24 bulan dulu untuk cakupan awal yang match dengan `ChildAgeGroup` yang sudah ada di aplikasi).
2. Ambang skor resmi per kategori.
3. Konfirmasi/koreksi redaksi pesan ke orang tua di bagian 3 (bahasanya harus tetap ramah, bukan bahasa klinis — sesuai aturan lama proyek: istilah psikologi teknis tidak boleh muncul ke orang tua).

Begitu saya terima ini, saya masukkan ke kode dan mulai bangun Tahap 2.

---

*Rujukan: [PRD Tumbuh Kembang](13_prd_tumbuh_kembang.md) · [AI Governance](09_ai_governance.md) · [growth-standards.ts](../../apps/web/src/lib/growth-standards.ts) (pola disclaimer yang sama dipakai di sini)*
