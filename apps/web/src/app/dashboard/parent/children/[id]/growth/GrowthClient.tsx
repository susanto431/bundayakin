"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import GrowthChart from "@/components/growth/GrowthChart"
import {
  sexFromGender,
  ageInMonths,
  whoMedianWeight,
  whoMedianHeight,
  whoWeightCurve,
  whoHeightCurve,
  categorizeDeviation,
  GROWTH_CATEGORY_LABEL,
  type GrowthCategory,
} from "@/lib/growth-standards"

type Record_ = {
  id: string
  measuredAtISO: string
  weightKg: number | null
  heightCm: number | null
  headCircumferenceCm: number | null
  notes: string | null
}

type Props = {
  childId: string
  childName: string
  gender: string | null
  dateOfBirthISO: string
  isPaid: boolean
  records: Record_[]
}

const CATEGORY_STYLE: Record<GrowthCategory, string> = {
  SESUAI: "bg-[#E5F6F4] text-[#2C5F5A] border-[#A8DDD8]",
  PERLU_PANTAU: "bg-[#FEF0E7] text-[#A35320] border-[#F5C4A0]",
  PERLU_PERHATIAN: "bg-[#FAEAEA] text-[#C75D5D] border-[#F5AAAA]",
}

function inputCls() {
  return "w-full px-3.5 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[48px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/15 placeholder:text-[#999AAA] outline-none transition-all"
}

export default function GrowthClient({ childId, childName, gender, dateOfBirthISO, isPaid, records }: Props) {
  const router = useRouter()
  const firstName = childName.split(" ")[0]
  const sex = sexFromGender(gender)
  const dob = new Date(dateOfBirthISO)

  const [showForm, setShowForm] = useState(records.length === 0)
  const [measuredAt, setMeasuredAt] = useState(() => new Date().toISOString().split("T")[0])
  const [weightKg, setWeightKg] = useState("")
  const [heightCm, setHeightCm] = useState("")
  const [headCm, setHeadCm] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSubmit() {
    if (loading) return
    if (!weightKg && !heightCm && !headCm) {
      setErrorMsg("Isi minimal salah satu: berat, tinggi, atau lingkar kepala")
      return
    }
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch(`/api/parent/children/${childId}/growth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          measuredAt,
          weightKg: weightKg ? parseFloat(weightKg) : undefined,
          heightCm: heightCm ? parseFloat(heightCm) : undefined,
          headCircumferenceCm: headCm ? parseFloat(headCm) : undefined,
        }),
      })
      const data = await res.json() as { success: boolean; error?: string }
      if (data.success) {
        setWeightKg(""); setHeightCm(""); setHeadCm("")
        setShowForm(false)
        router.refresh()
      } else {
        setErrorMsg(data.error ?? "Gagal menyimpan. Coba lagi.")
      }
    } catch {
      setErrorMsg("Koneksi bermasalah. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  const weightMeasurements = records
    .filter(r => r.weightKg != null)
    .map(r => ({
      months: ageInMonths(dob, new Date(r.measuredAtISO)),
      value: r.weightKg!,
      date: new Date(r.measuredAtISO).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
    }))
  const heightMeasurements = records
    .filter(r => r.heightCm != null)
    .map(r => ({
      months: ageInMonths(dob, new Date(r.measuredAtISO)),
      value: r.heightCm!,
      date: new Date(r.measuredAtISO).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
    }))

  const latest = records[records.length - 1]
  const latestMonths = latest ? ageInMonths(dob, new Date(latest.measuredAtISO)) : null
  const weightMedian = latest?.weightKg != null && latestMonths != null ? whoMedianWeight(sex, latestMonths) : null
  const heightMedian = latest?.heightCm != null && latestMonths != null ? whoMedianHeight(sex, latestMonths) : null
  const weightCategory = latest?.weightKg != null && weightMedian != null ? categorizeDeviation(latest.weightKg, weightMedian) : null
  const heightCategory = latest?.heightCm != null && heightMedian != null ? categorizeDeviation(latest.heightCm, heightMedian) : null

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-4">
      {/* Header */}
      <div className="border-b border-[#E0D0F0] pb-3 mb-4">
        <Link href={`/dashboard/parent/children/${childId}`} className="text-[12px] text-[#A97CC4] font-semibold mb-1 inline-block">
          ← Kembali ke profil {firstName}
        </Link>
        <h1 className="text-[16px] font-bold text-[#5A3A7A]">Tumbuh Kembang — {firstName}</h1>
        <p className="text-[12px] text-[#999AAA] mt-0.5">Kurva Pertumbuhan (berat, tinggi, lingkar kepala)</p>
      </div>

      {/* Tambah catatan */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] mb-4 transition-all"
        >
          + Catat pengukuran baru
        </button>
      ) : (
        <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-4 mb-4">
          <p className="text-[13px] font-bold text-[#5A3A7A] mb-3">Catat pengukuran baru</p>
          <div className="space-y-3">
            <div>
              <label htmlFor="measuredAt" className="block text-[12px] text-[#666666] mb-1">Tanggal ukur</label>
              <input id="measuredAt" type="date" value={measuredAt} max={new Date().toISOString().split("T")[0]}
                onChange={e => setMeasuredAt(e.target.value)} className={inputCls()} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label htmlFor="weightKg" className="block text-[12px] text-[#666666] mb-1">Berat (kg)</label>
                <input id="weightKg" type="number" inputMode="decimal" step="0.1" placeholder="9.5" value={weightKg}
                  onChange={e => setWeightKg(e.target.value)} className={inputCls()} />
              </div>
              <div>
                <label htmlFor="heightCm" className="block text-[12px] text-[#666666] mb-1">Tinggi (cm)</label>
                <input id="heightCm" type="number" inputMode="decimal" step="0.1" placeholder="75" value={heightCm}
                  onChange={e => setHeightCm(e.target.value)} className={inputCls()} />
              </div>
              <div>
                <label htmlFor="headCm" className="block text-[12px] text-[#666666] mb-1">Lingkar kepala</label>
                <input id="headCm" type="number" inputMode="decimal" step="0.1" placeholder="45" value={headCm}
                  onChange={e => setHeadCm(e.target.value)} className={inputCls()} />
              </div>
            </div>
            {errorMsg && <p className="text-[12px] text-red-600" role="alert">{errorMsg}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(false)}
                disabled={loading}
                className="flex-1 border-[1.5px] border-[#C8B8DC] text-[#666666] font-semibold text-[13px] min-h-[44px] rounded-[10px] hover:bg-[#F3EEF8] transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-[#5BBFB0] hover:bg-[#2C5F5A] disabled:opacity-50 text-white font-semibold text-[13px] min-h-[44px] rounded-[10px] transition-all"
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {records.length === 0 ? (
        <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-6 text-center">
          <p className="text-[13px] text-[#999AAA]">Belum ada catatan pengukuran. Mulai catat untuk melihat kurva pertumbuhan {firstName}.</p>
        </div>
      ) : !isPaid ? (
        <>
          {/* Akun gratis: data mentah terlihat, interpretasi & kurva terkunci (PRD 13 §4) */}
          <div className="bg-[#5A3A7A] rounded-[16px] p-4 mb-4">
            <p className="text-[10px] font-bold tracking-[2px] uppercase text-[#A8DDD8] mb-1">Fitur Pelanggan</p>
            <p className="text-[14px] font-bold text-white mb-1">Lihat kurva & artinya</p>
            <p className="text-[13px] leading-relaxed mb-3" style={{ color: "rgba(255,255,255,0.7)" }}>
              Data pengukuran {firstName} tersimpan gratis. Pelanggan mendapat kurva WHO otomatis + penjelasan apakah pertumbuhan sesuai usia.
            </p>
            <Link
              href="/dashboard/parent/subscription"
              className="inline-flex items-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white text-[13px] font-semibold px-4 py-2 rounded-[10px] min-h-[40px] transition-all"
            >
              Langganan Rp 500rb/tahun →
            </Link>
          </div>
          <RecordsTable records={records} />
        </>
      ) : (
        <>
          {/* Kategori terkini */}
          {(weightCategory || heightCategory) && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {weightCategory && (
                <div className={`rounded-[12px] border px-3 py-2.5 ${CATEGORY_STYLE[weightCategory]}`}>
                  <p className="text-[10px] font-bold uppercase tracking-wide opacity-70">Berat Badan</p>
                  <p className="text-[13px] font-bold">{GROWTH_CATEGORY_LABEL[weightCategory]}</p>
                </div>
              )}
              {heightCategory && (
                <div className={`rounded-[12px] border px-3 py-2.5 ${CATEGORY_STYLE[heightCategory]}`}>
                  <p className="text-[10px] font-bold uppercase tracking-wide opacity-70">Tinggi Badan</p>
                  <p className="text-[13px] font-bold">{GROWTH_CATEGORY_LABEL[heightCategory]}</p>
                </div>
              )}
            </div>
          )}

          {/* Charts */}
          <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-4 mb-3">
            <GrowthChart title="Berat Badan" unit="kg" medianCurve={whoWeightCurve(sex)} measurements={weightMeasurements} />
          </div>
          <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-4 mb-4">
            <GrowthChart title="Tinggi Badan" unit="cm" medianCurve={whoHeightCurve(sex)} measurements={heightMeasurements} />
          </div>

          {/* Disclaimer — wajib, lihat growth-standards.ts */}
          <div className="bg-[#F3EEF8] border border-[#E0D0F0] rounded-[12px] p-3 mb-4">
            <p className="text-[11px] text-[#666666] leading-relaxed">
              Kurva menggunakan median pertumbuhan WHO sebagai acuan umum — <strong>bukan alat diagnosis</strong>.
              Untuk penilaian klinis, konsultasikan ke dokter anak, Posyandu, atau gunakan Konsultasi Psikolog Anak.
            </p>
          </div>

          <RecordsTable records={records} />
        </>
      )}
    </div>
  )
}

function RecordsTable({ records }: { records: Record_[] }) {
  return (
    <div className="bg-white border border-[#E0D0F0] rounded-[16px] overflow-hidden">
      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] px-4 pt-3 pb-2">Riwayat Pengukuran</p>
      {[...records].reverse().map((r, idx) => (
        <div key={r.id} className={`px-4 py-3 flex justify-between items-center ${idx < records.length - 1 ? "border-b border-[#F3EEF8]" : ""}`}>
          <span className="text-[12px] text-[#666666]">
            {new Date(r.measuredAtISO).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <span className="text-[13px] font-semibold text-[#5A3A7A]">
            {[
              r.weightKg != null ? `${r.weightKg} kg` : null,
              r.heightCm != null ? `${r.heightCm} cm` : null,
              r.headCircumferenceCm != null ? `LK ${r.headCircumferenceCm} cm` : null,
            ].filter(Boolean).join(" · ")}
          </span>
        </div>
      ))}
    </div>
  )
}
