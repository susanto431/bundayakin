import { describe, expect, test } from "vitest"
import { CAPTURE_WORK_STYLE_ITEMS } from "@/lib/capture-work-style-instrument"
import type { CaptureWorkStyleDimension } from "@/lib/capture-work-style-instrument"
import { scoreCaptureWorkStyle, type CaptureWorkStyleAnswer } from "@/lib/capture-work-style-scoring"

function allAnswers(pick: CaptureWorkStyleAnswer): CaptureWorkStyleAnswer[] {
  return CAPTURE_WORK_STYLE_ITEMS.map(() => pick)
}

/** Jawaban yang memilih `dimension` persis sekali (raw score 1), dan menghindarinya di semua blok lain. */
function answersWithExactlyOnePick(dimension: CaptureWorkStyleDimension): CaptureWorkStyleAnswer[] {
  let picked = false
  return CAPTURE_WORK_STYLE_ITEMS.map(item => {
    if (!picked && item.dimensionA === dimension) {
      picked = true
      return "A"
    }
    if (!picked && item.dimensionB === dimension) {
      picked = true
      return "B"
    }
    return item.dimensionA === dimension ? "B" : "A"
  })
}

describe("scoreCaptureWorkStyle", () => {
  test("every answer contributes exactly one point to exactly one dimension", () => {
    const result = scoreCaptureWorkStyle(allAnswers("A"))

    const totalRawPoints = Object.values(result.dimensionRaw).reduce((sum, raw) => sum + raw, 0)

    expect(totalRawPoints).toBe(CAPTURE_WORK_STYLE_ITEMS.length)
    for (const raw of Object.values(result.dimensionRaw)) {
      expect(raw).toBeGreaterThanOrEqual(0)
      expect(raw).toBeLessThanOrEqual(9)
    }
  })

  test("very low K (need to be forceful) flags the incident-reporting risk", () => {
    const result = scoreCaptureWorkStyle(answersWithExactlyOnePick("K"))

    expect(result.dimensionRaw.K).toBe(1)
    expect(result.flags).toContain(
      "K sangat rendah — risiko tidak melapor insiden penting. Sistem laporan harian dari orang tua adalah keharusan."
    )
  })

  test("normal K score does not trigger the incident-reporting flag", () => {
    const result = scoreCaptureWorkStyle(allAnswers("A"))

    expect(result.flags).not.toContain(
      "K sangat rendah — risiko tidak melapor insiden penting. Sistem laporan harian dari orang tua adalah keharusan."
    )
  })
})
