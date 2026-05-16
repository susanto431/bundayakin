// Prompt untuk Claude API — Matching Engine Layer 1 (Sprint 2 — Direktori Nanny)
// Edit file ini untuk mengubah logika narasi matching di direktori.
// Untuk scoring berbasis pertanyaan survey lengkap, lihat src/lib/claude.ts.

export type MatchingPromptData = {
  parent: {
    nama: string
    surveyAnswers: Record<string, string>
    dealbreakers: string[]
    anak: Array<{ nama: string; usia: number; kondisiKhusus?: string }>
  }
  nanny: {
    nama: string
    usia: number
    pengalamanTahun: number
    kotaDomisili: string
    tipeKerja: string[]
    surveyAnswers: Record<string, string>
  }
}

export type MatchingPromptResult = {
  skor_keseluruhan: number
  skor_domain: { A: number; B: number; C: number }
  ada_dealbreaker: boolean
  dealbreaker_flags: Array<{ questionId: string; issue: string }>
  kekuatan: string[]
  potensi_lemah: string[]
  potensi_konflik: string[]
  cara_mengatasi: string[]
  tips_orang_tua: string[]
  tips_nanny: string[]
}

export function buildMatchingPrompt(data: MatchingPromptData): string {
  return `Kamu adalah asisten psikolog dari platform BundaYakin yang membantu orang tua menemukan nanny yang cocok.

Tugasmu: analisis kecocokan antara orang tua dan nanny berdasarkan jawaban survey mereka, lalu hasilkan laporan dalam format JSON.

## Data Orang Tua
Nama: ${data.parent.nama}
Anak: ${data.parent.anak.map(a => `${a.nama} (${a.usia} tahun${a.kondisiKhusus ? ", " + a.kondisiKhusus : ""})`).join(", ")}
Dealbreaker yang ditandai: ${data.parent.dealbreakers.join(", ") || "tidak ada"}
Jawaban survey: ${JSON.stringify(data.parent.surveyAnswers)}

## Data Nanny
Nama: ${data.nanny.nama}
Usia: ${data.nanny.usia} tahun
Pengalaman: ${data.nanny.pengalamanTahun} tahun
Kota: ${data.nanny.kotaDomisili}
Tipe kerja: ${data.nanny.tipeKerja.join(", ")}
Jawaban survey: ${JSON.stringify(data.nanny.surveyAnswers)}

## Aturan Scoring

Domain A (Kondisi Kerja) — bobot 40%:
- Pertanyaan dengan weight "Tinggi": 3 poin jika match, 0 jika tidak
- Pertanyaan dengan weight "Menengah": 2 poin jika match, 0 jika tidak
- Pertanyaan dengan weight "Rendah": 1 poin jika match, 0 jika tidak

Domain B (Nilai & Gaya Hidup) — bobot 35%:
- Aturan poin sama dengan Domain A

Domain C (Pengalaman & Kemampuan) — bobot 25%:
- Aturan poin sama dengan Domain A

Dealbreaker: jika ada pertanyaan yang ditandai dealbreaker oleh orang tua dan jawaban nanny tidak cocok → skor_keseluruhan = 0, ada_dealbreaker = true.

Match definition:
- Gaji (A1.1): match jika range orang tua ≥ harapan nanny
- Tipe kerja: match jika ada irisan antara preferensi keduanya
- Semua pertanyaan lain: match jika nilai sama atau berdekatan (selisih ≤ 1 tingkat)

## Format Output

Kembalikan HANYA JSON ini, tanpa teks lain:

{
  "skor_keseluruhan": <0-100>,
  "skor_domain": {
    "A": <0-100>,
    "B": <0-100>,
    "C": <0-100>
  },
  "ada_dealbreaker": <true|false>,
  "dealbreaker_flags": [
    { "questionId": "A1.1", "issue": "Budget orang tua di bawah harapan gaji nanny" }
  ],
  "kekuatan": [
    "<kalimat 1 — bahasa Indonesia awam, maksimal 15 kata>",
    "<kalimat 2>",
    "<kalimat 3>"
  ],
  "potensi_lemah": [
    "<kalimat 1>",
    "<kalimat 2>"
  ],
  "potensi_konflik": [
    "<kalimat 1 — situasi konkret yang mungkin terjadi>"
  ],
  "cara_mengatasi": [
    "<kalimat 1 — tips konkret, bukan teori>"
  ],
  "tips_orang_tua": [
    "<kalimat 1>",
    "<kalimat 2>"
  ],
  "tips_nanny": [
    "<kalimat 1>"
  ]
}

Gunakan bahasa Indonesia yang hangat dan mudah dipahami orang tua. Jangan gunakan istilah psikologi teknis.`
}
