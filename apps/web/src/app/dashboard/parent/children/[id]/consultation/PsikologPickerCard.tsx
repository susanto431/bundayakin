"use client"

export type PsikologListItem = {
  id: string
  fullName: string
  level: string
  jamTerbang: number
  hasHandledThisChild: boolean
}

type Props = {
  psikolog: PsikologListItem
  selected?: boolean
  onSelect?: () => void
  childName?: string
  compact?: boolean
}

const LEVEL_LABEL: Record<string, string> = { JUNIOR: "Junior", MID: "Mid", SENIOR: "Senior" }

// Kartu pilih psikolog — nama, level, Jam Terbang (pengalaman, publik), dan
// tanda kontinuitas "pernah menangani anak ini" (ADR-012, 11 Juli 2026).
export default function PsikologPickerCard({ psikolog, selected, onSelect, childName, compact }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left bg-white border-[1.5px] rounded-[14px] transition-all ${compact ? "p-3" : "p-4"} ${
        selected ? "border-[#5BBFB0] bg-[#5BBFB0]/5" : "border-[#E0D0F0] hover:border-[#A97CC4]"
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <div>
          <p className="text-[14px] font-bold text-[#5A3A7A]">{psikolog.fullName}</p>
          <p className="text-[11px] text-[#999AAA] mt-0.5">
            Psikolog {LEVEL_LABEL[psikolog.level] ?? psikolog.level} · {psikolog.jamTerbang} jam pengalaman
          </p>
        </div>
        {selected && <span className="text-[#5BBFB0] text-[16px] flex-shrink-0">✓</span>}
      </div>
      {psikolog.hasHandledThisChild && childName && (
        <span className="inline-block mt-2 text-[11px] font-semibold text-[#2C5F5A] bg-[#E5F6F4] border border-[#A8DDD8] rounded-full px-2 py-0.5">
          Pernah menangani {childName}
        </span>
      )}
    </button>
  )
}
