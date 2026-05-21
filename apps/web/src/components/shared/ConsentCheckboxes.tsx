"use client"

import { useState } from "react"
import Link from "next/link"

type Props = {
  role: "PARENT" | "NANNY"
  onComplete: () => void
}

export function ConsentCheckboxes({ role, onComplete }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [c1, setC1] = useState(false) // S&K + Privasi
  const [c2, setC2] = useState(false) // AI processing
  const [c3, setC3] = useState(false) // laporan indikatif
  const [c4, setC4] = useState(false) // data untuk matching (nanny only)

  const allChecked = role === "NANNY"
    ? c1 && c2 && c3 && c4
    : c1 && c2 && c3

  async function handleSubmit() {
    if (!allChecked) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/consent", { method: "POST" })
      const json = await res.json() as { success: boolean; error?: string }
      if (!json.success) throw new Error(json.error ?? "Gagal menyimpan")
      onComplete()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan, coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E0D0F0] p-5 space-y-5">
      <div>
        <h2 className="font-[var(--font-dm-serif)] text-[18px] text-[#5A3A7A]">
          Sebelum melanjutkan
        </h2>
        <p className="text-[13px] text-[#666666] mt-1 leading-relaxed">
          Harap baca dan centang pernyataan di bawah ini. Semua wajib disetujui sebelum bisa lanjut.
        </p>
      </div>

      <div className="space-y-3">
        <ConsentItem
          checked={c1}
          onChange={setC1}
          label={
            <>
              Saya menyetujui{" "}
              <Link href="/legal/terms-of-service" target="_blank" className="text-[#5BBFB0] underline font-medium">
                Syarat &amp; Ketentuan
              </Link>{" "}
              dan{" "}
              <Link href="/legal/privacy-policy" target="_blank" className="text-[#5BBFB0] underline font-medium">
                Kebijakan Privasi
              </Link>{" "}
              BundaYakin.
            </>
          }
        />

        <ConsentItem
          checked={c2}
          onChange={setC2}
          label="Saya menyetujui bahwa jawaban survey saya diproses oleh AI untuk menghasilkan laporan kecocokan."
        />

        <ConsentItem
          checked={c3}
          onChange={setC3}
          label="Saya memahami bahwa laporan AI bersifat indikatif, bukan pengganti penilaian manusia."
        />

        {role === "NANNY" && (
          <ConsentItem
            checked={c4}
            onChange={setC4}
            label="Saya menyetujui data profil saya dapat digunakan platform untuk keperluan matching dengan calon keluarga."
          />
        )}
      </div>

      {error && (
        <p className="text-[12px] text-red-500 text-center">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!allChecked || loading}
        className="w-full min-h-[48px] rounded-[10px] font-semibold text-[15px] transition-all
          bg-[#5BBFB0] text-white hover:bg-[#2C5F5A]
          disabled:bg-[#E0D0F0] disabled:text-[#999AAA] disabled:cursor-not-allowed"
      >
        {loading ? "Menyimpan..." : "Setuju & Lanjut"}
      </button>
    </div>
  )
}

type ItemProps = {
  checked: boolean
  onChange: (v: boolean) => void
  label: React.ReactNode
}

function ConsentItem({ checked, onChange, label }: ItemProps) {
  return (
    <label className="flex gap-3 cursor-pointer group">
      <div className="shrink-0 mt-0.5">
        <div
          onClick={() => onChange(!checked)}
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
            ${checked
              ? "bg-[#5BBFB0] border-[#5BBFB0]"
              : "bg-white border-[#D0C0E8] group-hover:border-[#A97CC4]"
            }`}
        >
          {checked && (
            <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
              <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>
      <span
        className="text-[14px] text-[#444444] leading-relaxed select-none"
        onClick={() => onChange(!checked)}
      >
        {label}
      </span>
    </label>
  )
}
