# AI Governance Document
## BundaYakin — Human Care Consulting

> Versi 1.0 · Mei 2026 · Dokumen Internal OPDS

Dokumen ini mendefinisikan **bagaimana AI digunakan di platform BundaYakin** — batas kemampuannya, kebijakan privasi data yang diproses AI, transparansi ke user, dan mekanisme akuntabilitas.

Platform BundaYakin memproses **data psikologis sensitif** (hasil tes kepribadian, catatan psikolog, pola pengasuhan, kondisi medis anak). Penggunaan AI pada data ini membutuhkan standar yang lebih tinggi dari aplikasi biasa.

---

## 1. Inventaris Penggunaan AI

| Use Case | Layer | Model | Input | Output |
|---|---|---|---|---|
| **Scoring matching** | Layer 1 | Claude claude-sonnet-4-6 | Jawaban survey (parent + nanny) | Skor domain A/B/C, narasi, tips |
| **Interpretasi psikotes** | Layer 2 | Claude claude-sonnet-4-6 | Hasil tes kepribadian + sikap kerja | Breakdown kepribadian, kekuatan, gap |
| **Ringkasan evaluasi** | Monitoring | Claude claude-sonnet-4-6 | Jawaban evaluasi berkala | AI summary + rekomendasi |
| **Cache skor direktori** | Fasa 2 | Claude claude-sonnet-4-6 | Survey snapshot (parent vs nanny) | MatchResult pre-computed |
| **Sosmed screening** | Add-on | Claude claude-sonnet-4-6 | Ringkasan profil publik nanny | Flag + catatan (dengan disclaimer) |
| **PDF NannyCare Profile™** | Layer 3 | ReportLab (Python, no AI) | Data dari psikolog manusia | PDF dokumen — AI hanya format |

**Catatan:** Layer 3 (NannyCare Profile™) menggunakan AI **hanya untuk formatting PDF**, bukan untuk interpretasi. Interpretasi tetap dilakukan oleh psikolog manusia.

---

## 2. Prinsip Penggunaan AI

### 2.1 AI sebagai Alat Bantu, Bukan Penentu Akhir

AI di BundaYakin adalah **alat bantu pengambilan keputusan**, bukan pengambil keputusan itu sendiri.

- Skor kecocokan adalah **rekomendasi awal**, bukan verdict
- Keputusan final (terima atau tolak nanny) ada di tangan **orang tua**
- Catatan psikolog Layer 3 adalah interpretasi **psikolog manusia**, bukan AI
- AI tidak pernah secara otomatis menyetujui atau menolak nanny

### 2.2 Transparansi Minimum ke User

Setiap output AI yang ditampilkan ke user harus menyertakan:
1. **Indikasi bahwa ini output AI** — bukan manusia
2. **Confidence level** atau batasan interpretasi (jika relevan)
3. **Cara menghubungi tim** jika user tidak setuju dengan hasilnya

### 2.3 Tidak Ada Training Data dari User

Sesuai kebijakan Anthropic API:
- Data yang dikirim ke Claude API **tidak digunakan untuk training model**
- Semua data diproses secara ephemeral di Anthropic API
- BundaYakin tidak mengirim data ke pihak ketiga lain untuk tujuan AI

---

## 3. Klasifikasi Data Sensitif

| Tipe Data | Sensitivitas | Siapa yang Boleh Akses |
|---|---|---|
| Jawaban survey matching | **Tinggi** — nilai pribadi, preferensi gaya hidup | Orang tua (jawaban sendiri + laporan) · Nanny (jawaban sendiri + laporan) · AI (scoring) · Admin (audit) |
| Hasil psikotes (Layer 2) | **Sangat Tinggi** — data psikologis formal | Orang tua (jika beli Layer 2) · Nanny (diri sendiri) · AI (scoring) · Admin (audit) |
| Catatan psikolog (Layer 3) | **Sangat Sensitif** — data klinis psikologi | Orang tua (yang membeli) · Psikolog HCC · Admin (audit, bukan konten) |
| Kondisi medis anak | **Sangat Tinggi** — data kesehatan anak | Orang tua · Nanny aktif dalam assignment · AI (jika relevan untuk matching) |
| Evaluasi berkala | **Tinggi** — performa kerja dan kondisi rumah tangga | Orang tua + nanny (diri sendiri) · AI (ringkasan) · Admin (jika ada eskalasi) |
| Rekam jejak nanny | **Sedang** — riwayat kerja | Orang tua yang membeli akses · Nanny sendiri |
| Data sosmed screening | **Sedang — Perhatian Khusus** | Hanya orang tua yang membeli · Wajib disclaimer |

---

## 4. Data Psikologis — Penanganan Khusus

### 4.1 Data Psikologis adalah Kategori Khusus

Berdasarkan **UU Perlindungan Data Pribadi No. 27 Tahun 2022 (UU PDP)**:
- Data kesehatan fisik dan psikis termasuk **data pribadi yang sensitif**
- Membutuhkan **persetujuan eksplisit** dari subjek data
- Wajib ada **dasar pemrosesan yang sah**

### 4.2 Consent yang Diperlukan

Saat registrasi dan sebelum mengisi survey, user (orang tua dan nanny) harus menyetujui:
1. **Data survey diproses oleh AI** untuk menghasilkan laporan kecocokan
2. **Data disimpan** di platform untuk keperluan evaluasi dan rekam jejak
3. **Siapa yang bisa mengakses** data mereka (lihat tabel klasifikasi di atas)
4. **Hak untuk meminta penghapusan data** kapan saja

### 4.3 Catatan Psikolog (Layer 3) — Ekstra Ketat

- Dokumen NannyCare Profile™ hanya bisa diakses oleh orang tua yang membeli dan psikolog yang mereview
- Admin platform **tidak bisa membaca konten** NannyCare Profile™ (hanya bisa lihat apakah dokumen ada/tidak)
- Dokumen tidak boleh di-forward, di-screenshot, atau disebarkan — perlu UI notice yang jelas
- TTL akses: perlu ditentukan (rekomendasi: akses berlaku 1 tahun dari tanggal pembelian)

---

## 5. Batas Kemampuan AI — Komunikasi ke User

### Yang Wajib Dikomunikasikan

#### Matching Scoring (Layer 1 & 2)

> **Disclaimer wajib di laporan matching:**
> "Laporan ini dihasilkan oleh AI berdasarkan jawaban survei kedua pihak. Skor dan rekomendasi bersifat indikatif — bukan kesimpulan final. Faktor yang tidak tercakup dalam survei (seperti chemistry personal, bahasa tubuh, atau situasi di luar parameter ini) tetap perlu dinilai langsung oleh Anda."

#### Sosmed Screening

> **Disclaimer wajib di laporan sosmed:**
> "Laporan ini dihasilkan oleh AI berdasarkan informasi yang tersedia secara publik. Ini adalah indikasi awal — bukan kesimpulan. BundaYakin tidak menjamin keakuratan atau kelengkapan informasi ini. Gunakan sebagai bahan pertimbangan tambahan, bukan satu-satunya dasar penilaian."

### Yang TIDAK Boleh Diklaim

AI di BundaYakin **tidak boleh diklaim** bisa:
- Mendeteksi niat jahat, kebohongan, atau karakter moral nanny
- Menjamin keamanan anak
- Memberikan diagnosis psikologis
- Menggantikan penilaian psikolog profesional untuk keputusan klinis

---

## 6. Mekanisme Appeal & Koreksi

### Jika User Tidak Setuju dengan Skor AI

1. User bisa **melaporkan ketidaksesuaian** via form di laporan matching
2. Admin BundaYakin mereview laporan dalam 3 hari kerja
3. Jika ada data yang salah/tidak akurat → admin bisa trigger re-scoring
4. Jika keluhan valid tapi AI memang "salah interpretasi" → catat sebagai feedback untuk perbaikan prompt

### Jika Nanny Merasa Dirugikan oleh AI Score

1. Nanny bisa mengajukan keberatan via form
2. Admin review apakah ada bias sistemik dalam pertanyaan atau scoring
3. Jika terbukti ada bias → perbaiki prompt dan re-score semua yang terdampak

### Log Audit

Semua output AI disimpan di database (`aiRawOutput`, `aiModel`) untuk keperluan audit. Ini memungkinkan:
- Investigasi jika ada keluhan
- Konsistensi monitoring (apakah skor berubah drastis antar versi model)
- Compliance jika ada pemeriksaan regulasi

---

## 7. Keamanan Data yang Dikirim ke AI

### Data Minimization

Hanya data yang **relevan untuk scoring** yang dikirim ke Claude API:
- **Dikirim:** Jawaban survey (tanpa nama, email, atau identifier personal jika memungkinkan)
- **Tidak dikirim:** Nomor WA, alamat lengkap, nomor rekening, data keuangan

### Anonymization

Untuk scoring matching, pertimbangkan mengirim data dengan referensi internal (UUID) bukan nama user:
- `parent_id: "abc123"` bukan `parent_name: "Dina"`
- AI tidak perlu tahu siapa usernya — hanya perlu tahu jawaban surveynya

### Enkripsi

- Data di database: enkripsi at-rest (dihandle Neon PostgreSQL)
- Data in-transit: HTTPS (Vercel + Neon + Anthropic semuanya force HTTPS)
- `clinicalNotes` di AssessmentResult: pertimbangkan application-level encryption di Fasa 2

---

## 8. Regulasi & Compliance

### UU PDP No. 27 Tahun 2022

BundaYakin sebagai **pengendali data** wajib:
- Memberitahu user tentang tujuan pemrosesan data ✅ (dalam T&C dan consent form)
- Mendapatkan consent eksplisit untuk data sensitif ✅ (perlu diimplementasikan di onboarding)
- Menjamin hak penghapusan data (right to erasure) 📋 (perlu UI dan flow untuk ini)
- Melindungi data dari akses tidak sah ✅ (RBAC, audit log)

### Etika Psikologi Profesional

Mengacu pada **Kode Etik Psikologi Indonesia (HIMPSI)**:
- Psikolog di Layer 3 wajib menjaga kerahasiaan klien
- Laporan psikologis hanya untuk tujuan yang disepakati
- Tidak ada diagnostic labeling tanpa asesmen yang memadai

### Rekomendasi Tindakan

| Aksi | Prioritas | Status |
|---|---|---|
| Tambah halaman T&C dan Privacy Policy yang lengkap | Tinggi | 📋 Belum |
| Implementasi consent form saat onboarding (sebelum isi survey) | Tinggi | 📋 Belum |
| Flow "hapus akun + data" yang bisa diakses user | Tinggi | 📋 Belum |
| Application-level encryption untuk clinicalNotes | Sedang | 🔮 Fasa 2 |
| Anonymization data sebelum dikirim ke Claude API | Sedang | 📋 Perlu audit |
| Mekanisme appeal di UI laporan | Sedang | 📋 Belum |
| Log akses ke NannyCare Profile™ | Tinggi | 📋 Perlu diimplementasikan |

---

## 9. Pembaruan Model AI

Saat ada update model Claude (misalnya dari `claude-sonnet-4-6` ke versi lebih baru):

1. **Test** output baru pada set pertanyaan referensi sebelum deploy
2. **Bandingkan** skor dari model lama vs baru untuk kasus yang sama
3. Jika ada perubahan signifikan (>5 poin) → review apakah prompt perlu di-update
4. **Catat** perubahan model di ADR atau update file ini
5. **Simpan** `aiModel` per `MatchingResult` — sehingga audit trail tetap jelas

---

## 10. Kontak untuk Pertanyaan AI & Privasi

Untuk pertanyaan tentang kebijakan AI atau permintaan penghapusan data:

- **Tim BundaYakin** (operasional) — [kontak admin]
- **Psikolog HCC** (untuk pertanyaan tentang Layer 3) — lewat admin BundaYakin

---

*Lihat juga: [ADR-005 — Claude API](08_adr/ADR-005_claude-api-matching.md) · [PRD](06_prd.md) · [Domain Registry](02_domain_registry.md)*
