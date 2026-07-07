// Alat bantu visual sederhana untuk item KPSP yang butuh contoh gambar/bentuk.
// Hanya bentuk geometris murni yang direndersecara akurat (segi empat warna,
// garis, lingkaran, silang, kotak) — itu memang stimulusnya. Untuk item yang
// aslinya perlu GAMBAR NYATA (hewan) atau POSISI TUBUH tertentu, kami TIDAK
// membuat ilustrasi kasar yang berisiko tidak representatif — instruksikan
// orang tua memakai buku bergambar/mainan/foto sendiri, sesuai teks soal.

export default function KpspVisualAid({ kind }: { kind: string }) {
  switch (kind) {
    case "segi-empat-warna":
      return (
        <div className="flex gap-2 justify-center py-2" role="img" aria-label="Empat segi empat warna: merah, kuning, biru, hijau">
          {["#E34948", "#EDA100", "#2A78D6", "#1BAF7A"].map((c) => (
            <div key={c} className="w-12 h-12 rounded-[6px]" style={{ backgroundColor: c }} />
          ))}
        </div>
      )
    case "garis-panjang-pendek":
      return (
        <div className="flex gap-6 justify-center items-end py-2" role="img" aria-label="Dua garis vertikal beda panjang">
          <div className="w-[3px] h-14 bg-[#5A3A7A]" />
          <div className="w-[3px] h-8 bg-[#5A3A7A]" />
        </div>
      )
    case "garis-lurus":
      return (
        <div className="flex justify-center py-2" role="img" aria-label="Contoh garis lurus vertikal">
          <div className="w-[3px] h-14 bg-[#5A3A7A]" />
        </div>
      )
    case "gambar-lingkaran":
      return (
        <div className="flex justify-center py-2" role="img" aria-label="Contoh gambar lingkaran">
          <svg width="56" height="56" viewBox="0 0 56 56"><circle cx="28" cy="28" r="24" fill="none" stroke="#5A3A7A" strokeWidth="3" /></svg>
        </div>
      )
    case "tanda-silang":
      return (
        <div className="flex justify-center py-2" role="img" aria-label="Contoh tanda silang">
          <svg width="56" height="56" viewBox="0 0 56 56">
            <line x1="10" y1="10" x2="46" y2="46" stroke="#5A3A7A" strokeWidth="4" strokeLinecap="round" />
            <line x1="46" y1="10" x2="10" y2="46" stroke="#5A3A7A" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
      )
    case "gambar-kotak":
      return (
        <div className="flex justify-center py-2" role="img" aria-label="Contoh gambar kotak/persegi">
          <svg width="56" height="56" viewBox="0 0 56 56"><rect x="6" y="6" width="44" height="44" fill="none" stroke="#5A3A7A" strokeWidth="3" /></svg>
        </div>
      )
    case "gambar-binatang":
      return (
        <p className="text-[12px] text-[#A97CC4] bg-[#F3EEF8] rounded-[10px] px-3 py-2 text-center">
          Siapkan buku bergambar, mainan, atau foto: kucing, burung, kuda, anjing, dan orang.
        </p>
      )
    default:
      // angkat-kepala-*, angkat-dada, dan posisi tubuh lain — tidak ada ilustrasi,
      // instruksi lengkap sudah ada di teks pertanyaan.
      return null
  }
}
