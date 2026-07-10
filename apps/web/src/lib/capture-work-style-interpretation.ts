import type { CaptureWorkStyleDimension } from "@/lib/capture-work-style-instrument"

// Bank interpretasi Capture Work Style — milik & lisensi HCC (Kartika, 10 Juli 2026).
// Sumber: docs/opds/sumber-instrumen/06-attitude-test-interpretation.md — JANGAN ubah
// teksnya tanpa instruksi eksplisit Kartika. Narasi ini sengaja TIDAK menyebut kode
// dimensi/istilah Inggris di dalam kalimatnya — aman ditampilkan ke orang tua, TAPI
// jangan render bersama kode/label dimensi mentah (lihat aturan CLAUDE.md §5).

type Band = { min: number; max: number; text: string }

const B = (min: number, max: number, text: string): Band => ({ min, max, text })
const INF = 999

export const DIMENSION_INTERPRETATION: Record<CaptureWorkStyleDimension, Band[]> = {
  N: [
    B(0, 2, "Ia tidak merasa perlu untuk menyelesaikan sendiri tugas-tugasnya dan lebih senang mendelegasikan tugas yang menjadi tanggung jawabnya kepada orang lain. Konsentrasinya dalam bekerja mudah terpecah dan cenderung meninggalkan tugas sebelum tuntas untuk mengerjakan hal lain yang menarik perhatiannya atau ia anggap lebih penting."),
    B(3, 5, "Ia memiliki cukup komitmen untuk menyelesaikan tugas yang menjadi tanggung jawabnya. Namun jika memungkinkan, ia akan mendelegasikan tugasnya pada orang lain."),
    B(6, 7, "Ia memiliki komitmen yang tinggi untuk menyelesaikan tugasnya. Dalam bekerja, ia memiliki preferensi untuk mengerjakan tugasnya satu per satu, namun jika terpaksa ia masih bisa mengubah prioritas kerjanya."),
    B(8, INF, "Ia memiliki komitmen yang sangat tinggi untuk menyelesaikan tugas hingga tuntas. Hal ini mendorongnya untuk fokus pada pekerjaan yang ada di hadapannya dan bertekun untuk menyelesaikannya. Kebutuhannya untuk menyelesaikan tugas satu per satu berpotensi membuat perhatiannya terpaku pada satu tugas sehingga sulit menangani beberapa tugas sekaligus. Ia pun sulit mendelegasikan pekerjaan yang ia hayati sebagai tugasnya pribadi kepada orang lain."),
  ],
  G: [
    B(0, 2, "Ia bukan pribadi yang memandang kerja keras sebagai hal yang penting. Ia cenderung santai dalam bekerja dan enggan menuangkan energi yang besar untuk mengerjakan tugasnya. Jika memungkinkan, ia akan mencari cara atau sistem yang dapat mempermudah dirinya dalam menyelesaikan pekerjaan dengan usaha seminim mungkin. Hal ini terkadang membuatnya terkesan malas."),
    B(3, 4, "Dalam bekerja, ia mau bekerja sesuai tuntutan tugasnya. Namun jika memungkinkan ia akan menyalurkan usahanya untuk hal-hal yang bermanfaat dan menguntungkan dirinya."),
    B(5, 7, "Ia mau bekerja keras ketika memiliki tujuan yang jelas untuk dicapai. Ia akan bersikap lebih santai ketika memang menghadapi situasi yang tidak menuntutnya untuk bekerja keras."),
    B(8, INF, "Ia ingin dipandang sebagai seorang pekerja keras dan memandang bahwa bekerja keras merupakan hal yang penting untuk dilakukan. Kebutuhannya untuk dipandang sebagai pekerja keras berpotensi menyebabkan ia menciptakan pekerjaan yang tidak perlu dan kadang kala tanpa tujuan yang jelas."),
  ],
  A: [
    B(0, 4, "Ia bukan pribadi yang kompetitif dan mudah puas atas pencapaian dirinya. Ia kurang tergerak untuk mencapai target yang menantang dan tidak tertarik untuk menjadi yang terbaik. Ia belum mengerahkan usahanya secara optimal untuk menyelesaikan tugas. Dengan demikian, ia masih membutuhkan dorongan dari luar dirinya untuk memotivasinya lebih berusaha mencapai sasaran."),
    B(5, 7, "Ia memiliki kebutuhan yang cukup besar untuk menjadi lebih baik dibanding orang lain. Ia ingin menjadi pribadi yang berprestasi, namun cukup realistis untuk menyesuaikannya dengan situasi yang dihadapi. Ia mengetahui tujuan yang ingin dicapainya dan mau berusaha untuk mencapai tujuannya tersebut. Dalam menetapkan target, ia cenderung menyesuaikannya dengan kemampuan diri secara realistis."),
    B(8, INF, "Ia merupakan pribadi yang sangat berambisi untuk berprestasi dan menjadi yang terbaik. Ia menyukai tantangan dan situasi kerja yang kompetitif. Dalam menetapkan target, ia cenderung mengejar kesempurnaan dan target yang tinggi. Hal ini berpotensi menyebabkan ia kurang realistis dalam menetapkan target, baik bagi dirinya maupun orang lain dan mudah kecewa ketika harapannya tidak tercapai."),
  ],
  L: [
    B(0, 1, "Ia puas dengan perannya sebagai bawahan atau anggota tim sehingga memberikan kesempatan pada orang lain untuk memimpin. Ia kurang percaya diri untuk berperan sebagai pemimpin dan cenderung pasif dalam tim kerjanya."),
    B(2, 3, "Ia memiliki keinginan untuk didengarkan pendapatnya oleh kelompok, namun tidak aktif mengambil peran sebagai pemimpin. Ia kurang percaya diri dan enggan berada di posisi pemimpin."),
    B(4, 4, "Ia kurang percaya diri dan kurang berminat untuk berperan sebagai pemimpin dalam tim kerjanya."),
    B(5, 5, "Ia tidak secara aktif mencari posisi sebagai pemimpin, namun cukup percaya diri jika diberi kepercayaan untuk berperan sebagai pemimpin."),
    B(6, 7, "Ia memiliki keinginan untuk berperan sebagai pemimpin yang cukup besar dan percaya diri bahwa ia dapat menjalankan peran tersebut."),
    B(8, INF, "Ia tertarik untuk menjalankan peran sebagai pemimpin dan sangat percaya diri untuk berperan sebagai pemimpin. Terkadang Ia terlalu percaya diri dan angkuh dalam mengarahkan tim kerjanya. Dengan kebutuhannya yang besar untuk dipandang sebagai pemimpin ia berpotensi tidak memberikan kesempatan memimpin pada orang lain yang mungkin lebih siap atau kompeten dibanding dirinya."),
  ],
  P: [
    B(0, 1, "Ia bukan pribadi yang mendominasi dalam tim kerja. Ia cenderung menghindari tugas yang menuntutnya untuk memberikan arahan dan membimbing orang lain. Jika berperan sebagai pemimpin, ia akan bersikap permisif dan kurang memberikan arahan dan pendampingan kepada anggota tim kerjanya. Ia tidak merasa bertanggung jawab atas hasil kerja anggota timnya."),
    B(2, 3, "Ia enggan mengontrol dan mengarahkan orang lain. Ia pun tidak merasa bertanggung jawab atas hasil kerja orang lain. Jika menjalankan peran sebagai pemimpin, ia cenderung membiarkan bawahannya bekerja sesuai gaya kerjanya masing-masing. Ia pun mengharapkan bawahannya untuk mempertanggungjawabkan hasil kerjanya masing-masing."),
    B(4, 4, "Ia cenderung enggan mengarahkan, membimbing, dan mengajari orang lain bagaimana melakukan sesuatu. Ia lebih memilih untuk bekerja sendiri dalam rangka mencapai sasaran kelompok. Jika ia berperan sebagai pemimpin, ia memposisikan diri sebagai pemimpin yang sedikit memberikan arahan dan lebih banyak memberikan kebebasan kepada personel kerjanya. Ia kurang aktif memanfaatkan kapasitas bawahannya secara optimal."),
    B(5, 5, "Ia senang mengatur dan mengarahkan orang lain untuk melakukan pekerjaan mereka. Ia ingin membantu orang lain menyelesaikan tugasnya dengan baik. Hal ini ia lakukan tanpa menunjukan sikap yang mendominasi."),
    B(6, 7, "Ia merupakan pribadi yang berinisiatif untuk mengarahkan dan mengatur orang lain dalam tim kerjanya. Ia merasa ikut bertanggung jawab atas hasil kerja timnya dan cenderung bersikap dominan dalam mengarahkan orang-orang di tim kerjanya."),
    B(8, INF, "Ia merupakan pribadi yang senang mempengaruhi dan mengarahkan orang lain. Ia merasa bertanggung jawab untuk memastikan hasil kerja timnya sesuai ketentuan yang dipersyaratkan. Kebutuhannya yang besar untuk mengarahkan orang lain berpotensi membuatnya cenderung mendominasi dalam kelompok yang sulit bekerja sama dengan rekan yang berkedudukan sejajar ataupun dengan atasan yang juga dominan."),
  ],
  I: [
    B(0, 1, "Ia sangat berhati-hati dalam mengambil keputusan. Kehati-hatiannya ini membuatnya lambat dalam mengambil keputusan. Jika cenderung menghindari situasi yang menuntutnya untuk mengambil keputusan ataupun mengalihkan pengambilan keputusan tersebut pada orang lain."),
    B(2, 3, "Ia cenderung ragu-ragu dalam mengambil keputusan. Jika memungkinkan, ia akan menyerahkan pengambilan keputusan pada orang lain dan mengikuti keputusan yang dibuat orang lain."),
    B(4, 5, "Ia tergolong cukup berhati-hati dalam mengambil keputusan. Jika memungkinkan, ia cenderung memilih untuk mengambil waktu sejenak sebelum membuat keputusan."),
    B(6, 7, "Ia cukup percaya diri dalam mengambil keputusan. Ia dapat mengambil keputusan dengan cepat dan siap menanggung risiko dari keputusan yang dibuatnya. Dalam hal-hal tertentu, keputusannya didasarkan pada pertimbangan-pertimbangan terlebih dulu."),
    B(8, INF, "Ia menilai dirinya sebagai pribadi yang cepat dan mudah mengambil keputusan. Ia berani mengambil memanfaatkan kesempatan yang ada. Ia pun sangat yakin akan keputusan yang diambilnya. Ia cenderung impulsif dalam menilai sehingga keputusannya belum didasarkan pada pertimbangan yang matang."),
  ],
  T: [
    B(0, 3, "Ia tidak memandang dirinya sebagai pribadi yang bekerja dengan cepat. Ia lebih memprioritaskan hal-hal lain selain kecepatan kerja. Kurangnya rasa urgensi untuk menyelesaikan tugas dengan cepat membuat ia terkesan santai dalam bekerja. Ia pun berpotensi untuk membuang-buang waktu dan kurang tepat waktu mengikuti tenggat waktu penyelesaian tugas yang ketat."),
    B(4, 6, "Ia memandang dirinya sebagai pekerja yang cukup cepat dalam menyelesaikan tugas. Kecepatan kerja merupakan hal yang cukup menjadi perhatiannya. Dalam beberapa situasi ia berusaha bekerja dengan cepat sementara di situasi yang berbeda, ia memprioritaskan hal lain selain kecepatan penyelesaian tugas. Ia diperkirakan dapat menyesuaikan tempo kerjanya dengan cukup berimbang."),
    B(7, INF, "Ia memandang dirinya sebagai pribadi yang bekerja dengan cepat. Menyelesaikan tugas dengan cepat dipandang sebagai hal yang penting baginya. Keinginannya untuk segera menyelesaikan tugas membuat ia cenderung terburu-buru dalam bekerja. Hal ini berpotensi membuatnya tegang, cemas, dan impulsif dalam menyelesaikan tugasnya."),
  ],
  V: [
    B(0, 2, "Ia memililki preferensi untuk bekerja di belakang meja dibanding mengerjakan tugas-tugas yang menuntutnya untuk banyak bergerak melakukan sesuatu. Dengan pembawaannya yang kurang energik, ia cenderung terkesan lamban dalam kesehariannya."),
    B(3, 6, "Ia memiliki preferensi yang cukup berimbang antara bekerja di belakang meja dengan terjun langsung ke lapangan dan mengerjakan tugas yang membutuhkan energi."),
    B(7, INF, "Ia lebih memilih untuk bekerja di lapangan dibanding bekerja di balik meja. Ia menyukai aktivitas fisik yang memungkinkannya untuk banyak bergerak melakukan sesuatu. Ia cenderung kurang betah mengerjakan tugas rutin yang monoton di balik meja."),
  ],
  F: [
    B(0, 3, "Sebagai bagian dalam organisasi, ia pribadi yang otonom dan lebih senang bekerja sendiri tanpa campur tangan orang lain. Motivasi kerjanya timbul bukan karena pujian dari otoritas. Ketika memiliki pemikiran dan pendapat yang berbeda dengan atasan, ia cenderung tidak puas dan mempertanyakan otoritas atasan sehingga terkesan kurang loyal terhadap organisasi karena kurang mendukung otoritas."),
    B(4, 6, "Ia memiliki keinginan untuk menyenangkan otoritas dan bekerja sesuai arahan atasan. Di sisi lain, ia masih dapat bekerja secara mandiri juga sesuai situasi yang dihadapinya."),
    B(7, 7, "Ia pribadi yang cukup loyal pada atasannya dan ingin menyenangkan atasan. Ia patuh mengikuti perintah dan arahan kerja yang ia terima. Adanya penerimaan dan dukungan dari figur otoritas menjadi hal yang penting baginya."),
    B(8, INF, "Ia pribadi yang loyal dan memiliki keinginan yang besar untuk menyenangkan atasan. Ia mau mematuhi arahan atasan meski hal tersebut mungkin kurang sejalan dengan pemikirannya. Keenggannya untuk memberikan pendapat yang berbeda dari figur otoritas membuatnya terkesan kurang mandiri dan pasif."),
  ],
  W: [
    B(0, 3, "Ia berpatokan pada tujuan dan garis besar tugas dalam bekerja. Ia dapat bekerja dalam situasi kerja yang kurang terstruktur, mandiri, dan berinisiatif. Terkadang ia terkesan kurang patuh karena cenderung mengabaikan aturan dan prosedur kerja yang berlaku. Ia merasa kurang nyaman jika diminta mengikuti pedoman kerja secara kaku."),
    B(4, 5, "Ia dapat mengerjakan tugas secara mandiri selama ia telah mendapatkan pengarahan awal dan tolak ukur keberhasilan yang jelas."),
    B(6, 7, "Ia membutuhkan uraian rinci mengenai tugas, wewenang, dan tanggung jawabnya sebagai pedoman kerjanya. Ia cenderung kurang percaya diri jika diminta bekerja tanpa adanya aturan dan prosedur yang jelas."),
    B(8, INF, "Ia membutuhkan adanya uraian tugas, wewenang, dan tanggung jawab yang dijelaskan secara rinci dalam bekerja. Ia patuh pada arahan dan pedoman kerja yang diberikan padanya. Ia cenderung kurang berinisiatif dalam melaksanakan tugas dan ingin organisasi yang menyiapkan semua informasi dan hal-hal yang ia butuhkan dalam bekerja."),
  ],
  X: [
    B(0, 1, "Ia cenderung menghindari situasi yang berpotensi membuatnya menjadi pusat perhatian sehingga ia terkesan menarik diri dan pemalu. Ia bukan pribadi yang menyombongkan dirinya di depan orang lain. Ia justru terkesan kurang percaya diri dan terkadang merendahkan kapasitas dirinya."),
    B(2, 3, "Kebutuhannya untuk menjadi pusat perhatian cenderung kecil sehingga ia terkesan sebagai pribadi yang pendiam dan pemalu saat berinteraksi dalam kelompok. Ia lebih suka tidak menonjolkan diri dibanding menjadi pusat perhatian."),
    B(4, 5, "Ia mengharapkan adanya perhatian dan pengakuan dari lingkungan. Ia tidak ingin diabaikan oleh orang di sekelilingnya. Akan tetapi, ia tidak mencari perhatian dalam setiap interaksinya dengan orang lain. Diperkirakan, ia pun dapat memberi kesempatan orang lain untuk juga menjadi pusat perhatian."),
    B(6, INF, "Ia merasa bangga akan diri dan gayanya sendiri. Ia mengharapkan adanya perhatian dari lingkungan dan senang saat menjadi pusat perhatian. Pembawaannya yang senang menceritakan tentang dirinya berpotensi membuat orang lain memandang dirinya sebagai pribadi yang sombong."),
  ],
  S: [
    B(0, 2, "Ia lebih senang bekerja sendiri dibanding berinteraksi dengan banyak orang. Bergaul dengan banyak orang bukanlah hal yang ia anggap penting. Ia cenderung menarik diri saat berada di antara banyak orang. Terdapat kemungkinan bahwa ia pribadi yang kaku dan kurang luwes dalam berinteraksi dengan banyak orang."),
    B(3, 4, "Ia bukan pribadi yang aktif membuka interaksi dengan orang lain ataupun cukup percaya diri untuk menghidupkan suasana yang menyenangkan dalam interaksinya dengan banyak orang. Namun pada dasarnya ia masih cukup terbuka untuk menjalin interaksi dengan orang lain."),
    B(5, INF, "Ia memandang dirinya sebagai pribadi yang ramah dan mudah bergaul. Di lingkungan sosial, ia cenderung tampil percaya diri dan berusaha menghidupkan suasana yang menyenangkan. Sebagai pribadi yang menyukai interaksi dengan banyak orang, ia kemungkinan akan berinisatif untuk menjalin relasi dengan orang lain. Di sisi lain, hal ini berpotensi membuatnya banyak membuang waktu untuk aktivitas sosial dibanding menyelesaikan tugas yang menjadi tanggung jawabnya."),
  ],
  B: [
    B(0, 2, "Ia adalah pribadi yang mandiri secara emosi sehingga tidak mudah dipengaruhi tekanan kelompok. Ia bukan pribadi yang senang terikat dalam satu kelompok secara eksklusif. Terdapat kemungkinan bahwa ia kurang peka terhadap sikap dan kebutuhan kelompok. Pembawaannya yang cenderung penyendiri membuatnya enggan terikat sebagai bagian dalam kelompok tertentu."),
    B(3, 5, "Ia cenderung selektif dalam bergabung dengan kelompok. Terdapat kemungkinan bahwa ia bergabung dalam suatu kelompok apabila ia memandang kelompok tersebut bernilai atau sesuai minat. Dengan kebutuhannya bergabung dalam kelompok yang tergolong moderat, diperkirakan ia tidak mudah dipengaruhi pendapat kelompoknya. Ada situasi di mana ia senang menjadi bagian dalam kelompok, namun ada juga saat-saat dimana ia akan memprioritaskan hal lain dibanding berkumpul di kelompok."),
    B(6, INF, "Ia memiliki kebutuhan yang besar untuk menjadi bagian dalam kelompok. Ia pun ingin disukai dan diakui oleh lingkungan. Penerimaan dari teman dan hubungan yang harmonis menjadi hal yang penting baginya. Rasa keterikatan yang besar pada kelompok akan membuatnya fokus ke kepentingan kelompoknya. Hal ini berpotensi membuatnya mudah terpengaruh pendapat kelompok. Selain itu, ia pun cenderung lebih mengutamakan relasinya dalam kelompok dibanding penyelesaian tugas dan tanggung jawab pribadinya."),
  ],
  O: [
    B(0, 2, "Dalam menjalin relasi, ia cenderung menjaga jarak dan membangun hubungan yang formal dengan orang lain. Ia sangat berhati-hati dalam menyampaikan informasi yang sifatnya pribadi. Ia tampil dingin dan kaku ketika berinteraksi dengan orang lain, terutama saat berada dalam situasi informal. Ia tidak berusaha untuk mengenal orang lain secara mendalam sehingga terdapat kemungkinan ia pun kurang peka atas perasaan orang lain."),
    B(3, 5, "Dalam menjalin relasi, ia tidak aktif mencari ataupun menghindari hubungan antarpribadi secara personal. Ia cenderung memilih untuk membiarkannya terjadi secara natural."),
    B(6, INF, "Dalam menjalin relasi, ia sangat menghargai persahabatan yang mendalam dan tulus. Ia peka akan kebutuhan orang lain dan berharap orang lain pun mengenal dan memahaminya secara personal. Waktu dan energinya banyak diluangkan untuk menjalin hubungan yang intim dengan orang lain. Fokusnya untuk menjalin relasi yang mendalam berpotensi membuat dirinya kurang fokus pada target kerja dan tanggung jawab kerja yang harus ia penuhi. Ia cenderung subjektif dalam memberikan penilaian dan mudah tersinggung atas sikap dan perkataan orang lain. Ada indikasi ia sangat tergantung pada individu tertentu yang dirasanya nyaman."),
  ],
  R: [
    B(0, 3, "Ia merupakan tipe pragmatis yang menghadapi berbagai situasi kerja berdasarkan pengalaman ataupun intuisinya. Ia lebih fokus mencari solusi praktis dibanding memikirkan teori, konsep, dan ide. Ia cenderung bekerja secara spontan dan tanpa perencanaan. Meski di satu sisi dia diperkirakan dapat cepat merespon berbagai situasi, namun hal ini seringkali tanpa didasari pada pertimbangan matang."),
    B(4, 5, "Dalam menghadapi berbagai situasi kerja, pertimbangannya berimbang antara pengalaman praktis di lapangan dengan perencanaan dan pemikiran yang mendalam."),
    B(6, 7, "Ia suka memikirkan situasi dan permasalahan secara mendalam. Dalam memikirkan sesuatu, ia merujuk pada teori atau konsep tertentu."),
    B(8, INF, "Ia merupakan tipe pemikir yang sangat tertarik untuk memikirkan teori, konsep, ide dan gagasan. Ia tertarik pada peluang dan ide baru meski terkadang hal-hal tersebut kurang praktis dan kurang dapat diimplementasikan di lapangan. Ia memiliki preferensi untuk menyusun rencana kerja sebagai bentuk persiapannya menghadapi masa mendatang. Ia cenderung kaku pada rencana kerja yang dibuatnya."),
  ],
  D: [
    B(0, 1, "Ia lebih senang melihat pekerjaan secara makro dan fokus pada hal-hal yang ia anggap penting dalam pekerjaannya. Jika memungkinkan, ia akan menghindari dan mendelegasikan hal detail pada orang lain. Kurangnya perhatian terhadap hal detail berpotensi membuat ia bertindak tanpa didasarkan data yang akurat dan bertindak ceroboh pada tugas yang membutuhkan kecermatan tinggi."),
    B(2, 3, "Ia kurang tertarik untuk memperhatikan hal detail, namun ia masih cukup peduli pada akurasi, kelengkapan data, dan hal detail yang ada di lingkup kerjanya."),
    B(4, 6, "Ia tertarik untuk menangani sendiri hal-hal detail yang terkait dengan pekerjaannya. Namun jika diperlukan, ia masih dapat mengalihkan fokusnya pada hal lain yang lebih penting."),
    B(7, INF, "Ia memiliki minat yang sangat besar untuk memperhatikan hal detail. Akurasi dan kelengkapan data menjadi hal yang penting baginya. Terkadang ia terpaku pada hal-hal detail hingga tujuan utama yang ingin dicapai cenderung terabaikan. Ia pun berpotensi menghabiskan waktu yang terlalu lama dalam mengerjakan tugas secara detail sehingga penyelesaian tugas membutuhkan waktu yang cukup lama."),
  ],
  C: [
    B(0, 2, "Ia tidak memandang keteraturan dan kerapian lingkungan kerjanya sebagai hal yang penting. Ia lebih mementingkan fleksibilitas kerja sesuai situasi dan kondisi yang dihadapinya saat itu dibanding keteraturan dan sistematika kerja."),
    B(3, 4, "Pada dasarnya ia lebih menyukai lingkungan kerja yang fleksibel dibanding lingkungan kerja yang teratur dan tertata. Namun ia masih cukup memperhatikan keteraturan dan kerapian lingkungan kerja."),
    B(5, 6, "Ia memperhatikan keteraturan dan kerapian lingkungan kerja. Namun masih cukup fleksibel menyesuaikan diri ketika situasi dan kondisi yang dihadapi tidak sesuai dengan harapannya."),
    B(7, INF, "Ia sangat menyukai lingkungan kerja yang tertata rapi. Adanya penataan lingkungan kerja yang tidak terorganisir dan berantakan merupakan hal yang dirasa mengganggu baginya. Ada kecenderungan bahwa ia kaku mempertahankan penataan dan sistem kerja yang menurutnya teratur."),
  ],
  Z: [
    B(0, 1, "Ia menyukai pekerjaan rutin serta lingkungan yang stabil dan tidak berubah. Ia dapat mengerjakan tugas yang monoton tanpa merasa bosan. Ia tidak membutuhkan variasi dan cenderung menolak perubahan. Kesulitannya untuk menerima hal baru membuatnya membutuhkan waktu lama untuk beradaptasi."),
    B(2, 3, "Ia lebih menyukai aktivitas rutin yang sudah akrab baginya dibanding hal-hal baru yang berbeda dari kesehariannya. Ia hanya menerima perubahan jika hal tersebut didasari oleh hal yang jelas dan meyakinkan. Ia cenderung resisten dan membutuhkan waktu untuk dapat menerima hal baru dan perubahan."),
    B(4, 5, "Ia cukup menyukai perubahan dan mudah beradaptasi dengan hal baru."),
    B(6, 7, "Ia antusias terhadap perubahan dan mencari hal-hal baru yang dapat dilakukan dalam kesehariannya. Dalam menerima dan melakukan hal-hal baru, ia tetap mempertimbangkan manfaat dari berbagai hal baru tersebut."),
    B(8, INF, "Ia sangat menyukai perubahan, ide-ide baru, dan melakukan aktivitas yang bervariasi. Hal ini membuatnya aktif mencari dan menginisiasi perubahan. Ia mudah beradaptasi pada situasi yang berbeda-beda. Ia tidak menyukai tugas rutin yang monoton dan berpotensi mudah bosan ketika mengerjakannya. Ia membutuhkan variasi dalam kesehariannya meski hal tersebut tidak efektif ataupun tidak signifikan mendukung pencapaian target dan pemenuhan tugasnya."),
  ],
  E: [
    B(0, 1, "Ia memandang dirinya sebagai pribadi yang sangat terbuka dan berterus terang."),
    B(2, 3, "Ia memandang dirinya sebagai pribadi yang terbuka dalam mengungkapkan perasaan dan pendapatnya mengenai suatu hal kepada orang lain."),
    B(4, 6, "Ia memandang dirinya dapat mengendalikan perasaannya dengan cukup baik. Ia dapat mengekspresikan perasaannya dalam situasi tertentu dan menahan ekspresi emosinya di situasi yang lain."),
    B(7, INF, "Ia memandang dirinya sebagai pribadi yang tenang dan dapat menyimpan emosinya dengan baik. Di sisi lain, ia terkesan kurang ekspresif dan kemungkinan sulit mengungkapan apa yang dirasakannya."),
  ],
  K: [
    B(0, 1, "Ia cenderung berusaha menghindari konflik dan perdebatan dengan orang lain. Hal ini membuatnya terkesan pasif dan tidak terbuka menyampaikan pemikirannya. Kecenderungannya menghindari konfrontasi membuatnya terkadang tidak mengakui adanya konflik dan sulit dipahami pemikirannya."),
    B(2, 3, "Ia cenderung menghindari konflik ataupun situasi yang memicu perdebatan dengan orang lain. Ia lebih fokus untuk mencari jalan tengah ataupun menyetujui pendapat orang lain meski ia memiliki pendapat yang berbeda."),
    B(4, 5, "Ia tidak mencari ataupun menghindari konflik. Ia mau mendengarkan pendapat orang lain yang berbeda dari dirinya. Namun untuk hal yang ia anggap penting, ia cukup berani untuk menyampaikannya dan cenderung berpegang teguh pada pendapatnya tersebut."),
    B(6, 7, "Ia adalah pribadi yang berani menyampaikan pendapat dan pemikiran yang ia anggap benar. Ia berani menghadapi situasi yang berpotensi konflik untuk asertif mengemukakan pendapatnya. Di waktu dan situasi tertentu ia dapat menahan diri ataupun menyampaikan pendapatnya dengan cara yang positif sehingga lebih mudah diterima orang lain."),
    B(8, INF, "Ia adalah pribadi yang sangat terbuka dan berterus terang menyampaikan apa yang ia pikirkan. Ia tidak segan menghadapi konflik ataupun situasi yang berpotensi konflik untuk mempertahankan hal yang diyakininya benar. Ia cenderung bersikap menyerang orang lain yang memiliki pendapat berbeda dari dirinya. Orang lain kemungkinan memandang dirinya bersikap keras kepala dan sulit menerima masukan."),
  ],
}

/** Ambil narasi interpretasi untuk satu dimensi berdasar skor mentah (0–9). */
export function getInterpretation(dimension: CaptureWorkStyleDimension, rawScore: number): string {
  const bands = DIMENSION_INTERPRETATION[dimension]
  const band = bands.find(b => rawScore >= b.min && rawScore <= b.max)
  return band?.text ?? bands[0].text
}
