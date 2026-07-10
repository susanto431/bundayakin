# Spesifikasi Laporan Nanny Care Profile™ (Layer 3)

> Diterima dari Kartika, 10 Juli 2026 — dokumen sumber resmi untuk pembangunan Layer 3 (Review Psikolog HCC).
> Status: **spesifikasi lengkap, implementasi belum dimulai** — menunggu Layer 2 (Capture Work Style) selesai dibangun lebih dulu, lihat [ADR-011](08_adr/ADR-011_capture-work-style-built-in.md) dan keputusan produk di `apps/web/CLAUDE.md`.
> Perlakuan sumber dokumen ini sama seperti [17_draft_instrumen_skrining_kpsp.md](17_draft_instrumen_skrining_kpsp.md): jangan diubah isinya tanpa instruksi eksplisit dari Kartika — ini adalah spesifikasi klinis/desain resmi dari HCC.

---

## Catatan Revisi UI/UX (10 Juli 2026, review `ui-ux-pro-max`)

Sebelum implementasi dimulai, terapkan perbaikan berikut pada spesifikasi desain di bawah (hasil audit kontras warna & hierarki informasi):

1. **Lencana status oranye ("Ada Catatan Khusus")** — teks putih di atasnya kurang terbaca (kontras ~3:1, di bawah standar 4,5:1). Gelapkan warna latar badge oranye khusus untuk kombinasi ini (border tetap oranye terang seperti semula).
2. **Label "Psikolog Klinis:" di panel kredensial header** — hijau muda di atas hijau tua kontrasnya pas-pasan (~3,8:1) apalagi ukurannya kecil (10px) + huruf renggang. Pertimbangkan warna lebih terang atau ukuran lebih besar.
3. **Angka sudut radar chart (6,5pt)** — terlalu kecil, berisiko tidak terbaca kalau dicetak/dilihat di HP. Naikkan minimal ke 8–9pt.
4. **Kotak Catatan Psikolog** (sudut kanan atas identity bar, maks 240px) — ini pesan PALING penting untuk orang tua yang cemas, tapi ukurannya kecil dan bisa "kalah" secara visual dari radar chart & judul besar di bawahnya. Untuk status "Ada Catatan Khusus"/"Masalah Klinis Signifikan", pertimbangkan membuat kotak ini lebar penuh (bukan sekadar pojok kecil) supaya jadi hal pertama yang dibaca.
5. **Radar chart 8 sumbu** sudah di batas maksimum yang disarankan (5–8 sumbu) — jangan pernah menambah aspek ke-9. Kartu penjelasan bahasa awam di bawah chart sudah benar sebagai pelengkap (radar chart bukan satu-satunya sumber info) — pertahankan pola ini.

Yang sudah baik dan jangan diubah: radar chart pakai warna DAN pola berbeda (solid vs putus-putus) untuk ideal vs kandidat, larangan warna kuning, pill verdict putih+hijau tua (kontras sangat baik).

---

## Dokumen Asli

<!-- Isi asli dokumen SKILL_NannyCareProfile (FINAL).md yang dibagikan Kartika — disalin apa adanya, jangan diubah tanpa instruksi eksplisit. -->

# SKILL: Nanny Care Profile™ Report Generator
**Human Care Consulting (HCC)**
Versi: 1.1 | 2026

---

## KAPAN SKILL INI DIGUNAKAN

Gunakan skill ini ketika pengguna meminta generate laporan **Nanny Care Profile™** — yaitu laporan psikologis pengasuhan untuk calon nanny, ditujukan kepada **agency nanny dan orang tua (ibu-ibu non-psikologi)**.

Trigger kalimat:
- "Buatkan laporan nanny untuk [nama]"
- "Generate Nanny Care Profile untuk kandidat ini"
- "Ini data psikotes nanny, buatkan reportnya"
- "Saya mau laporan nanny, ini hasilnya: ..."

---

## INPUT YANG DIBUTUHKAN DARI PENGGUNA

Claude harus mengumpulkan semua data berikut sebelum generate. Jika ada yang belum ada, **tanya dulu** sebelum generate.

### A. DATA IDENTITAS KANDIDAT
```
- Nama lengkap
- Usia
- Jenis kelamin
- Pendidikan terakhir
- Pengalaman pengasuhan (tahun)
- Tanggal asesmen
- Nama psikolog
```

### B. DATA PAPI KOSTICK (Raw Score 0–9 per dimensi)
```
Dimensi yang WAJIB ada:
- N  (Need to Finish a Task)
- G  (Role of Hard Intense Worker)
- L  (Leadership Role)
- P  (Need to Control Others)
- I  (Ease in Decision Making)
- T  (Pace)
- V  (Vigorous Type)
- F  (Need to Support Authority)
- W  (Need for Rules and Supervision)
- X  (Need to Be Noticed)
- S  (Social Extension)
- B  (Need to Belong to Groups)
- O  (Need for Closeness & Affection)
- Z  (Need for Change)
- E  (Emotional Restraint)
- K  (Need to Be Forceful)
- R  (Theoretical Type)
- D  (Interest in Working With Detail)
- C  (Organize Type)
- A  (Need to Achieve)
```

### C. HASIL BACA PSIKOLOG — GRAFIS & CATATAN KLINIS

Input dari psikolog terdiri dari DUA hal yang berbeda perannya:

**C1. Hasil baca grafis (untuk aspek A7 dan A8):**
```
- Relasi ke Anak    → Level: Rendah / Cukup / Tinggi / Sangat Tinggi
- Relasi ke Sekitar → Level: Rendah / Cukup / Tinggi / Sangat Tinggi

Narasi grafis (opsional, 1–2 kalimat teknis):
Psikolog boleh menambahkan temuan singkat dari tes grafis
(misal: "figur ekspresif, proporsi baik, pohon berakar kuat").
Claude akan mengubahnya menjadi bahasa awam di laporan.
```

**C2. Catatan Psikolog — WAJIB TAMPIL MENCOLOK di laporan:**
```
Ini adalah pernyataan klinis singkat dari psikolog yang langsung
dibaca orang tua. Berisi DUA hal:

a) Status klinis:
   "Tidak ditemukan indikasi masalah psikologis yang perlu 
    dikhawatirkan dalam konteks pengasuhan."
   ATAU
   "Ditemukan beberapa area yang perlu diperhatikan: [...]"

b) Pesan singkat untuk orang tua (1–3 kalimat bebas dari psikolog):
   Ditulis langsung oleh psikolog, tidak diubah Claude.
   Contoh: "Kandidat ini cocok untuk keluarga yang komunikatif.
            Kami sarankan perkenalan bertahap di minggu pertama."

Format input dari psikolog (fleksibel, Claude bisa parsing):
  "Klinis: aman / Pesan: [kalimat psikolog]"
  ATAU teks bebas yang mengandung pernyataan klinis dan pesan
```

⚠️ PENTING: Catatan Psikolog adalah SUARA RESMI PSIKOLOG —
Claude tidak boleh mengubah, menambah, atau mengurangi isinya.
Claude hanya memformatnya ke dalam kotak yang mencolok di laporan.

### D. REKOMENDASI AKHIR PSIKOLOG
```
- Verdict: Sangat Direkomendasikan / Direkomendasikan dengan Catatan /
           Pertimbangan Khusus / Tidak Direkomendasikan
- Cocok untuk: 1 anak / 1–2 anak / 2+ anak
- Masa percobaan: Tidak perlu / 2 minggu / 1 bulan / 3 bulan
- Catatan penutup (1–2 kalimat untuk orang tua)
- Catatan psikolog khusus (opsional — flagging, risiko, dll)
```

---

## STRUKTUR TETAP LAPORAN (JANGAN DIUBAH)

Laporan selalu terdiri dari bagian-bagian ini, **urutan tidak boleh berubah**:

```
1. Header              — nama institusi, judul, stamp
2. Identity Bar        — foto inisial, nama, tags, psikolog
                         + KOTAK CATATAN PSIKOLOG di kanan atas — BARU
3. Kesimpulan          — narasi ringkasan (bahasa awam)
4. Grafik Radar        — 8 aspek: ideal vs kandidat + bar list
5. Kartu Aspek         — 8 kartu penjelasan (bahasa awam)
6. Tips Bunda & Agency — saran actionable
7. Kesimpulan Akhir    — verdict + pills
8. Footer              — disclaimer
```

### POSISI CATATAN PSIKOLOG — ATURAN LAYOUT WAJIB

Catatan Psikolog **TIDAK** diletakkan sebagai section tersendiri di tengah laporan.
Catatan Psikolog diletakkan di **sudut kanan atas, di dalam identity bar**,
sejajar dengan data identitas kandidat — sehingga adalah hal **pertama yang dilihat**
orang tua setelah nama kandidat.

CSS untuk kotak catatan psikolog (WAJIB IKUTI):
```css
.psikolog-box {
  flex-shrink: 0;
  max-width: 240px;
  background: white;
  border: 2px solid [warna sesuai status klinis];
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

/* Warna border sesuai status klinis psikolog: */
/* "Aman" / tidak ada masalah  → border: var(--green)  #3D8B7A */
/* Ada catatan/perlu perhatian → border: var(--orange) #E07B39 */
/* Masalah klinis signifikan   → border: #C75D5D (merah)       */

.psikolog-box-header {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: [warna sesuai status];
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.psikolog-box-status {
  font-size: 11px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 20px;
  margin-bottom: 8px;
  display: inline-block;
}

.psikolog-box-pesan {
  font-size: 11.5px;
  color: var(--ink);
  line-height: 1.65;
  font-weight: 600;
  font-style: italic;
  border-top: 1px solid var(--border);
  padding-top: 8px;
  margin-top: 4px;
}

.psikolog-box-nama {
  font-size: 10px;
  color: var(--ink2);
  margin-top: 6px;
  text-align: right;
}
```

Jika psikolog tidak memberikan catatan klinis → kotak tetap ditampilkan
dengan status default: "🔵 Dalam Proses Review" (border biru #7788CC)
dan pesan: "Catatan psikolog akan ditambahkan setelah review grafis selesai."

---

## 8 ASPEK TETAP (JANGAN DIUBAH URUTANNYA)

| # | ID  | Label Awam              | Label Bar               | Sumber Data | Skor Ideal |
|---|-----|-------------------------|-------------------------|-------------|------------|
| 1 | A1  | Bisa Diandalkan         | Tanggung Jawab          | PAPI        | 80         |
| 2 | A2  | Sigap & Penuh Inisiatif | Inisiatif & Kesigapan   | PAPI        | 80         |
| 3 | A3  | Bisa Kerja Sendiri      | Kemandirian Kerja       | PAPI        | 75         |
| 4 | A4  | Nurut Aturan Rumah      | Ikuti Arahan            | PAPI        | 80         |
| 5 | A5  | Mudah Beradaptasi       | Fleksibilitas           | PAPI        | 75         |
| 6 | A6  | Mau Cerita ke Bunda     | Komunikasi Proaktif     | PAPI        | 80         |
| 7 | A7  | Hangat ke Anak          | Relasi ke Anak          | GRAFIS      | 85         |
| 8 | A8  | Bergaul di Lingkungan   | Relasi ke Sekitar       | GRAFIS      | 75         |

---

## ATURAN KONVERSI RAW SCORE PAPI → SKOR 0–100

```
Raw Score → Skor
0 → 0     1 → 11    2 → 22    3 → 33    4 → 44
5 → 56    6 → 67    7 → 78    8 → 89    9 → 100
```
Formula: `skor = round((raw / 9) * 100)`

---

## ATURAN MAPPING DIMENSI PAPI → ASPEK

```
A1 → Tanggung Jawab
     Dimensi: N, G
     Formula: round((konversi(N) + konversi(G)) / 2)

A2 → Inisiatif & Kesigapan
     Dimensi: L, I, T (T diinvers)
     Formula: round((konversi(L) + konversi(I) + (100 - konversi(T))) / 3)

A3 → Kemandirian Kerja
     Dimensi: W (diinvers), I
     Formula: round(((100 - konversi(W)) + konversi(I)) / 2)

A4 → Ikuti Arahan
     Dimensi: F, W
     Formula: round((konversi(F) + konversi(W)) / 2)

A5 → Fleksibilitas
     Dimensi: Z, R (diinvers), C (diinvers)
     Formula: round((konversi(Z) + (100-konversi(R)) + (100-konversi(C))) / 3)

A6 → Komunikasi Proaktif
     Dimensi: K (diinvers), S, X
     Formula: round(((100-konversi(K)) + konversi(S) + konversi(X)) / 3)
     ⚠️ PERHATIAN KHUSUS: K diinvers karena K=Need to Be Forceful.
         K rendah = menghindari konfrontasi = tidak mau melapor masalah.
         Jika K raw score ≤ 1 → tandai sebagai WARN + tambahkan
         catatan risiko otomatis: "K sangat rendah — risiko tidak melapor
         insiden penting. Sistem laporan harian dari orang tua adalah keharusan."

A7 → Relasi ke Anak
     Sumber: GRAFIS (bukan PAPI)
     Jika skor grafis belum ada → estimasi dari:
     Formula: round((konversi(O) + konversi(B) + konversi(E)) / 3)
     Tandai sebagai "partial" (estimasi, bukan final)

A8 → Relasi ke Sekitar
     Sumber: GRAFIS (bukan PAPI)
     Jika skor grafis belum ada → estimasi dari:
     Formula: round((konversi(S) + konversi(B) + konversi(X)) / 3)
     Tandai sebagai "partial" (estimasi, bukan final)
```

---

## ATURAN STATUS PER ASPEK

```
Sumber PAPI:
  gap = skor_ideal - skor_kandidat
  gap > 20  → status: "warn"  (oranye)
  gap ≤ 20  → status: "ok"    (hijau)

Sumber GRAFIS dengan data final:
  gap = skor_ideal - skor_kandidat
  gap > 20  → status: "warn"
  gap ≤ 20  → status: "ok"

Sumber GRAFIS tanpa data final (estimasi):
  → status selalu: "partial" (biru) + tambahkan badge estimasi
```

---

## ATURAN NARASI — BAHASA AWAM

Semua narasi yang ditulis Claude harus memenuhi aturan ini:

### BOLEH:
- Kalimat pendek (maks 2 baris per kalimat)
- Sapaan "Bunda" untuk orang tua
- Contoh konkret: "misalnya jam makan, mandi, tidur siang"
- Solusi langsung: "tulis jadwal di kertas dan tempel di kulkas"
- Emosi positif dan hangat: "tenang", "bisa diandalkan", "ini nilai plus"
- Kalimat aktif: "Ia akan...", "Ia bisa...", "Bunda perlu..."

### TIDAK BOLEH:
- Istilah psikologi tanpa penjelasan: "konfrontasi", "afektif", "kognitif"
- Angka skor di narasi utama (bukan untuk orang tua)
- Kalimat pasif yang membingungkan
- Paragraf panjang lebih dari 3 kalimat
- Kata-kata negatif yang menghakimi kandidat
- Diagnosis atau label psikiatri

### Template narasi per level per aspek:

**A1 — Tanggung Jawab:**
- Rendah:        "Ia perlu sering diingatkan untuk menyelesaikan tugasnya. Tanpa pengawasan rutin, ada risiko tugas tidak selesai tepat waktu."
- Cukup:         "Ia cukup bisa diandalkan untuk rutinitas harian anak. Jadwal tertulis akan sangat membantu agar tidak ada yang terlewat."
- Tinggi:        "Ia dapat menyelesaikan tugasnya sendiri tanpa perlu diingatkan berulang kali. Rutinitas anak bisa berjalan konsisten."
- Sangat Tinggi: "Ia sangat bisa diandalkan. Rutinitas anak — mandi, makan, tidur — akan dijalankan dengan teliti dan konsisten setiap hari."

**A2 — Inisiatif & Kesigapan:**
- Rendah:        "Ia cenderung menunggu instruksi sebelum bertindak. Dalam situasi darurat, ia perlu panduan yang sangat jelas tentang apa yang harus dilakukan."
- Cukup:         "Ia cukup sigap dalam situasi yang penting. Untuk jadwal rutin, ia masih perlu diingatkan — tapi dalam kondisi darurat ia bisa bertindak sendiri."
- Tinggi:        "Ia tidak perlu menunggu perintah. Kalau ada sesuatu yang perlu segera ditangani — misalnya anak jatuh atau rewel — ia langsung bertindak."
- Sangat Tinggi: "Ia sangat proaktif dan sigap. Bunda tidak perlu khawatir karena ia akan langsung bertindak cepat sebelum diminta."

**A3 — Kemandirian Kerja:**
- Rendah:        "Ia membutuhkan arahan yang sering dan detail. Cocok untuk keluarga yang aktif di rumah dan bisa memberikan panduan langsung."
- Cukup:         "Ia bisa bekerja sendiri setelah mendapat panduan awal yang jelas. Briefing yang baik di minggu pertama sangat penting."
- Tinggi:        "Ia mampu bekerja mandiri dengan baik. Bunda bisa beraktivitas di luar rumah dengan tenang."
- Sangat Tinggi: "Ia sangat mandiri. Bunda bisa sepenuhnya mempercayakannya untuk mengurus anak dalam waktu yang panjang sekalipun."

**A4 — Ikuti Arahan:**
- Rendah:        "Ia cenderung bekerja dengan caranya sendiri. Aturan rumah perlu dijelaskan dengan sangat personal dan sabar agar bisa diikuti."
- Cukup:         "Ia mau mengikuti aturan — asal dijelaskan kenapa aturan itu penting. Pendekatan 'karena ini bagus untuk anak' lebih efektif dari sekadar larangan."
- Tinggi:        "Ia patuh terhadap aturan yang Bunda tetapkan. Sampaikan ekspektasi dengan jelas di awal dan ia akan mengikutinya."
- Sangat Tinggi: "Ia sangat disiplin mengikuti panduan. Aturan rumah akan dijalankan dengan teliti, termasuk detail kecil sekalipun."

**A5 — Fleksibilitas:**
- Rendah:        "Ia lebih nyaman dengan rutinitas yang sangat tetap. Perubahan mendadak bisa membuatnya kurang optimal. Cocok untuk keluarga dengan jadwal stabil."
- Cukup:         "Ia bisa menyesuaikan diri dengan perubahan yang wajar. Perubahan mendadak yang terlalu sering sebaiknya diminimalkan."
- Tinggi:        "Ia mudah beradaptasi dengan perubahan jadwal atau situasi yang tidak terduga. Cocok untuk keluarga yang aktivitasnya dinamis."
- Sangat Tinggi: "Ia sangat fleksibel dan tidak terganggu oleh perubahan apapun. Sangat cocok untuk keluarga dengan jadwal tidak menentu."

**A6 — Komunikasi Proaktif:**
- Rendah:        "Ia sangat jarang melapor sendiri dan cenderung diam kalau ada masalah. Bunda WAJIB menanyakan kabar anak setiap hari — jangan tunggu ia yang cerita duluan."
- Cukup:         "Ia tidak terlalu sering melapor sendiri, tapi akan berbagi kalau ditanya. Biasakan tanya 2–3 hal setiap hari: anak makan apa, kegiatan apa, ada hal aneh tidak."
- Tinggi:        "Ia cukup terbuka dan akan melapor kalau ada hal penting. Hubungan komunikasi yang baik mudah dibangun."
- Sangat Tinggi: "Ia sangat komunikatif. Bunda akan selalu dapat update tentang anak tanpa perlu meminta terlebih dahulu."

**A7 — Relasi ke Anak:**
(Selalu tambahkan kalimat pembuka: "Berdasarkan hasil pembacaan psikolog," jika dari grafis final,
atau "Berdasarkan estimasi dari data yang tersedia," jika masih estimasi PAPI)
- Rendah:        "...kandidat menunjukkan kehangatan yang terbatas terhadap anak. Perlu observasi langsung dan pendampingan di minggu pertama untuk memastikan kenyamanan anak."
- Cukup:         "...kandidat cukup mampu membangun hubungan yang nyaman dengan anak, meski mungkin tidak terlalu ekspresif. Kehangatan dan responnya perlu diamati langsung di minggu pertama."
- Tinggi:        "...kandidat menunjukkan kemampuan relasi yang baik — hangat, responsif, dan sabar saat anak rewel. Ini nilai plus yang penting untuk pengasuhan."
- Sangat Tinggi: "...kandidat memiliki kehangatan dan kepekaan yang tinggi terhadap anak. Berpotensi membangun ikatan yang kuat dan penuh kasih dengan anak."

**A8 — Relasi ke Sekitar:**
(Sama — gunakan pembuka "Berdasarkan hasil pembacaan psikolog," atau "Berdasarkan estimasi,")
- Rendah:        "...kandidat cenderung tertutup di lingkungan baru. Ia perlu waktu adaptasi lebih panjang. Perkenalkan ke anggota keluarga dan tetangga dekat sejak hari pertama."
- Cukup:         "...kandidat bisa bergaul dengan keluarga dan lingkungan sekitar, meski tidak terlalu aktif membuka interaksi. Perkenalkan ia ke lingkungan sejak awal agar merasa nyaman."
- Tinggi:        "...kandidat memiliki kemampuan sosial yang baik. Ia dapat menjalin hubungan yang nyaman dengan anggota keluarga dan tetangga di sekitar."
- Sangat Tinggi: "...kandidat sangat luwes dalam bergaul. Ia akan dengan cepat membangun kepercayaan dan kenyamanan dengan seluruh lingkungan keluarga."

---

## ATURAN RINGKASAN (bagian atas laporan)

Ringkasan harus:
- Maks 3 kalimat
- Kalimat 1: kesan umum positif (kekuatan utama)
- Kalimat 2: area yang perlu perhatian (jujur tapi tidak menghakimi)
- Kalimat 3: penutup — apa yang bisa dilakukan keluarga

Jika ada K raw score ≤ 1 → wajib sebut "tidak akan melapor sendiri" di ringkasan.
Jika ada aspek partial (grafis belum ada) → sebut "perlu dikonfirmasi langsung".

---

## ATURAN SARAN (Tips Bunda & Agency)

Tips untuk Bunda selalu berisi 4–5 poin, urutan:
1. Jadwal harian (selalu ada)
2. Komunikasi rutin (selalu ada)
3. Cara menyampaikan aturan
4. Poin spesifik dari temuan kandidat ini (sesuaikan)
5. Observasi di minggu pertama (jika ada aspek partial/warn)

Tips untuk Agency selalu berisi 4 poin:
1. Onboarding/briefing sebelum penempatan
2. Kontrak kerja yang jelas
3. Evaluasi bulan pertama
4. Poin spesifik dari temuan (misal: wawancara lanjutan jika ada flag)

---

## ATURAN DESAIN HTML (TIDAK BOLEH BERUBAH)

### Palet Warna (CSS Variables — tetap):
```css
--green:        #3D8B7A   /* warna utama HCC */
--green-light:  #E8F5F2
--green-mid:    #A8D5CC
--orange:       #E07B39   /* warn */
--orange-light: #FEF0E7
--ink:          #1A1A2E
--ink2:         #555570
--bg:           #F5F8FA
--border:       #E2E8EE
```

### Status warna (TIDAK BOLEH DIGANTI):
- ok      → hijau (#3D8B7A) — kandidat mendekati ideal
- warn    → oranye (#E07B39) — gap > 20 dari ideal
- partial → biru (#7788CC) — estimasi, belum final

### Font (TIDAK BOLEH DIGANTI):
- Semua teks: Helvetica / Helvetica-Bold / Helvetica-Oblique
- Alasan: font built-in ReportLab, tidak perlu CDN, konsisten di semua OS

### Radar Chart:
- 8 sisi (oktagon) — sesuai 8 aspek
- Layer 1: polygon ideal — hijau solid, fill alpha 0.18, stroke C_GREEN, linewidth 2
- Layer 2: polygon kandidat — oranye putus-putus, fill alpha 0.15, stroke C_ORANGE, dash [5,3]
- Titik kandidat: lingkaran r=4, fill sesuai status, stroke putih linewidth 1.5
- Label di setiap sudut: font Helvetica-Bold — **naikkan ke 8-9pt** (spesifikasi asli 6.5pt terlalu kecil, lihat Catatan Revisi UI/UX di atas)

### Format output — PDF via Python ReportLab:
- Library: `reportlab` (pip install reportlab)
- Page size: A4, margin 18mm semua sisi
- Engine: SimpleDocTemplate + Platypus (Table, Paragraph, Flowable)
- Radar chart: custom Flowable (class RadarChart) dengan canvas drawing
- Avatar kandidat: custom Flowable (class CircleAvatar)
- Bar progress: custom Flowable (class MiniBar)
- Section icon: custom Flowable (class GreenDot) — BUKAN karakter teks
- Output: file .pdf langsung, tidak melalui HTML
- Nama file: `NannyCareProfile_[NamaKandidat]_[Tanggal].pdf`
- **Lokasi implementasi: `apps/pdf-service` (Python/ReportLab, Railway) — bukan `apps/web`** (keputusan 10 Juli 2026, mengikuti pola report matching NannyProfile yang sudah ada, lihat ADR-006)

### Aturan Warna — LARANGAN MUTLAK (TIDAK BOLEH DILANGGAR):
```
KUNING (#FFFF00, #F5E642, dsb) — DILARANG KERAS di seluruh laporan.
Alasan: tidak profesional, terlihat seperti elemen promosi/marketing,
kontras buruk di atas background hijau maupun putih.

Ini berlaku untuk:
- Background elemen apapun (stamp, badge, pill, box)
- Warna teks apapun
- Warna border apapun
- Warna ikon apapun
```

### Aturan Warna Teks di Atas Background Gelap/Hijau:
```
Jika background = hijau gelap (#2D7A6A atau lebih gelap):
  → Teks WAJIB putih (#FFFFFF) atau putih transparan
  → BUKAN hitam, BUKAN kuning, BUKAN abu gelap

Jika background = putih atau terang:
  → Teks WAJIB hitam (#1A1A1A) atau dark green (#1A3D35)
  → BUKAN putih (tidak terbaca), BUKAN kuning
```

### Aturan Header — Credential Panel:
```
Header menggunakan HeaderFlowable (custom class) dengan struktur:
- Band atas tipis (#1E5C51 lebih gelap): logo PUTIH kiri + nomor referensi kanan
- Area utama (#2D7A6A): judul besar kiri + credential panel kanan

Logo di header: WAJIB pakai versi logo PUTIH (logo_hcc_white.png)

Credential panel — SOLID COLOR, bukan transparan:
- Background: solid #356B61
- Border: C_GREEN_MID (#A8D5CC) tipis 0.8pt
- Teks label: C_GREEN_MID — **cek ulang kontras saat implementasi, lihat Catatan Revisi UI/UX**
- Teks nilai: putih solid (#FFFFFF)
- Shield icon: digambar manual dengan canvas, fill C_GREEN_MID
- TIDAK ADA warna kuning, TIDAK ADA transparansi 8-digit hex

⚠️ Gunakan colors.Color(r,g,b,alpha) untuk warna transparan,
BUKAN hex 8-digit (#FFFFFF1A) — ReportLab membaca AARRGGBB bukan RRGGBBAA
sehingga #FFFFFF1A menjadi KUNING terang.

Isi credential panel (1 baris saja): Psikolog Klinis: [nama psikolog]
Tanggal Asesmen & Instrumen TIDAK ditampilkan di header — informasi teknis internal.
```

### Aturan Page Break — Mencegah Orphan & Split (WAJIB):
```
Import: from reportlab.platypus import KeepTogether

ATURAN 1: Section title WAJIB digabung dengan konten pertamanya
ATURAN 2: Verdict table WAJIB dibungkus KeepTogether penuh
ATURAN 3: Tabel dengan background warna solid besar → KeepTogether
ATURAN 4: Radar section (header + body) — sudah 1 Table object
ATURAN 5: Kartu aspek 2-kolom → KeepTogether untuk baris pertama + section title
```

### Aturan Teks Footer (WAJIB — menyangkut kredibilitas):
```
TEKS FOOTER YANG BENAR:
"Laporan berdasarkan asesmen psikologis dan diinterpretasikan oleh psikolog.
Hanya sebagai bahan pertimbangan penempatan — bukan diagnosis klinis.
Data bersifat RAHASIA untuk keluarga dan agency."

DILARANG KERAS:
- "psikolog berlisensi HCC" — SALAH, HCC tidak memiliki lisensi sendiri
- "berlisensi HCC" — SALAH

YANG BOLEH:
- "diinterpretasikan oleh psikolog Human Care Consulting"
- "diinterpretasikan oleh psikolog"
```

### Aturan Section Title Icon:
- Icon kiri WAJIB digambar sebagai custom Flowable (GreenDot)
- BUKAN karakter teks seperti [V], [!], [=]
- GreenDot = kotak rounded C_GREEN_LIGHT dengan lingkaran C_GREEN di tengah
- Ukuran: width=28, height=28

---

## FLAGGING OTOMATIS

| Kondisi | Aksi |
|---|---|
| K raw ≤ 1 | Tambah badge merah "⚠️ Perhatian Khusus" di kartu A6 + catatan di ringkasan |
| T raw ≤ 2 | Tambah catatan "Jadwal harian tertulis adalah keharusan" di saran |
| W raw ≤ 2 | Tambah catatan "SOP perlu dijelaskan konteksnya, bukan sekadar aturan" di saran |
| A7 atau A8 masih estimasi | Tampilkan badge biru + disclaimer estimasi |
| Semua aspek PAPI warn (≥3 aspek warn) | Tampilkan kotak merah di bagian atas: "Perlu Evaluasi Mendalam" |

---

## FORMAT INPUT YANG DITERIMA

Format ringkas (tabel): `N=5, G=3, L=6, P=6, I=6, T=3, V=6, F=4, W=3, X=6, S=4, B=5, O=5, Z=5, E=6, K=1, R=3, D=6, C=2, A=5`

Format dari PDF laporan: `Need to Finish a Task    N: 5` dst.

Format campur dengan narasi psikolog:
```
Skor PAPI: N=5, G=3, ...
Grafis - Relasi ke Anak: Tinggi
Narasi grafis: "Dari hasil DAP dan BAUM, kandidat menunjukkan
kehangatan yang baik, figur manusia proporsional dan ekspresif,
pohon dengan akar kuat menunjukkan kelekatan yang sehat."
Verdict: Direkomendasikan dengan Catatan
```

---

## CHECKLIST SEBELUM GENERATE PDF

- [ ] Semua 20 dimensi PAPI (Capture Work Style) sudah ada nilainya
- [ ] Skor 8 aspek sudah dihitung dengan formula yang benar
- [ ] A7 dan A8: cek apakah dari grafis final atau estimasi PAPI
- [ ] Narasi ringkasan: 3 kalimat, bahasa awam
- [ ] Narasi per aspek: sesuai level, tidak ada istilah psikologi
- [ ] Flag otomatis diterapkan (K≤1, T≤2, W≤2)
- [ ] Radar chart: 8 titik, ideal vs kandidat, class RadarChart
- [ ] Section icon: class GreenDot (bukan karakter teks)
- [ ] Warna status: ok=hijau, warn=oranye, partial=biru
- [ ] Verdict pills: background putih, teks hijau tua (#1A3D35)
- [ ] Header pakai HeaderFlowable
- [ ] Tidak ada warna kuning di seluruh dokumen
- [ ] Kotak Catatan Psikolog di kanan atas identity bar, verbatim, tidak diubah sistem
- [ ] Semua section title dibungkus KeepTogether dengan konten pertamanya
- [ ] Verdict table dibungkus KeepTogether
- [ ] Output file .pdf siap download

---

## CATATAN PENTING

1. Konsistensi adalah prioritas utama — laporan kandidat A dan B harus dari template yang sama.
2. Jangan improvisasi struktur — kalau ada aspek yang datanya tidak lengkap, gunakan estimasi dan tandai.
3. Narasi psikolog adalah override — kalau psikolog memberi narasi bebas, pakai itu, bukan template.
4. Bahasa awam adalah keharusan — target pembaca ibu-ibu non-psikologi.
5. Output adalah file PDF via ReportLab (`apps/pdf-service`) — bukan HTML.
6. Pesan psikolog TIDAK BOLEH DIUBAH — prinsip integritas laporan klinis.
7. Kotak Catatan Psikolog selalu ada, walau psikolog belum memberi catatan (status biru "Dalam Proses Review").
8. Warna kotak mencerminkan status klinis: Hijau=aman, Oranye=ada catatan, Merah=masalah klinis signifikan.
9. Nama instrumen (PAPI Kostick/Capture Work Style) TIDAK tampil di header — untuk konsumsi orang tua saja.
10. KUNING DILARANG KERAS di seluruh laporan, tidak ada pengecualian.

---

*Rujukan: [ADR-011](08_adr/ADR-011_capture-work-style-built-in.md) · [Matriks Layanan](12_matriks_layanan.md) · CONTEXT.md (istilah "Capture Work Style", "Tester HCC", "NannyCare Profile™")*
