"use client"

import { useState } from "react"

type Child = {
  name: string
  ageGroup: string
  allergies?: string | null
  medicalNotes?: string | null
  pantangan?: string | null
  schedule?: string | null
  additionalNotes?: string | null
  schoolName?: string | null
  schoolSchedule?: string | null
}

export function ShareChildButton({ child }: { child: Child }) {
  const [copied, setCopied] = useState(false)

  const WA_NUMBER = "6287888180363"

  function buildSummary() {
    const lines: string[] = [
      `Halo tim BundaYakin, berikut catatan tentang ${child.name}:`,
      `Kelompok usia: ${child.ageGroup}`,
    ]
    if (child.allergies) lines.push(`Alergi/kondisi: ${child.allergies}`)
    if (child.medicalNotes) lines.push(`Tumbuh kembang: ${child.medicalNotes}`)
    if (child.pantangan) lines.push(`Pantangan: ${child.pantangan}`)
    if (child.schedule) lines.push(`Rutinitas: ${child.schedule}`)
    if (child.schoolName) lines.push(`Sekolah: ${child.schoolName}`)
    if (child.schoolSchedule) lines.push(`Jadwal sekolah: ${child.schoolSchedule}`)
    if (child.additionalNotes) lines.push(`Aturan lain: ${child.additionalNotes}`)
    lines.push("\nMohon bagikan ke nanny baru kami. Terima kasih.")
    return lines.join("\n")
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildSummary())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: open WA
    }
  }

  const waText = encodeURIComponent(buildSummary())

  return (
    <div className="space-y-2">
      <a
        href={`https://wa.me/${WA_NUMBER}?text=${waText}`}
        target="_blank"
        rel="noreferrer"
        className="w-full flex items-center justify-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] transition-all"
      >
        Bagikan ke nanny baru via WA
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className="w-full flex items-center justify-center bg-transparent border-[1.5px] border-[#C8B8DC] text-[#666666] font-semibold text-[13px] min-h-[48px] rounded-[10px] hover:bg-[#F3EEF8] transition-all"
      >
        {copied ? "Tersalin ✓" : "Salin ringkasan catatan"}
      </button>
    </div>
  )
}
