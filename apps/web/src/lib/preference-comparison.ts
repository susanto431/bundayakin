// Komparasi Preferensi — perbandingan deterministik jawaban Tes Kecocokan Bunda vs Nanny,
// per aspek (A1, A2, B1, B2, B3, C1–C4). Lihat ADR-013 untuk alasan ini dihitung terpisah
// dari skor AI (MatchResult.skorDomainA/B/C) — sengaja tidak dipakai sebagai input satu sama lain.
//
// Pertanyaan yang forParent === null (nanny-only) tidak pernah masuk komparasi ini — tidak
// ada jawaban Bunda untuk dibandingkan.

import { prisma } from "@/lib/prisma"
import { SURVEY_QUESTIONS, ASPECT_META, type SurveyQuestion } from "@/constants/survey-questions"

export type AspectStatus = "cocok" | "beda_preferensi" | "perlu_dibicarakan" | "belum_ada_data"

export type QuestionComparison = {
  questionId: string
  questionForParent: string
  questionForNanny: string
  parentAnswerLabel: string | null
  nannyAnswerLabel: string | null
  compatible: boolean | null // null = salah satu/kedua pihak belum jawab
  isDealbreakerCandidate: boolean // ditandai wajib cocok oleh salah satu pihak
}

export type AspectComparison = {
  code: string // "A1"
  label: string
  domain: "A" | "B" | "C"
  status: AspectStatus
  questions: QuestionComparison[]
}

type AnswerMap = Record<string, { value: string | null; isDealbreaker: boolean }>

// Frasa yang menandai jawaban "fleksibel" — cocok dengan jawaban apa pun dari pihak lain.
// Ditentukan dari teks label asli tiap pertanyaan (bukan tebakan generik di luar konteks
// pertanyaannya), lihat ADR-013 catatan soal peta kecocokan per pertanyaan.
const WILDCARD_PHRASES = [
  "bebas",
  "terserah",
  "tidak masalah",
  "tidak ada preferensi",
  "tidak ada persyaratan khusus",
  "fleksibel",
  "tergantung situasi",
  "tergantung",
]

function isWildcardLabel(label: string): boolean {
  const lower = label.toLowerCase()
  return WILDCARD_PHRASES.some((phrase) => lower.includes(phrase))
}

// Pertanyaan dengan jawaban berjenjang (ordinal) di mana "lebih banyak/lebih tinggi yang
// ditawarkan Bunda" tetap cocok meski bukan persis sama dengan yang diminta Nanny —
// meniru definisi yang sudah dipakai buildMatchingPrompt untuk gaji (A1.1).
const ORDINAL_GTE_QUESTIONS: Record<string, string[]> = {
  "A1.1": ["a", "b", "c", "d", "e"], // budget Bunda >= harapan gaji Nanny
  "A1.4": ["a", "b", "c", "d", "e"], // libur yang diizinkan Bunda >= libur yang diminta Nanny
}

function findOption(side: SurveyQuestion["forNanny"] | SurveyQuestion["forParent"], value: string | null) {
  if (!side || value == null) return null
  return side.options.find((o) => o.value === value) ?? null
}

function answersCompatible(q: SurveyQuestion, nannyValue: string, parentValue: string): boolean {
  const ordinalOrder = ORDINAL_GTE_QUESTIONS[q.id]
  if (ordinalOrder) {
    const nannyIdx = ordinalOrder.indexOf(nannyValue)
    const parentIdx = ordinalOrder.indexOf(parentValue)
    if (nannyIdx !== -1 && parentIdx !== -1) return parentIdx >= nannyIdx
  }

  const nannyOption = findOption(q.forNanny, nannyValue)
  const parentOption = findOption(q.forParent, parentValue)
  if (nannyOption && isWildcardLabel(nannyOption.label)) return true
  if (parentOption && isWildcardLabel(parentOption.label)) return true

  return nannyValue === parentValue
}

/**
 * Bandingkan jawaban mentah Bunda vs Nanny per aspek. Pure function — tidak menyentuh
 * database, supaya bisa diuji dan dipakai ulang tanpa perlu mock Prisma.
 */
export function computeKomparasiPreferensi(
  parentAnswers: AnswerMap,
  nannyAnswers: AnswerMap,
): AspectComparison[] {
  const comparableQuestions = SURVEY_QUESTIONS.filter((q) => q.forParent !== null)

  const bySubdomain = new Map<string, SurveyQuestion[]>()
  for (const q of comparableQuestions) {
    const list = bySubdomain.get(q.subdomain) ?? []
    list.push(q)
    bySubdomain.set(q.subdomain, list)
  }

  const aspects: AspectComparison[] = []

  for (const [code, meta] of Object.entries(ASPECT_META)) {
    const questions = bySubdomain.get(code) ?? []
    const questionResults: QuestionComparison[] = questions.map((q) => {
      const parentAnswer = parentAnswers[q.id]
      const nannyAnswer = nannyAnswers[q.id]
      const parentValue = parentAnswer?.value ?? null
      const nannyValue = nannyAnswer?.value ?? null

      const parentOption = findOption(q.forParent, parentValue)
      const nannyOption = findOption(q.forNanny, nannyValue)

      const compatible =
        parentValue != null && nannyValue != null
          ? answersCompatible(q, nannyValue, parentValue)
          : null

      const isDealbreakerCandidate =
        q.canBeDealbreaker && Boolean(parentAnswer?.isDealbreaker || nannyAnswer?.isDealbreaker)

      return {
        questionId: q.id,
        questionForParent: q.forParent!.question,
        questionForNanny: q.forNanny.question,
        parentAnswerLabel: parentOption?.label ?? null,
        nannyAnswerLabel: nannyOption?.label ?? null,
        compatible,
        isDealbreakerCandidate,
      }
    })

    aspects.push({
      code,
      label: meta.label,
      domain: meta.domain,
      status: rollupStatus(questionResults),
      questions: questionResults,
    })
  }

  return aspects
}

// "Status paling serius menang": kalau ada 1 saja pertanyaan Dealbreaker asli (jawaban
// beda DAN ditandai wajib cocok oleh salah satu pihak) → aspek "Perlu Dibicarakan".
// Kalau tidak, tapi ada jawaban beda → "Beda Preferensi". Kalau tidak ada satu pun
// pasangan jawaban yang bisa dibandingkan (semua belum diisi) → "Belum Ada Data".
function rollupStatus(questions: QuestionComparison[]): AspectStatus {
  const answered = questions.filter((q) => q.compatible !== null)
  if (answered.length === 0) return "belum_ada_data"

  const hasDealbreaker = answered.some((q) => !q.compatible && q.isDealbreakerCandidate)
  if (hasDealbreaker) return "perlu_dibicarakan"

  const hasMismatch = answered.some((q) => !q.compatible)
  if (hasMismatch) return "beda_preferensi"

  return "cocok"
}

async function loadAnswerMap(
  respondentRole: "PARENT" | "NANNY",
  profileFilter: { parentProfileId: string } | { nannyProfileId: string },
): Promise<AnswerMap> {
  const rows = await prisma.surveyResponse.findMany({
    where: { respondentRole, ...profileFilter },
    select: { questionCode: true, answerValue: true, isDealbreaker: true },
  })
  const map: AnswerMap = {}
  for (const r of rows) {
    map[r.questionCode] = { value: r.answerValue, isDealbreaker: r.isDealbreaker }
  }
  return map
}

/**
 * Ambil & hitung Komparasi Preferensi untuk satu pasangan Bunda ↔ Nanny langsung dari
 * SurveyResponse mentah (bukan dari MatchResult) — lihat ADR-013.
 */
export async function getKomparasiPreferensi(
  parentProfileId: string,
  nannyProfileId: string,
): Promise<AspectComparison[]> {
  const [parentAnswers, nannyAnswers] = await Promise.all([
    loadAnswerMap("PARENT", { parentProfileId }),
    loadAnswerMap("NANNY", { nannyProfileId }),
  ])
  return computeKomparasiPreferensi(parentAnswers, nannyAnswers)
}
