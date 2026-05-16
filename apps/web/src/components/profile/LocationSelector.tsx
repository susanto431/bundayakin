"use client"

import { useState, useEffect } from "react"

type Region = { id: string; nama: string }

type Props = {
  province: string
  city: string
  district: string
  onProvinceChange: (v: string) => void
  onCityChange: (v: string) => void
  onDistrictChange: (v: string) => void
  labelClass?: string
  selectClass?: string
}

const BASE = "https://ibnux.github.io/data-indonesia"

const SELECT_CLASS =
  "w-full px-3.5 py-2.5 text-sm text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[48px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/20 outline-none transition-all appearance-none"

const LABEL_CLASS = "block text-sm font-semibold text-[#5A3A7A] mb-1.5"

function capitalize(s: string) {
  return s
    .toLowerCase()
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

export default function LocationSelector({
  province,
  city,
  district,
  onProvinceChange,
  onCityChange,
  onDistrictChange,
  labelClass = LABEL_CLASS,
  selectClass = SELECT_CLASS,
}: Props) {
  const [provinces, setProvinces] = useState<Region[]>([])
  const [cities, setCities] = useState<Region[]>([])
  const [districts, setDistricts] = useState<Region[]>([])
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)

  // province id that matches the current province name
  const [provinceId, setProvinceId] = useState("")
  const [cityId, setCityId] = useState("")

  useEffect(() => {
    fetch(`${BASE}/provinsi.json`)
      .then(r => r.json())
      .then((data: Region[]) => setProvinces(data))
      .catch(() => {})
  }, [])

  // When province name is set from saved data, find the ID
  useEffect(() => {
    if (!province || provinces.length === 0) return
    const found = provinces.find(p => capitalize(p.nama) === province)
    if (found && found.id !== provinceId) {
      setProvinceId(found.id)
    }
  }, [province, provinces, provinceId])

  // Load cities when provinceId changes
  useEffect(() => {
    if (!provinceId) { setCities([]); return }
    setLoadingCities(true)
    fetch(`${BASE}/kabupaten/${provinceId}.json`)
      .then(r => r.json())
      .then((data: Region[]) => { setCities(data); setLoadingCities(false) })
      .catch(() => setLoadingCities(false))
  }, [provinceId])

  // When city name is set from saved data, find the ID
  useEffect(() => {
    if (!city || cities.length === 0) return
    const found = cities.find(c => capitalize(c.nama) === city)
    if (found && found.id !== cityId) {
      setCityId(found.id)
    }
  }, [city, cities, cityId])

  // Load districts when cityId changes
  useEffect(() => {
    if (!cityId) { setDistricts([]); return }
    setLoadingDistricts(true)
    fetch(`${BASE}/kecamatan/${cityId}.json`)
      .then(r => r.json())
      .then((data: Region[]) => { setDistricts(data); setLoadingDistricts(false) })
      .catch(() => setLoadingDistricts(false))
  }, [cityId])

  function handleProvinceChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value
    const found = provinces.find(p => p.id === id)
    const name = found ? capitalize(found.nama) : ""
    setProvinceId(id)
    setCityId("")
    setCities([])
    setDistricts([])
    onProvinceChange(name)
    onCityChange("")
    onDistrictChange("")
  }

  function handleCityChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value
    const found = cities.find(c => c.id === id)
    const name = found ? capitalize(found.nama) : ""
    setCityId(id)
    setDistricts([])
    onCityChange(name)
    onDistrictChange("")
  }

  function handleDistrictChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const found = districts.find(d => d.id === e.target.value)
    const name = found ? capitalize(found.nama) : ""
    onDistrictChange(name)
  }

  const currentProvinceId = provinces.find(p => capitalize(p.nama) === province)?.id ?? provinceId
  const currentCityId = cities.find(c => capitalize(c.nama) === city)?.id ?? cityId
  const currentDistrictId = districts.find(d => capitalize(d.nama) === district)?.id ?? ""

  return (
    <div className="space-y-3">
      {/* Provinsi */}
      <div>
        <label className={labelClass}>Provinsi</label>
        <div className="relative">
          <select
            value={currentProvinceId}
            onChange={handleProvinceChange}
            className={selectClass}
          >
            <option value="">Pilih Provinsi</option>
            {provinces.map(p => (
              <option key={p.id} value={p.id}>{capitalize(p.nama)}</option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8B8DC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
        </div>
      </div>

      {/* Kota / Kabupaten */}
      <div>
        <label className={labelClass}>Kota / Kabupaten</label>
        <div className="relative">
          <select
            value={currentCityId}
            onChange={handleCityChange}
            disabled={!currentProvinceId || loadingCities}
            className={`${selectClass} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <option value="">
              {loadingCities ? "Memuat..." : !currentProvinceId ? "Pilih provinsi dulu" : "Pilih Kota/Kabupaten"}
            </option>
            {cities.map(c => (
              <option key={c.id} value={c.id}>{capitalize(c.nama)}</option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8B8DC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
        </div>
      </div>

      {/* Kecamatan */}
      <div>
        <label className={labelClass}>Kecamatan</label>
        <div className="relative">
          <select
            value={currentDistrictId}
            onChange={handleDistrictChange}
            disabled={!currentCityId || loadingDistricts}
            className={`${selectClass} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <option value="">
              {loadingDistricts ? "Memuat..." : !currentCityId ? "Pilih kota dulu" : "Pilih Kecamatan"}
            </option>
            {districts.map(d => (
              <option key={d.id} value={d.id}>{capitalize(d.nama)}</option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8B8DC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
        </div>
      </div>
    </div>
  )
}
