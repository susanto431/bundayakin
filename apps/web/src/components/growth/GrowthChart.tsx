"use client"

import { useState } from "react"

type Point = { months: number; value: number }
type Measurement = { months: number; value: number; date: string }

type Props = {
  title: string // "Berat Badan" | "Tinggi Badan"
  unit: string // "kg" | "cm"
  medianCurve: Point[]
  measurements: Measurement[]
  maxMonths?: number
}

// Chart SVG ringan (tanpa library) — 1 sumbu, garis median WHO (recessive/abu)
// + titik pengukuran anak (aksen brand teal), sesuai guideline dataviz:
// mark 2px line, marker >=8px dengan ring surface, label selektif di titik akhir,
// tooltip via tap (mobile-first), tabel di bawah chart sebagai fallback aksesibilitas.
export default function GrowthChart({ title, unit, medianCurve, measurements, maxMonths = 60 }: Props) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  const width = 320
  const height = 180
  const padding = { top: 16, right: 12, bottom: 24, left: 36 }
  const plotW = width - padding.left - padding.right
  const plotH = height - padding.top - padding.bottom

  const allValues = [...medianCurve.map(p => p.value), ...measurements.map(m => m.value)]
  const minV = Math.min(...allValues) * 0.9
  const maxV = Math.max(...allValues) * 1.1

  const x = (months: number) => padding.left + (months / maxMonths) * plotW
  const y = (value: number) => padding.top + plotH - ((value - minV) / (maxV - minV)) * plotH

  const medianPath = medianCurve
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.months).toFixed(1)} ${y(p.value).toFixed(1)}`)
    .join(" ")

  const sortedMeasurements = [...measurements].sort((a, b) => a.months - b.months)
  const childPath = sortedMeasurements
    .map((m, i) => `${i === 0 ? "M" : "L"} ${x(m.months).toFixed(1)} ${y(m.value).toFixed(1)}`)
    .join(" ")

  const lastMedian = medianCurve[medianCurve.length - 1]
  const yTicks = [minV, (minV + maxV) / 2, maxV]

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[12px] font-bold text-[#5A3A7A]">{title}</p>
        <div className="flex items-center gap-3 text-[10px] text-[#999AAA]">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-[2px] bg-[#C8B8DC]" /> Median WHO
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[#5BBFB0]" /> {title === "Berat Badan" ? "Si Kecil" : "Si Kecil"}
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label={`Grafik ${title} dibandingkan median WHO`}>
        {/* Gridlines (recessive, hairline, solid) */}
        {yTicks.map((v, i) => (
          <line
            key={i}
            x1={padding.left} x2={width - padding.right}
            y1={y(v)} y2={y(v)}
            stroke="#E0D0F0" strokeWidth={1}
          />
        ))}
        {yTicks.map((v, i) => (
          <text key={i} x={padding.left - 6} y={y(v) + 3} textAnchor="end" fontSize="8" fill="#999AAA">
            {v.toFixed(v < 20 ? 1 : 0)}
          </text>
        ))}

        {/* Median WHO — garis referensi, muted */}
        <path d={medianPath} fill="none" stroke="#C8B8DC" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {lastMedian && (
          <text x={x(lastMedian.months) - 2} y={y(lastMedian.value) - 6} textAnchor="end" fontSize="8" fill="#999AAA">
            Median
          </text>
        )}

        {/* Garis pengukuran anak — aksen brand */}
        {sortedMeasurements.length > 1 && (
          <path d={childPath} fill="none" stroke="#5BBFB0" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* Titik pengukuran — marker >=8px dengan ring surface, tap untuk detail */}
        {sortedMeasurements.map((m, i) => (
          <g key={i}>
            <circle
              cx={x(m.months)} cy={y(m.value)} r={5}
              fill="#5BBFB0" stroke="#FDFBFF" strokeWidth={2}
              onClick={() => setActiveIdx(activeIdx === i ? null : i)}
              style={{ cursor: "pointer" }}
            />
            {/* Hit target lebih besar dari mark, sesuai guideline touch target */}
            <circle
              cx={x(m.months)} cy={y(m.value)} r={12}
              fill="transparent"
              onClick={() => setActiveIdx(activeIdx === i ? null : i)}
              style={{ cursor: "pointer" }}
            />
          </g>
        ))}

        {/* X axis label */}
        <text x={padding.left} y={height - 6} fontSize="8" fill="#999AAA">0 bln</text>
        <text x={width - padding.right} y={height - 6} textAnchor="end" fontSize="8" fill="#999AAA">{maxMonths} bln</text>
      </svg>

      {/* Tooltip tap-based (mobile-first) */}
      {activeIdx !== null && sortedMeasurements[activeIdx] && (
        <div className="mt-1.5 bg-[#F3EEF8] border border-[#E0D0F0] rounded-[10px] px-3 py-2 text-[12px] text-[#5A3A7A]">
          <strong>{sortedMeasurements[activeIdx].value} {unit}</strong> pada {sortedMeasurements[activeIdx].date}
          {" · "}usia {Math.round(sortedMeasurements[activeIdx].months)} bulan
        </div>
      )}
    </div>
  )
}
