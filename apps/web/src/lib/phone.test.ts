import { describe, expect, test } from "vitest"
import { normalizePhone } from "@/lib/phone"

describe("normalizePhone", () => {
  test("converts a leading-zero local number to international format", () => {
    expect(normalizePhone("081234567890")).toBe("6281234567890")
  })

  test("leaves an already-international number unchanged", () => {
    expect(normalizePhone("6281234567890")).toBe("6281234567890")
  })

  test("strips spaces, dashes, and a plus sign", () => {
    expect(normalizePhone("+62 812-3456-7890")).toBe("6281234567890")
  })

  test("prepends 62 to a number with no leading 0 or 62", () => {
    expect(normalizePhone("81234567890")).toBe("6281234567890")
  })

  test("is idempotent — normalizing twice gives the same result", () => {
    const once = normalizePhone("0812 3456 7890")
    expect(normalizePhone(once)).toBe(once)
  })

  test("two different formats for the same number normalize to the same value", () => {
    // Bunda mengetik format lokal di form undangan, nanny mungkin sudah terdaftar
    // dengan format internasional — keduanya harus cocok saat dicek dedup.
    expect(normalizePhone("0812-3456-7890")).toBe(normalizePhone("+6281234567890"))
  })
})
