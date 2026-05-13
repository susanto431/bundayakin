"use client"

import { useState } from "react"

type Props = {
  initialEmail: string
}

export default function EmailSection({ initialEmail }: Props) {
  const [email, setEmail] = useState(initialEmail)
  const [draft, setDraft] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setError("")
    setSaving(true)
    try {
      const res = await fetch("/api/user/email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: draft }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setError(json.error ?? "Gagal menyimpan email")
      } else {
        setEmail(draft)
        setSaved(true)
      }
    } finally {
      setSaving(false)
    }
  }

  if (email) {
    return (
      <div className="bg-[#F3EEF8] border border-[#E0D0F0] rounded-[12px] px-3.5 py-2.5 mb-5">
        <p className="text-[10px] font-bold tracking-[1px] uppercase text-[#999AAA] mb-0.5">Email</p>
        <p className="text-[13px] text-[#5A3A7A]">{email}</p>
        <p className="text-[11px] text-[#C8B8DC] mt-1">
          Tidak dapat diubah.{" "}
          <a
            href="https://wa.me/6287888180363?text=Halo%2C%20saya%20ingin%20mengubah%20email%20akun%20BundaYakin%20saya."
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#5A3A7A] underline"
          >
            Hubungi tim BundaYakin
          </a>{" "}
          jika ingin ganti email.
        </p>
      </div>
    )
  }

  if (saved) {
    return (
      <div className="bg-[#E5F6F4] border border-[#A8DDD8] rounded-[12px] px-3.5 py-2.5 mb-5">
        <p className="text-[10px] font-bold tracking-[1px] uppercase text-[#2C5F5A] mb-0.5">Email</p>
        <p className="text-[13px] text-[#2C5F5A]">{email}</p>
        <p className="text-[11px] text-[#2C5F5A] mt-0.5">Email berhasil disimpan.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#E0D0F0] rounded-[12px] px-3.5 py-3 mb-5">
      <p className="text-[10px] font-bold tracking-[1px] uppercase text-[#999AAA] mb-1.5">Email</p>
      <input
        type="email"
        value={draft}
        onChange={e => { setDraft(e.target.value); setError(""); setSaved(false) }}
        placeholder="contoh@email.com"
        className="w-full text-[13px] text-[#5A3A7A] border border-[#E0D0F0] rounded-[8px] px-3 py-2 outline-none focus:border-[#A97CC4] transition-colors placeholder:text-[#C8B8DC]"
      />
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
      <button
        onClick={handleSave}
        disabled={saving || draft.trim().length === 0}
        className="mt-2 w-full bg-[#5BBFB0] hover:bg-[#2C5F5A] disabled:opacity-50 text-white font-semibold text-[13px] rounded-[8px] py-2 transition-all"
      >
        {saving ? "Menyimpan…" : "Simpan email"}
      </button>
      <p className="text-[11px] text-[#999AAA] mt-1.5 leading-relaxed">
        Akun ini didaftarkan tanpa email. Isi email untuk menerima notifikasi penting.
      </p>
    </div>
  )
}
