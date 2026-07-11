"use client"

import { useState } from "react"
import type { AspectComparison } from "@/lib/preference-comparison"
import StatusPill, { statusLegend } from "./StatusPill"
import { ChevronDownIcon, CompareIcon } from "./icons"

const DOMAIN_LABELS: Record<"A" | "B" | "C", string> = {
  A: "Kondisi Kerja & Ekspektasi",
  B: "Nilai & Gaya Hidup",
  C: "Pengalaman & Kemampuan",
}
const DOMAIN_ORDER: Array<"A" | "B" | "C"> = ["A", "B", "C"]

export default function KomparasiPreferensi({ aspects }: { aspects: AspectComparison[] }) {
  const [expandedCode, setExpandedCode] = useState<string | null>(null)

  if (aspects.length === 0) return null

  return (
    <div className="mb-5">
      <div className="flex items-center gap-1.5 mb-1">
        <CompareIcon className="text-[#A97CC4]" />
        <p className="text-[13px] font-bold text-[#5A3A7A]">Komparasi Preferensi</p>
      </div>
      <p className="text-[11px] text-[#999AAA] mb-3 leading-relaxed">
        Preferensi Bunda dibandingkan langsung dengan jawaban Nanny di Tes Kecocokan, per aspek.
      </p>

      <div className="flex flex-wrap gap-x-3 gap-y-1.5 mb-3">
        {statusLegend().map((item) => (
          <span key={item.label} className="inline-flex items-center gap-1 text-[10px] text-[#666666]">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            {item.label}
          </span>
        ))}
      </div>

      <div className="space-y-3">
        {DOMAIN_ORDER.map((domain) => {
          const domainAspects = aspects.filter((a) => a.domain === domain)
          if (domainAspects.length === 0) return null
          const cocokCount = domainAspects.filter((a) => a.status === "cocok").length

          return (
            <div
              key={domain}
              className="bg-white border border-[#E0D0F0] rounded-[14px] overflow-hidden"
              style={{ boxShadow: "0 2px 8px rgba(90,58,122,0.05)" }}
            >
              <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-[#F9F6FC] border-b border-[#E0D0F0]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-white text-[#5A3A7A] text-[11px] font-bold flex items-center justify-center flex-shrink-0 border border-[#E0D0F0]">
                    {domain}
                  </span>
                  <span className="text-[12px] font-semibold text-[#5A3A7A] truncate">
                    {DOMAIN_LABELS[domain]}
                  </span>
                </div>
                <span className="text-[11px] text-[#999AAA] flex-shrink-0">
                  {cocokCount}/{domainAspects.length} Cocok
                </span>
              </div>

              <div className="divide-y divide-[#F3EEF8]">
                {domainAspects.map((aspect) => (
                  <AspectRow
                    key={aspect.code}
                    aspect={aspect}
                    expanded={expandedCode === aspect.code}
                    onToggle={() =>
                      setExpandedCode((current) => (current === aspect.code ? null : aspect.code))
                    }
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AspectRow({
  aspect,
  expanded,
  onToggle,
}: {
  aspect: AspectComparison
  expanded: boolean
  onToggle: () => void
}) {
  const mismatches = aspect.questions.filter((q) => q.compatible === false)
  const hasDetail = mismatches.length > 0

  return (
    <div>
      <button
        type="button"
        onClick={hasDetail ? onToggle : undefined}
        aria-expanded={hasDetail ? expanded : undefined}
        className={`w-full flex items-center justify-between gap-3 px-4 min-h-[48px] py-2.5 text-left ${
          hasDetail ? "cursor-pointer active:bg-[#FAFAFC]" : "cursor-default"
        }`}
      >
        <span className="text-[13px] text-[#5A3A7A] font-medium">{aspect.label}</span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <StatusPill status={aspect.status} />
          {hasDetail && (
            <ChevronDownIcon className={`text-[#999AAA] transition-transform ${expanded ? "rotate-180" : ""}`} />
          )}
        </div>
      </button>

      {expanded && hasDetail && (
        <div className="px-4 pb-3 space-y-2">
          {mismatches.map((q) => (
            <div key={q.questionId} className="rounded-[10px] bg-[#FAFAFC] border border-[#F3EEF8] p-2.5">
              <p className="text-[11px] font-semibold text-[#5A3A7A] mb-1.5 leading-snug">
                {q.questionForParent}
              </p>
              <p className="text-[11px] text-[#666666] leading-relaxed">
                Bunda: <span className="font-medium text-[#5A3A7A]">{q.parentAnswerLabel ?? "–"}</span>
              </p>
              <p className="text-[11px] text-[#666666] leading-relaxed">
                Nanny: <span className="font-medium text-[#5A3A7A]">{q.nannyAnswerLabel ?? "–"}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
