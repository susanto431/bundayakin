import Anthropic from "@anthropic-ai/sdk"
import { SURVEY_QUESTIONS, ASPECT_META } from "@/constants/survey-questions"
import type { QuestionSide } from "@/constants/survey-questions"
import type { SurveyAnswers, MatchingScore } from "@/types/survey"

export type { MatchingScore }

// ── Client ────────────────────────────────────────────────────────────────────

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── Prompt helpers ────────────────────────────────────────────────────────────

function getLabel(side: QuestionSide, value: string): string {
  if (value === "__text__") return "(teks bebas)"
  return side.options.find(o => o.value === value)?.label ?? value
}

function buildComparisonText(parentAnswers: SurveyAnswers, nannyAnswers: SurveyAnswers): string {
  const lines: string[] = []
  let currentDomain = ""
  let currentSubdomain = ""

  for (const q of SURVEY_QUESTIONS) {
    const nAns = nannyAnswers[q.id]
    const pAns = q.forParent !== null ? parentAnswers[q.id] : undefined

    if (!nAns && !pAns) continue

    const meta = ASPECT_META[q.subdomain]

    if (meta.domain !== currentDomain) {
      currentDomain = meta.domain
      lines.push(`\n=== DOMAIN ${meta.domain}: ${meta.domainLabel.toUpperCase()} ===`)
    }
    if (q.subdomain !== currentSubdomain) {
      currentSubdomain = q.subdomain
      lines.push(`\n[${q.subdomain}] ${meta.label}`)
    }

    lines.push(`${q.id}. (bobot: ${q.weight}) ${q.forNanny.question}`)

    if (q.forParent !== null) {
      if (pAns) {
        const label = getLabel(q.forParent, pAns.value)
        const free = pAns.freeText ? ` → "${pAns.freeText}"` : ""
        const db = pAns.isDealbreaker ? " ⚑DEALBREAKER" : ""
        lines.push(`  Orang tua : ${label}${free}${db}`)
      } else {
        lines.push(`  Orang tua : (belum menjawab)`)
      }
    }

    if (nAns) {
      const label = getLabel(q.forNanny, nAns.value)
      const free = nAns.freeText ? ` → "${nAns.freeText}"` : ""
      const db = nAns.isDealbreaker ? " ⚑DEALBREAKER" : ""
      lines.push(`  Nanny     : ${label}${free}${db}`)
    } else {
      lines.push(`  Nanny     : (belum menjawab)`)
    }
  }

  return lines.join("\n")
}

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Kamu adalah sistem AI BundaYakin yang mengevaluasi kecocokan antara orang tua dan nanny.

Tugas: analisis perbandingan jawaban survey, hitung skor kecocokan, berikan insight.

OUTPUT: hanya JSON valid satu baris. Tidak ada teks lain, tidak ada markdown.

Format wajib:
{"scoreOverall":<0-100>,"scoreDomainA":<0-100>,"scoreDomainB":<0-100>,"scoreDomainC":<0-100>,"aspectBreakdown":{"A1":<0-100>,"A2":<0-100>,"B1":<0-100>,"B2":<0-100>,"B3":<0-100>,"C1":<0-100>,"C2":<0-100>,"C3":<0-100>,"C4":<0-100>},"matchHighlights":[<2-4 string>],"mismatchAreas":[<0-3 string>],"negotiationPoints":[<string per dealbreaker tidak match>],"tipsForParent":[<1-3 string>],"tipsForNanny":[<1-3 string>]}

Panduan scoring:
- Jawaban identik atau sangat kompatibel: 85–100
- Perbedaan kecil yang bisa dikompromikan: 65–84
- Perbedaan signifikan: 40–64
- Konflik besar atau DEALBREAKER tidak match: kurangi 25–35 poin dari aspek terkait
- scoreOverall = (scoreDomainA × 0.35) + (scoreDomainB × 0.30) + (scoreDomainC × 0.35)
- Bobot aspek — Domain A: A1=57%, A2=43% | Domain B: B1=33%, B2=23%, B3=43% | Domain C: C1=40%, C2=34%, C3=14%, C4=11%
- Pertanyaan nanny-only (tanpa jawaban orang tua): nilai kualitas/relevansi pengalaman nanny (0–100)

Framing bahasa Indonesia: hangat, profesional, konstruktif.
- matchHighlights: kesamaan dan kekuatan yang ditemukan
- mismatchAreas: "ada perbedaan yang bisa dinegosiasikan" — BUKAN "tidak cocok"
- negotiationPoints: topik spesifik dari dealbreaker yang perlu dibicarakan bersama
- tips: saran konkret dan actionable`

// ── Main export ───────────────────────────────────────────────────────────────

export async function scoreSurveyMatch(
  parentAnswers: SurveyAnswers,
  nannyAnswers: SurveyAnswers
): Promise<MatchingScore> {
  const comparison = buildComparisonText(parentAnswers, nannyAnswers)

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Perbandingan jawaban survey orang tua dan nanny:\n\n${comparison}\n\nBerikan skor kecocokan dalam format JSON yang diminta.`,
      },
    ],
  })

  const text = message.content[0].type === "text" ? message.content[0].text.trim() : ""

  try {
    // Strip potential markdown code fences if model adds them anyway
    const cleaned = text.replace(/^```json?\s*/i, "").replace(/\s*```$/, "")
    return JSON.parse(cleaned) as MatchingScore
  } catch {
    console.error("[CLAUDE] Parse error. Raw:", text.slice(0, 300))
    throw new Error("Respons AI tidak dapat diparse sebagai JSON")
  }
}
