# Tes Sikap Kerja (ATTITUDES) — Interpretasi Hasil & Cara Hitung

**Domain:** Assessment
**Sumber kode:**
- `app/Services/TestResultService.php` → `extractAttitudes()`, `storeAttitudes()`
- `app/Http/Controllers/Api/TestResultController.php` → `extractAttitudes()`, `storeAttitudes()` (duplikat logika yang sama)
- `app/Services/FPDF/Templates/PDF_ATTITUDES.php` → label & pengelompokan dimensi pada laporan PDF
- `public/assets/files/NormAttitude.csv` → 81 baris data norma (skor → interpretasi)
- `database/seeds/TestTypeDescriptionSeeder.php` → deskripsi resmi tes
- `app/Models/ResultAttitude.php`, `app/Models/NormAttitude.php`

## Jawaban singkat

**Ya, ada interpretasi.** Setiap dari 20 skala (kode 1 huruf) punya beberapa *band* skor, dan tiap band punya teks interpretasi (narasi kepribadian/sikap kerja) dalam Bahasa Indonesia. Ini disimpan di tabel `norm_attitudes` (`code`, `score_min`, `score_max`, `description`) dan di-copy ke `result_attitudes.description` saat skor peserta dihitung. Tidak ada satu paragraf "kesimpulan keseluruhan" yang menggabungkan 20 skala — laporan PDF hanya menggabungkan (concat) teks interpretasi per kode ke dalam blok per dimensi (lihat `AddBoxInterpretasi` di `PDF_ATTITUDES.php`).

**Yang belum ada di codebase:** teks butir soal asli (pasangan pernyataan forced-choice yang dibaca peserta). Itu adalah data dinamis di database aplikasi `surveyapp` (tabel `questions` / `new_questions`), bukan seed statis di repo ini.

---

## Cara Menghitung Skor

Format soal: **forced-choice**, satu tag per item yang dijawab.

1. Ambil semua jawaban peserta yang bukan contoh (`is_example == 0`).
2. Tiap jawaban punya satu `answer_tag` berkode `PAPI_<KODE>` (mis. `PAPI_G`, `PAPI_N`) — prefix `PAPI_` di-strip jadi kode 1 huruf.
3. **Skor mentah per kode = jumlah kemunculan tag tersebut** (`groupBy('tag')` lalu `count()`).
4. Untuk tiap kode, cari baris `norm_attitudes` dengan `code` sama dan `score_max >= skor` (band pertama yang cukup menampung skor, diurutkan dari `score_min` terkecil) → ambil `description`-nya.
5. Kode yang **tidak pernah muncul** di jawaban peserta otomatis diberi skor `0`, dan interpretasinya diambil dari band dengan `score_min = 0`.
6. Hasil akhir disimpan satu baris per kode per peserta di `result_attitudes` (`nit`, `code`, `score`, `description`).

```
answers = all_data.filter(item => item.is_example == 0)
                   .map(item => strip_prefix(item.answer_candidate.answer_tag[0].tag_name, "PAPI_"))

raw_score[code] = count(answers where tag == code)   // per 20 kode

for each code in ALL_CODES:
    score = raw_score[code] ?? 0
    band  = norm_attitudes.find(code == code AND score_max >= score)  // band terendah yg cukup
    save ResultAttitude(nit, code, score, band.description)
```

> Tidak ada bobot atau reverse-scoring di kode. Karena format ipsative (forced-choice), skor antar-skala saling terkait — memilih satu skala di suatu soal berarti tidak memilih skala lain pada soal yang sama.

---

## Ringkasan 20 Skala

| Kode | Skala (label internal) | Dimensi |
|---|---|---|
| N | Need to Finish a Task | Arah Kerja |
| G | Role of Hard Intense Worker | Arah Kerja |
| A | Need to Achieve | Arah Kerja |
| L | Leadership Role | Kepemimpinan |
| P | Need to Control Others | Kepemimpinan |
| I | Ease in Decision Making | Kepemimpinan |
| T | Pace | Tempo Kerja |
| V | Vigorous Type | Tempo Kerja |
| F | Need to Support Authority | Followership |
| W | Need for Rules and Supervision | Followership |
| X | Need to Be Noticed | Dorongan Sosial |
| S | Social Extension | Dorongan Sosial |
| B | Need to Belong to Groups | Dorongan Sosial |
| O | Need for Closeness & Affection | Dorongan Sosial |
| R | Theoretical Type | Gaya Kerja |
| D | Interest in Working With Detail | Gaya Kerja |
| C | Organize Type | Gaya Kerja |
| Z | Need for Change | Temperamen |
| E | Emotional Restraint | Temperamen |
| K | Need to Be Forceful | Temperamen |

---

## 1. Arah Kerja (Energi dan Dinamika Kerja / Work Direction)

### N — Need to Finish a Task

| Skor | Interpretasi |
|---|---|
| 0–2 | Ia tidak merasa perlu untuk menyelesaikan sendiri tugas-tugasnya dan lebih senang mendelegasikan tugas yang menjadi tanggung jawabnya kepada orang lain. Konsentrasinya dalam bekerja mudah terpecah dan cenderung meninggalkan tugas sebelum tuntas untuk mengerjakan hal lain yang menarik perhatiannya atau ia anggap lebih penting. |
| 3–5 | Ia memiliki cukup komitmen untuk menyelesaikan tugas yang menjadi tanggung jawabnya. Namun jika memungkinkan, ia akan mendelegasikan tugasnya pada orang lain. |
| 6–7 | Ia memiliki komitmen yang tinggi untuk menyelesaikan tugasnya. Dalam bekerja, ia memiliki preferensi untuk mengerjakan tugasnya satu per satu, namun jika terpaksa ia masih bisa mengubah prioritas kerjanya. |
| 8+ | Ia memiliki komitmen yang sangat tinggi untuk menyelesaikan tugas hingga tuntas. Hal ini mendorongnya untuk fokus pada pekerjaan yang ada di hadapannya dan bertekun untuk menyelesaikannya. Kebutuhannya untuk menyelesaikan tugas satu per satu berpotensi membuat perhatiannya terpaku pada satu tugas sehingga sulit menangani beberapa tugas sekaligus. Ia pun sulit mendelegasikan pekerjaan yang ia hayati sebagai tugasnya pribadi kepada orang lain. |

### G — Role of Hard Intense Worker

| Skor | Interpretasi |
|---|---|
| 0–2 | Ia bukan pribadi yang memandang kerja keras sebagai hal yang penting. Ia cenderung santai dalam bekerja dan enggan menuangkan energi yang besar untuk mengerjakan tugasnya. Jika memungkinkan, ia akan mencari cara atau sistem yang dapat mempermudah dirinya dalam menyelesaikan pekerjaan dengan usaha seminim mungkin. Hal ini terkadang membuatnya terkesan malas. |
| 3–4 | Dalam bekerja, ia mau bekerja sesuai tuntutan tugasnya. Namun jika memungkinkan ia akan menyalurkan usahanya untuk hal-hal yang bermanfaat dan menguntungkan dirinya. |
| 5–7 | Ia mau bekerja keras ketika memiliki tujuan yang jelas untuk dicapai. Ia akan bersikap lebih santai ketika memang menghadapi situasi yang tidak menuntutnya untuk bekerja keras. |
| 8+ | Ia ingin dipandang sebagai seorang pekerja keras dan memandang bahwa bekerja keras merupakan hal yang penting untuk dilakukan. Kebutuhannya untuk dipandang sebagai pekerja keras berpotensi menyebabkan ia menciptakan pekerjaan yang tidak perlu dan kadang kala tanpa tujuan yang jelas. |

### A — Need to Achieve

| Skor | Interpretasi |
|---|---|
| 0–4 | Ia bukan pribadi yang kompetitif dan mudah puas atas pencapaian dirinya. Ia kurang tergerak untuk mencapai target yang menantang dan tidak tertarik untuk menjadi yang terbaik. Ia belum mengerahkan usahanya secara optimal untuk menyelesaikan tugas. Dengan demikian, ia masih membutuhkan dorongan dari luar dirinya untuk memotivasinya lebih berusaha mencapai sasaran. |
| 5–7 | Ia memiliki kebutuhan yang cukup besar untuk menjadi lebih baik dibanding orang lain. Ia ingin menjadi pribadi yang berprestasi, namun cukup realistis untuk menyesuaikannya dengan situasi yang dihadapi. Ia mengetahui tujuan yang ingin dicapainya dan mau berusaha untuk mencapai tujuannya tersebut. Dalam menetapkan target, ia cenderung menyesuaikannya dengan kemampuan diri secara realistis. |
| 8+ | Ia merupakan pribadi yang sangat berambisi untuk berprestasi dan menjadi yang terbaik. Ia menyukai tantangan dan situasi kerja yang kompetitif. Dalam menetapkan target, ia cenderung mengejar kesempurnaan dan target yang tinggi. Hal ini berpotensi menyebabkan ia kurang realistis dalam menetapkan target, baik bagi dirinya maupun orang lain dan mudah kecewa ketika harapannya tidak tercapai. |

---

## 2. Kepemimpinan (Leadership)

### L — Leadership Role

| Skor | Interpretasi |
|---|---|
| 0–1 | Ia puas dengan perannya sebagai bawahan atau anggota tim sehingga memberikan kesempatan pada orang lain untuk memimpin. Ia kurang percaya diri untuk berperan sebagai pemimpin dan cenderung pasif dalam tim kerjanya. |
| 2–3 | Ia memiliki keinginan untuk didengarkan pendapatnya oleh kelompok, namun tidak aktif mengambil peran sebagai pemimpin. Ia kurang percaya diri dan enggan berada di posisi pemimpin. |
| 4 | Ia kurang percaya diri dan kurang berminat untuk berperan sebagai pemimpin dalam tim kerjanya. |
| 5 | Ia tidak secara aktif mencari posisi sebagai pemimpin, namun cukup percaya diri jika diberi kepercayaan untuk berperan sebagai pemimpin. |
| 6–7 | Ia memiliki keinginan untuk berperan sebagai pemimpin yang cukup besar dan percaya diri bahwa ia dapat menjalankan peran tersebut. |
| 8+ | Ia tertarik untuk menjalankan peran sebagai pemimpin dan sangat percaya diri untuk berperan sebagai pemimpin. Terkadang Ia terlalu percaya diri dan angkuh dalam mengarahkan tim kerjanya. Dengan kebutuhannya yang besar untuk dipandang sebagai pemimpin ia berpotensi tidak memberikan kesempatan memimpin pada orang lain yang mungkin lebih siap atau kompeten dibanding dirinya. |

### P — Need to Control Others

| Skor | Interpretasi |
|---|---|
| 0–1 | Ia bukan pribadi yang mendominasi dalam tim kerja. Ia cenderung menghindari tugas yang menuntutnya untuk memberikan arahan dan membimbing orang lain. Jika berperan sebagai pemimpin, ia akan bersikap permisif dan kurang memberikan arahan dan pendampingan kepada anggota tim kerjanya. Ia tidak merasa bertanggung jawab atas hasil kerja anggota timnya. |
| 2–3 | Ia enggan mengontrol dan mengarahkan orang lain. Ia pun tidak merasa bertanggung jawab atas hasil kerja orang lain. Jika menjalankan peran sebagai pemimpin, ia cenderung membiarkan bawahannya bekerja sesuai gaya kerjanya masing-masing. Ia pun mengharapkan bawahannya untuk mempertanggungjawabkan hasil kerjanya masing-masing. |
| 4 | Ia cenderung enggan mengarahkan, membimbing, dan mengajari orang lain bagaimana melakukan sesuatu. Ia lebih memilih untuk bekerja sendiri dalam rangka mencapai sasaran kelompok. Jika ia berperan sebagai pemimpin, ia memposisikan diri sebagai pemimpin yang sedikit memberikan arahan dan lebih banyak memberikan kebebasan kepada personel kerjanya. Ia kurang aktif memanfaatkan kapasitas bawahannya secara optimal. |
| 5 | Ia senang mengatur dan mengarahkan orang lain untuk melakukan pekerjaan mereka. Ia ingin membantu orang lain menyelesaikan tugasnya dengan baik. Hal ini ia lakukan tanpa menunjukan sikap yang mendominasi. |
| 6–7 | Ia merupakan pribadi yang berinisiatif untuk mengarahkan dan mengatur orang lain dalam tim kerjanya. Ia merasa ikut bertanggung jawab atas hasil kerja timnya dan cenderung bersikap dominan dalam mengarahkan orang-orang di tim kerjanya. |
| 8+ | Ia merupakan pribadi yang senang mempengaruhi dan mengarahkan orang lain. Ia merasa bertanggung jawab untuk memastikan hasil kerja timnya sesuai ketentuan yang dipersyaratkan. Kebutuhannya yang besar untuk mengarahkan orang lain berpotensi membuatnya cenderung mendominasi dalam kelompok yang sulit bekerja sama dengan rekan yang berkedudukan sejajar ataupun dengan atasan yang juga dominan. |

### I — Ease in Decision Making

| Skor | Interpretasi |
|---|---|
| 0–1 | Ia sangat berhati-hati dalam mengambil keputusan. Kehati-hatiannya ini membuatnya lambat dalam mengambil keputusan. Jika cenderung menghindari situasi yang menuntutnya untuk mengambil keputusan ataupun mengalihkan pengambilan keputusan tersebut pada orang lain. |
| 2–3 | Ia cenderung ragu-ragu dalam mengambil keputusan. Jika memungkinkan, ia akan menyerahkan pengambilan keputusan pada orang lain dan mengikuti keputusan yang dibuat orang lain. |
| 4–5 | Ia tergolong cukup berhati-hati dalam mengambil keputusan. Jika memungkinkan, ia cenderung memilih untuk mengambil waktu sejenak sebelum membuat keputusan. |
| 6–7 | Ia cukup percaya diri dalam mengambil keputusan. Ia dapat mengambil keputusan dengan cepat dan siap menanggung risiko dari keputusan yang dibuatnya. Dalam hal-hal tertentu, keputusannya didasarkan pada pertimbangan-pertimbangan terlebih dulu. |
| 8+ | Ia menilai dirinya sebagai pribadi yang cepat dan mudah mengambil keputusan. Ia berani mengambil memanfaatkan kesempatan yang ada. Ia pun sangat yakin akan keputusan yang diambilnya. Ia cenderung impulsif dalam menilai sehingga keputusannya belum didasarkan pada pertimbangan yang matang. |

---

## 3. Tempo Kerja (Activity)

### T — Pace

| Skor | Interpretasi |
|---|---|
| 0–3 | Ia tidak memandang dirinya sebagai pribadi yang bekerja dengan cepat. Ia lebih memprioritaskan hal-hal lain selain kecepatan kerja. Kurangnya rasa urgensi untuk menyelesaikan tugas dengan cepat membuat ia terkesan santai dalam bekerja. Ia pun berpotensi untuk membuang-buang waktu dan kurang tepat waktu mengikuti tenggat waktu penyelesaian tugas yang ketat. |
| 4–6 | Ia memandang dirinya sebagai pekerja yang cukup cepat dalam menyelesaikan tugas. Kecepatan kerja merupakan hal yang cukup menjadi perhatiannya. Dalam beberapa situasi ia berusaha bekerja dengan cepat sementara di situasi yang berbeda, ia memprioritaskan hal lain selain kecepatan penyelesaian tugas. Ia diperkirakan dapat menyesuaikan tempo kerjanya dengan cukup berimbang. |
| 7+ | Ia memandang dirinya sebagai pribadi yang bekerja dengan cepat. Menyelesaikan tugas dengan cepat dipandang sebagai hal yang penting baginya. Keinginannya untuk segera menyelesaikan tugas membuat ia cenderung terburu-buru dalam bekerja. Hal ini berpotensi membuatnya tegang, cemas, dan impulsif dalam menyelesaikan tugasnya. |

### V — Vigorous Type

| Skor | Interpretasi |
|---|---|
| 0–2 | Ia memililki preferensi untuk bekerja di belakang meja dibanding mengerjakan tugas-tugas yang menuntutnya untuk banyak bergerak melakukan sesuatu. Dengan pembawaannya yang kurang energik, ia cenderung terkesan lamban dalam kesehariannya. |
| 3–6 | Ia memiliki preferensi yang cukup berimbang antara bekerja di belakang meja dengan terjun langsung ke lapangan dan mengerjakan tugas yang membutuhkan energi. |
| 7+ | Ia lebih memilih untuk bekerja di lapangan dibanding bekerja di balik meja. Ia menyukai aktivitas fisik yang memungkinkannya untuk banyak bergerak melakukan sesuatu. Ia cenderung kurang betah mengerjakan tugas rutin yang monoton di balik meja. |

---

## 4. Followership

*(disebut "kebutuhan untuk mengikuti arahan" pada deskripsi resmi tes)*

### F — Need to Support Authority

| Skor | Interpretasi |
|---|---|
| 0–3 | Sebagai bagian dalam organisasi, ia pribadi yang otonom dan lebih senang bekerja sendiri tanpa campur tangan orang lain. Motivasi kerjanya timbul bukan karena pujian dari otoritas. Ketika memiliki pemikiran dan pendapat yang berbeda dengan atasan, ia cenderung tidak puas dan mempertanyakan otoritas atasan sehingga terkesan kurang loyal terhadap organisasi karena kurang mendukung otoritas. |
| 4–6 | Ia memiliki keinginan untuk menyenangkan otoritas dan bekerja sesuai arahan atasan. Di sisi lain, ia masih dapat bekerja secara mandiri juga sesuai situasi yang dihadapinya. |
| 7 | Ia pribadi yang cukup loyal pada atasannya dan ingin menyenangkan atasan. Ia patuh mengikuti perintah dan arahan kerja yang ia terima. Adanya penerimaan dan dukungan dari figur otoritas menjadi hal yang penting baginya. |
| 8+ | Ia pribadi yang loyal dan memiliki keinginan yang besar untuk menyenangkan atasan. Ia mau mematuhi arahan atasan meski hal tersebut mungkin kurang sejalan dengan pemikirannya. Keenggannya untuk memberikan pendapat yang berbeda dari figur otoritas membuatnya terkesan kurang mandiri dan pasif. |

### W — Need for Rules and Supervision

| Skor | Interpretasi |
|---|---|
| 0–3 | Ia berpatokan pada tujuan dan garis besar tugas dalam bekerja. Ia dapat bekerja dalam situasi kerja yang kurang terstruktur, mandiri, dan berinisiatif. Terkadang ia terkesan kurang patuh karena cenderung mengabaikan aturan dan prosedur kerja yang berlaku. Ia merasa kurang nyaman jika diminta mengikuti pedoman kerja secara kaku. |
| 4–5 | Ia dapat mengerjakan tugas secara mandiri selama ia telah mendapatkan pengarahan awal dan tolak ukur keberhasilan yang jelas. |
| 6–7 | Ia membutuhkan uraian rinci mengenai tugas, wewenang, dan tanggung jawabnya sebagai pedoman kerjanya. Ia cenderung kurang percaya diri jika diminta bekerja tanpa adanya aturan dan prosedur yang jelas. |
| 8+ | Ia membutuhkan adanya uraian tugas, wewenang, dan tanggung jawab yang dijelaskan secara rinci dalam bekerja. Ia patuh pada arahan dan pedoman kerja yang diberikan padanya. Ia cenderung kurang berinisiatif dalam melaksanakan tugas dan ingin organisasi yang menyiapkan semua informasi dan hal-hal yang ia butuhkan dalam bekerja. |

---

## 5. Dorongan Sosial (Social Nature)

### X — Need to Be Noticed

| Skor | Interpretasi |
|---|---|
| 0–1 | Ia cenderung menghindari situasi yang berpotensi membuatnya menjadi pusat perhatian sehingga ia terkesan menarik diri dan pemalu. Ia bukan pribadi yang menyombongkan dirinya di depan orang lain. Ia justru terkesan kurang percaya diri dan terkadang merendahkan kapasitas dirinya. |
| 2–3 | Kebutuhannya untuk menjadi pusat perhatian cenderung kecil sehingga ia terkesan sebagai pribadi yang pendiam dan pemalu saat berinteraksi dalam kelompok. Ia lebih suka tidak menonjolkan diri dibanding menjadi pusat perhatian. |
| 4–5 | Ia mengharapkan adanya perhatian dan pengakuan dari lingkungan. Ia tidak ingin diabaikan oleh orang di sekelilingnya. Akan tetapi, ia tidak mencari perhatian dalam setiap interaksinya dengan orang lain. Diperkirakan, ia pun dapat memberi kesempatan orang lain untuk juga menjadi pusat perhatian. |
| 6+ | Ia merasa bangga akan diri dan gayanya sendiri. Ia mengharapkan adanya perhatian dari lingkungan dan senang saat menjadi pusat perhatian. Pembawaannya yang senang menceritakan tentang dirinya berpotensi membuat orang lain memandang dirinya sebagai pribadi yang sombong. |

### S — Social Extension

| Skor | Interpretasi |
|---|---|
| 0–2 | Ia lebih senang bekerja sendiri dibanding berinteraksi dengan banyak orang. Bergaul dengan banyak orang bukanlah hal yang ia anggap penting. Ia cenderung menarik diri saat berada di antara banyak orang. Terdapat kemungkinan bahwa ia pribadi yang kaku dan kurang luwes dalam berinteraksi dengan banyak orang. |
| 3–4 | Ia bukan pribadi yang aktif membuka interaksi dengan orang lain ataupun cukup percaya diri untuk menghidupkan suasana yang menyenangkan dalam interaksinya dengan banyak orang. Namun pada dasarnya ia masih cukup terbuka untuk menjalin interaksi dengan orang lain. |
| 5+ | Ia memandang dirinya sebagai pribadi yang ramah dan mudah bergaul. Di lingkungan sosial, ia cenderung tampil percaya diri dan berusaha menghidupkan suasana yang menyenangkan. Sebagai pribadi yang menyukai interaksi dengan banyak orang, ia kemungkinan akan berinisatif untuk menjalin relasi dengan orang lain. Di sisi lain, hal ini berpotensi membuatnya banyak membuang waktu untuk aktivitas sosial dibanding menyelesaikan tugas yang menjadi tanggung jawabnya. |

### B — Need to Belong to Groups

| Skor | Interpretasi |
|---|---|
| 0–2 | Ia adalah pribadi yang mandiri secara emosi sehingga tidak mudah dipengaruhi tekanan kelompok. Ia bukan pribadi yang senang terikat dalam satu kelompok secara eksklusif. Terdapat kemungkinan bahwa ia kurang peka terhadap sikap dan kebutuhan kelompok. Pembawaannya yang cenderung penyendiri membuatnya enggan terikat sebagai bagian dalam kelompok tertentu. |
| 3–5 | Ia cenderung selektif dalam bergabung dengan kelompok. Terdapat kemungkinan bahwa ia bergabung dalam suatu kelompok apabila ia memandang kelompok tersebut bernilai atau sesuai minat. Dengan kebutuhannya bergabung dalam kelompok yang tergolong moderat, diperkirakan ia tidak mudah dipengaruhi pendapat kelompoknya. Ada situasi di mana ia senang menjadi bagian dalam kelompok, namun ada juga saat-saat dimana ia akan memprioritaskan hal lain dibanding berkumpul di kelompok. |
| 6+ | Ia memiliki kebutuhan yang besar untuk menjadi bagian dalam kelompok. Ia pun ingin disukai dan diakui oleh lingkungan. Penerimaan dari teman dan hubungan yang harmonis menjadi hal yang penting baginya. Rasa keterikatan yang besar pada kelompok akan membuatnya fokus ke kepentingan kelompoknya. Hal ini berpotensi membuatnya mudah terpengaruh pendapat kelompok. Selain itu, ia pun cenderung lebih mengutamakan relasinya dalam kelompok dibanding penyelesaian tugas dan tanggung jawab pribadinya. |

### O — Need for Closeness & Affection

| Skor | Interpretasi |
|---|---|
| 0–2 | Dalam menjalin relasi, ia cenderung menjaga jarak dan membangun hubungan yang formal dengan orang lain. Ia sangat berhati-hati dalam menyampaikan informasi yang sifatnya pribadi. Ia tampil dingin dan kaku ketika berinteraksi dengan orang lain, terutama saat berada dalam situasi informal. Ia tidak berusaha untuk mengenal orang lain secara mendalam sehingga terdapat kemungkinan ia pun kurang peka atas perasaan orang lain. |
| 3–5 | Dalam menjalin relasi, ia tidak aktif mencari ataupun menghindari hubungan antarpribadi secara personal. Ia cenderung memilih untuk membiarkannya terjadi secara natural. |
| 6+ | Dalam menjalin relasi, ia sangat menghargai persahabatan yang mendalam dan tulus. Ia peka akan kebutuhan orang lain dan berharap orang lain pun mengenal dan memahaminya secara personal. Waktu dan energinya banyak diluangkan untuk menjalin hubungan yang intim dengan orang lain. Fokusnya untuk menjalin relasi yang mendalam berpotensi membuat dirinya kurang fokus pada target kerja dan tanggung jawab kerja yang harus ia penuhi. Ia cenderung subjektif dalam memberikan penilaian dan mudah tersinggung atas sikap dan perkataan orang lain. Ada indikasi ia sangat tergantung pada individu tertentu yang dirasanya nyaman. |

---

## 6. Gaya Kerja (Work Style)

### R — Theoretical Type

| Skor | Interpretasi |
|---|---|
| 0–3 | Ia merupakan tipe pragmatis yang menghadapi berbagai situasi kerja berdasarkan pengalaman ataupun intuisinya. Ia lebih fokus mencari solusi praktis dibanding memikirkan teori, konsep, dan ide. Ia cenderung bekerja secara spontan dan tanpa perencanaan. Meski di satu sisi dia diperkirakan dapat cepat merespon berbagai situasi, namun hal ini seringkali tanpa didasari pada pertimbangan matang. |
| 4–5 | Dalam menghadapi berbagai situasi kerja, pertimbangannya berimbang antara pengalaman praktis di lapangan dengan perencanaan dan pemikiran yang mendalam. |
| 6–7 | Ia suka memikirkan situasi dan permasalahan secara mendalam. Dalam memikirkan sesuatu, ia merujuk pada teori atau konsep tertentu. |
| 8+ | Ia merupakan tipe pemikir yang sangat tertarik untuk memikirkan teori, konsep, ide dan gagasan. Ia tertarik pada peluang dan ide baru meski terkadang hal-hal tersebut kurang praktis dan kurang dapat diimplementasikan di lapangan. Ia memiliki preferensi untuk menyusun rencana kerja sebagai bentuk persiapannya menghadapi masa mendatang. Ia cenderung kaku pada rencana kerja yang dibuatnya. |

### D — Interest in Working With Detail

| Skor | Interpretasi |
|---|---|
| 0–1 | Ia lebih senang melihat pekerjaan secara makro dan fokus pada hal-hal yang ia anggap penting dalam pekerjaannya. Jika memungkinkan, ia akan menghindari dan mendelegasikan hal detail pada orang lain. Kurangnya perhatian terhadap hal detail berpotensi membuat ia bertindak tanpa didasarkan data yang akurat dan bertindak ceroboh pada tugas yang membutuhkan kecermatan tinggi. |
| 2–3 | Ia kurang tertarik untuk memperhatikan hal detail, namun ia masih cukup peduli pada akurasi, kelengkapan data, dan hal detail yang ada di lingkup kerjanya. |
| 4–6 | Ia tertarik untuk menangani sendiri hal-hal detail yang terkait dengan pekerjaannya. Namun jika diperlukan, ia masih dapat mengalihkan fokusnya pada hal lain yang lebih penting. |
| 7+ | Ia memiliki minat yang sangat besar untuk memperhatikan hal detail. Akurasi dan kelengkapan data menjadi hal yang penting baginya. Terkadang ia terpaku pada hal-hal detail hingga tujuan utama yang ingin dicapai cenderung terabaikan. Ia pun berpotensi menghabiskan waktu yang terlalu lama dalam mengerjakan tugas secara detail sehingga penyelesaian tugas membutuhkan waktu yang cukup lama. |

### C — Organize Type

| Skor | Interpretasi |
|---|---|
| 0–2 | Ia tidak memandang keteraturan dan kerapian lingkungan kerjanya sebagai hal yang penting. Ia lebih mementingkan fleksibilitas kerja sesuai situasi dan kondisi yang dihadapinya saat itu dibanding keteraturan dan sistematika kerja. |
| 3–4 | Pada dasarnya ia lebih menyukai lingkungan kerja yang fleksibel dibanding lingkungan kerja yang teratur dan tertata. Namun ia masih cukup memperhatikan keteraturan dan kerapian lingkungan kerja. |
| 5–6 | Ia memperhatikan keteraturan dan kerapian lingkungan kerja. Namun masih cukup fleksibel menyesuaikan diri ketika situasi dan kondisi yang dihadapi tidak sesuai dengan harapannya. |
| 7+ | Ia sangat menyukai lingkungan kerja yang tertata rapi. Adanya penataan lingkungan kerja yang tidak terorganisir dan berantakan merupakan hal yang dirasa mengganggu baginya. Ada kecenderungan bahwa ia kaku mempertahankan penataan dan sistem kerja yang menurutnya teratur. |

---

## 7. Temperamen (Temperament)

### Z — Need for Change

| Skor | Interpretasi |
|---|---|
| 0–1 | Ia menyukai pekerjaan rutin serta lingkungan yang stabil dan tidak berubah. Ia dapat mengerjakan tugas yang monoton tanpa merasa bosan. Ia tidak membutuhkan variasi dan cenderung menolak perubahan. Kesulitannya untuk menerima hal baru membuatnya membutuhkan waktu lama untuk beradaptasi. |
| 2–3 | Ia lebih menyukai aktivitas rutin yang sudah akrab baginya dibanding hal-hal baru yang berbeda dari kesehariannya. Ia hanya menerima perubahan jika hal tersebut didasari oleh hal yang jelas dan meyakinkan. Ia cenderung resisten dan membutuhkan waktu untuk dapat menerima hal baru dan perubahan. |
| 4–5 | Ia cukup menyukai perubahan dan mudah beradaptasi dengan hal baru. |
| 6–7 | Ia antusias terhadap perubahan dan mencari hal-hal baru yang dapat dilakukan dalam kesehariannya. Dalam menerima dan melakukan hal-hal baru, ia tetap mempertimbangkan manfaat dari berbagai hal baru tersebut. |
| 8+ | Ia sangat menyukai perubahan, ide-ide baru, dan melakukan aktivitas yang bervariasi. Hal ini membuatnya aktif mencari dan menginisiasi perubahan. Ia mudah beradaptasi pada situasi yang berbeda-beda. Ia tidak menyukai tugas rutin yang monoton dan berpotensi mudah bosan ketika mengerjakannya. Ia membutuhkan variasi dalam kesehariannya meski hal tersebut tidak efektif ataupun tidak signifikan mendukung pencapaian target dan pemenuhan tugasnya. |

### E — Emotional Restraint

| Skor | Interpretasi |
|---|---|
| 0–1 | Ia memandang dirinya sebagai pribadi yang sangat terbuka dan berterus terang. |
| 2–3 | Ia memandang dirinya sebagai pribadi yang terbuka dalam mengungkapkan perasaan dan pendapatnya mengenai suatu hal kepada orang lain. |
| 4–6 | Ia memandang dirinya dapat mengendalikan perasaannya dengan cukup baik. Ia dapat mengekspresikan perasaannya dalam situasi tertentu dan menahan ekspresi emosinya di situasi yang lain. |
| 7+ | Ia memandang dirinya sebagai pribadi yang tenang dan dapat menyimpan emosinya dengan baik. Di sisi lain, ia terkesan kurang ekspresif dan kemungkinan sulit mengungkapan apa yang dirasakannya. |

### K — Need to Be Forceful

| Skor | Interpretasi |
|---|---|
| 0–1 | Ia cenderung berusaha menghindari konflik dan perdebatan dengan orang lain. Hal ini membuatnya terkesan pasif dan tidak terbuka menyampaikan pemikirannya. Kecenderungannya menghindari konfrontasi membuatnya terkadang tidak mengakui adanya konflik dan sulit dipahami pemikirannya. |
| 2–3 | Ia cenderung menghindari konflik ataupun situasi yang memicu perdebatan dengan orang lain. Ia lebih fokus untuk mencari jalan tengah ataupun menyetujui pendapat orang lain meski ia memiliki pendapat yang berbeda. |
| 4–5 | Ia tidak mencari ataupun menghindari konflik. Ia mau mendengarkan pendapat orang lain yang berbeda dari dirinya. Namun untuk hal yang ia anggap penting, ia cukup berani untuk menyampaikannya dan cenderung berpegang teguh pada pendapatnya tersebut. |
| 6–7 | Ia adalah pribadi yang berani menyampaikan pendapat dan pemikiran yang ia anggap benar. Ia berani menghadapi situasi yang berpotensi konflik untuk asertif mengemukakan pendapatnya. Di waktu dan situasi tertentu ia dapat menahan diri ataupun menyampaikan pendapatnya dengan cara yang positif sehingga lebih mudah diterima orang lain. |
| 8+ | Ia adalah pribadi yang sangat terbuka dan berterus terang menyampaikan apa yang ia pikirkan. Ia tidak segan menghadapi konflik ataupun situasi yang berpotensi konflik untuk mempertahankan hal yang diyakininya benar. Ia cenderung bersikap menyerang orang lain yang memiliki pendapat berbeda dari dirinya. Orang lain kemungkinan memandang dirinya bersikap keras kepala dan sulit menerima masukan. |

---

## Catatan [?]

- Tidak ditemukan interpretasi gabungan/ringkasan lintas-20-skala (mis. "tipe kepribadian dominan") — laporan PDF hanya menyusun interpretasi per kode ke dalam 7 blok dimensi.
- Struktur 20-skala forced-choice ini konsisten dengan instrumen **PAPI Kostick**. Perlu dikonfirmasi ke tim psikolog/konten HCC mengenai status lisensi sebelum konten ini dipakai di aplikasi terpisah.
- Teks butir soal asli belum ditemukan di codebase — kemungkinan tersimpan di database `surveyapp` (tabel `questions`/`new_questions`), bukan di repo ini.
