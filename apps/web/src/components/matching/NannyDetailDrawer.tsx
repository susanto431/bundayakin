"use client"

import { useEffect, useState } from "react"
import PaymentModal from "./PaymentModal"

type MatchDetail = {
  id: string
  skorKeseluruhan: number
  skorDomainA: number | null
  skorDomainB: number | null
  skorDomainC: number | null
  kekuatan: string[]
  potensiLemah: string[]
  potensiKonflik: string[]
  caraMengatasi: string[]
  tipsOrangTua: string[]
  tipsNanny: string[]
  adaDealbreaker: boolean
  dealbreakerFlags: Array<{ questionId: string; issue: string }> | null
  kontakTerbuka: boolean
  nannyProfile: {
    id: string
    fullName: string
    city: string | null
    educationLevel: string | null
    yearsOfExperience: number | null
    dateOfBirth: string | null
    nannyType: string[]
    profilePhotoUrl: string | null
    phone: string | null
    bio: string | null
  }
}

type Props = {
  nannyProfileId: string
  onClose: () => void
  onMatchCalculated?: () => void
}

function DomainBar({ label, skor }: { label: string; skor: number | null }) {
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs text-[#666666] mb-1">
        <span>{label}</span>
        <span className="font-medium text-[#5A3A7A]">{skor ?? "–"}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${skor ?? 0}%`, backgroundColor: "#5BBFB0" }}
        />
      </div>
    </div>
  )
}

function BulletList({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={`space-y-1.5 ${className ?? ""}`}>
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-[#444444]">
          <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#5BBFB0]" />
          {item}
        </li>
      ))}
    </ul>
  )
}

export default function NannyDetailDrawer({ nannyProfileId, onClose, onMatchCalculated }: Props) {
  const [detail, setDetail] = useState<MatchDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showPayment, setShowPayment] = useState(false)
  const [calculating, setCalculating] = useState(false)

  async function fetchDetail() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/matching/detail?nannyProfileId=${nannyProfileId}`)
      if (res.status === 404) {
        // No match yet — trigger calculation
        await calculateMatch()
        return
      }
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setDetail(json.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data")
    } finally {
      setLoading(false)
    }
  }

  async function calculateMatch() {
    setCalculating(true)
    try {
      const res = await fetch("/api/matching/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nannyProfileId }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setDetail(json.data)
      onMatchCalculated?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghitung kecocokan")
    } finally {
      setCalculating(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetail()
  }, [nannyProfileId])

  function handlePaymentSuccess() {
    setShowPayment(false)
    fetchDetail()
  }

  const nanny = detail?.nannyProfile
  const usia = nanny?.dateOfBirth
    ? Math.floor((Date.now() - new Date(nanny.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#E0D0F0" }}>
          <h2 className="font-bold text-[#5A3A7A]">Detail Nanny</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#666666] hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {(loading || calculating) && (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="w-8 h-8 border-3 border-[#5BBFB0] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-[#666666]">
                {calculating ? "Menghitung kecocokan via AI..." : "Memuat data..."}
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="p-5">
              <p className="text-[#C75D5D] text-sm">{error}</p>
              <button
                onClick={fetchDetail}
                className="mt-3 text-sm text-[#5BBFB0] underline"
              >
                Coba lagi
              </button>
            </div>
          )}

          {detail && !loading && (
            <div className="p-5 space-y-5">
              {/* Nanny info */}
              <div className="flex items-start gap-3">
                {nanny?.profilePhotoUrl ? (
                  <img src={nanny.profilePhotoUrl} alt={nanny.fullName} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                    style={{ backgroundColor: "#A97CC4" }}>
                    {nanny?.fullName.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-bold text-[#5A3A7A] text-lg">{nanny?.fullName}</p>
                  <p className="text-sm text-[#666666]">
                    {[usia ? `${usia} tahun` : null, nanny?.city].filter(Boolean).join(" · ")}
                  </p>
                  <p className="text-sm text-[#666666]">
                    Pengalaman {nanny?.yearsOfExperience ?? 0} tahun
                    {nanny?.educationLevel ? ` · ${nanny.educationLevel}` : ""}
                  </p>
                </div>
              </div>

              {/* Skor */}
              {detail.adaDealbreaker ? (
                <div className="rounded-xl p-4" style={{ backgroundColor: "#FAEAEA" }}>
                  <p className="font-semibold text-[#C75D5D] mb-1">Tidak Cocok — Ada Dealbreaker</p>
                  {detail.dealbreakerFlags?.map((f, i) => (
                    <p key={i} className="text-sm text-[#C75D5D]">• {f.issue}</p>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl p-4" style={{ backgroundColor: "#E5F6F4" }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-[#5A3A7A]">Kecocokan Keseluruhan</span>
                    <span className="text-2xl font-bold text-[#5BBFB0]">{detail.skorKeseluruhan}%</span>
                  </div>
                  <DomainBar label="A — Kondisi Kerja" skor={detail.skorDomainA} />
                  <DomainBar label="B — Nilai & Gaya Hidup" skor={detail.skorDomainB} />
                  <DomainBar label="C — Pengalaman & Kemampuan" skor={detail.skorDomainC} />
                </div>
              )}

              {/* Kekuatan */}
              {detail.kekuatan.length > 0 && (
                <div>
                  <p className="font-semibold text-[#5A3A7A] mb-2">✅ Kekuatan Pasangan Ini</p>
                  <BulletList items={detail.kekuatan} />
                </div>
              )}

              {/* Potensi Lemah */}
              {detail.potensiLemah.length > 0 && (
                <div>
                  <p className="font-semibold text-[#5A3A7A] mb-2">⚠️ Potensi Lemah</p>
                  {detail.kontakTerbuka ? (
                    <BulletList items={detail.potensiLemah} />
                  ) : (
                    <>
                      <BulletList items={detail.potensiLemah.slice(0, 1)} />
                      {detail.potensiLemah.length > 1 && (
                        <div
                          className="mt-2 rounded-lg p-3 text-sm text-[#999AAA] text-center"
                          style={{ backgroundColor: "#F5F5F8", filter: "blur(0px)" }}
                        >
                          <span className="blur-sm select-none">{detail.potensiLemah[1]}</span>
                          <p className="mt-1 text-xs not-italic text-[#999AAA] blur-none">
                            🔒 Buka laporan lengkap untuk melihat semua
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Laporan Lengkap — hanya jika kontak terbuka */}
              {detail.kontakTerbuka && (
                <>
                  {detail.potensiKonflik.length > 0 && (
                    <div>
                      <p className="font-semibold text-[#5A3A7A] mb-2">💬 Potensi Konflik</p>
                      <BulletList items={detail.potensiKonflik} />
                    </div>
                  )}
                  {detail.caraMengatasi.length > 0 && (
                    <div>
                      <p className="font-semibold text-[#5A3A7A] mb-2">🛠 Cara Mengatasi</p>
                      <BulletList items={detail.caraMengatasi} />
                    </div>
                  )}
                  {detail.tipsOrangTua.length > 0 && (
                    <div>
                      <p className="font-semibold text-[#5A3A7A] mb-2">💡 Tips untuk Bunda</p>
                      <BulletList items={detail.tipsOrangTua} />
                    </div>
                  )}

                  {/* Kontak */}
                  <div className="rounded-xl p-4 border" style={{ backgroundColor: "#E5F6F4", borderColor: "#A8DDD8" }}>
                    <p className="font-semibold text-[#2C5F5A] mb-2">📞 Kontak Nanny</p>
                    {nanny?.phone ? (
                      <a
                        href={`https://wa.me/62${nanny.phone.replace(/^0/, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-[#5BBFB0] font-medium underline"
                      >
                        WhatsApp: {nanny.phone}
                      </a>
                    ) : (
                      <p className="text-[#666666] text-sm">Nomor belum diisi oleh nanny</p>
                    )}
                  </div>
                </>
              )}

              {/* CTA — buka kontak */}
              {!detail.kontakTerbuka && !detail.adaDealbreaker && (
                <button
                  onClick={() => setShowPayment(true)}
                  className="w-full py-4 rounded-xl font-bold text-white text-base transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#5BBFB0" }}
                >
                  Buka Kontak & Laporan Lengkap — Rp 100.000
                </button>
              )}

              {/* Bio */}
              {nanny?.bio && detail.kontakTerbuka && (
                <div>
                  <p className="font-semibold text-[#5A3A7A] mb-1">Tentang {nanny.fullName}</p>
                  <p className="text-sm text-[#666666]">{nanny.bio}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showPayment && detail && (
        <PaymentModal
          nannyNama={detail.nannyProfile.fullName}
          nannyProfileId={nannyProfileId}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPayment(false)}
        />
      )}
    </>
  )
}
