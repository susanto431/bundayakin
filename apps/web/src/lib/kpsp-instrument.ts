// ============================================================
// KPSP — Kuesioner Pra Skrining Perkembangan
// Skrining Perkembangan (Tumbuh Kembang, PRD 13 Tahap 2)
//
// SUMBER: "Buku Panduan Kuesioner Pra Skrining Perkembangan (KPSP)",
// Dr. dr. Martira Maddeppungeng Sp.A(K), Clinical Skill Lab Siklus
// Hidup CSL 5, Fakultas Kedokteran Universitas Hasanuddin, 2018.
// Mengacu pada: Pedoman Pelaksanaan Stimulasi Deteksi dan Intervensi
// Dini Tumbuh Kembang (SDIDTK), Depkes RI, 2010.
// Diserahkan & dikonfirmasi oleh Kartika (HCC) — Juli 2026.
//
// CATATAN TRANSKRIPSI: teks disalin dari dokumen sumber (hasil OCR
// buku panduan); beberapa artefak OCR (typo "clan"→"dan", pecahan
// header tabel yang nyasar ke tengah kalimat, penomoran ganda pada
// formulir 15 bulan) dirapikan agar kalimat terbaca wajar TANPA
// mengubah makna/substansi pertanyaan. Dokumen sumber tidak melabeli
// domain (motorik kasar/halus, bicara-bahasa, sosialisasi) per butir
// soal secara konsisten — field `domain` di bawah TIDAK diisi karena
// tidak bisa diekstrak reliable dari sumber ini.
//
// ATURAN OPERASIONAL RESMI (dari buku panduan, WAJIB diikuti kode):
// - Usia dibulatkan: jika usia anak lebih dari 16 hari melewati bulan
//   penuh, dibulatkan ke atas 1 bulan.
// - Bayi prematur (usia kehamilan ≤35 minggu) dan usia kronologis
//   masih <2 tahun: pakai USIA KOREKSI (usia kronologis dikurangi
//   selisih minggu prematur terhadap 40 minggu, dikonversi ke bulan).
// - Jika usia anak tidak tepat pada salah satu dari 16 titik skrining,
//   pakai formulir KPSP TERDEKAT YANG LEBIH MUDA (bukan pembulatan ke
//   atas/terdekat).
// - Jadwal skrining ulang: setiap 3 bulan untuk usia <24 bulan, setiap
//   6 bulan untuk usia 24–72 bulan.
// - Skor: hitung jumlah jawaban "YA". 9–10 = SESUAI, 7–8 = MERAGUKAN,
//   <6 = PENYIMPANGAN.
// ============================================================

export const KPSP_AGE_BANDS = [
  3, 6, 9, 12, 15, 18, 21, 24, 30, 36, 42, 48, 54, 60, 66, 72,
] as const

export type KpspAgeBand = (typeof KPSP_AGE_BANDS)[number]

export type KpspItem = {
  text: string
  note?: string // instruksi tambahan untuk orang tua/pemeriksa
  visualAid?: string // penanda butuh alat bantu visual sederhana di UI
}

export const KPSP_QUESTIONNAIRES: Record<KpspAgeBand, KpspItem[]> = {
  3: [
    { text: "Pada waktu bayi telentang, apakah masing-masing lengan dan tungkai bergerak dengan mudah?", note: "Jawab TIDAK bila salah satu atau kedua tungkai/lengan bayi bergerak tak terarah/tak terkendali." },
    { text: "Pada waktu bayi telentang, apakah ia melihat dan menatap wajah Anda?" },
    { text: "Apakah bayi dapat mengeluarkan suara-suara lain (ngoceh), di samping menangis?" },
    { text: "Pada waktu bayi telentang, apakah ia dapat mengikuti gerakan Anda dengan menggerakkan kepalanya dari kanan/kiri ke tengah?" },
    { text: "Pada waktu bayi telentang, apakah ia dapat mengikuti gerakan Anda dengan menggerakkan kepalanya dari satu sisi hampir sampai ke sisi yang lain?" },
    { text: "Pada waktu Anda mengajak bayi berbicara dan tersenyum, apakah ia tersenyum kembali kepada Anda?" },
    { text: "Pada waktu bayi telungkup di alas yang datar, apakah ia dapat mengangkat kepalanya (sedikit terangkat)?", visualAid: "angkat-kepala-sedikit" },
    { text: "Pada waktu bayi telungkup di alas yang datar, apakah ia dapat mengangkat kepalanya sehingga membentuk sudut 45°?", visualAid: "angkat-kepala-45" },
    { text: "Pada waktu bayi telungkup di alas yang datar, apakah ia dapat mengangkat kepalanya dengan tegak?", visualAid: "angkat-kepala-tegak" },
    { text: "Apakah bayi suka tertawa keras walau tidak digelitik atau diraba-raba?" },
  ],
  6: [
    { text: "Pada waktu bayi telentang, apakah ia dapat mengikuti gerakan Anda dengan menggerakkan kepala sepenuhnya dari satu sisi ke sisi yang lain?" },
    { text: "Dapatkah bayi mempertahankan posisi kepala dalam keadaan tegak dan stabil?", note: "Jawab TIDAK bila kepala bayi cenderung jatuh ke kanan/kiri atau ke dadanya." },
    { text: "Sentuhkan pensil di punggung tangan atau ujung jari bayi (jangan di telapak tangan). Apakah bayi dapat menggenggam pensil itu selama beberapa detik?" },
    { text: "Ketika bayi telungkup di alas datar, apakah ia dapat mengangkat dada dengan kedua lengannya sebagai penyangga?", visualAid: "angkat-dada" },
    { text: "Pernahkah bayi mengeluarkan suara gembira bernada tinggi atau memekik, tetapi bukan menangis?" },
    { text: "Pernahkah bayi berbalik paling sedikit dua kali, dari telentang ke telungkup atau sebaliknya?" },
    { text: "Pernahkah Anda melihat bayi tersenyum ketika melihat mainan yang lucu, gambar, atau binatang peliharaan saat ia bermain sendiri?" },
    { text: "Dapatkah bayi mengarahkan matanya pada benda kecil sebesar kacang, kismis, atau uang logam?", note: "Jawab TIDAK jika ia tidak dapat mengarahkan matanya." },
    { text: "Dapatkah bayi meraih mainan yang diletakkan agak jauh namun masih berada dalam jangkauan tangannya?" },
    { text: "Pada posisi bayi telentang, pegang kedua tangannya lalu tarik perlahan-lahan ke posisi duduk. Dapatkah bayi mempertahankan lehernya secara kaku (tidak jatuh ke belakang)?", note: "Jawab TIDAK bila kepala bayi jatuh kembali ke belakang." },
  ],
  9: [
    { text: "Pada posisi bayi telentang, pegang kedua tangannya lalu tarik perlahan-lahan ke posisi duduk. Dapatkah bayi mempertahankan lehernya secara kaku (tidak jatuh ke belakang)?", note: "Jawab TIDAK bila kepala bayi jatuh kembali ke belakang." },
    { text: "Pernahkah Anda melihat bayi memindahkan mainan atau kue kering dari satu tangan ke tangan yang lain?", note: "Benda panjang seperti sendok atau kerincingan bertangkai tidak ikut dinilai." },
    { text: "Tarik perhatian bayi dengan memperlihatkan selendang/sapu tangan/serbet, lalu jatuhkan ke lantai. Apakah bayi mencoba mencarinya (mis. di bawah meja atau di belakang kursi)?" },
    { text: "Apakah bayi dapat memungut dua benda (mis. mainan/kue kering), masing-masing tangan memegang satu benda pada saat yang sama?", note: "Jawab TIDAK bila bayi tidak pernah melakukan ini." },
    { text: "Jika Anda mengangkat bayi melalui ketiaknya ke posisi berdiri, dapatkah ia menyangga sebagian berat badan dengan kedua kakinya?", note: "Jawab YA bila ia mencoba berdiri dan sebagian berat badan tertumpu pada kedua kakinya." },
    { text: "Dapatkah bayi memungut benda kecil (kismis, kacang-kacangan, potongan biskuit) dengan gerakan miring atau menggerapai?" },
    { text: "Tanpa disangga bantal, kursi, atau dinding, dapatkah bayi duduk sendiri selama 60 detik?" },
    { text: "Apakah bayi dapat makan kue kering sendiri?" },
    { text: "Pada waktu bayi bermain sendiri dan Anda diam-diam berdiri di belakangnya, apakah ia menengok seperti mendengar kedatangan Anda?", note: "Suara keras tidak dihitung — hanya reaksi terhadap suara perlahan/bisikan." },
    { text: "Letakkan mainan yang diinginkannya di luar jangkauan bayi. Apakah ia mencoba mendapatkannya dengan mengulurkan lengan atau badannya?" },
  ],
  12: [
    { text: "Jika Anda bersembunyi di belakang sesuatu/di pojok, lalu muncul dan menghilang berulang-ulang di hadapan anak, apakah ia mencari Anda atau mengharapkan Anda muncul kembali?" },
    { text: "Letakkan pensil di telapak tangan bayi. Coba ambil pensil itu perlahan-lahan. Sulitkah Anda mendapatkannya kembali?" },
    { text: "Apakah anak dapat berdiri selama 30 detik atau lebih dengan berpegangan pada kursi/meja?" },
    { text: "Apakah anak dapat mengatakan 2 suku kata yang sama, misalnya \"ma-ma\", \"da-da\", atau \"pa-pa\"?", note: "Jawab YA bila ia mengeluarkan salah satu suara tadi." },
    { text: "Apakah anak dapat mengangkat badannya ke posisi berdiri tanpa bantuan Anda?" },
    { text: "Apakah anak dapat membedakan Anda dengan orang yang belum ia kenal?", note: "Ia menunjukkan sikap malu-malu/ragu-ragu saat bertemu orang baru." },
    { text: "Apakah anak dapat mengambil benda kecil (kacang/kismis) dengan meremas di antara ibu jari dan jarinya?" },
    { text: "Apakah anak dapat duduk sendiri tanpa bantuan?" },
    { text: "Sebutkan 2–3 kata yang dapat ditiru anak (tidak perlu kata lengkap). Apakah ia mencoba menirukannya?" },
    { text: "Tanpa bantuan, apakah anak dapat mempertemukan dua kubus kecil yang ia pegang?", note: "Kerincingan bertangkai dan tutup panci tidak ikut dinilai." },
  ],
  15: [
    { text: "Tanpa bantuan, apakah anak dapat mempertemukan dua kubus kecil yang ia pegang?", note: "Kerincingan bertangkai dan tutup panci tidak ikut dinilai." },
    { text: "Apakah anak dapat jalan sendiri atau jalan dengan berpegangan?" },
    { text: "Tanpa bantuan, apakah anak dapat bertepuk tangan atau melambai-lambai?", note: "Jawab TIDAK bila ia membutuhkan bantuan." },
    { text: "Apakah anak dapat mengatakan \"papa\" saat memanggil/melihat ayahnya, atau \"mama\" saat memanggil/melihat ibunya?", note: "Jawab YA bila anak mengatakan salah satu di antaranya." },
    { text: "Dapatkah anak berdiri sendiri tanpa berpegangan selama kira-kira 5 detik?" },
    { text: "Dapatkah anak berdiri sendiri tanpa berpegangan selama 30 detik atau lebih?" },
    { text: "Tanpa berpegangan atau menyentuh lantai, dapatkah anak membungkuk memungut mainan di lantai lalu berdiri kembali?" },
    { text: "Apakah anak dapat menunjukkan apa yang diinginkannya tanpa menangis atau merengek?", note: "Jawab YA bila ia menunjuk, menarik, atau mengeluarkan suara yang menyenangkan." },
    { text: "Apakah anak dapat berjalan di sepanjang ruangan tanpa jatuh atau terhuyung-huyung?" },
    { text: "Apakah anak dapat mengambil benda kecil (kacang, kismis, potongan biskuit) dengan ibu jari dan telunjuk?" },
  ],
  18: [
    { text: "Tanpa bantuan, apakah anak dapat bertepuk tangan atau melambai-lambai?", note: "Jawab TIDAK bila ia membutuhkan bantuan." },
    { text: "Apakah anak dapat mengatakan \"papa\" saat memanggil/melihat ayahnya, atau \"mama\" saat memanggil/melihat ibunya?" },
    { text: "Apakah anak dapat berdiri sendiri tanpa berpegangan selama kira-kira 5 detik?" },
    { text: "Apakah anak dapat berdiri sendiri tanpa berpegangan selama 30 detik atau lebih?" },
    { text: "Tanpa berpegangan atau menyentuh lantai, apakah anak dapat membungkuk untuk memungut mainan di lantai lalu berdiri kembali?" },
    { text: "Apakah anak dapat menunjukkan apa yang diinginkannya tanpa menangis atau merengek?", note: "Jawab YA bila ia menunjuk, menarik, atau mengeluarkan suara yang menyenangkan." },
    { text: "Apakah anak dapat berjalan di sepanjang ruangan tanpa jatuh atau terhuyung-huyung?" },
    { text: "Apakah anak dapat mengambil benda kecil (kacang, kismis, potongan biskuit) dengan ibu jari dan telunjuk?" },
    { text: "Jika Anda menggelindingkan bola ke anak, apakah ia menggelindingkan/melemparkan kembali bola pada Anda?" },
    { text: "Apakah anak dapat memegang sendiri cangkir/gelas dan minum dari situ tanpa tumpah?" },
  ],
  21: [
    { text: "Tanpa berpegangan atau menyentuh lantai, apakah anak dapat membungkuk untuk memungut mainan di lantai lalu berdiri kembali?" },
    { text: "Apakah anak dapat menunjukkan apa yang diinginkannya tanpa menangis atau merengek?", note: "Jawab YA bila ia menunjuk, menarik, atau mengeluarkan suara yang menyenangkan." },
    { text: "Apakah anak dapat berjalan di sepanjang ruangan tanpa jatuh atau terhuyung-huyung?" },
    { text: "Apakah anak dapat mengambil benda kecil (kacang, kismis, potongan biskuit) dengan ibu jari dan telunjuk?" },
    { text: "Jika Anda menggelindingkan bola ke anak, apakah ia menggelindingkan/melemparkan kembali bola pada Anda?" },
    { text: "Apakah anak dapat memegang sendiri cangkir/gelas dan minum dari situ tanpa tumpah?" },
    { text: "Jika Anda sedang melakukan pekerjaan rumah tangga, apakah anak meniru apa yang Anda lakukan?" },
    { text: "Apakah anak dapat meletakkan satu kubus di atas kubus yang lain tanpa menjatuhkannya?", note: "Kubus berukuran 2,5–5,0 cm." },
    { text: "Apakah anak dapat mengucapkan paling sedikit 3 kata yang mempunyai arti selain \"papa\" dan \"mama\"?" },
    { text: "Apakah anak dapat berjalan mundur 5 langkah atau lebih tanpa kehilangan keseimbangan?", note: "Mungkin terlihat saat anak menarik mainannya." },
  ],
  24: [
    { text: "Jika Anda sedang melakukan pekerjaan rumah tangga, apakah anak meniru apa yang Anda lakukan?" },
    { text: "Apakah anak dapat meletakkan 1 kubus di atas kubus yang lain tanpa menjatuhkannya?", note: "Kubus berukuran 2,5–5 cm." },
    { text: "Apakah anak dapat mengucapkan paling sedikit 3 kata yang mempunyai arti selain \"papa\" dan \"mama\"?" },
    { text: "Apakah anak dapat berjalan mundur 5 langkah atau lebih tanpa kehilangan keseimbangan?" },
    { text: "Dapatkah anak melepas pakaiannya sendiri seperti baju, rok, atau celana?", note: "Topi dan kaos kaki tidak ikut dinilai." },
    { text: "Dapatkah anak berjalan naik tangga sendiri?", note: "Jawab YA jika posisi tegak/berpegangan dinding atau pegangan tangga. Jawab TIDAK jika merangkak atau harus berpegangan pada seseorang." },
    { text: "Tanpa bimbingan/bantuan, dapatkah anak menunjuk dengan benar paling sedikit satu bagian badannya (rambut, mata, hidung, mulut, dll.)?" },
    { text: "Dapatkah anak makan nasi sendiri tanpa banyak tumpah?" },
    { text: "Dapatkah anak membantu memungut mainannya sendiri atau membantu mengangkat piring jika diminta?" },
    { text: "Dapatkah anak menendang bola kecil (sebesar bola tenis) ke depan tanpa berpegangan?", note: "Mendorong tidak ikut dinilai." },
  ],
  30: [
    { text: "Dapatkah anak melepas pakaiannya sendiri seperti baju, rok, atau celana?", note: "Topi dan kaos kaki tidak ikut dinilai." },
    { text: "Dapatkah anak berjalan naik tangga sendiri?", note: "Jawab YA jika posisi tegak/berpegangan dinding atau pegangan tangga. Jawab TIDAK jika merangkak atau harus berpegangan pada seseorang." },
    { text: "Tanpa bimbingan/bantuan, dapatkah anak menunjuk dengan benar paling sedikit satu bagian badannya?" },
    { text: "Dapatkah anak makan nasi sendiri tanpa banyak tumpah?" },
    { text: "Dapatkah anak membantu memungut mainannya sendiri atau membantu mengangkat piring jika diminta?" },
    { text: "Dapatkah anak menendang bola kecil (sebesar bola tenis) ke depan tanpa berpegangan?", note: "Mendorong tidak ikut dinilai." },
    { text: "Bila diberi pensil, apakah anak mencoret-coret kertas tanpa bantuan/petunjuk?" },
    { text: "Dapatkah anak meletakkan 4 kubus satu per satu di atas kubus lain tanpa menjatuhkannya?", note: "Kubus berukuran 2,5–5 cm." },
    { text: "Dapatkah anak menggunakan 2 kata saat berbicara, seperti \"minta minum\" atau \"mau tidur\"?", note: "\"Terima kasih\" dan \"dadah\" tidak ikut dinilai." },
    { text: "Apakah anak dapat menyebut 2 di antara gambar-gambar ini tanpa bantuan?", note: "Menyebut dengan suara binatang tidak dinilai.", visualAid: "gambar-binatang" },
  ],
  36: [
    { text: "Bila diberi pensil, apakah anak mencoret-coret kertas tanpa bantuan/petunjuk?" },
    { text: "Dapatkah anak meletakkan 4 kubus satu per satu di atas kubus lain tanpa menjatuhkannya?", note: "Kubus berukuran 2,5–5 cm." },
    { text: "Dapatkah anak menggunakan 2 kata saat berbicara, seperti \"minta minum\" atau \"mau tidur\"?", note: "\"Terima kasih\" dan \"dadah\" tidak ikut dinilai." },
    { text: "Apakah anak dapat menyebut 2 di antara gambar-gambar ini tanpa bantuan?", visualAid: "gambar-binatang" },
    { text: "Dapatkah anak melempar bola lurus ke arah perut/dada Anda dari jarak 1,5 meter?" },
    { text: "Ikuti perintah ini tanpa isyarat telunjuk/mata: \"Letakkan kertas ini di lantai.\" \"Letakkan kertas ini di kursi.\" \"Berikan kertas ini kepada ibu.\" Dapatkah anak melaksanakan ketiga perintah tadi?" },
    { text: "Buat garis lurus ke bawah sepanjang minimal 2,5 cm. Suruh anak menggambar garis lain di sampingnya. Dapatkah ia menirukannya?", visualAid: "garis-lurus" },
    { text: "Letakkan selembar kertas seukuran buku di lantai. Dapatkah anak melompati bagian lebar kertas dengan mengangkat kedua kaki bersamaan, tanpa lari dulu?" },
    { text: "Dapatkah anak mengenakan sepatunya sendiri?" },
    { text: "Dapatkah anak mengayuh sepeda roda tiga sejauh sedikitnya 3 meter?" },
  ],
  42: [
    { text: "Dapatkah anak mengenakan sepatunya sendiri?" },
    { text: "Dapatkah anak mengayuh sepeda roda tiga sejauh sedikitnya 3 meter?" },
    { text: "Setelah makan, apakah anak mencuci dan mengeringkan tangannya dengan baik sehingga Anda tidak perlu mengulanginya?" },
    { text: "Suruh anak berdiri satu kaki tanpa berpegangan (beri 3 kali kesempatan). Dapatkah ia bertahan seimbang selama 2 detik atau lebih?" },
    { text: "Letakkan selembar kertas seukuran buku di lantai. Dapatkah anak melompati panjang kertas dengan mengangkat kedua kaki bersamaan, tanpa lari dulu?" },
    { text: "Tanpa membantu atau menyebut kata \"lingkaran\", suruh anak menggambar seperti contoh. Dapatkah anak menggambar lingkaran?", visualAid: "gambar-lingkaran" },
    { text: "Dapatkah anak meletakkan 8 kubus satu per satu di atas yang lain tanpa menjatuhkannya?", note: "Kubus berukuran 2,5–5 cm." },
    { text: "Apakah anak dapat bermain petak umpet, ular naga, atau permainan lain sambil mengikuti aturan bermain?" },
    { text: "Dapatkah anak mengenakan celana panjang, kemeja, baju, atau kaos kaki tanpa dibantu?", note: "Tidak termasuk memasang kancing/gesper/ikat pinggang." },
  ],
  48: [
    { text: "Dapatkah anak mengayuh sepeda roda tiga sejauh sedikitnya 3 meter?" },
    { text: "Setelah makan, apakah anak mencuci dan mengeringkan tangannya dengan baik sehingga Anda tidak perlu mengulanginya?" },
    { text: "Suruh anak berdiri satu kaki tanpa berpegangan (beri 3 kali kesempatan). Dapatkah ia bertahan seimbang selama 2 detik atau lebih?" },
    { text: "Letakkan selembar kertas seukuran buku di lantai. Dapatkah anak melompati panjang kertas dengan mengangkat kedua kaki bersamaan, tanpa lari dulu?" },
    { text: "Tanpa membantu atau menyebut kata \"lingkaran\", suruh anak menggambar seperti contoh. Dapatkah anak menggambar lingkaran?", visualAid: "gambar-lingkaran" },
    { text: "Dapatkah anak meletakkan 8 kubus satu per satu di atas yang lain tanpa menjatuhkannya?", note: "Kubus berukuran 2,5–5 cm." },
    { text: "Apakah anak dapat bermain petak umpet, ular naga, atau permainan lain sambil mengikuti aturan bermain?" },
    { text: "Dapatkah anak mengenakan celana panjang, kemeja, baju, atau kaos kaki tanpa dibantu?", note: "Tidak termasuk memasang kancing/gesper/ikat pinggang." },
    { text: "Dapatkah anak menyebutkan nama lengkapnya tanpa dibantu?", note: "Jawab TIDAK jika hanya menyebut sebagian nama atau ucapannya sulit dimengerti." },
  ],
  54: [
    { text: "Dapatkah anak meletakkan 8 kubus satu per satu di atas yang lain tanpa menjatuhkannya?", note: "Kubus berukuran 2,5–5 cm." },
    { text: "Apakah anak dapat bermain petak umpet, ular naga, atau permainan lain sambil mengikuti aturan bermain?" },
    { text: "Dapatkah anak mengenakan celana panjang, kemeja, baju, atau kaos kaki tanpa dibantu?", note: "Tidak termasuk memasang kancing/gesper/ikat pinggang." },
    { text: "Dapatkah anak menyebutkan nama lengkapnya tanpa dibantu?", note: "Jawab TIDAK jika hanya menyebut sebagian nama atau ucapannya sulit dimengerti." },
    { text: "Tanyakan (jangan bantu, boleh ulangi pertanyaan): \"Apa yang kamu lakukan jika kedinginan/lapar/lelah?\" Jawab YA bila ketiganya dijawab benar (bukan gerakan/isyarat).", note: "Kunci: kedinginan→menggigil/pakai mantel/masuk rumah; lapar→makan; lelah→mengantuk/tidur/istirahat." },
    { text: "Apakah anak dapat mengancingkan bajunya atau pakaian boneka?" },
    { text: "Suruh anak berdiri satu kaki tanpa berpegangan (3 kali kesempatan). Dapatkah ia bertahan seimbang selama 6 detik atau lebih?" },
    { text: "Tanpa membetulkan atau menyebut \"lebih panjang\", perlihatkan gambar dua garis dan tanyakan mana yang lebih panjang. Ulangi 3 kali dengan memutar posisi gambar. Apakah anak menunjuk benar ketiga kalinya?", visualAid: "garis-panjang-pendek" },
    { text: "Tanpa membantu/menyebut nama gambar, suruh anak menggambar seperti contoh (tanda silang), 3 kali kesempatan. Apakah ia bisa menirukannya?", visualAid: "tanda-silang" },
    { text: "Ikuti perintah tanpa isyarat: \"Letakkan kertas di atas lantai / di bawah kursi / di depan kamu / di belakang kamu.\" Jawab YA hanya jika anak mengerti keempat posisi itu." },
  ],
  60: [
    { text: "Tanyakan (jangan bantu, boleh ulangi pertanyaan): \"Apa yang kamu lakukan jika kedinginan/lapar/lelah?\" Jawab YA bila ketiganya dijawab benar.", note: "Kunci: kedinginan→menggigil/pakai mantel/masuk rumah; lapar→makan; lelah→mengantuk/tidur/istirahat." },
    { text: "Apakah anak dapat mengancingkan bajunya atau pakaian boneka?" },
    { text: "Suruh anak berdiri satu kaki tanpa berpegangan (3 kali kesempatan). Dapatkah ia bertahan seimbang selama 6 detik atau lebih?" },
    { text: "Tanpa membetulkan atau menyebut \"lebih panjang\", perlihatkan gambar dua garis dan tanyakan mana yang lebih panjang, ulangi 3 kali dengan memutar gambar. Apakah anak menunjuk benar ketiga kalinya?", visualAid: "garis-panjang-pendek" },
    { text: "Tanpa membantu/menyebut nama gambar, suruh anak menggambar seperti contoh (tanda silang), 3 kali kesempatan. Apakah ia bisa menirukannya?", visualAid: "tanda-silang" },
    { text: "Ikuti perintah tanpa isyarat: \"Letakkan kertas di atas lantai / di bawah kursi / di depan kamu / di belakang kamu.\" Jawab YA hanya jika anak mengerti keempat posisi itu." },
    { text: "Apakah anak bereaksi tenang dan tidak rewel (tanpa menangis/menggelayut) saat Anda meninggalkannya?" },
    { text: "Tanpa menunjuk/membantu, katakan: \"Tunjukkan segi empat merah/kuning/biru/hijau.\" Dapatkah anak menunjuk keempat warna dengan benar?", visualAid: "segi-empat-warna" },
    { text: "Suruh anak melompat satu kaki beberapa kali tanpa berpegangan (lompatan dua kaki tidak dinilai). Bisakah ia melompat 2–3 kali dengan satu kaki?" },
    { text: "Dapatkah anak sepenuhnya berpakaian sendiri tanpa bantuan?" },
  ],
  66: [
    { text: "Tanpa membantu/menyebut nama gambar, suruh anak menggambar seperti contoh (tanda silang), 3 kali kesempatan. Apakah ia bisa menirukannya?", visualAid: "tanda-silang" },
    { text: "Ikuti perintah tanpa isyarat: \"Letakkan kertas di atas lantai / di bawah kursi / di depan kamu / di belakang kamu.\" Jawab YA hanya jika anak mengerti keempat posisi itu." },
    { text: "Apakah anak bereaksi tenang dan tidak rewel (tanpa menangis/menggelayut) saat Anda meninggalkannya?" },
    { text: "Tanpa menunjuk/membantu, katakan: \"Tunjukkan segi empat merah/kuning/biru/hijau.\" Dapatkah anak menunjuk keempat warna dengan benar?", visualAid: "segi-empat-warna" },
    { text: "Suruh anak melompat satu kaki beberapa kali tanpa berpegangan (lompatan dua kaki tidak dinilai). Bisakah ia melompat 2–3 kali dengan satu kaki?" },
    { text: "Dapatkah anak sepenuhnya berpakaian sendiri tanpa bantuan?" },
    { text: "Suruh anak menggambar bebas: \"Buatlah gambar orang.\" Jangan mengingatkan bagian yang belum tergambar. Hitung bagian tubuh yang tergambar (bagian berpasangan seperti mata/telinga/lengan/kaki dihitung satu bagian). Dapatkah anak menggambar sedikitnya 3 bagian tubuh?" },
    { text: "Pada gambar orang yang sama, dapatkah anak menggambar sedikitnya 6 bagian tubuh?" },
    { text: "Lengkapi kalimat ini (jangan bantu, boleh ulangi): \"Jika kuda besar, maka tikus…\", \"Jika api panas, maka es…\", \"Jika ibu wanita, maka ayah…\". Apakah anak menjawab benar (tikus kecil, es dingin, ayah pria)?" },
    { text: "Apakah anak dapat menangkap bola kecil (sebesar bola tenis/kasti) hanya dengan kedua tangannya?", note: "Bola besar tidak ikut dinilai." },
  ],
  72: [
    { text: "Tanpa menunjuk/membantu, katakan: \"Tunjukkan segi empat merah/kuning/biru/hijau.\" Dapatkah anak menunjuk keempat warna dengan benar?", visualAid: "segi-empat-warna" },
    { text: "Suruh anak melompat satu kaki beberapa kali tanpa berpegangan (lompatan dua kaki tidak dinilai). Bisakah ia melompat 2–3 kali dengan satu kaki?" },
    { text: "Dapatkah anak sepenuhnya berpakaian sendiri tanpa bantuan?" },
    { text: "Suruh anak menggambar bebas: \"Buatlah gambar orang.\" Hitung bagian tubuh yang tergambar. Dapatkah anak menggambar sedikitnya 3 bagian tubuh?" },
    { text: "Pada gambar orang yang sama, dapatkah anak menggambar sedikitnya 6 bagian tubuh?" },
    { text: "Lengkapi kalimat ini (jangan bantu, boleh ulangi): \"Jika kuda besar, maka tikus…\", \"Jika api panas, maka es…\", \"Jika ibu wanita, maka ayah…\". Apakah anak menjawab benar?" },
    { text: "Apakah anak dapat menangkap bola kecil (sebesar bola tenis/kasti) hanya dengan kedua tangannya?", note: "Bola besar tidak ikut dinilai." },
    { text: "Suruh anak berdiri satu kaki tanpa berpegangan (3 kali kesempatan). Dapatkah ia bertahan seimbang selama 11 detik atau lebih?" },
    { text: "Tanpa membantu/menyebut nama gambar, suruh anak menggambar seperti contoh (bentuk kotak), 3 kali kesempatan. Apakah ia bisa menirukannya?", visualAid: "gambar-kotak" },
    { text: "Isi jawaban anak (jangan bantu, boleh ulangi sampai 3 kali): \"Sendok dibuat dari apa? Sepatu dari apa? Pintu dari apa?\" Apakah ketiganya dijawab benar?", note: "Kunci: sendok=besi/baja/plastik/kayu; sepatu=kulit/karet/kain/plastik/kayu; pintu=kayu/besi/kaca." },
  ],
}

// ── Alat bantu yang dibutuhkan (dari buku panduan) ────────────────────────────
export const KPSP_REQUIRED_PROPS = [
  "bola", "boneka", "kubus sisi 2,5 cm", "benang wol merah", "kertas",
  "krayon", "kismis", "kerincingan", "lonceng",
] as const
