import { describe, expect, test } from "vitest"
import { CAPTURE_WORK_STYLE_DIMENSIONS } from "@/lib/capture-work-style-instrument"
import { DIMENSION_FULL_NAME } from "@/lib/capture-work-style-scoring"
import { DIMENSION_INTERPRETATION, getInterpretation } from "@/lib/capture-work-style-interpretation"

describe("getInterpretation", () => {
  test("every dimension has narrative coverage for every score 0-9, no gaps", () => {
    for (const dimension of CAPTURE_WORK_STYLE_DIMENSIONS) {
      const bands = DIMENSION_INTERPRETATION[dimension]
      for (let score = 0; score <= 9; score++) {
        const matchingBand = bands.find(b => score >= b.min && score <= b.max)
        expect(matchingBand, `dimensi ${dimension} skor ${score} tidak punya narasi`).toBeDefined()
      }
    }
  })

  test("narrative never mentions the English dimension name (CLAUDE.md larangan istilah psikologi)", () => {
    for (const dimension of CAPTURE_WORK_STYLE_DIMENSIONS) {
      const englishName = DIMENSION_FULL_NAME[dimension]
      for (let score = 0; score <= 9; score++) {
        const narrative = getInterpretation(dimension, score)
        expect(narrative).not.toContain(englishName)
      }
    }
  })

  test("narrative never mentions the raw dimension code as a standalone word", () => {
    for (const dimension of CAPTURE_WORK_STYLE_DIMENSIONS) {
      for (let score = 0; score <= 9; score++) {
        const narrative = getInterpretation(dimension, score)
        const codeAsWord = new RegExp(`\\b${dimension}\\b`)
        expect(codeAsWord.test(narrative)).toBe(false)
      }
    }
  })
})
