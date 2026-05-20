"use client"

import { useState } from "react"
import Link from "next/link"
import { AGE_OPTIONS, AGE_GROUP_LABEL, monthsAgoDate } from "@/constants/children"

type Child = {
  id: string
  name: string
  ageGroup: string
  gender: string | null
  allergies: string | null
  medicalNotes: string | null
  pantangan: string | null
}

export default function ChildrenListClient({ initialChildren }: { initialChildren: Child[] }) {
  const [children, setChildren] = useState(initialChildren)
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState("")
  const [ageLabel, setAgeLabel] = useState("1–3 thn")
  const [gender, setGender] = useState<"FEMALE" | "MALE">("FEMALE")
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    try {
      const selectedAge = AGE_OPTIONS.find(o => o.label === ageLabel) ?? AGE_OPTIONS[2]
      const res = await fetch("/api/parent/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          dateOfBirth: monthsAgoDate(selectedAge.months),
          gender,
        }),
      })
      const data = await res.json() as { success: boolean; data?: Child; error?: string }
      if (data.success && data.data) {
        setChildren(prev => [...prev, data.data!])
        setName("")
        setAgeLabel("1–3 thn")
        setGender("FEMALE")
        setShowAdd(false)
      } else {
        setError(data.error ?? "Gagal menyimpan")
      }
    } catch {
      setError("Koneksi bermasalah. Coba lagi.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, childName: string) {
    if (!confirm(`Hapus profil ${childName}? Tindakan ini tidak bisa dibatalkan.`)) return
    setDeletingId(id)
    setError(null)
    try {
      const res = await fetch(`/api/parent/children/${id}`, { method: "DELETE" })
      const data = await res.json() as { success: boolean; error?: string }
      if (data.success) {
        setChildren(prev => prev.filter(c => c.id !== id))
      } else {
        setError(data.error ?? "Gagal menghapus. Coba lagi.")
      }
    } catch {
      setError("Koneksi bermasalah. Gagal menghapus.")
    } finally {
      setDeletingId(null)
    }
  }

  const pillCls = (active: boolean) =>
    `text-[13px] font-medium px-3.5 py-2 min-h-[40px] border-[1.5px] rounded-full transition-all cursor-pointer ${
      active
        ? "bg-[#E5F6F4] text-[#1E4A45] border-[#5BBFB0] font-semibold"
        : "bg-white text-[#666666] border-[#C8B8DC] hover:border-[#A97CC4]"
    }`

  return (
    <div>
      {/* Error banner (delete failure) */}
      {error && !showAdd && (
        <div className="bg-[#FAEAEA] border border-[#F5C4C4] rounded-[12px] px-3.5 py-2.5 mb-3 flex items-center justify-between gap-2">
          <p className="text-[13px] text-[#C75D5D]">{error}</p>
          <button onClick={() => setError(null)} className="text-[#C75D5D] hover:text-red-700 flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Empty state */}
      {children.length === 0 && !showAdd && (
        <div className="bg-[#F3EEF8] border border-[#C8B8DC] rounded-[16px] p-5 text-center mb-4">
          <div className="w-12 h-12 bg-[#E8DCF0] rounded-full flex items-center justify-center mx-auto mb-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A97CC4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>
          <p className="text-[14px] font-bold text-[#5A3A7A] mb-1">Belum ada profil anak</p>
          <p className="text-[13px] text-[#666666] mb-4 leading-relaxed">
            Tambahkan profil si Kecil untuk mulai mengisi catatan alergi, rutinitas, dan aturan rumah.
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center bg-[#A97CC4] hover:bg-[#5A3A7A] text-white font-semibold text-[13px] px-5 py-2.5 rounded-[10px] min-h-[48px] transition-all"
          >
            + Tambah profil anak
          </button>
        </div>
      )}

      {/* Child cards */}
      {children.length > 0 && (
        <div className="space-y-2.5 mb-4">
          {children.map(child => {
            const hasProfile = !!child.allergies
            const hasDevelopment = !!child.medicalNotes
            const hasRules = !!child.pantangan
            const initials = child.name.split(" ").map(w => w[0]).slice(0, 2).join("")
            return (
              <div key={child.id} className="bg-white border border-[#E0D0F0] rounded-[16px] overflow-hidden">
                <Link
                  href={`/dashboard/parent/children/${child.id}`}
                  className="flex items-center gap-3 p-3.5 hover:bg-[#FDFBFF] transition-colors"
                >
                  <div className="w-10 h-10 bg-[#F3EEF8] rounded-full flex items-center justify-center font-bold text-[14px] text-[#5A3A7A] flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-[#5A3A7A]">{child.name}</p>
                    <p className="text-[12px] text-[#999AAA] mt-0.5">
                      {AGE_GROUP_LABEL[child.ageGroup] ?? child.ageGroup}
                      {child.gender === "FEMALE" ? " · Perempuan" : child.gender === "MALE" ? " · Laki-laki" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span title="Profil" className={`w-2 h-2 rounded-full ${hasProfile ? "bg-[#5BBFB0]" : "bg-[#E0D0F0]"}`} />
                    <span title="Perkembangan" className={`w-2 h-2 rounded-full ${hasDevelopment ? "bg-[#5BBFB0]" : "bg-[#E0D0F0]"}`} />
                    <span title="Aturan" className={`w-2 h-2 rounded-full ${hasRules ? "bg-[#5BBFB0]" : "bg-[#E0D0F0]"}`} />
                    <svg className="ml-1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8B8DC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </Link>
                <div className="border-t border-[#F3EEF8] px-3.5 py-2 flex justify-end">
                  <button
                    onClick={() => handleDelete(child.id, child.name)}
                    disabled={deletingId === child.id}
                    className="text-[12px] text-[#999AAA] hover:text-red-500 transition-colors disabled:opacity-50 min-h-[32px] px-2"
                  >
                    {deletingId === child.id ? "Menghapus..." : "Hapus"}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Inline add form */}
      {showAdd ? (
        <div className="bg-[#F3EEF8] border border-[#C8B8DC] rounded-[16px] p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[14px] font-bold text-[#5A3A7A]">Tambah anak baru</p>
            <button
              onClick={() => { setShowAdd(false); setError(null) }}
              className="w-8 h-8 flex items-center justify-center text-[#999AAA] hover:text-[#5A3A7A] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#5A3A7A] mb-1.5">Nama anak *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Mis: Aisyah"
                className="w-full px-3 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[48px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/15 outline-none transition-all placeholder:text-[#999AAA]"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#5A3A7A] mb-1.5">Usia</label>
              <div className="flex flex-wrap gap-2">
                {AGE_OPTIONS.map(opt => (
                  <button key={opt.label} type="button" onClick={() => setAgeLabel(opt.label)} className={pillCls(ageLabel === opt.label)}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#5A3A7A] mb-1.5">Jenis kelamin</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setGender("FEMALE")} className={pillCls(gender === "FEMALE")}>Perempuan</button>
                <button type="button" onClick={() => setGender("MALE")} className={pillCls(gender === "MALE")}>Laki-laki</button>
              </div>
            </div>
            {error && <p className="text-[12px] text-red-600">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={saving || !name.trim()}
                className="flex-1 flex items-center justify-center bg-[#5BBFB0] hover:bg-[#2C5F5A] disabled:opacity-50 text-white font-semibold text-[13px] min-h-[48px] rounded-[10px] transition-all"
              >
                {saving ? "Menyimpan..." : "Tambah"}
              </button>
              <button
                type="button"
                onClick={() => { setShowAdd(false); setError(null) }}
                className="px-5 min-h-[48px] border-[1.5px] border-[#C8B8DC] text-[#666666] font-semibold text-[13px] rounded-[10px] hover:bg-white transition-all"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      ) : (
        children.length > 0 && (
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1.5 bg-[#E5F6F4] hover:bg-[#A8DDD8] text-[#1E4A45] font-semibold text-[12px] px-3.5 py-1.5 rounded-[8px] min-h-[40px] border border-[#A8DDD8] transition-all"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Tambah profil anak
          </button>
        )
      )}
    </div>
  )
}
