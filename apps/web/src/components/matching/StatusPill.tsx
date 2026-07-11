import type { AspectStatus } from "@/lib/preference-comparison"
import { CheckCircleIcon, SwapIcon, MessageCircleIcon, HelpCircleIcon } from "./icons"

// Warna 4 status Komparasi Preferensi — semuanya token yang SUDAH dipakai di tempat lain
// di codebase ini (tidak ada warna baru). "Perlu Dibicarakan" pakai warna error box
// UnlockContactButton (#FEF0E7/#A35320) — cukup menonjol tanpa jadi merah alarm.
// Tidak pernah mengandalkan warna saja: tiap status selalu ikon + teks (WCAG color-not-only).
const VARIANTS: Record<AspectStatus, { bg: string; border: string; text: string; label: string; Icon: typeof CheckCircleIcon }> = {
  cocok: { bg: "#E5F6F4", border: "#A8DDD8", text: "#2C5F5A", label: "Cocok", Icon: CheckCircleIcon },
  beda_preferensi: { bg: "#F3EEF8", border: "#E0D0F0", text: "#5A3A7A", label: "Beda Preferensi", Icon: SwapIcon },
  perlu_dibicarakan: { bg: "#FEF0E7", border: "#F5C4A0", text: "#A35320", label: "Perlu Dibicarakan", Icon: MessageCircleIcon },
  belum_ada_data: { bg: "#F5F5F8", border: "#E5E5EC", text: "#999AAA", label: "Belum Ada Data", Icon: HelpCircleIcon },
}

export default function StatusPill({ status }: { status: AspectStatus }) {
  const v = VARIANTS[status]
  const Icon = v.Icon
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full border whitespace-nowrap"
      style={{ backgroundColor: v.bg, borderColor: v.border, color: v.text }}
    >
      <Icon />
      {v.label}
    </span>
  )
}

export function statusLegend() {
  return Object.values(VARIANTS).map((v) => ({ label: v.label, color: v.text, bg: v.bg }))
}
