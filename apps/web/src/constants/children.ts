export const AGE_OPTIONS = [
  { label: "0–6 bln", months: 3 },
  { label: "6–12 bln", months: 9 },
  { label: "1–3 thn", months: 24 },
  { label: "3 thn ke atas", months: 54 },
] as const

export type AgeOptionLabel = (typeof AGE_OPTIONS)[number]["label"]

export const AGE_GROUP_LABEL: Record<string, string> = {
  INFANT_0_6M: "0–6 bln",
  INFANT_6_12M: "6–12 bln",
  TODDLER_1_3Y: "1–3 thn",
  PRESCHOOL_3_6Y: "3 thn ke atas",
}

export const AGE_GROUP_LABEL_LONG: Record<string, string> = {
  INFANT_0_6M: "Bayi 0–6 bulan",
  INFANT_6_12M: "Bayi 6–12 bulan",
  TODDLER_1_3Y: "Balita 1–3 tahun",
  PRESCHOOL_3_6Y: "3 tahun ke atas",
  MIXED: "Lebih dari satu rentang usia",
}

export function monthsAgoDate(months: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() - months)
  return d.toISOString().split("T")[0]
}
