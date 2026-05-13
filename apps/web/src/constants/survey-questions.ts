// Source of truth: docs/BLOK5_SurveyMatching_53Questions.md

export type QuestionWeight = "Tinggi" | "Menengah" | "Rendah"

export type AnswerOption = {
  label: string
  value: string
}

export type PopupQuestion = {
  question: string
  options: AnswerOption[]
}

export type PopupFollowUp = {
  trigger: string
  questions: PopupQuestion[]
}

export type QuestionSide = {
  question: string
  options: AnswerOption[]
  hasFreeText?: boolean
  /** Values that trigger the free-text input (e.g. ["f"] or ["a","b"]) */
  freeTextTriggers?: string[]
}

export type SurveyQuestion = {
  id: string               // e.g. "A1.1"
  domain: "A" | "B" | "C"
  subdomain: string        // e.g. "A1"
  subdomainLabel: string
  weight: QuestionWeight
  layer: "L1" | "L2" | "L2/L3"
  forNanny: QuestionSide
  forParent: QuestionSide | null  // null = nanny-only question
  canBeDealbreaker: boolean
  /** Conditional inline questions shown after user picks a trigger value */
  popupFollowUp?: PopupFollowUp[]
}

// ── Aspect metadata (used by SurveyForm for section headers) ─────────────────
export const ASPECT_META: Record<string, { label: string; domain: "A" | "B" | "C"; domainLabel: string }> = {
  A1: { label: "Gaji, Libur & Fasilitas",        domain: "A", domainLabel: "Kondisi Kerja & Ekspektasi Praktis" },
  A2: { label: "Lingkup & Tugas Kerja",           domain: "A", domainLabel: "Kondisi Kerja & Ekspektasi Praktis" },
  B1: { label: "Agama & Kepercayaan",             domain: "B", domainLabel: "Nilai, Kepercayaan & Gaya Hidup" },
  B2: { label: "Pakaian & Penampilan",            domain: "B", domainLabel: "Nilai, Kepercayaan & Gaya Hidup" },
  B3: { label: "Gaya Pengasuhan",                 domain: "B", domainLabel: "Nilai, Kepercayaan & Gaya Hidup" },
  C1: { label: "Rekam Jejak Pengalaman",          domain: "C", domainLabel: "Pengalaman & Kemampuan Nanny" },
  C2: { label: "Kemampuan Praktis",               domain: "C", domainLabel: "Pengalaman & Kemampuan Nanny" },
  C3: { label: "Gaya Komunikasi & Keterbukaan",   domain: "C", domainLabel: "Pengalaman & Kemampuan Nanny" },
  C4: { label: "Kecocokan Lingkungan",            domain: "C", domainLabel: "Pengalaman & Kemampuan Nanny" },
}

// ── 53 Survey Questions ───────────────────────────────────────────────────────
export const SURVEY_QUESTIONS: SurveyQuestion[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // DOMAIN A — Kondisi Kerja & Ekspektasi Praktis
  // ══════════════════════════════════════════════════════════════════════════

  // ── A1 — Gaji, Libur & Fasilitas (10 pertanyaan) ──────────────────────────

  {
    id: "A1.1",
    domain: "A", subdomain: "A1", subdomainLabel: "Gaji, Libur & Fasilitas",
    weight: "Tinggi", layer: "L1",
    forNanny: {
      question: "Berapa gaji yang kamu harapkan per bulan?",
      options: [
        { value: "a", label: "Di bawah Rp 2 juta" },
        { value: "b", label: "Rp 2–3 juta" },
        { value: "c", label: "Rp 3–4 juta" },
        { value: "d", label: "Rp 4–5 juta" },
        { value: "e", label: "Di atas Rp 5 juta" },
      ],
    },
    forParent: {
      question: "Berapa budget gaji nanny per bulan?",
      options: [
        { value: "a", label: "Di bawah Rp 2 juta" },
        { value: "b", label: "Rp 2–3 juta" },
        { value: "c", label: "Rp 3–4 juta" },
        { value: "d", label: "Rp 4–5 juta" },
        { value: "e", label: "Di atas Rp 5 juta" },
      ],
    },
    canBeDealbreaker: true,
  },

  {
    id: "A1.2",
    domain: "A", subdomain: "A1", subdomainLabel: "Gaji, Libur & Fasilitas",
    weight: "Tinggi", layer: "L1",
    forNanny: {
      question: "Apakah kamu mau tinggal di rumah majikan?",
      options: [
        { value: "a", label: "Ya, mau tinggal di sana" },
        { value: "b", label: "Tidak, mau pulang setiap hari" },
      ],
    },
    forParent: {
      question: "Nanny harus tinggal di rumah?",
      options: [
        { value: "a", label: "Ya, harus tinggal" },
        { value: "b", label: "Boleh pulang setiap hari" },
        { value: "c", label: "Bebas" },
      ],
    },
    canBeDealbreaker: true,
  },

  {
    id: "A1.3",
    domain: "A", subdomain: "A1", subdomainLabel: "Gaji, Libur & Fasilitas",
    weight: "Tinggi", layer: "L1",
    forNanny: {
      question: "Kalau tinggal di rumah — kamu butuh kamar sendiri?",
      options: [
        { value: "a", label: "Ya, harus kamar sendiri" },
        { value: "b", label: "Tidak masalah berbagi kamar dengan rekan kerja" },
        { value: "c", label: "Tidak masalah tidur sekamar dengan anak" },
        { value: "d", label: "Tidak tinggal di sana" },
      ],
    },
    forParent: {
      question: "Untuk area tidur, nanny mendapat fasilitas:",
      options: [
        { value: "a", label: "Kamar sendiri" },
        { value: "b", label: "Berbagi kamar dengan rekan kerja" },
        { value: "c", label: "Tidur sekamar dengan anak" },
        { value: "d", label: "Tidak tinggal di rumah" },
      ],
    },
    canBeDealbreaker: true,
  },

  {
    id: "A1.4",
    domain: "A", subdomain: "A1", subdomainLabel: "Gaji, Libur & Fasilitas",
    weight: "Tinggi", layer: "L1",
    forNanny: {
      question: "Seberapa sering kamu ingin libur tiap bulan?",
      options: [
        { value: "a", label: "Tidak perlu libur" },
        { value: "b", label: "1 hari" },
        { value: "c", label: "2 hari" },
        { value: "d", label: "3 hari" },
        { value: "e", label: "4 hari (seminggu sekali)" },
        { value: "f", label: "Lain-lain" },
      ],
      hasFreeText: true,
      freeTextTriggers: ["f"],
    },
    forParent: {
      question: "Seberapa sering nanny boleh libur tiap bulan?",
      options: [
        { value: "a", label: "Tidak ada libur" },
        { value: "b", label: "1 hari" },
        { value: "c", label: "2 hari" },
        { value: "d", label: "3 hari" },
        { value: "e", label: "4 hari (seminggu sekali)" },
      ],
    },
    canBeDealbreaker: true,
  },

  {
    id: "A1.5",
    domain: "A", subdomain: "A1", subdomainLabel: "Gaji, Libur & Fasilitas",
    weight: "Tinggi", layer: "L1",
    forNanny: {
      question: "Bagaimana jam kerja yang kamu harapkan?",
      options: [
        { value: "a", label: "Shift kerja 8 jam sehari" },
        { value: "b", label: "Shift kerja 12 jam" },
        { value: "c", label: "Menyesuaikan jadwal anak (dari bangun hingga tidur)" },
        { value: "d", label: "Kerja sepanjang hari termasuk tidur bersama anak" },
      ],
    },
    forParent: {
      question: "Jam kerja nanny yang diharapkan:",
      options: [
        { value: "a", label: "Shift kerja 8 jam sehari" },
        { value: "b", label: "Shift kerja 12 jam" },
        { value: "c", label: "Menyesuaikan jadwal anak (dari bangun hingga tidur)" },
        { value: "d", label: "Kerja sepanjang hari termasuk tidur bersama anak" },
      ],
    },
    canBeDealbreaker: true,
  },

  {
    id: "A1.6",
    domain: "A", subdomain: "A1", subdomainLabel: "Gaji, Libur & Fasilitas",
    weight: "Menengah", layer: "L1",
    forNanny: {
      question: "Apakah kamu mau lembur kalau diminta?",
      options: [
        { value: "a", label: "Ya, tidak masalah" },
        { value: "b", label: "Mau sesekali" },
        { value: "c", label: "Tidak mau" },
      ],
      hasFreeText: true,
      freeTextTriggers: ["b"],
    },
    forParent: {
      question: "Ada kemungkinan nanny diminta lembur?",
      options: [
        { value: "a", label: "Ya, sering" },
        { value: "b", label: "Kadang-kadang" },
        { value: "c", label: "Tidak pernah" },
      ],
      hasFreeText: true,
      freeTextTriggers: ["a", "b"],
    },
    canBeDealbreaker: false,
  },

  {
    id: "A1.7",
    domain: "A", subdomain: "A1", subdomainLabel: "Gaji, Libur & Fasilitas",
    weight: "Menengah", layer: "L1",
    forNanny: {
      question: "Kamu mau dapat THR?",
      options: [
        { value: "a", label: "Ya, wajib" },
        { value: "b", label: "Tidak masalah kalau tidak ada" },
      ],
    },
    forParent: {
      question: "Bunda kasih THR ke nanny?",
      options: [
        { value: "a", label: "Ya" },
        { value: "b", label: "Tidak" },
      ],
    },
    canBeDealbreaker: true,
  },

  {
    id: "A1.8",
    domain: "A", subdomain: "A1", subdomainLabel: "Gaji, Libur & Fasilitas",
    weight: "Menengah", layer: "L1",
    forNanny: {
      question: "Kamu mau didaftarkan BPJS Kesehatan?",
      options: [
        { value: "a", label: "Ya, wajib" },
        { value: "b", label: "Tidak masalah" },
      ],
    },
    forParent: {
      question: "Bunda daftarkan nanny ke BPJS Kesehatan?",
      options: [
        { value: "a", label: "Ya" },
        { value: "b", label: "Tidak" },
      ],
    },
    canBeDealbreaker: true,
  },

  {
    id: "A1.9",
    domain: "A", subdomain: "A1", subdomainLabel: "Gaji, Libur & Fasilitas",
    weight: "Rendah", layer: "L1",
    forNanny: {
      question: "Kamu mau fasilitas kebutuhan sehari-hari disediakan? (sabun, shampo, odol, pembalut, dll)",
      options: [
        { value: "a", label: "Ya, wajib disediakan" },
        { value: "b", label: "Tidak masalah atur sendiri" },
        { value: "c", label: "Tidak masalah keduanya" },
      ],
    },
    forParent: {
      question: "Apakah kamu menyediakan kebutuhan sehari-hari nanny? (sabun, shampo, odol, dll)",
      options: [
        { value: "a", label: "Ya, disediakan" },
        { value: "b", label: "Tidak, nanny atur sendiri" },
      ],
    },
    canBeDealbreaker: false,
  },

  {
    id: "A1.10",
    domain: "A", subdomain: "A1", subdomainLabel: "Gaji, Libur & Fasilitas",
    weight: "Menengah", layer: "L1",
    forNanny: {
      question: "Kamu berencana bekerja sebagai nanny berapa lama?",
      options: [
        { value: "a", label: "1 bulan" },
        { value: "b", label: "3 bulan" },
        { value: "c", label: "6 bulan" },
        { value: "d", label: "1 tahun" },
        { value: "e", label: "Belum ditentukan" },
        { value: "f", label: "Lain-lain" },
      ],
      hasFreeText: true,
      freeTextTriggers: ["f"],
    },
    forParent: {
      question: "Kontrak kerja yang kamu tawarkan ke nanny berapa lama?",
      options: [
        { value: "a", label: "1 bulan" },
        { value: "b", label: "3 bulan" },
        { value: "c", label: "6 bulan" },
        { value: "d", label: "1 tahun" },
        { value: "e", label: "Belum ditentukan" },
        { value: "f", label: "Lain-lain" },
      ],
      hasFreeText: true,
      freeTextTriggers: ["f"],
    },
    canBeDealbreaker: true,
  },

  // ── A2 — Lingkup & Tugas Kerja (6 pertanyaan) ─────────────────────────────

  {
    id: "A2.1",
    domain: "A", subdomain: "A2", subdomainLabel: "Lingkup & Tugas Kerja",
    weight: "Tinggi", layer: "L1",
    forNanny: {
      question: "Kamu mau bantu masak?",
      options: [
        { value: "a", label: "Ya, masak untuk semua anggota keluarga" },
        { value: "b", label: "Hanya masak untuk anak" },
        { value: "c", label: "Tidak mau / tidak bisa masak" },
      ],
    },
    forParent: {
      question: "Nanny perlu bantu masak?",
      options: [
        { value: "a", label: "Ya, untuk semua anggota keluarga" },
        { value: "b", label: "Hanya untuk anak" },
        { value: "c", label: "Tidak perlu" },
      ],
    },
    canBeDealbreaker: true,
  },

  {
    id: "A2.2",
    domain: "A", subdomain: "A2", subdomainLabel: "Lingkup & Tugas Kerja",
    weight: "Menengah", layer: "L1",
    forNanny: {
      question: "Kamu mau bantu cuci baju?",
      options: [
        { value: "a", label: "Ya, semua baju di rumah" },
        { value: "b", label: "Hanya baju anak" },
        { value: "c", label: "Tidak" },
      ],
    },
    forParent: {
      question: "Nanny perlu cuci baju?",
      options: [
        { value: "a", label: "Ya, semua baju keluarga" },
        { value: "b", label: "Hanya baju anak" },
        { value: "c", label: "Tidak perlu" },
      ],
    },
    canBeDealbreaker: false,
  },

  {
    id: "A2.3",
    domain: "A", subdomain: "A2", subdomainLabel: "Lingkup & Tugas Kerja",
    weight: "Menengah", layer: "L1",
    forNanny: {
      question: "Kamu mau bantu bersih-bersih rumah?",
      options: [
        { value: "a", label: "Ya, seluruh bagian rumah" },
        { value: "b", label: "Hanya kamar dan area/ruang bermain anak" },
        { value: "c", label: "Tidak mau" },
      ],
    },
    forParent: {
      question: "Nanny perlu bersih-bersih rumah?",
      options: [
        { value: "a", label: "Ya, seluruh bagian rumah" },
        { value: "b", label: "Hanya kamar dan area/ruang bermain anak" },
        { value: "c", label: "Tidak perlu" },
      ],
    },
    canBeDealbreaker: false,
  },

  {
    id: "A2.4",
    domain: "A", subdomain: "A2", subdomainLabel: "Lingkup & Tugas Kerja",
    weight: "Rendah", layer: "L1",
    forNanny: {
      question: "Kamu mau bantu setrika?",
      options: [
        { value: "a", label: "Ya, semua baju di rumah" },
        { value: "b", label: "Hanya baju anak" },
        { value: "c", label: "Tidak" },
      ],
    },
    forParent: {
      question: "Nanny perlu setrika?",
      options: [
        { value: "a", label: "Ya, semua baju keluarga" },
        { value: "b", label: "Hanya baju anak" },
        { value: "c", label: "Tidak perlu" },
      ],
    },
    canBeDealbreaker: false,
  },

  {
    id: "A2.5",
    domain: "A", subdomain: "A2", subdomainLabel: "Lingkup & Tugas Kerja",
    weight: "Menengah", layer: "L1",
    forNanny: {
      question: "Kamu nyaman kerja bareng ART lain di rumah yang sama?",
      options: [
        { value: "a", label: "Ya, tidak masalah" },
        { value: "b", label: "Lebih suka kerja sendiri" },
        { value: "c", label: "Tidak ada pendapat" },
      ],
    },
    forParent: {
      question: "Di rumah ada ART lain selain nanny?",
      options: [
        { value: "a", label: "Ya" },
        { value: "b", label: "Tidak" },
      ],
    },
    canBeDealbreaker: false,
  },

  {
    id: "A2.6",
    domain: "A", subdomain: "A2", subdomainLabel: "Lingkup & Tugas Kerja",
    weight: "Tinggi", layer: "L1",
    forNanny: {
      question: "Kamu mau jaga lebih dari 1 anak?",
      options: [
        { value: "a", label: "Ya, tidak masalah" },
        { value: "b", label: "Maksimal 2 anak" },
        { value: "c", label: "Lebih suka 1 anak saja" },
      ],
    },
    forParent: {
      question: "Berapa anak yang perlu dijaga?",
      options: [
        { value: "a", label: "1 anak" },
        { value: "b", label: "2 anak" },
        { value: "c", label: "Lebih dari 2 anak" },
      ],
    },
    canBeDealbreaker: true,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // DOMAIN B — Nilai, Kepercayaan & Gaya Hidup
  // ══════════════════════════════════════════════════════════════════════════

  // ── B1 — Agama & Kepercayaan (4 pertanyaan) ───────────────────────────────

  {
    id: "B1.1",
    domain: "B", subdomain: "B1", subdomainLabel: "Agama & Kepercayaan",
    weight: "Tinggi", layer: "L1",
    forNanny: {
      question: "Agama kamu apa?",
      options: [
        { value: "a", label: "Islam" },
        { value: "b", label: "Kristen" },
        { value: "c", label: "Katolik" },
        { value: "d", label: "Hindu" },
        { value: "e", label: "Budha" },
        { value: "f", label: "Lainnya" },
      ],
    },
    forParent: {
      question: "Agama keluarga apa?",
      options: [
        { value: "a", label: "Islam" },
        { value: "b", label: "Kristen" },
        { value: "c", label: "Katolik" },
        { value: "d", label: "Hindu" },
        { value: "e", label: "Budha" },
        { value: "f", label: "Lainnya" },
      ],
    },
    canBeDealbreaker: false,
  },

  {
    id: "B1.2",
    domain: "B", subdomain: "B1", subdomainLabel: "Agama & Kepercayaan",
    weight: "Tinggi", layer: "L1",
    forNanny: {
      question: "Kamu perlu waktu khusus untuk ibadah di jam kerja?",
      options: [
        { value: "a", label: "Ya, perlu" },
        { value: "b", label: "Tidak perlu" },
      ],
    },
    forParent: {
      question: "Kamu izinkan nanny ibadah di jam kerja?",
      options: [
        { value: "a", label: "Ya, boleh" },
        { value: "b", label: "Tidak, harus di luar jam kerja" },
      ],
    },
    canBeDealbreaker: true,
  },

  {
    id: "B1.3",
    domain: "B", subdomain: "B1", subdomainLabel: "Agama & Kepercayaan",
    weight: "Tinggi", layer: "L1",
    forNanny: {
      question: "Kamu mau masak atau menyuapi anak makanan yang tidak halal?",
      options: [
        { value: "a", label: "Ya, tidak masalah" },
        { value: "b", label: "Masak boleh, tapi tidak mau menyuapi" },
        { value: "c", label: "Tidak mau sama sekali" },
        { value: "d", label: "Tergantung jenis makanannya" },
      ],
    },
    forParent: {
      question: "Di rumah ada makanan tidak halal yang perlu dimasak atau disiapkan nanny?",
      options: [
        { value: "a", label: "Ya" },
        { value: "b", label: "Tidak" },
      ],
    },
    canBeDealbreaker: true,
  },

  {
    id: "B1.4",
    domain: "B", subdomain: "B1", subdomainLabel: "Agama & Kepercayaan",
    weight: "Menengah", layer: "L1",
    forNanny: {
      question: "Kamu mau dampingi anak ke tempat ibadah yang berbeda agama?",
      options: [
        { value: "a", label: "Ya, siap" },
        { value: "b", label: "Tidak mau" },
        { value: "c", label: "Bisa, tapi tidak ikut masuk ke dalam" },
      ],
    },
    forParent: {
      question: "Nanny perlu dampingi anak ke tempat ibadah?",
      options: [
        { value: "a", label: "Ya, sering" },
        { value: "b", label: "Kadang-kadang" },
        { value: "c", label: "Tidak pernah" },
      ],
    },
    canBeDealbreaker: true,
  },

  // ── B2 — Pakaian & Penampilan (5 pertanyaan) ──────────────────────────────

  {
    id: "B2.1",
    domain: "B", subdomain: "B2", subdomainLabel: "Pakaian & Penampilan",
    weight: "Menengah", layer: "L1",
    forNanny: {
      question: "Kamu biasa pakai hijab?",
      options: [
        { value: "a", label: "Ya, selalu" },
        { value: "b", label: "Tergantung situasi (saat keluar saja)" },
        { value: "c", label: "Tidak" },
      ],
    },
    forParent: {
      question: "Nanny diharapkan pakai hijab?",
      options: [
        { value: "a", label: "Ya, harus" },
        { value: "b", label: "Tidak masalah pakai atau tidak" },
        { value: "c", label: "Lebih suka tidak pakai hijab" },
      ],
    },
    canBeDealbreaker: true,
  },

  {
    id: "B2.2",
    domain: "B", subdomain: "B2", subdomainLabel: "Pakaian & Penampilan",
    weight: "Menengah", layer: "L1",
    forNanny: {
      question: "Kalau diminta lepas hijab di dalam rumah, kamu keberatan?",
      options: [
        { value: "a", label: "Ya, keberatan" },
        { value: "b", label: "Tidak masalah" },
        { value: "c", label: "Saya tidak pakai hijab" },
      ],
    },
    forParent: {
      question: "Kamu mengharapkan nanny lepas hijab di dalam rumah?",
      options: [
        { value: "a", label: "Ya" },
        { value: "b", label: "Tidak" },
        { value: "c", label: "Tidak masalah" },
      ],
    },
    canBeDealbreaker: true,
  },

  {
    id: "B2.3",
    domain: "B", subdomain: "B2", subdomainLabel: "Pakaian & Penampilan",
    weight: "Rendah", layer: "L1",
    forNanny: {
      question: "Kamu nyaman pakai seragam kerja?",
      options: [
        { value: "a", label: "Ya, tidak masalah" },
        { value: "b", label: "Lebih suka baju sendiri" },
        { value: "c", label: "Tidak masalah keduanya" },
      ],
    },
    forParent: {
      question: "Apakah kamu menyediakan seragam untuk nanny?",
      options: [
        { value: "a", label: "Ya, wajib pakai seragam" },
        { value: "b", label: "Tidak, bebas rapi" },
        { value: "c", label: "Tidak wajib tapi disediakan" },
      ],
    },
    canBeDealbreaker: false,
  },

  {
    id: "B2.4",
    domain: "B", subdomain: "B2", subdomainLabel: "Pakaian & Penampilan",
    weight: "Rendah", layer: "L1",
    forNanny: {
      question: "Jenis pakaian apa yang ingin kamu gunakan sehari-hari saat bekerja di dalam rumah?",
      options: [
        { value: "a", label: "Celana pendek dan/atau tank top" },
        { value: "b", label: "Kaos dan celana panjang longgar" },
        { value: "c", label: "Mengikuti aturan berpakaian majikan" },
      ],
    },
    forParent: {
      question: "Aturan berpakaian nanny di dalam rumah:",
      options: [
        { value: "a", label: "Bebas, termasuk celana pendek / tank top" },
        { value: "b", label: "Harus berpakaian sopan dan tertutup" },
        { value: "c", label: "Tidak masalah selama rapi" },
      ],
    },
    canBeDealbreaker: false,
  },

  {
    id: "B2.5",
    domain: "B", subdomain: "B2", subdomainLabel: "Pakaian & Penampilan",
    weight: "Rendah", layer: "L1",
    forNanny: {
      question: "Waktu keluar rumah bersama anak, kamu ingin berpakaian seperti apa?",
      options: [
        { value: "a", label: "Bebas rapi" },
        { value: "b", label: "Pakai seragam" },
        { value: "c", label: "Tertutup/sopan" },
        { value: "d", label: "Sesuai permintaan majikan" },
      ],
    },
    forParent: {
      question: "Waktu keluar rumah bersama anak, nanny diharapkan berpakaian seperti apa?",
      options: [
        { value: "a", label: "Bebas rapi" },
        { value: "b", label: "Pakai seragam" },
        { value: "c", label: "Harus tertutup" },
        { value: "d", label: "Terserah nanny" },
      ],
    },
    canBeDealbreaker: false,
  },

  // ── B3 — Gaya Pengasuhan (6 pertanyaan) ───────────────────────────────────

  {
    id: "B3.1",
    domain: "B", subdomain: "B3", subdomainLabel: "Gaya Pengasuhan",
    weight: "Tinggi", layer: "L1",
    forNanny: {
      question: "Kalau anak nangis, kamu bagaimana?",
      options: [
        { value: "a", label: "Langsung gendong/peluk" },
        { value: "b", label: "Tunggu sebentar, lihat situasi dulu" },
        { value: "c", label: "Tergantung kenapa nangisnya" },
      ],
    },
    forParent: {
      question: "Kalau anak nangis, kamu mau nanny bagaimana?",
      options: [
        { value: "a", label: "Langsung gendong/peluk" },
        { value: "b", label: "Tunggu sebentar dulu" },
        { value: "c", label: "Tergantung situasi" },
      ],
    },
    canBeDealbreaker: true,
  },

  {
    id: "B3.2",
    domain: "B", subdomain: "B3", subdomainLabel: "Gaya Pengasuhan",
    weight: "Tinggi", layer: "L1",
    forNanny: {
      question: "Kamu setuju anak boleh lihat HP/TV?",
      options: [
        { value: "a", label: "Boleh, tidak dibatasi" },
        { value: "b", label: "Boleh tapi dibatasi waktunya" },
        { value: "c", label: "Tidak boleh sama sekali" },
      ],
    },
    forParent: {
      question: "Di rumah, anak boleh lihat HP/TV?",
      options: [
        { value: "a", label: "Boleh bebas" },
        { value: "b", label: "Boleh tapi dibatasi" },
        { value: "c", label: "Tidak boleh" },
      ],
    },
    canBeDealbreaker: true,
  },

  {
    id: "B3.3",
    domain: "B", subdomain: "B3", subdomainLabel: "Gaya Pengasuhan",
    weight: "Tinggi", layer: "L1",
    forNanny: {
      question: "Kalau anak tidak mau makan, kamu bagaimana?",
      options: [
        { value: "a", label: "Bujuk pelan-pelan sampai mau" },
        { value: "b", label: "Batasi waktu makan (20–30 menit), tunggu waktu makan berikutnya" },
        { value: "c", label: "Tunggu sampai lapar sendiri" },
        { value: "d", label: "Ikuti mau anak" },
        { value: "e", label: "Langsung lapor ke orang tua" },
      ],
    },
    forParent: {
      question: "Kalau anak susah makan, kamu mau nanny bagaimana?",
      options: [
        { value: "a", label: "Bujuk pelan-pelan" },
        { value: "b", label: "Batasi waktu makan, tunggu jadwal berikutnya" },
        { value: "c", label: "Tunggu lapar sendiri" },
        { value: "d", label: "Lapor ke orang tua" },
      ],
    },
    canBeDealbreaker: true,
  },

  {
    id: "B3.4",
    domain: "B", subdomain: "B3", subdomainLabel: "Gaya Pengasuhan",
    weight: "Tinggi", layer: "L1",
    forNanny: {
      question: "Kamu pernah cubit atau marahi anak keras kalau nakal?",
      options: [
        { value: "a", label: "Tidak pernah" },
        { value: "b", label: "Pernah tapi sangat jarang" },
        { value: "c", label: "Kadang-kadang" },
      ],
    },
    forParent: {
      question: "Batas disiplin nanny ke anak yang kamu izinkan:",
      options: [
        { value: "a", label: "Tegur dengan suara biasa saja" },
        { value: "b", label: "Boleh tegur keras" },
        { value: "c", label: "Tidak boleh ada hukuman apapun" },
      ],
    },
    canBeDealbreaker: true,
  },

  {
    id: "B3.5",
    domain: "B", subdomain: "B3", subdomainLabel: "Gaya Pengasuhan",
    weight: "Tinggi", layer: "L1",
    forNanny: {
      question: "Kamu mau tidur bersama anak?",
      options: [
        { value: "a", label: "Siap tidur bersama anak setiap malam" },
        { value: "b", label: "Sehari-hari bersama anak, sesekali anak tidur dengan orang tua" },
        { value: "c", label: "Sehari-hari anak tidur dengan orang tua, siap kalau kondisi khusus" },
        { value: "d", label: "Menemani tidur siang saja, malam terpisah" },
      ],
    },
    forParent: {
      question: "Kamu mau nanny tidur bersama anak?",
      options: [
        { value: "a", label: "Ya, setiap malam" },
        { value: "b", label: "Kebanyakan bersama nanny, sesekali dengan orang tua" },
        { value: "c", label: "Kebanyakan dengan orang tua, sesekali dengan nanny" },
        { value: "d", label: "Tidak perlu, anak tidur dengan orang tua" },
      ],
    },
    canBeDealbreaker: true,
  },

  {
    id: "B3.6",
    domain: "B", subdomain: "B3", subdomainLabel: "Gaya Pengasuhan",
    weight: "Menengah", layer: "L1",
    forNanny: {
      question: "Kamu mau aktif ajak anak main dan belajar, bukan cuma dijaga?",
      options: [
        { value: "a", label: "Ya, senang melakukannya" },
        { value: "b", label: "Bisa, kalau diminta" },
        { value: "c", label: "Lebih nyaman jaga saja" },
      ],
    },
    forParent: {
      question: "Nanny diharapkan aktif ajak anak main dan belajar?",
      options: [
        { value: "a", label: "Ya, wajib" },
        { value: "b", label: "Kalau ada waktu saja" },
        { value: "c", label: "Tidak perlu, cukup dijaga" },
      ],
    },
    canBeDealbreaker: false,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // DOMAIN C — Pengalaman & Kemampuan Nanny
  // ══════════════════════════════════════════════════════════════════════════

  // ── C1 — Rekam Jejak Pengalaman (6 pertanyaan + conditional skip) ──────────
  // Skip logic: C1.1 value "b" → skip C1.2–C1.6 (nanny has no prior experience)

  {
    id: "C1.1",
    domain: "C", subdomain: "C1", subdomainLabel: "Rekam Jejak Pengalaman",
    weight: "Tinggi", layer: "L1",
    forNanny: {
      question: "Kamu pernah jadi nanny atau pengasuh sebelumnya?",
      options: [
        { value: "a", label: "Ya" },
        { value: "b", label: "Tidak" },
      ],
    },
    forParent: {
      question: "Pengalaman minimum yang kamu harapkan dari nanny:",
      options: [
        { value: "a", label: "Tidak ada pengalaman pun tidak masalah" },
        { value: "b", label: "Minimal 1 tahun" },
        { value: "c", label: "Minimal 3 tahun" },
      ],
    },
    canBeDealbreaker: true,
  },

  {
    id: "C1.2",
    domain: "C", subdomain: "C1", subdomainLabel: "Rekam Jejak Pengalaman",
    weight: "Tinggi", layer: "L1",
    forNanny: {
      question: "Anak yang kamu jaga waktu itu usianya berapa?",
      options: [
        { value: "a", label: "0–6 bulan" },
        { value: "b", label: "6–12 bulan" },
        { value: "c", label: "1–3 tahun" },
        { value: "d", label: "3–6 tahun" },
        { value: "e", label: "6 tahun ke atas" },
      ],
    },
    forParent: {
      question: "Nanny perlu punya pengalaman mengasuh anak dalam rentang usia yang sama?",
      options: [
        { value: "a", label: "Ya, wajib pernah" },
        { value: "b", label: "Lebih baik pernah, tapi tidak wajib" },
        { value: "c", label: "Tidak perlu" },
      ],
    },
    canBeDealbreaker: true,
    popupFollowUp: [
      {
        trigger: "a",
        questions: [
          { question: "Kamu bisa buat atau panaskan susu formula?", options: [{ value: "ya", label: "Ya" }, { value: "tidak", label: "Tidak" }] },
          { question: "Kamu bisa mandikan bayi?", options: [{ value: "ya", label: "Ya" }, { value: "tidak", label: "Tidak" }] },
          { question: "Kamu bisa ganti popok?", options: [{ value: "ya", label: "Ya" }, { value: "tidak", label: "Tidak" }] },
          { question: "Kamu pernah tangani bayi yang kolik atau sering nangis malam?", options: [{ value: "ya", label: "Ya" }, { value: "tidak", label: "Tidak" }] },
        ],
      },
      {
        trigger: "b",
        questions: [
          { question: "Kamu bisa buat MPASI (makanan pendamping ASI)?", options: [{ value: "ya", label: "Ya" }, { value: "tidak", label: "Tidak" }] },
          { question: "Kamu bisa bantu anak belajar duduk atau merangkak?", options: [{ value: "ya", label: "Ya" }, { value: "tidak", label: "Tidak" }] },
        ],
      },
      {
        trigger: "c",
        questions: [
          { question: "Kamu bisa bantu latih anak toilet training?", options: [{ value: "ya", label: "Ya" }, { value: "tidak", label: "Tidak" }] },
          { question: "Kamu bisa ajak anak main sesuai usianya?", options: [{ value: "ya", label: "Ya" }, { value: "tidak", label: "Tidak" }] },
        ],
      },
      {
        trigger: "d",
        questions: [
          { question: "Kamu bisa bantu anak belajar baca atau tulis dasar?", options: [{ value: "ya", label: "Ya" }, { value: "tidak", label: "Tidak" }] },
        ],
      },
    ],
  },

  {
    id: "C1.3",
    domain: "C", subdomain: "C1", subdomainLabel: "Rekam Jejak Pengalaman",
    weight: "Rendah", layer: "L1",
    forNanny: {
      question: "Anak yang dulu kamu jaga — laki-laki atau perempuan?",
      options: [
        { value: "a", label: "Laki-laki" },
        { value: "b", label: "Perempuan" },
      ],
    },
    forParent: {
      question: "Nanny perlu punya pengalaman mengasuh anak dengan jenis kelamin yang sama?",
      options: [
        { value: "a", label: "Ya, wajib pernah" },
        { value: "b", label: "Lebih baik pernah, tapi tidak wajib" },
        { value: "c", label: "Tidak perlu" },
      ],
    },
    canBeDealbreaker: false,
  },

  {
    id: "C1.4",
    domain: "C", subdomain: "C1", subdomainLabel: "Rekam Jejak Pengalaman",
    weight: "Menengah", layer: "L1",
    forNanny: {
      question: "Kamu kerja di sana berapa lama?",
      options: [
        { value: "a", label: "Kurang dari 3 bulan" },
        { value: "b", label: "3–6 bulan" },
        { value: "c", label: "6–12 bulan" },
        { value: "d", label: "Lebih dari 1 tahun" },
      ],
    },
    forParent: null,
    canBeDealbreaker: false,
  },

  {
    id: "C1.5",
    domain: "C", subdomain: "C1", subdomainLabel: "Rekam Jejak Pengalaman",
    weight: "Menengah", layer: "L1",
    forNanny: {
      question: "Kamu berhenti dari sana karena apa?",
      options: [
        { value: "a", label: "Kontrak selesai" },
        { value: "b", label: "Pindah kota" },
        { value: "c", label: "Gaji kurang" },
        { value: "d", label: "Tidak cocok dengan keluarga" },
        { value: "e", label: "Alasan keluarga sendiri" },
        { value: "f", label: "Lainnya" },
      ],
      hasFreeText: true,
      freeTextTriggers: ["f"],
    },
    forParent: null,
    canBeDealbreaker: false,
  },

  {
    id: "C1.6",
    domain: "C", subdomain: "C1", subdomainLabel: "Rekam Jejak Pengalaman",
    weight: "Tinggi", layer: "L1",
    forNanny: {
      question: "Boleh kami hubungi majikan lama kamu sebagai referensi?",
      options: [
        { value: "a", label: "Ya, boleh" },
        { value: "b", label: "Tidak" },
      ],
    },
    forParent: null,
    canBeDealbreaker: false,
  },

  // ── C2 — Kemampuan Praktis (9 pertanyaan) ─────────────────────────────────

  {
    id: "C2.1",
    domain: "C", subdomain: "C2", subdomainLabel: "Kemampuan Praktis",
    weight: "Tinggi", layer: "L1",
    forNanny: {
      question: "Kendaraan apa yang kamu bisa naiki?",
      options: [
        { value: "a", label: "Sepeda" },
        { value: "b", label: "Sepeda listrik" },
        { value: "c", label: "Motor" },
        { value: "d", label: "Mobil" },
        { value: "e", label: "Tidak bisa mengendarai apapun" },
      ],
    },
    forParent: {
      question: "Nanny perlu bisa mengendarai:",
      options: [
        { value: "a", label: "Sepeda" },
        { value: "b", label: "Sepeda listrik" },
        { value: "c", label: "Motor" },
        { value: "d", label: "Mobil" },
        { value: "e", label: "Tidak perlu" },
      ],
    },
    canBeDealbreaker: true,
  },

  {
    id: "C2.2",
    domain: "C", subdomain: "C2", subdomainLabel: "Kemampuan Praktis",
    weight: "Menengah", layer: "L1",
    forNanny: {
      question: "Kamu punya SIM?",
      options: [
        { value: "a", label: "Ya, SIM A (mobil)" },
        { value: "b", label: "Ya, SIM C (motor)" },
        { value: "c", label: "Keduanya" },
        { value: "d", label: "Tidak punya" },
      ],
    },
    forParent: {
      question: "Nanny perlu punya SIM?",
      options: [
        { value: "a", label: "Ya" },
        { value: "b", label: "Tidak perlu" },
      ],
    },
    canBeDealbreaker: false,
  },

  {
    id: "C2.3",
    domain: "C", subdomain: "C2", subdomainLabel: "Kemampuan Praktis",
    weight: "Tinggi", layer: "L1",
    forNanny: {
      question: "Kamu bisa masak makanan pokok dan snack untuk anak?",
      options: [
        { value: "a", label: "Ya, bisa keduanya" },
        { value: "b", label: "Bisa masak, tapi tidak bisa buat snack" },
        { value: "c", label: "Terbatas, hanya masak sederhana" },
        { value: "d", label: "Tidak bisa masak" },
      ],
    },
    forParent: {
      question: "Nanny perlu bisa masak?",
      options: [
        { value: "a", label: "Ya" },
        { value: "b", label: "Tidak perlu" },
      ],
    },
    canBeDealbreaker: true,
  },

  {
    id: "C2.4",
    domain: "C", subdomain: "C2", subdomainLabel: "Kemampuan Praktis",
    weight: "Menengah", layer: "L1",
    forNanny: {
      question: "Kamu bisa baca tulisan dan ikuti instruksi tertulis?",
      options: [
        { value: "a", label: "Ya, lancar" },
        { value: "b", label: "Bisa tapi pelan" },
        { value: "c", label: "Lebih mudah dijelaskan langsung" },
      ],
    },
    forParent: null,
    canBeDealbreaker: false,
  },

  {
    id: "C2.5",
    domain: "C", subdomain: "C2", subdomainLabel: "Kemampuan Praktis",
    weight: "Menengah", layer: "L1",
    forNanny: {
      question: "Kamu bisa pakai WhatsApp dan kirim laporan harian?",
      options: [
        { value: "a", label: "Ya, lancar" },
        { value: "b", label: "Bisa tapi kadang perlu bantuan" },
        { value: "c", label: "Tidak bisa" },
      ],
    },
    forParent: {
      question: "Cara laporan harian yang kamu mau:",
      options: [
        { value: "a", label: "Lewat aplikasi BundaYakin" },
        { value: "b", label: "WhatsApp" },
        { value: "c", label: "Lisan langsung" },
        { value: "d", label: "Tidak perlu laporan harian" },
      ],
    },
    canBeDealbreaker: false,
  },

  {
    id: "C2.6",
    domain: "C", subdomain: "C2", subdomainLabel: "Kemampuan Praktis",
    weight: "Rendah", layer: "L1",
    forNanny: {
      question: "Kamu punya HP sendiri?",
      options: [
        { value: "a", label: "Ya" },
        { value: "b", label: "Tidak" },
      ],
    },
    forParent: null,
    canBeDealbreaker: false,
  },

  {
    id: "C2.7",
    domain: "C", subdomain: "C2", subdomainLabel: "Kemampuan Praktis",
    weight: "Tinggi", layer: "L1",
    forNanny: {
      question: "Kamu pernah tangani situasi darurat? (anak tersedak, demam tinggi, dll)",
      options: [
        { value: "a", label: "Ya, pernah dan tahu apa yang harus dilakukan" },
        { value: "b", label: "Pernah tapi tidak tahu harus bagaimana" },
        { value: "c", label: "Belum pernah" },
      ],
    },
    forParent: null,
    canBeDealbreaker: false,
  },

  {
    id: "C2.8",
    domain: "C", subdomain: "C2", subdomainLabel: "Kemampuan Praktis",
    weight: "Menengah", layer: "L1",
    forNanny: {
      question: "Selain Bahasa Indonesia, kamu bisa berkomunikasi dalam bahasa apa?",
      options: [
        { value: "a", label: "Bahasa Inggris (dasar s.d. lancar)" },
        { value: "b", label: "Bahasa Arab" },
        { value: "c", label: "Bahasa Mandarin" },
        { value: "d", label: "Hanya Bahasa Indonesia" },
      ],
    },
    forParent: {
      question: "Ada bahasa khusus yang diharapkan dari nanny?",
      options: [
        { value: "a", label: "Tidak ada persyaratan khusus" },
        { value: "b", label: "Bahasa Inggris" },
        { value: "c", label: "Bahasa Arab" },
        { value: "d", label: "Bahasa Mandarin" },
      ],
    },
    canBeDealbreaker: false,
  },

  {
    id: "C2.9",
    domain: "C", subdomain: "C2", subdomainLabel: "Kemampuan Praktis",
    weight: "Rendah", layer: "L1",
    forNanny: {
      question: "Kamu punya passport?",
      options: [
        { value: "a", label: "Ya" },
        { value: "b", label: "Tidak" },
      ],
    },
    forParent: null,
    canBeDealbreaker: false,
  },

  // ── C3 — Gaya Komunikasi & Keterbukaan (3 pertanyaan) ─────────────────────

  {
    id: "C3.1",
    domain: "C", subdomain: "C3", subdomainLabel: "Gaya Komunikasi & Keterbukaan",
    weight: "Menengah", layer: "L1",
    forNanny: {
      question: "Kalau ada sesuatu yang aneh dengan anak, kamu bagaimana?",
      options: [
        { value: "a", label: "Langsung lapor ke orang tua" },
        { value: "b", label: "Lihat dulu sebentar, kalau tidak membaik baru lapor" },
        { value: "c", label: "Tergantung situasinya" },
      ],
    },
    forParent: {
      question: "Kamu mau nanny lapor kapan?",
      options: [
        { value: "a", label: "Segera saat ada sesuatu" },
        { value: "b", label: "Cukup di akhir hari" },
        { value: "c", label: "Tergantung situasi" },
      ],
    },
    canBeDealbreaker: false,
  },

  {
    id: "C3.2",
    domain: "C", subdomain: "C3", subdomainLabel: "Gaya Komunikasi & Keterbukaan",
    weight: "Menengah", layer: "L1",
    forNanny: {
      question: "Kamu nyaman kalau cara kerjamu ditegur oleh majikan?",
      options: [
        { value: "a", label: "Ya, tidak masalah" },
        { value: "b", label: "Tidak masalah asal caranya baik" },
        { value: "c", label: "Agak tidak nyaman" },
      ],
    },
    forParent: {
      question: "Bunda nyaman kasih masukan langsung ke nanny?",
      options: [
        { value: "a", label: "Ya, bisa berterus terang langsung" },
        { value: "b", label: "Bisa, tapi perlu disampaikan dengan halus" },
        { value: "c", label: "Lebih nyaman lewat pesan tertulis dulu" },
      ],
    },
    canBeDealbreaker: false,
  },

  {
    id: "C3.3",
    domain: "C", subdomain: "C3", subdomainLabel: "Gaya Komunikasi & Keterbukaan",
    weight: "Menengah", layer: "L1",
    forNanny: {
      question: "Kamu mau kasih laporan harian lewat mana?",
      options: [
        { value: "a", label: "Lewat aplikasi BundaYakin" },
        { value: "b", label: "Lewat WhatsApp" },
        { value: "c", label: "Lisan langsung" },
        { value: "d", label: "Tidak nyaman buat laporan harian" },
      ],
    },
    forParent: {
      question: "Kamu mau pantau nanny lewat:",
      options: [
        { value: "a", label: "Aplikasi BundaYakin" },
        { value: "b", label: "WhatsApp" },
        { value: "c", label: "Lisan langsung" },
        { value: "d", label: "Tidak perlu laporan harian" },
      ],
    },
    canBeDealbreaker: false,
  },

  // ── C4 — Kecocokan Lingkungan (4 pertanyaan) ──────────────────────────────

  {
    id: "C4.1",
    domain: "C", subdomain: "C4", subdomainLabel: "Kecocokan Lingkungan",
    weight: "Menengah", layer: "L1",
    forNanny: {
      question: "Kamu mau kerja di area mana?",
      options: [
        { value: "bebas", label: "Tidak ada preferensi / bebas di mana saja" },
        { value: "spesifik", label: "Ada preferensi area tertentu" },
      ],
      hasFreeText: true,
      freeTextTriggers: ["spesifik"],
    },
    forParent: {
      question: "Rumah Bunda di area mana?",
      options: [
        { value: "jaksel", label: "Jakarta Selatan" },
        { value: "jakbar", label: "Jakarta Barat" },
        { value: "jaktim", label: "Jakarta Timur" },
        { value: "jakut", label: "Jakarta Utara" },
        { value: "jakpus", label: "Jakarta Pusat" },
        { value: "tangerang", label: "Tangerang / Tangsel" },
        { value: "bekasi", label: "Bekasi" },
        { value: "depok_bogor", label: "Depok / Bogor" },
        { value: "bandung", label: "Bandung" },
        { value: "surabaya", label: "Surabaya" },
        { value: "lainnya", label: "Kota lain" },
      ],
      hasFreeText: true,
      freeTextTriggers: ["lainnya"],
    },
    canBeDealbreaker: true,
  },

  {
    id: "C4.2",
    domain: "C", subdomain: "C4", subdomainLabel: "Kecocokan Lingkungan",
    weight: "Tinggi", layer: "L1",
    forNanny: {
      question: "Kamu bersedia pindah kota untuk kerja?",
      options: [
        { value: "a", label: "Ya, siap" },
        { value: "b", label: "Tidak, hanya di kota sendiri" },
        { value: "c", label: "Tergantung kotanya" },
      ],
    },
    forParent: null,
    canBeDealbreaker: true,
  },

  {
    id: "C4.3",
    domain: "C", subdomain: "C4", subdomainLabel: "Kecocokan Lingkungan",
    weight: "Menengah", layer: "L1",
    forNanny: {
      question: "Kamu alergi sesuatu?",
      options: [
        { value: "a", label: "Bulu hewan" },
        { value: "b", label: "Debu" },
        { value: "c", label: "Makanan tertentu" },
        { value: "d", label: "Tidak ada alergi" },
      ],
    },
    forParent: {
      question: "Di rumah ada hewan peliharaan?",
      options: [
        { value: "a", label: "Anjing — bebas berkeliaran di rumah" },
        { value: "b", label: "Anjing — selalu dikandang/terpisah" },
        { value: "c", label: "Kucing — bebas berkeliaran di rumah" },
        { value: "d", label: "Kucing — selalu dikandang/terpisah" },
        { value: "e", label: "Hewan peliharaan lain" },
        { value: "f", label: "Tidak ada hewan peliharaan" },
      ],
    },
    canBeDealbreaker: true,
  },

  {
    id: "C4.4",
    domain: "C", subdomain: "C4", subdomainLabel: "Kecocokan Lingkungan",
    weight: "Rendah", layer: "L1",
    forNanny: {
      question: "Kamu nyaman kalau rumah sering ada tamu?",
      options: [
        { value: "a", label: "Ya, tidak masalah" },
        { value: "b", label: "Tidak terlalu nyaman" },
        { value: "c", label: "Tidak masalah" },
      ],
    },
    forParent: {
      question: "Rumah sering ada tamu atau keluarga besar?",
      options: [
        { value: "a", label: "Sering" },
        { value: "b", label: "Kadang-kadang" },
        { value: "c", label: "Jarang" },
      ],
    },
    canBeDealbreaker: false,
  },
]
