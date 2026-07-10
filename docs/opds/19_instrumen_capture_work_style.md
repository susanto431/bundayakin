# Instrumen Capture Work Style (Layer 2 — Psikotes AI)

> Sumber: dua file Excel dari Kartika (10 Juli 2026) — `Soal_sikap kerja_dari aplikasi.xlsx` (soal dari aplikasi lama, tanpa kunci jawaban) dan `Sourcing & Recruiting_Psychological Test__Buku Soal_PAPI-R (Indonesia)_Sikap Kerja.xlsx` (dari tim RnD, punya kunci jawaban/pemetaan dimensi). File asli disimpan di `docs/opds/sumber-instrumen/`.
> Status: **instrumen final, siap dipakai untuk implementasi** — lihat [ADR-011](08_adr/ADR-011_capture-work-style-built-in.md) untuk keputusan arsitektur (built-in di `apps/web`).
> Perlakuan sama seperti [17_draft_instrumen_skrining_kpsp.md](17_draft_instrumen_skrining_kpsp.md): jangan ubah tanpa instruksi eksplisit Kartika.

## Cara rekonsiliasi dua sumber (10 Juli 2026)

Dibandingkan soal per soal (90 blok × 2 pernyataan = 180 pernyataan): **hanya 13 berbeda**, sisanya identik. Keputusan Kartika:
- 8 beda karena salah OCR di file RnD ("Iain" harusnya "lain") — diperbaiki otomatis.
- 5 beda pilihan kata — **pakai versi aplikasi**, KECUALI soal 89B (pakai versi RnD "meletakkan", ejaan baku).
- Kunci jawaban (pemetaan soal → dimensi) **selalu dari file RnD** — file aplikasi tidak punya kunci jawaban sama sekali.

Hasil rekonsiliasi disimpan di `docs/opds/sumber-instrumen/capture-work-style-final.json` (90 objek `{no, statementA, aspekA, statementB, aspekB}`) — ini yang dipakai jadi dasar `src/lib/capture-work-style-instrument.ts`.

## Struktur instrumen

90 blok soal, tiap blok berisi 2 pernyataan (A dan B). Nanny memilih pernyataan yang **lebih menggambarkan dirinya**. Setiap pernyataan (A atau B) terhubung ke satu dari 20 dimensi kepribadian. Skor mentah per dimensi (0–9) dihitung dari jumlah pernyataan yang dipilih nanny yang terhubung ke dimensi itu — tiap dimensi punya tepat 9 pernyataan di seluruh 90 blok (sudah diverifikasi otomatis, total 20×9=180 cocok dengan 90×2).

**20 kode dimensi:** N (Need to Finish a Task), G (Role of Hard Intense Worker), L (Leadership Role), P (Need to Control Others), I (Ease in Decision Making), T (Pace), V (Vigorous Type), F (Need to Support Authority), W (Need for Rules and Supervision), X (Need to Be Noticed), S (Social Extension), B (Need to Belong to Groups), O (Need for Closeness and Affection), Z (Need for Change), E (Emotional Restraint), K (Need to Be Forceful), R (Theoretical Type), D (Interest in Working With Detail), C (Organize Type), A (Need to Achieve).

Tidak berbatas waktu. Instruksi ke nanny: "Jawaban yang tepat biasanya adalah jawaban yang PERTAMA KALI TERLINTAS di pikiran Anda."

## Daftar 90 Soal (final, setelah rekonsiliasi)

| No | Pernyataan A | Dim A | Pernyataan B | Dim B |
|---|---|---|---|---|
| 1 | Saya seorang pekerja keras. | G | Saya bukan seorang pemurung. | E |
| 2 | Saya suka bekerja lebih baik dari orang lain. | A | Saya suka menekuni pekerjaan yang saya lakukan sampai selesai. | N |
| 3 | Saya suka memberi petunjuk kepada orang bagaimana melakukan sesuatu. | P | Saya ingin bekerja sebaik mungkin. | A |
| 4 | Saya senang memberitahu orang apa yang harus dikerjakannya. | P | Saya suka melakukan hal-hal yang lucu. | X |
| 5 | Saya suka bergabung dalam kelompok. | B | Saya senang diperhatikan oleh kelompok. | X |
| 6 | Saya suka berteman dengan suatu kelompok. | B | Saya senang bersahabat akrab dengan seseorang. | O |
| 7 | Saya cepat berubah jika hal itu diperlukan. | Z | Saya berusaha membina hubungan yang akrab dengan teman saya. | O |
| 8 | Saya ingin mencoba sesuatu yang baru dan bervariasi. | Z | Saya ingin membalas bila disakiti. | K |
| 9 | Saya ingin atasan saya menyukai saya. | F | Saya suka memberitahu orang lain jika mereka salah. | K |
| 10 | Saya suka menyenangkan hati orang yang memimpin saya. | F | Saya suka mengikuti petunjuk kerja yang diberikan pada saya. | W |
| 11 | Saya mencoba sekuat tenaga. | G | Saya menempatkan semua barang pada tempatnya. | C |
| 12 | Saya dapat membuat orang mau bekerja keras. | L | Saya tidak mudah marah. | E |
| 13 | Saya suka memberitahu kelompok apa yang harus dikerjakan. | P | Saya selalu menekuni suatu pekerjaan sampai selesai. | N |
| 14 | Saya ingin tampil menarik dan menakjubkan. | X | Saya ingin menjadi sangat sukses. | A |
| 15 | Saya ingin diterima dalam kelompok. | B | Saya suka membantu orang lain dalam mengambil sikap. | P |
| 16 | Saya cemas jika seseorang tidak menyukai saya. | O | Saya suka orang memperhatikan saya. | X |
| 17 | Saya suka mencoba sesuatu yang baru. | Z | Saya lebih suka bekerja bersama orang lain daripada sendiri. | B |
| 18 | Saya menyalahkan orang lain atas kesalahan yang mereka lakukan. | K | Saya merasa terganggu jika ada orang yang tidak menyukai saya. | O |
| 19 | Saya suka mendukung pendapat atasan saya. | F | Saya suka mencoba tugas-tugas yang baru dan berbeda. | Z |
| 20 | Saya suka petunjuk terperinci untuk menyelesaikan permasalahan. | W | Saya suka mengatakan langsung kepada orang lain bila mereka membuat saya kesal. | K |
| 21 | Saya selalu berusaha keras. | G | Saya senang bekerja dengan cermat dan hati-hati. | D |
| 22 | Saya adalah pemimpin yang baik. | L | Saya mengorganisir tugas-tugas dengan baik. | C |
| 23 | Saya mudah mengambil keputusan. | I | Saya pandai mengendalikan diri. | E |
| 24 | Saya suka menceritakan keberhasilan saya dalam mengerjakan tugas. | X | Saya tidak suka mengerjakan beberapa pekerjaan sekaligus. | N |
| 25 | Saya ingin menyelaraskan diri dengan kelompok. | B | Saya ingin melakukan sesuatu lebih baik dari orang lain. | A |
| 26 | Saya suka membina hubungan yang akrab dengan teman-teman saya. | O | Saya suka menasehati orang lain. | P |
| 27 | Saya suka melakukan hal yang baru dan berbeda. | Z | Saya suka menceritakan bagaimana saya berhasil melakukan sesuatu. | X |
| 28 | Jika saya benar, saya akan mempertahankannya. | K | Saya ingin diterima dan diakui dalam suatu kelompok. | B |
| 29 | Saya suka menyenangkan hati orang yang menjadi atasan saya. | F | Saya cemas kalau orang lain tidak menyukai saya. | O |
| 30 | Saya senang diberitahu bagaimana melakukan suatu pekerjaan. | W | Saya mudah merasa bosan. | Z |
| 31 | Saya bekerja keras. | G | Saya banyak berpikir dan berencana. | R |
| 32 | Saya memimpin kelompok. | L | Hal-hal kecil (detail) menarik bagi saya. | D |
| 33 | Saya cepat mengambil keputusan. | I | Saya seorang yang teratur dalam bekerja. | C |
| 34 | Biasanya saya bekerja dengan tergesa-gesa. | T | Saya jarang marah atau bersedih. | E |
| 35 | Saya ingin menjadi bagian dari kelompok. | B | Saya ingin menyelesaikan pekerjaan satu per satu. | N |
| 36 | Saya berusaha berteman secara akrab. | O | Saya berusaha keras untuk menjadi yang terbaik. | A |
| 37 | Saya menyukai kegiatan yang bervariasi dan berbeda. | Z | Saya ingin menjadi penanggung jawab bagi orang-orang lain. | P |
| 38 | Saya menyukai perdebatan mengenai suatu topik. | K | Saya suka mendapatkan perhatian. | X |
| 39 | Saya suka mendukung orang yang menjadi atasan saya. | F | Saya tertarik menjadi bagian dari kelompok. | B |
| 40 | Saya senang mengikuti peraturan secara tertib. | W | Saya suka orang mengenal saya dengan baik. | O |
| 41 | Saya berusaha keras sekali. | G | Saya sangat hangat kepada orang lain. | S |
| 42 | Orang lain beranggapan bahwa saya adalah seorang pemimpin yang baik. | L | Saya berpikir panjang dan hati-hati. | R |
| 43 | Saya sering mengambil risiko atau coba-coba. | I | Saya senang mengurus hal-hal kecil atau detail. | D |
| 44 | Orang lain berpendapat bahwa saya bekerja dengan cepat. | T | Orang lain menganggap saya dapat mengelola segala sesuatunya dengan rapi dan teratur. | C |
| 45 | Saya senang berolahraga rutin. | V | Saya mempunyai pribadi yang menyenangkan. | E |
| 46 | Saya senang bila orang-orang dapat intim dan bersahabat. | O | Saya selalu berusaha menyelesaikan apa yang sudah saya mulai. | N |
| 47 | Saya senang bereksperimen dan mencoba hal-hal baru. | Z | Saya suka mengerjakan tugas-tugas yang sulit dengan baik. | A |
| 48 | Saya ingin diperlakukan secara adil. | K | Saya suka mengajari orang lain bagaimana cara melakukan sesuatu. | P |
| 49 | Saya suka melakukan apa yang diharapkan atasan dari saya. | F | Saya suka menarik perhatian. | X |
| 50 | Saya suka petunjuk terperinci untuk melaksanakan suatu tugas. | W | Saya senang berada bersama dengan orang-orang lain. | B |
| 51 | Saya selalu berusaha menyelesaikan tugas secara sempurna. | G | Orang lain menganggap saya tidak mengenal lelah dalam bekerja. | V |
| 52 | Saya tergolong tipe seorang pemimpin. | L | Saya mudah mendapat kawan baru. | S |
| 53 | Saya mengambil peluang yang muncul dengan cepat. | I | Saya banyak mempertimbangkan konsep dan ide-ide. | R |
| 54 | Saya bekerja dengan cepat. | T | Saya senang mengerjakan hal-hal yang detail. | D |
| 55 | Saya memiliki banyak energi untuk beraktivitas dan berolahraga. | V | Saya suka menata segala sesuatunya dengan rapi dan teratur. | C |
| 56 | Saya dapat bergaul baik dengan semua orang. | S | Saya adalah seorang yang mempunyai pembawaan tenang. | E |
| 57 | Saya ingin mengerjakan hal-hal baru. | Z | Saya selalu ingin menyelesaikan pekerjaan yang telah saya mulai. | N |
| 58 | Saya biasanya mempertahankan pendapat yang saya yakini. | K | Saya ingin menjadi orang yang berhasil. | A |
| 59 | Saya menyukai saran-saran dari orang yang saya kagumi. | F | Saya senang diserahi tanggung jawab atas sekelompok orang. | P |
| 60 | Saya suka diberitahu tentang apa yang perlu dilakukan. | W | Saya suka menerima banyak perhatian. | X |
| 61 | Saya berusaha bekerja keras. | G | Saya mengerjakan sesuatu dengan cepat. | T |
| 62 | Bila saya berbicara, kelompok akan mendengarkan. | L | Saya terampil menggunakan berbagai peralatan kerja. | V |
| 63 | Bagi saya, mengambil keputusan adalah hal yang mudah. | I | Saya sangat menyenangkan dalam bergaul dengan banyak orang. | S |
| 64 | Biasanya saya melakukan berbagai aktivitas dengan cepat. | T | Saya senang bekerja berdasarkan teori atau konsep tertentu. | R |
| 65 | Saya menyukai pekerjaan dimana saya banyak bergerak. | V | Saya menyukai pekerjaan yang harus dilakukan secara teliti. | D |
| 66 | Saya mencari teman sebanyak mungkin. | S | Apa yang sudah saya simpan akan mudah saya temukan kembali. | C |
| 67 | Perencanaan saya jauh ke masa depan. | R | Saya dapat tampil tenang dalam berbagai situasi. | E |
| 68 | Saya biasanya bersikeras mengenai apa yang saya yakini. | K | Saya terus menekuni suatu masalah sampai terselesaikan. | N |
| 69 | Saya suka menyenangkan hati orang-orang yang saya kagumi. | F | Saya ingin sukses. | A |
| 70 | Saya menyukai prosedur dan aturan kerja yang jelas. | W | Saya suka membantu kelompok dalam mengambil sikap. | P |
| 71 | Saya selalu berusaha bekerja keras. | G | Saya mengambil keputusan secara mudah. | I |
| 72 | Kelompok biasanya melakukan apa yang saya inginkan. | L | Saya biasa terburu-buru. | T |
| 73 | Saya tidak banyak pertimbangan dalam membuat keputusan. | I | Saya tidak mengenal lelah dalam bekerja. | V |
| 74 | Saya bekerja secara cepat. | T | Saya mudah berteman. | S |
| 75 | Biasanya saya bersemangat dan penuh energi. | V | Sebagian besar waktu saya gunakan untuk berpikir. | R |
| 76 | Saya sangat ramah kepada orang-orang. | S | Saya menyukai pekerjaan yang menuntut ketepatan. | D |
| 77 | Saya banyak berpikir dan merencanakan. | R | Saya menyimpan segala sesuatu pada tempatnya. | C |
| 78 | Saya suka pekerjaan yang harus memperhatikan hal-hal kecil (detail). | D | Saya tidak cepat marah. | E |
| 79 | Saya senang mengikuti orang-orang yang saya kagumi. | F | Saya selalu menyelesaikan pekerjaan yang telah saya mulai. | N |
| 80 | Saya menyukai petunjuk kerja yang jelas. | W | Saya suka menjadi orang yang sukses. | A |
| 81 | Saya mengejar apa yang saya inginkan. | G | Saya adalah pemimpin yang baik. | L |
| 82 | Saya membuat orang lain bekerja keras. | L | Saya adalah seorang yang tidak banyak pertimbangan dalam mengambil keputusan. | I |
| 83 | Saya bicara dengan cepat. | T | Saya membuat keputusan dengan cepat. | I |
| 84 | Saya biasanya tergesa-gesa dalam bekerja. | T | Saya berolahraga secara teratur. | V |
| 85 | Saya berteman dengan sebanyak mungkin orang. | S | Orang mengatakan bahwa saya tidak mengenal lelah. | V |
| 86 | Saya mempunyai banyak sekali teman. | S | Saya banyak menghabiskan waktu untuk berpikir. | R |
| 87 | Saya suka bekerja dengan hal-hal yang terperinci. | D | Saya bekerja dengan teori. | R |
| 88 | Saya menikmati pekerjaan yang melibatkan hal detail. | D | Saya suka mengorganisir pekerjaan saya. | C |
| 89 | Orang lain tidak mudah mengetahui apa yang saya rasakan. | E | Saya meletakkan segala sesuatu pada tempatnya. | C |
| 90 | Saya senang diberi petunjuk mengenai apa yang harus saya lakukan. | W | Saya harus menyelesaikan apa yang sudah saya mulai. | N |

## Skoring

1. **Raw score per dimensi (0–9):** hitung berapa kali nanny memilih pernyataan yang terhubung ke dimensi tersebut (maks 9, sesuai jumlah pernyataan per dimensi).
2. **Konversi raw → skor 0–100:** `skor = round((raw / 9) * 100)` (lihat [18_spec_nanny_care_profile_layer3.md](18_spec_nanny_care_profile_layer3.md) untuk tabel konversi).
3. **Konversi 20 dimensi → 8 aspek (A1–A8):** rumus lengkap ada di [18_spec_nanny_care_profile_layer3.md](18_spec_nanny_care_profile_layer3.md) — Layer 2 otomatis menghasilkan A1–A6 (dari PAPI langsung) dan estimasi awal A7/A8 (ditandai "partial", karena bacaan grafis final adalah pekerjaan Layer 3/psikolog).

## Implementasi

- Data soal: `src/lib/capture-work-style-instrument.ts`
- Mesin skoring: `src/lib/capture-work-style-scoring.ts`
- Model penyimpanan hasil: `AssessmentResult` (layer `LAYER_2`, `testType: "Capture Work Style"`, `rawScores` Json berisi jawaban mentah + skor dimensi + skor aspek, `interpretedBy: "AI"`)

*Rujukan: [ADR-011](08_adr/ADR-011_capture-work-style-built-in.md) · [Spesifikasi Nanny Care Profile (Layer 3)](18_spec_nanny_care_profile_layer3.md) · CONTEXT.md*
