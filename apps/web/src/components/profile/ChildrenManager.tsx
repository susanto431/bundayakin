"use client"

import { useState } from "react"

type Child = {
  id: string
  name: string
  dateOfBirth: string
  gender: string | null
  allergies: string | null
  medicalNotes: string | null
  pantangan: string | null
  schedule: string | null
  schoolName: string | null
  additionalNotes: string | null
}

type ChildForm = Omit<Child, "id">

const EMPTY_FORM: ChildForm = {
  name: "", dateOfBirth: "", gender: "",
  allergies: "", medicalNotes: "", pantangan: "",
  schedule: "", schoolName: "", additionalNotes: "",
}

const INPUT_CLASS =
  "w-full px-3.5 py-2.5 text-sm text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[48px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/20 placeholder:text-[#999AAA] outline-none transition-all"

const TEXTAREA_CLASS =
  "w-full px-3.5 py-2.5 text-sm text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/20 placeholder:text-[#999AAA] outline-none transition-all resize-none"

const LABEL_CLASS = "block text-sm font-semibold text-[#5A3A7A] mb-1.5"

function calcAge(dob: string): string {
  const birth = new Date(dob)
  const now = new Date()
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth())
  if (months < 12) return `${months} bulan`
  const years = Math.floor(months / 12)
  const rem = months % 12
  return rem > 0 ? `${years} tahun ${rem} bulan` : `${years} tahun`
}

type DrawerMode = "add" | "edit"

export default function ChildrenManager({ initial }: { initial: Child[] }) {
  const [children, setChildren] = useState<Child[]>(initial)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("add")
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<ChildForm>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  function openAdd() {
    setForm(EMPTY_FORM)
    setDrawerMode("add")
    setEditId(null)
    setError(null)
    setDrawerOpen(true)
  }

  function openEdit(child: Child) {
    setForm({
      name: child.name,
      dateOfBirth: child.dateOfBirth.slice(0, 10),
      gender: child.gender ?? "",
      allergies: child.allergies ?? "",
      medicalNotes: child.medicalNotes ?? "",
      pantangan: child.pantangan ?? "",
      schedule: child.schedule ?? "",
      schoolName: child.schoolName ?? "",
      additionalNotes: child.additionalNotes ?? "",
    })
    setDrawerMode("edit")
    setEditId(child.id)
    setError(null)
    setDrawerOpen(true)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const url = drawerMode === "add" ? "/api/parent/children" : `/api/parent/children/${editId}`
    const method = drawerMode === "add" ? "POST" : "PATCH"

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = (await res.json()) as { success: boolean; data?: Child; error?: string }
      if (!data.success || !data.data) {
        setError(data.error ?? "Gagal menyimpan")
        return
      }
      if (drawerMode === "add") {
        setChildren(prev => [...prev, data.data!])
      } else {
        setChildren(prev => prev.map(c => c.id === editId ? data.data! : c))
      }
      setDrawerOpen(false)
    } catch {
      setError("Tidak dapat terhubung ke server")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleteId(null)
    try {
      await fetch(`/api/parent/children/${id}`, { method: "DELETE" })
      setChildren(prev => prev.filter(c => c.id !== id))
    } catch {
      // silent — list stays unchanged if delete fails
    }
  }

  return (
    <>
      {/* List */}
      <div className="space-y-3 mb-4">
        {children.length === 0 && (
          <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-8 text-center">
            <div className="w-12 h-12 bg-[#F3EEF8] rounded-full mx-auto mb-3 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A97CC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="7" r="4" /><path d="M5.5 20a7.5 7.5 0 0 1 13 0" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-[#5A3A7A] mb-1">Belum ada data anak</p>
            <p className="text-xs text-[#999AAA]">Tambahkan profil si kecil untuk mulai matching</p>
          </div>
        )}

        {children.map(child => (
          <div key={child.id} className="bg-white border border-[#E0D0F0] rounded-[16px] p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F3EEF8] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A97CC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="7" r="4" /><path d="M5.5 20a7.5 7.5 0 0 1 13 0" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#5A3A7A]">{child.name}</p>
                  <p className="text-xs text-[#999AAA]">
                    {calcAge(child.dateOfBirth)}
                    {child.gender ? ` · ${child.gender}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(child)}
                  className="text-xs text-[#5BBFB0] font-semibold hover:text-[#2C5F5A] min-h-[32px] px-2 transition-colors">
                  Edit
                </button>
                <button onClick={() => setDeleteId(child.id)}
                  className="text-xs text-[#999AAA] hover:text-[#C75D5D] min-h-[32px] px-2 transition-colors">
                  Hapus
                </button>
              </div>
            </div>
            {(child.allergies || child.medicalNotes) && (
              <div className="mt-3 pt-3 border-t border-[#F3EEF8] space-y-1">
                {child.allergies && (
                  <p className="text-xs text-[#666666]">
                    <span className="font-semibold text-[#5A3A7A]">Alergi:</span> {child.allergies}
                  </p>
                )}
                {child.medicalNotes && (
                  <p className="text-xs text-[#666666]">
                    <span className="font-semibold text-[#5A3A7A]">Catatan medis:</span> {child.medicalNotes}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={openAdd}
        className="w-full flex items-center justify-center gap-2 border-[1.5px] border-dashed border-[#C8B8DC] hover:border-[#5BBFB0] hover:text-[#5BBFB0] text-[#999AAA] rounded-[14px] py-3.5 min-h-[52px] text-sm font-semibold transition-all"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Tambah Anak
      </button>

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0">
          <div className="bg-white rounded-[20px] p-6 w-full max-w-sm">
            <p className="font-semibold text-[#5A3A7A] mb-1">Hapus data anak?</p>
            <p className="text-sm text-[#666666] mb-5">Tindakan ini tidak bisa dibatalkan.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 border border-[#E0D0F0] text-[#5A3A7A] font-semibold py-2.5 rounded-[10px] min-h-[44px] text-sm transition-all hover:border-[#A97CC4]">
                Batal
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-[#C75D5D] hover:bg-[#A34848] text-white font-semibold py-2.5 rounded-[10px] min-h-[44px] text-sm transition-all">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-end justify-center">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-t-[24px] w-full max-w-lg max-h-[90dvh] flex flex-col"
          >
            {/* Fixed header */}
            <div className="flex-shrink-0 px-5 pt-5 pb-3 border-b border-[#F3EEF8] flex items-center justify-between">
              <p className="font-semibold text-[#5A3A7A]">
                {drawerMode === "add" ? "Tambah Anak" : "Edit Data Anak"}
              </p>
              <button type="button" onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-[#999AAA] hover:text-[#5A3A7A] hover:bg-[#F3EEF8] transition-all">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable fields */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              {error && (
                <div className="bg-[#FAEAEA] border-l-[3px] border-[#C75D5D] rounded-[10px] px-4 py-3 text-sm text-[#C75D5D]">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="name" className={LABEL_CLASS}>Nama Anak <span className="text-[#C75D5D]">*</span></label>
                <input id="name" name="name" type="text" value={form.name} onChange={handleChange}
                  required placeholder="Nama panggilan atau lengkap" className={INPUT_CLASS} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="dateOfBirth" className={LABEL_CLASS}>Tanggal Lahir <span className="text-[#C75D5D]">*</span></label>
                  <input id="dateOfBirth" name="dateOfBirth" type="date" value={form.dateOfBirth}
                    onChange={handleChange} required
                    max={new Date().toISOString().slice(0, 10)}
                    className={INPUT_CLASS} />
                </div>
                <div>
                  <label htmlFor="gender" className={LABEL_CLASS}>Jenis Kelamin</label>
                  <select id="gender" name="gender" value={form.gender ?? ""} onChange={handleChange}
                    className={INPUT_CLASS + " cursor-pointer"}>
                    <option value="">— pilih —</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="allergies" className={LABEL_CLASS}>Alergi</label>
                <input id="allergies" name="allergies" type="text" value={form.allergies ?? ""}
                  onChange={handleChange} placeholder="cth: susu sapi, kacang, debu" className={INPUT_CLASS} />
              </div>

              <div>
                <label htmlFor="medicalNotes" className={LABEL_CLASS}>Catatan Kesehatan</label>
                <textarea id="medicalNotes" name="medicalNotes" value={form.medicalNotes ?? ""}
                  onChange={handleChange} rows={2}
                  placeholder="Kondisi kesehatan yang perlu diperhatikan nanny"
                  className={TEXTAREA_CLASS} />
              </div>

              <div>
                <label htmlFor="pantangan" className={LABEL_CLASS}>Pantangan</label>
                <textarea id="pantangan" name="pantangan" value={form.pantangan ?? ""}
                  onChange={handleChange} rows={2}
                  placeholder="Pantangan makanan atau aktivitas"
                  className={TEXTAREA_CLASS} />
              </div>

              <div>
                <label htmlFor="schoolName" className={LABEL_CLASS}>Nama Sekolah / TK / PAUD</label>
                <input id="schoolName" name="schoolName" type="text" value={form.schoolName ?? ""}
                  onChange={handleChange} placeholder="Jika sudah sekolah (opsional)" className={INPUT_CLASS} />
              </div>

              <div>
                <label htmlFor="schedule" className={LABEL_CLASS}>Jadwal Harian</label>
                <textarea id="schedule" name="schedule" value={form.schedule ?? ""}
                  onChange={handleChange} rows={2}
                  placeholder="cth: tidur siang 12–14, makan sore 17.30"
                  className={TEXTAREA_CLASS} />
              </div>

              <div>
                <label htmlFor="additionalNotes" className={LABEL_CLASS}>Catatan Tambahan</label>
                <textarea id="additionalNotes" name="additionalNotes" value={form.additionalNotes ?? ""}
                  onChange={handleChange} rows={2}
                  placeholder="Hal lain yang penting untuk nanny ketahui"
                  className={TEXTAREA_CLASS} />
              </div>

            </div>

            {/* Fixed footer — always visible */}
            <div className="flex-shrink-0 px-5 pt-3 pb-6 border-t border-[#F3EEF8]">
              <button type="submit" disabled={loading}
                className="w-full bg-[#5BBFB0] hover:bg-[#2C5F5A] disabled:bg-[#C8B8DC] text-white font-semibold py-3.5 rounded-[12px] min-h-[52px] text-sm transition-all">
                {loading ? "Menyimpan..." : drawerMode === "add" ? "Tambah Anak" : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
