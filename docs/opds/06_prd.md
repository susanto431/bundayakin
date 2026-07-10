# Product Requirements Document (PRD)
## BundaYakin — Human Care Consulting

> Versi 1.2 · Diperbarui 10 Juli 2026 (audit kode vs dokumen) · Dokumen Internal OPDS
> Scope: Fasa 1 — Platform Kecocokan & Pemantauan
> Changelog v1.1: status Mayar diperbarui (production aktif), direktori nanny internal masuk scope shipped, auto-login pasca registrasi, profil anak dibuka untuk akun free
> Changelog v1.2: **Layer 2 (Psikotes AI) selesai dikoding** — lihat §5 & §8; Layer 3 (psikolog) SOP-nya sudah final walau belum dikoding
> **Juli 2026:** langganan kini dua pilar ([ADR-007](08_adr/ADR-007_langganan-dua-pilar.md)) — pilar kedua "Tumbuh Kembang" punya PRD sendiri: [13_prd_tumbuh_kembang.md](13_prd_tumbuh_kembang.md)

---

## 1. Latar Belakang & Problem Statement

### Masalah yang Diselesaikan

Mencari nanny di Indonesia adalah proses yang **tidak terstruktur, penuh ketidakpastian, dan bergantung pada jaringan sosial**. Keluarga sering kali mengambil keputusan besar (menitipkan anak kepada orang asing) berdasarkan:
- Informasi minimal dari mulut ke mulut
- CV yang tidak bisa diverifikasi
- Intuisi saat wawancara singkat

Akibatnya:
- Nanny sering tidak cocok bukan karena tidak kompeten, tetapi karena **nilai, gaya pengasuhan, atau ekspektasi berbeda**
- Turnover nanny tinggi → anak kehilangan attachment figure
- Orang tua mengulang proses pencarian yang melelahkan berkali-kali
- Tidak ada rekam jejak yang bisa dipercaya dari kedua pihak

### Insight Kunci

> *"Masalah terbesar bukan menemukan nanny yang jujur — itu hampir tidak bisa dijamin siapa pun. Masalah terbesar adalah menemukan nanny yang **cocok** dengan keluarga ini, anak ini, dan nilai-nilai ini."*
> — Apin, Psikolog HCC

**BundaYakin menjawab dengan:**
1. **Matching berbasis psikologi** — survey paralel yang mengukur kecocokan nilai, gaya pengasuhan, dan kondisi kerja secara objektif
2. **Pemantauan berkala** — check-in dan evaluasi terjadwal agar masalah terdeteksi dini
3. **Rekam jejak dua arah** — membangun trust ekosistem dari waktu ke waktu

---

## 2. Visi Produk

> **Jangka pendek (Fasa 1):** Platform yang membantu keluarga menemukan nanny yang benar-benar cocok — bukan hanya yang tersedia — dan membantu mereka memantau hubungan kerja itu agar bertahan lebih lama.

> **Jangka panjang (Fasa 3):** Ekosistem pengasuhan terpercaya di Indonesia — tempat nanny membangun karier dan orang tua mendapat ketenangan pikiran.

---

## 3. Target Pengguna

### Persona 1 — Ibu Muda Urban

| Atribut | Detail |
|---|---|
| Nama representatif | Dina, 32 tahun |
| Lokasi | Jakarta, Tangerang, Surabaya, Bandung |
| SES | B/B+ (pengeluaran keluarga Rp 8–20jt/bulan) |
| Situasi | Anak pertama usia 8 bulan, akan kembali kerja |
| Pain point | Tidak tahu cara mengevaluasi nanny secara objektif. Takut salah pilih. |
| Ekspektasi BundaYakin | "Bantu saya tahu apakah nanny ini cocok dengan cara saya membesarkan anak." |
| Willingness to pay | Rp 500rb/tahun terasa wajar jika memberi ketenangan pikiran |

### Persona 2 — Keluarga dengan Anak Berkebutuhan Khusus

| Atribut | Detail |
|---|---|
| Nama representatif | Pak Hendra, 38 tahun |
| Situasi | Anak usia 4 tahun dengan alergi berat dan kebutuhan jadwal ketat |
| Pain point | Susah menemukan nanny yang paham kondisi khusus anak. Sering ganti nanny. |
| Ekspektasi BundaYakin | "Saya butuh platform yang bisa mengkomunikasikan kondisi anak dengan jelas ke nanny." |
| Value khusus | Do-list/don't-list, kondisi medis, jadwal anak tersimpan dan bisa di-share terstruktur |

### Persona 3 — Nanny Berpengalaman yang Ingin Membangun Reputasi

| Atribut | Detail |
|---|---|
| Nama representatif | Mbak Yanti, 28 tahun |
| Latar belakang | 5 tahun pengalaman, pindah dari Jawa ke Jakarta |
| Pain point | Tidak ada cara untuk membuktikan rekam jejak. Selalu harus mulai dari nol di keluarga baru. |
| Ekspektasi BundaYakin | "Saya mau punya CV digital yang bisa saya tunjukkan ke keluarga baru." |
| Value khusus | Profil digital, badge Terpercaya, rekam jejak terverifikasi |

---

## 4. Proposisi Nilai

### Untuk Orang Tua
- **Matching objektif** — bukan intuisi, tapi data dari kedua pihak
- **Ketenangan pikiran** — monitoring berkala + evaluasi terjadwal
- **Kontinuitas pengasuhan** — knowledge transfer saat ganti nanny

### Untuk Nanny
- **Profil digital gratis** — CV yang bisa dibanggakan
- **Rekam jejak terverifikasi** — trust yang dibangun dari waktu ke waktu
- **Insentif finansial** — bonus milestone untuk nanny yang bertahan

### Pembeda dari Kompetitor

| Aspek | Job Board / Marketplace Biasa | BundaYakin |
|---|---|---|
| Proses matching | Browse → wawancara manual | Survey psikologi → AI scoring → laporan |
| Tanggung jawab | Jamin ketersediaan | Jamin kecocokan |
| Post-placement | Tidak ada | Check-in, evaluasi berkala, knowledge transfer |
| Data nanny | CV manual | Profil digital + rekam jejak + media portfolio |
| Psikologi | Tidak ada | Layer 1–3: survey, psikotes AI, psikolog |

---

## 5. Ruang Lingkup Fasa 1

### Dalam Scope

- Registrasi dan onboarding (orang tua + nanny), auto-login setelah registrasi
- Matching Engine Layer 1 (survey paralel + AI scoring)
- Direktori nanny internal (browse + filter dalam dashboard, skor kecocokan via cache `MatchResult`)
- **Jaminan Kecocokan** (diputuskan Juli 2026, belum dibangun): jika nanny berhenti dalam **30 hari pertama** penugasan → **matching ulang gratis tanpa memakai Kuota Koneksi DAN penempatan ulang gratis penuh (tanpa placement fee kedua)**. Pagar pengaman: (1) berlaku 1× per penempatan; (2) hanya jika berhenti ≤30 hari; (3) alasan berhenti terekam via check-in minggu 1 & 2. Senjata melawan "garansi ganti orang" penyalur tradisional — garansi mereka menjamin ketersediaan, garansi kami menjamin kecocokan; risiko rendah karena kecocokan sudah diukur di awal.
- Profil anak bisa diisi akun free (keputusan 22 Mei 2026 — yang premium adalah *berbagi ke nanny*, bukan datanya)
- Matching Engine Layer 2 (Psikotes AI — instrumen Capture Work Style) — **selesai dikoding 10 Juli 2026, menunggu deploy**: nanny isi tes gratis, orang tua bayar Rp300rb/nanny untuk buka hasil (interpretasi bahasa awam, bukan skor mentah — lihat [ADR-011](08_adr/ADR-011_capture-work-style-built-in.md))
- Placement fee flow (jangka panjang + infal)
- Profil anak multi-anak
- Media portfolio nanny (foto + video)
- Subscription Rp 500rb/tahun via Mayar
- Connection quota system
- Monitoring: check-in + evaluasi berkala
- Laporan PDF (matching + evaluasi)
- Referral sistem (nanny)
- Notifikasi in-app

### Tidak dalam Scope Fasa 1

- Direktori nanny publik (Fasa 2)
- Log aktivitas harian nanny (Fasa 2)
- Review psikolog Layer 3 (Nanny Care Profile™) — keputusan produk & SOP sudah final (10 Juli 2026, lihat [18_spec_nanny_care_profile_layer3.md](18_spec_nanny_care_profile_layer3.md)), implementasi belum dikoding, bergantung Layer 2 yang sudah selesai
- Track record dua arah yang lengkap (sebagian Fasa 1, penuh Fasa 2)
- Babysitter on-demand / hourly (Fasa 3)
- Mobile app native (web-only untuk Fasa 1)

---

## 6. User Stories Kritis

### Orang Tua

| ID | User Story | Kriteria Penerimaan |
|---|---|---|
| US-P01 | Sebagai orang tua, saya ingin mendaftar dan langsung bisa isi survey matching | Registrasi selesai < 3 menit, survey bisa dimulai langsung |
| US-P02 | Sebagai orang tua, saya ingin mengundang nanny tertentu untuk di-matching | Flow A: input nama/nomor nanny → nanny dapat notifikasi → isi survey |
| US-P03 | Sebagai orang tua, saya ingin melihat laporan kecocokan yang jelas | Laporan menampilkan skor per domain, highlight cocok/tidak cocok, tips negosiasi |
| US-P04 | Sebagai orang tua, saya ingin dapat notifikasi saat evaluasi jatuh tempo | Notifikasi H-3 dan H-0 sebelum jadwal evaluasi |
| US-P05 | Sebagai orang tua, saya ingin profil anak saya tersimpan dan bisa diakses nanny aktif | Nanny aktif bisa baca dan tambah catatan di profil anak |
| US-P06 | Sebagai orang tua, saya ingin bayar langganan tanpa kerumitan | Redirect ke Mayar, konfirmasi otomatis via webhook |

### Nanny

| ID | User Story | Kriteria Penerimaan |
|---|---|---|
| US-N01 | Sebagai nanny, saya ingin membuat profil digital lengkap | Profil bisa diisi: foto, video, skills, pengalaman kerja |
| US-N02 | Sebagai nanny, saya ingin upload video perkenalan | Upload video max 3 menit, tampil di profil |
| US-N03 | Sebagai nanny, saya ingin mengisi survey matching secara independen | Survey tidak menampilkan jawaban orang tua sebelum hasil keluar |
| US-N04 | Sebagai nanny, saya ingin memberi catatan tentang anak yang saya jaga | Catatan tersimpan di profil anak, hanya bisa diisi nanny aktif |
| US-N05 | Sebagai nanny, saya ingin membangun rekam jejak yang bisa ditunjukkan | Badge dan rekam jejak terverifikasi muncul di profil |

---

## 7. Success Metrics

### Metrics Fasa 1 (12 bulan pertama)

| Metrik | Target | Cara Ukur |
|---|---|---|
| Registered parent | 200 | Database `User` dengan `role = PARENT` |
| Registered nanny | 500 | Database `User` dengan `role = NANNY` |
| Paying subscriber | 100 | `Subscription.status = ACTIVE` |
| Completed matching | 150 | `MatchingResult` yang selesai |
| Placement fee transaction | 50 | `Transaction` tipe `PLACEMENT_FEE` |
| Nanny bertahan 3 bulan | 30% dari yang placed | `NannyAssignment` dengan durasi ≥ 90 hari |
| Conversion: registered → subscribed | 50% | (paying / registered parent) × 100 |

### Metrics Kualitas

| Metrik | Target |
|---|---|
| Survey completion rate | > 80% dari matching request yang dibuat |
| Evaluation completion rate | > 70% dari evaluasi yang dijadwalkan |
| Repeat subscription (tahun ke-2) | > 60% |

---

## 8. Constraints & Batasan

### Legal & Compliance

- BundaYakin adalah entitas CV terpisah dari HCC
- **Tidak menjamin** integritas, kejujuran, atau keamanan nanny — hanya kecocokan
- Data psikologis (hasil psikotes, catatan psikolog) adalah data sensitif — lihat [AI Governance](09_ai_governance.md)
- Invoice tidak mencantumkan PPN (omzet < Rp 4,8 miliar/tahun, PPh Final 0,5%)
- Psikolog HCC tidak boleh disebut secara eksplisit di marketing publik — cukup "psikolog"

### Technical

- Web-only untuk Fasa 1 (no native mobile app)
- Budget awal terbatas → serverless & managed services (Vercel, Neon, Railway)
- AI scoring menggunakan Claude API (biaya per-request) — perlu caching MatchResult
- Video nanny harus via Cloudflare Stream (bukan disimpan di R2 langsung)

### Operasional

- Tim sangat kecil — tidak ada QA engineer, tidak ada dedicated DevOps
- Mayar sudah diverifikasi dan production aktif (per akhir Mei 2026) — webhook lookup memakai `productId` Mayar
- Layer 3 (psikolog) belum dikoding — SOP sudah final (Tester/Admin pandu sesi grafis, Psikolog HCC tulis catatan di atas skor Layer 2), tinggal diimplementasikan

---

## 9. Asumsi

1. Orang tua target bersedia mengisi survey panjang (~15 menit) jika value proposition jelas
2. Nanny bersedia membuat profil digital dengan foto dan video jika proses mudah dan gratis
3. Mayar cukup reliable sebagai payment gateway untuk pasar Indonesia
4. Claude API memberikan scoring yang konsisten dan dapat dijelaskan ke user
5. Vercel + Neon cukup untuk skalabilitas awal (sampai ratusan user concurrent)

---

## 10. Risiko & Mitigasi

| Risiko | Probabilitas | Dampak | Mitigasi |
|---|---|---|---|
| Nanny tidak mau isi survey (UX terlalu panjang) | Tinggi | Tinggi | Survey dibuat mobile-friendly, progress indicator, bisa save & lanjut |
| Mayar payment gagal/error webhook | Rendah (sudah production) | Tinggi | Verifikasi sudah selesai; monitoring webhook + fallback manual transfer jika insiden |
| AI scoring bias atau tidak akurat | Sedang | Tinggi | Transparansi scoring, mekanisme appeal, tidak dijadikan satu-satunya penentu |
| Data psikologis bocor | Rendah | Sangat Tinggi | Enkripsi, akses terbatas, audit log — lihat AI Governance |
| Skalabilitas database saat user banyak | Rendah | Sedang | Neon serverless auto-scale, Prisma query optimization |

---

*Lihat juga: [Product Ecosystem Blueprint](01_product_ecosystem_blueprint.md) · [Feature Registry](05_feature_registry.md) · [AI Governance](09_ai_governance.md) · [Master Summary](../../apps/web/docs/BundaYakin_MasterSummary_Mei2026.md)*
