// Ambang skor & label yang dipakai di halaman profil nanny & drawer "Detail Nanny" —
// satu sumber kebenaran supaya kedua tempat selalu konsisten (threshold resmi:
// >=80% teal, 60-79% orange, <60% red — lihat CLAUDE.md §2).

export function scoreColor(s: number): string {
  return s >= 80 ? "#5BBFB0" : s >= 60 ? "#E07B39" : "#C75D5D"
}

export function scoreTextColor(s: number): string {
  return s >= 80 ? "text-[#2C5F5A]" : s >= 60 ? "text-[#E07B39]" : "text-[#C75D5D]"
}

export function verdictLabel(s: number): string {
  if (s >= 80) return "Sangat Cocok"
  if (s >= 60) return "Cocok"
  return "Cukup Cocok"
}
