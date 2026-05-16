"use client"

import { useState } from "react"
import LocationSelector from "./LocationSelector"

type ProfileData = {
  fullName: string
  phone: string
  province: string
  city: string
  district: string
  address: string
}

const INPUT_CLASS =
  "w-full px-3.5 py-2.5 text-sm text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[48px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/20 placeholder:text-[#999AAA] outline-none transition-all"

const LABEL_CLASS = "block text-sm font-semibold text-[#5A3A7A] mb-1.5"

export default function ParentProfileForm({ initial }: { initial: ProfileData }) {
  const [form, setForm] = useState<ProfileData>(initial)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setSaved(false)
  }

  function handleLocationChange(field: "province" | "city" | "district", value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSaved(false)

    try {
      const res = await fetch("/api/parent/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = (await res.json()) as { success: boolean; error?: string }
      if (!data.success) {
        setError(data.error ?? "Gagal menyimpan")
      } else {
        setSaved(true)
      }
    } catch {
      setError("Tidak dapat terhubung ke server")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-[#FAEAEA] border-l-[3px] border-[#C75D5D] rounded-[10px] px-4 py-3 text-sm text-[#C75D5D]">
          {error}
        </div>
      )}
      {saved && (
        <div className="bg-[#E5F6F4] border-l-[3px] border-[#5BBFB0] rounded-[10px] px-4 py-3 text-sm text-[#2C5F5A] font-semibold">
          Profil berhasil disimpan
        </div>
      )}

      <div>
        <label htmlFor="fullName" className={LABEL_CLASS}>Nama Lengkap</label>
        <input id="fullName" name="fullName" type="text" value={form.fullName}
          onChange={handleChange} required placeholder="Nama lengkap Anda" className={INPUT_CLASS} />
      </div>

      <div>
        <label htmlFor="phone" className={LABEL_CLASS}>Nomor HP</label>
        <input id="phone" name="phone" type="tel" value={form.phone}
          onChange={handleChange} placeholder="cth: 08123456789" className={INPUT_CLASS} />
      </div>

      <LocationSelector
        province={form.province}
        city={form.city}
        district={form.district}
        onProvinceChange={v => handleLocationChange("province", v)}
        onCityChange={v => handleLocationChange("city", v)}
        onDistrictChange={v => handleLocationChange("district", v)}
      />

      <div>
        <label htmlFor="address" className={LABEL_CLASS}>Alamat</label>
        <textarea id="address" name="address" value={form.address}
          onChange={handleChange} placeholder="Alamat lengkap (opsional)"
          rows={3}
          className="w-full px-3.5 py-2.5 text-sm text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/20 placeholder:text-[#999AAA] outline-none transition-all resize-none" />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#5BBFB0] hover:bg-[#2C5F5A] disabled:bg-[#C8B8DC] text-white font-semibold py-3 rounded-[10px] min-h-[48px] transition-all text-sm"
      >
        {loading ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  )
}
