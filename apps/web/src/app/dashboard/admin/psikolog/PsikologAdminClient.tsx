"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { IconCopy, IconCheck } from "@tabler/icons-react"
import { CONSULTATION_MAX_DAILY_CAPACITY } from "@/constants/consultation"

type PsikologLevel = "JUNIOR" | "MID" | "SENIOR"

type Psikolog = {
  id: string
  fullName: string
  level: PsikologLevel
  isActive: boolean
  dailyCapacity: number
  email: string | null
  phone: string | null
  createdAtISO: string
}

type Props = { initialPsikologs: Psikolog[] }

const LEVEL_LABEL: Record<PsikologLevel, string> = { JUNIOR: "Junior", MID: "Mid", SENIOR: "Senior" }

function CopyCredentialButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      return
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Tersalin ke clipboard" : "Salin kredensial ke clipboard"}
      className={`flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-[8px] border transition-colors ${
        copied ? "bg-[#E5F6F4] border-[#A8DDD8]" : "bg-white border-[#E0D0F0] hover:border-[#A97CC4]"
      }`}
    >
      {copied ? <IconCheck size={16} stroke={2.5} color="#2C5F5A" /> : <IconCopy size={16} stroke={1.75} color="#5A3A7A" />}
      <span className="sr-only" aria-live="polite">{copied ? "Tersalin" : ""}</span>
    </button>
  )
}

export default function PsikologAdminClient({ initialPsikologs }: Props) {
  const router = useRouter()
  const [psikologs, setPsikologs] = useState(initialPsikologs)
  const [showForm, setShowForm] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [level, setLevel] = useState<PsikologLevel>("SENIOR")
  const [dailyCapacity, setDailyCapacity] = useState(3)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [createdCredential, setCreatedCredential] = useState<{ email: string; tempPassword: string } | null>(null)
  const [resetCredential, setResetCredential] = useState<{ id: string; email: string; tempPassword: string } | null>(null)
  const [resettingId, setResettingId] = useState<string | null>(null)

  async function handleCreate() {
    if (submitting) return
    setSubmitting(true)
    setErrorMsg(null)
    try {
      const res = await fetch("/api/admin/psikolog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone: phone || undefined, level, dailyCapacity }),
      })
      const data = (await res.json()) as {
        success: boolean
        data?: { psikolog: Psikolog; tempPassword: string }
        error?: string
      }
      if (data.success && data.data) {
        setCreatedCredential({ email, tempPassword: data.data.tempPassword })
        setFullName("")
        setEmail("")
        setPhone("")
        setLevel("SENIOR")
        setDailyCapacity(3)
        setShowForm(false)
        router.refresh()
        setPsikologs(prev => [{ ...data.data!.psikolog, email, phone: phone || null, createdAtISO: new Date().toISOString() }, ...prev])
      } else {
        setErrorMsg(data.error ?? "Gagal membuat akun psikolog")
      }
    } catch {
      setErrorMsg("Koneksi bermasalah. Coba lagi.")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResetPassword(id: string, fullName: string) {
    if (resettingId) return
    if (!confirm(`Buat password sementara baru untuk ${fullName}? Password lama langsung tidak berlaku.`)) return
    setResettingId(id)
    try {
      const res = await fetch(`/api/admin/psikolog/${id}/reset-password`, { method: "POST" })
      const data = (await res.json()) as { success: boolean; data?: { email: string; tempPassword: string }; error?: string }
      if (data.success && data.data) {
        setResetCredential({ id, email: data.data.email, tempPassword: data.data.tempPassword })
      } else {
        alert(data.error ?? "Gagal membuat password baru")
      }
    } catch {
      alert("Koneksi bermasalah. Coba lagi.")
    } finally {
      setResettingId(null)
    }
  }

  async function handleUpdate(id: string, patch: Partial<Pick<Psikolog, "level" | "dailyCapacity" | "isActive">>) {
    setPsikologs(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)))
    try {
      const res = await fetch(`/api/admin/psikolog/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
      const data = (await res.json()) as { success: boolean; error?: string }
      if (!data.success) {
        router.refresh()
        alert(data.error ?? "Gagal menyimpan perubahan")
      }
    } catch {
      router.refresh()
    }
  }

  return (
    <div className="max-w-[640px] mx-auto px-4 pt-6 pb-16">
      <div className="border-b border-[#E0D0F0] pb-3 mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-bold text-[#5A3A7A]">Kelola Psikolog</h1>
          <p className="text-[13px] text-[#999AAA] mt-1">Akun psikolog dibuat manual setelah proses screening HCC — bukan pendaftaran mandiri.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(v => !v)}
          className="min-h-[40px] px-4 rounded-[10px] bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white text-[13px] font-semibold transition-all"
        >
          {showForm ? "Batal" : "+ Tambah"}
        </button>
      </div>

      {createdCredential && (
        <div className="bg-[#FEF0E7] border border-[#F5C4A0] rounded-[12px] p-4 mb-5">
          <p className="text-[13px] font-bold text-[#A35320]">Akun berhasil dibuat</p>
          <p className="text-[12px] text-[#A35320] mt-1">
            Sampaikan kredensial ini ke psikolog secara pribadi — password sementara ini hanya ditampilkan sekali.
          </p>
          <div className="flex items-center gap-2 bg-white rounded-[8px] p-2 mt-2">
            <span className="text-[12px] font-mono text-[#5A3A7A] break-all flex-1">
              {createdCredential.email} / {createdCredential.tempPassword}
            </span>
            <CopyCredentialButton text={`${createdCredential.email} / ${createdCredential.tempPassword}`} />
          </div>
          <button type="button" onClick={() => setCreatedCredential(null)} className="text-[11px] text-[#A35320] underline mt-2">
            Tutup
          </button>
        </div>
      )}

      {showForm && (
        <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-4 mb-5 space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-[#666666]">Nama lengkap</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full min-h-[40px] rounded-[8px] border border-[#C8B8DC] px-3 text-[13px] mt-1" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[#666666]">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full min-h-[40px] rounded-[8px] border border-[#C8B8DC] px-3 text-[13px] mt-1" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[#666666]">No. HP (opsional)</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full min-h-[40px] rounded-[8px] border border-[#C8B8DC] px-3 text-[13px] mt-1" />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[11px] font-semibold text-[#666666]">Level</label>
              <select value={level} onChange={e => setLevel(e.target.value as PsikologLevel)} className="w-full min-h-[40px] rounded-[8px] border border-[#C8B8DC] px-3 text-[13px] mt-1">
                {Object.entries(LEVEL_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-[11px] font-semibold text-[#666666]">Kapasitas/hari</label>
              <input
                type="number"
                min={1}
                max={CONSULTATION_MAX_DAILY_CAPACITY}
                value={dailyCapacity}
                onChange={e => setDailyCapacity(Number(e.target.value))}
                className="w-full min-h-[40px] rounded-[8px] border border-[#C8B8DC] px-3 text-[13px] mt-1"
              />
            </div>
          </div>
          {errorMsg && <p className="text-[12px] text-red-600">{errorMsg}</p>}
          <button
            type="button"
            onClick={handleCreate}
            disabled={submitting || !fullName || !email}
            className="w-full min-h-[44px] rounded-[10px] bg-[#5BBFB0] hover:bg-[#2C5F5A] disabled:opacity-50 text-white font-semibold text-[13px] transition-all"
          >
            {submitting ? "Menyimpan..." : "Buat akun psikolog"}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {psikologs.map(p => (
          <div key={p.id} className="bg-white border border-[#E0D0F0] rounded-[14px] p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[14px] font-bold text-[#5A3A7A]">{p.fullName}</p>
                <p className="text-[12px] text-[#999AAA]">{p.email}{p.phone ? ` · ${p.phone}` : ""}</p>
              </div>
              <label className="flex items-center gap-1.5 text-[11px] text-[#666666]">
                <input type="checkbox" checked={p.isActive} onChange={e => handleUpdate(p.id, { isActive: e.target.checked })} />
                Aktif
              </label>
            </div>
            <div className="flex gap-3 mt-3">
              <div className="flex-1">
                <label className="text-[10px] font-semibold text-[#999AAA] uppercase tracking-wide">Level</label>
                <select
                  value={p.level}
                  onChange={e => handleUpdate(p.id, { level: e.target.value as PsikologLevel })}
                  className="w-full min-h-[36px] rounded-[8px] border border-[#C8B8DC] px-2 text-[12px] mt-0.5"
                >
                  {Object.entries(LEVEL_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-semibold text-[#999AAA] uppercase tracking-wide">Kapasitas/hari</label>
                <input
                  type="number"
                  min={1}
                  max={CONSULTATION_MAX_DAILY_CAPACITY}
                  value={p.dailyCapacity}
                  onChange={e => handleUpdate(p.id, { dailyCapacity: Number(e.target.value) })}
                  className="w-full min-h-[36px] rounded-[8px] border border-[#C8B8DC] px-2 text-[12px] mt-0.5"
                />
              </div>
            </div>

            {resetCredential?.id === p.id ? (
              <div className="mt-3 bg-[#FEF0E7] border border-[#F5C4A0] rounded-[10px] p-3">
                <p className="text-[11px] font-bold text-[#A35320]">Password baru dibuat</p>
                <p className="text-[11px] text-[#A35320] mt-0.5">Sampaikan ke psikolog secara pribadi — hanya ditampilkan sekali.</p>
                <div className="flex items-center gap-2 bg-white rounded-[8px] p-2 mt-1.5">
                  <span className="text-[12px] font-mono text-[#5A3A7A] break-all flex-1">
                    {resetCredential.email} / {resetCredential.tempPassword}
                  </span>
                  <CopyCredentialButton text={`${resetCredential.email} / ${resetCredential.tempPassword}`} />
                </div>
                <button type="button" onClick={() => setResetCredential(null)} className="text-[11px] text-[#A35320] underline mt-1.5">
                  Tutup
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleResetPassword(p.id, p.fullName)}
                disabled={resettingId === p.id}
                className="text-[11px] font-semibold text-[#A97CC4] hover:text-[#5A3A7A] mt-3 disabled:opacity-50 transition-colors"
              >
                {resettingId === p.id ? "Membuat password baru..." : "Reset password →"}
              </button>
            )}
          </div>
        ))}
        {psikologs.length === 0 && !showForm && (
          <p className="text-[13px] text-[#999AAA] text-center py-8">Belum ada akun psikolog. Klik &ldquo;+ Tambah&rdquo; untuk membuat.</p>
        )}
      </div>

      <p className="text-[11px] text-[#999AAA] mt-4 leading-relaxed">
        Strategi peluncuran: sesi dikerjakan/disupervisi psikolog level Senior — pastikan minimal satu psikolog Senior
        aktif agar Konsultasi Psikolog Anak bisa dibooking. Level Junior/Mid belum menerima booking otomatis.
      </p>
    </div>
  )
}
