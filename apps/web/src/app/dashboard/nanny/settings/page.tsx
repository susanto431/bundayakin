"use client"

import { useState, useEffect } from "react"

export default function NannySettingsPage() {
  const [workTypes, setWorkTypes] = useState({ longterm: true, temporary: true })
  const [status, setStatus] = useState("active")
  const [visibility, setVisibility] = useState("all")
  const [bank, setBank] = useState("GoPay")
  const [bankNumber, setBankNumber] = useState("081234567890")
  const [notifications, setNotifications] = useState({
    invite: true,
    monitoring: true,
    bonus: true,
  })
  const [openToJob, setOpenToJob] = useState(false)
  const [openToJobLoading, setOpenToJobLoading] = useState(false)
  const [openToJobFetched, setOpenToJobFetched] = useState(false)

  useEffect(() => {
    fetch("/api/nanny/open-to-job")
      .then(r => r.json())
      .then(d => {
        if (d.success) setOpenToJob(d.data.openToJob)
        setOpenToJobFetched(true)
      })
      .catch(() => setOpenToJobFetched(true))
  }, [])

  async function handleOpenToJobToggle() {
    if (openToJobLoading) return
    setOpenToJobLoading(true)
    const next = !openToJob
    setOpenToJob(next)
    try {
      const res = await fetch("/api/nanny/open-to-job", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ openToJob: next }),
      })
      const d = await res.json()
      if (!d.success) setOpenToJob(!next)
    } catch {
      setOpenToJob(!next)
    } finally {
      setOpenToJobLoading(false)
    }
  }

  const pillPu = (active: boolean) =>
    `px-4 py-2 min-h-[44px] rounded-full border-[1.5px] text-[13px] font-medium transition-all cursor-pointer ${
      active
        ? "bg-[#F3EEF8] text-[#5A3A7A] border-[#A97CC4] font-semibold"
        : "bg-white text-[#666666] border-[#C8B8DC] hover:border-[#A97CC4]"
    }`

  const chkPu = (on: boolean) =>
    `w-5 h-5 rounded-[6px] border-[1.5px] flex items-center justify-center flex-shrink-0 mt-0.5 transition-all cursor-pointer ${
      on ? "bg-[#A97CC4] border-[#A97CC4]" : "bg-white border-[#C8B8DC]"
    }`

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-28">

      {/* Header */}
      <div className="border-b border-[#E0D0F0] pb-3 mb-4">
        <h1 className="text-[16px] font-bold text-[#5A3A7A]">Akun &amp; pengaturan</h1>
        <p className="text-[12px] text-[#999AAA] mt-0.5">Pengaturan akun nanny</p>
      </div>

      {/* Open to Job — LinkedIn mode */}
      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Status cari keluarga</p>
      <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-4 mb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-[13px] font-bold text-[#5A3A7A]">Open to Job</p>
            <p className="text-[12px] text-[#999AAA] mt-0.5 leading-relaxed">
              Aktifkan agar orang tua di platform bisa melihat bahwa kamu sedang cari keluarga baru.
              Profil tetap anonim — nama &amp; kontak hanya terlihat jika mereka membuka profil.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenToJobToggle}
            disabled={openToJobLoading || !openToJobFetched}
            className={`relative inline-flex flex-shrink-0 h-[28px] w-[52px] rounded-full border-2 border-transparent transition-all duration-200 focus:outline-none ${
              openToJob ? "bg-[#5BBFB0]" : "bg-[#C8B8DC]"
            } ${openToJobLoading ? "opacity-60" : ""}`}
            aria-label="Toggle open to job"
          >
            <span
              className={`inline-block h-[24px] w-[24px] rounded-full bg-white shadow transform transition-transform duration-200 ${
                openToJob ? "translate-x-[24px]" : "translate-x-0"
              }`}
            />
          </button>
        </div>
        {openToJob && (
          <div className="mt-3 bg-[#E5F6F4] border border-[#A8DDD8] rounded-[10px] px-3 py-2">
            <p className="text-[12px] text-[#1E4A45] font-semibold">Kamu sedang aktif dicari</p>
            <p className="text-[11px] text-[#2C5F5A] mt-0.5">
              Orang tua di kotamu bisa melihat ada nanny yang tersedia. Profil akan muncul di dashboard mereka.
            </p>
          </div>
        )}
      </div>

      {/* Work type */}
      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Ketersediaan &amp; tipe kerja</p>
      <div className="space-y-2 mb-4">
        {[
          { key: "longterm" as const, label: "Jangka panjang (tinggal / harian rutin)" },
          { key: "temporary" as const, label: "Temporer / infal" },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-start gap-2.5 cursor-pointer">
            <div
              className={chkPu(workTypes[key])}
              onClick={() => setWorkTypes(v => ({ ...v, [key]: !v[key] }))}
            >
              {workTypes[key] && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="text-[13px] text-[#666666] leading-relaxed">{label}</span>
          </label>
        ))}
        <div className="flex items-start gap-2.5 opacity-50">
          <div className="w-5 h-5 rounded-[6px] border-[1.5px] border-[#C8B8DC] bg-white flex-shrink-0 mt-0.5" />
          <span className="text-[13px] text-[#999AAA]">Harian / per jam (tersedia nanti)</span>
        </div>
      </div>

      {/* Status */}
      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Status ketersediaan</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { value: "active", label: "Aktif — siap tawaran" },
          { value: "working", label: "Sedang bekerja" },
          { value: "hidden", label: "Sembunyi sementara" },
        ].map(opt => (
          <button key={opt.value} type="button" onClick={() => setStatus(opt.value)} className={pillPu(status === opt.value)}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Visibility */}
      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Visibilitas profil</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { value: "all", label: "Terlihat oleh semua" },
          { value: "invited", label: "Hanya keluarga yang undang" },
        ].map(opt => (
          <button key={opt.value} type="button" onClick={() => setVisibility(opt.value)} className={pillPu(visibility === opt.value)}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Bank */}
      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Rekening / e-wallet untuk bonus</p>
      <div className="mb-2">
        <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">Bank atau e-wallet</label>
        <select
          value={bank}
          onChange={e => setBank(e.target.value)}
          className="w-full px-3.5 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[48px] focus:border-[#A97CC4] outline-none transition-all"
        >
          {["GoPay", "BCA", "BRI", "Mandiri", "OVO", "DANA"].map(b => <option key={b}>{b}</option>)}
        </select>
      </div>
      <div className="mb-3">
        <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">Nomor rekening / HP e-wallet</label>
        <input
          type="text"
          value={bankNumber}
          onChange={e => setBankNumber(e.target.value)}
          className="w-full px-3.5 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[48px] focus:border-[#A97CC4] outline-none transition-all"
        />
      </div>
      <button className="inline-flex items-center bg-[#E5F6F4] hover:bg-[#A8DDD8] text-[#1E4A45] font-semibold text-[12px] px-3.5 py-1.5 rounded-[8px] min-h-[36px] border border-[#A8DDD8] transition-all mb-4">
        Simpan perubahan rekening
      </button>

      {/* Notifications */}
      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Notifikasi</p>
      <div className="space-y-2 mb-4">
        {[
          { key: "invite" as const, label: "Undangan dari keluarga baru" },
          { key: "monitoring" as const, label: "Pemantauan berkala" },
          { key: "bonus" as const, label: "Bonus & badge" },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-start gap-2.5 cursor-pointer">
            <div className={chkPu(notifications[key])} onClick={() => setNotifications(v => ({ ...v, [key]: !v[key] }))}>
              {notifications[key] && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="text-[13px] text-[#666666] leading-relaxed">{label}</span>
          </label>
        ))}
      </div>

      {/* Account actions */}
      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Akun</p>
      <div className="space-y-0 text-[13px] mb-4">
        {["Edit nomor HP", "Ganti kata sandi", "Unduh data saya"].map(label => (
          <button key={label} className="block py-2.5 text-[#A97CC4] font-semibold min-h-[40px]">{label}</button>
        ))}
        <button className="block py-2.5 text-[#C75D5D] font-semibold min-h-[40px]">Hapus akun</button>
      </div>

      {/* About */}
      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Tentang</p>
      <div className="space-y-0 text-[13px] text-[#999AAA]">
        <div className="py-2.5 border-b border-[#F3EEF8]">Syarat &amp; Ketentuan Nanny</div>
        <button className="py-2.5 block text-[#A97CC4] font-semibold min-h-[40px]">Hubungi tim BundaYakin</button>
        <div className="py-2.5">Versi 1.0.0</div>
      </div>

    </div>
  )
}
