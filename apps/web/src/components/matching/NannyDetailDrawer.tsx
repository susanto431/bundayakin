"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import PaymentModal from "./PaymentModal"
import UnlockContactButton from "./UnlockContactButton"
import ScoreRing from "./ScoreRing"
import KomparasiPreferensi from "./KomparasiPreferensi"
import { scoreColor, verdictLabel } from "@/lib/score-display"
import type { AspectComparison } from "@/lib/preference-comparison"

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
  psikotes: {
    available: boolean
    unlocked: boolean
    invitedAt: string | null
    priceIDR: number | null
    categories: Array<{ id: string; label: string; narratives: string[] }> | null
  }
  komparasiPreferensi: AspectComparison[]
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
  flowType?: "REFERRAL" | "TALENT_POOL"
  remainingQuota?: number
  hasGuarantee?: boolean
  connectionAddonFeeIDR?: number
  onContactUnlocked?: () => void
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

export default function NannyDetailDrawer({
  nannyProfileId,
  onClose,
  onMatchCalculated,
  flowType,
  remainingQuota = 0,
  onContactUnlocked,
  hasGuarantee = false,
  connectionAddonFeeIDR,
}: Props) {
  const [detail, setDetail] = useState<MatchDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showPayment, setShowPayment] = useState(false)
  const [calculating, setCalculating] = useState(false)
  const [unlockingPsikotes, setUnlockingPsikotes] = useState(false)
  const [psikotesError, setPsikotesError] = useState("")
  const [invitingPsikotes, setInvitingPsikotes] = useState(false)

  const fetchDetail = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/matching/detail?nannyProfileId=${nannyProfileId}`)
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setDetail(json.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data")
    } finally {
      setLoading(false)
    }
  }, [nannyProfileId])

  const calculateMatch = useCallback(async () => {
    setCalculating(true)
    setError("")
    try {
      const res = await fetch("/api/matching/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nannyProfileId }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      // Calculate endpoint now returns full data with nannyProfile
      setDetail(json.data)
      onMatchCalculated?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kalkulasi matching gagal")
    } finally {
      setCalculating(false)
      setLoading(false)
    }
  }, [nannyProfileId, onMatchCalculated])

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError("")
      try {
        const res = await fetch(`/api/matching/detail?nannyProfileId=${nannyProfileId}`)
        if (res.status === 404) {
          const json = await res.json().catch(() => ({ error: "Hasil matching tidak ditemukan" }))
          // Only auto-calculate when the match row doesn't exist yet
          if (json?.error && json.error !== "Hasil matching tidak ditemukan") {
            throw new Error(json.error)
          }
          await calculateMatch()
          return
        }
        const json = await res.json()
        if (!json.success) throw new Error(json.error)
        // Hasil sudah lewat MATCH_RESULT_STALE_DAYS — refresh sekali via AI, lalu cache lagi
        if (json.data.isStale) {
          await calculateMatch()
          return
        }
        setDetail(json.data)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Gagal memuat data")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [nannyProfileId, calculateMatch])

  function handlePaymentSuccess() {
    setShowPayment(false)
    fetchDetail()
  }

  function handleContactUnlocked() {
    onContactUnlocked?.()
    fetchDetail()
  }

  async function handleUnlockPsikotes() {
    setUnlockingPsikotes(true)
    setPsikotesError("")
    try {
      const res = await fetch("/api/payment/psikotes-addon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nannyProfileId }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      window.location.href = json.data.paymentUrl
    } catch (e) {
      setPsikotesError(e instanceof Error ? e.message : "Gagal membuat pembayaran")
      setUnlockingPsikotes(false)
    }
  }

  // Undangan Psikotes (ADR-014): satu harga, satu endpoint — kalau nanny belum pernah
  // mengerjakan Capture Work Style, pembayaran ini memicu dia mengerjakan; begitu selesai
  // Bunda otomatis dapat akses (lihat handleUnlockPsikotes), tanpa bayar kedua kali.
  async function handleInvitePsikotes() {
    setInvitingPsikotes(true)
    setPsikotesError("")
    try {
      const res = await fetch("/api/payment/psikotes-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nannyProfileId }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      window.location.href = json.data.paymentUrl
    } catch (e) {
      setPsikotesError(e instanceof Error ? e.message : "Gagal membuat pembayaran")
      setInvitingPsikotes(false)
    }
  }

  const nanny = detail?.nannyProfile
  const usia = nanny?.dateOfBirth
    ? Math.floor((Date.now() - new Date(nanny.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[55] bg-black/30"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-[60] w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden">
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
              <div className="w-8 h-8 border-[3px] border-[#5BBFB0] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-[#666666]">
                {calculating ? "Menghitung kecocokan via AI..." : "Memuat data..."}
              </p>
            </div>
          )}

          {error && !loading && !calculating && (
            <div className="p-5">
              <p className="text-[#C75D5D] text-sm">{error}</p>
              <button
                onClick={() => calculateMatch()}
                className="mt-3 text-sm text-[#5BBFB0] underline"
              >
                Coba lagi
              </button>
            </div>
          )}

          {detail && !loading && !calculating && (
            <div className="p-5 pb-24 space-y-5">
              {/* Nanny info */}
              <div className="flex items-start gap-3">
                {nanny?.profilePhotoUrl ? (
                  <Image
                    src={nanny.profilePhotoUrl}
                    alt={nanny.fullName}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                    unoptimized
                  />
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

              {/* Link profil lengkap */}
              <Link
                href={`/dashboard/parent/nanny/${nannyProfileId}`}
                className="inline-block text-sm text-[#A97CC4] font-medium hover:underline"
              >
                Lihat profil lengkap →
              </Link>

              {/* Skor */}
              {detail.adaDealbreaker ? (
                <div className="rounded-xl p-4" style={{ backgroundColor: "#FAEAEA" }}>
                  <p className="font-semibold text-[#C75D5D] mb-1">Perlu Dibicarakan — Ada Dealbreaker</p>
                  {detail.dealbreakerFlags?.map((f, i) => (
                    <p key={i} className="text-sm text-[#C75D5D]">• {f.issue}</p>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl p-4 flex items-center gap-4" style={{ backgroundColor: "#E5F6F4" }}>
                  <div className="relative flex-shrink-0" style={{ width: 88, height: 88 }}>
                    <ScoreRing
                      score={detail.skorKeseluruhan}
                      size={88}
                      strokeWidth={8}
                      color={scoreColor(detail.skorKeseluruhan)}
                      trackColor="#FFFFFF"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span
                        className="text-lg font-bold leading-none"
                        style={{ color: scoreColor(detail.skorKeseluruhan), fontFamily: "var(--font-dm-serif)" }}
                      >
                        {detail.skorKeseluruhan}%
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#5A3A7A] mb-0.5">Kecocokan Keseluruhan</p>
                    <p className="text-xs text-[#666666] mb-2">{verdictLabel(detail.skorKeseluruhan)}</p>
                    <DomainBar label="A — Kondisi Kerja" skor={detail.skorDomainA} />
                    <DomainBar label="B — Nilai & Gaya Hidup" skor={detail.skorDomainB} />
                    <DomainBar label="C — Pengalaman & Kemampuan" skor={detail.skorDomainC} />
                  </div>
                </div>
              )}

              {/* Komparasi Preferensi — perbandingan deterministik jawaban Bunda vs Nanny,
                  gratis & tidak dikunci Kuota Koneksi (lihat ADR-015). */}
              <KomparasiPreferensi aspects={detail.komparasiPreferensi} />

              {/* Psikotes AI (Layer 2 — Capture Work Style) — 4 kondisi (ADR-014):
                  1. Belum ada undangan  2. Menunggu nanny mengerjakan
                  3. Sudah selesai, belum dibuka  4. Sudah dibuka */}
              <div className="rounded-xl p-4 border" style={{ backgroundColor: "#F3EEF8", borderColor: "#E0D0F0" }}>
                <p className="font-semibold text-[#5A3A7A] mb-2">🧠 Psikotes Sikap Kerja</p>

                {detail.psikotes.unlocked ? (
                  // Kondisi 4 — narasi bahasa awam per kategori, TIDAK menampilkan kode dimensi/
                  // istilah Inggris/angka mentah ke orang tua (aturan larangan CLAUDE.md §5).
                  <div className="space-y-2">
                    {detail.psikotes.categories?.map(cat => (
                      <details key={cat.id} className="group rounded-lg" style={{ backgroundColor: "#FFFFFF" }}>
                        <summary className="cursor-pointer list-none px-3 py-2.5 flex items-center justify-between text-sm font-semibold text-[#5A3A7A]">
                          {cat.label}
                          <span className="text-[#A97CC4] text-xs group-open:rotate-180 transition-transform">▾</span>
                        </summary>
                        <div className="px-3 pb-3 space-y-2">
                          {cat.narratives.map((text, i) => (
                            <p key={i} className="text-sm text-[#666666] leading-relaxed">{text}</p>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                ) : detail.psikotes.available ? (
                  // Kondisi 3 — nanny sudah selesai (mandiri atau lewat undangan Bunda lain),
                  // Bunda ini belum bayar untuk buka hasilnya. Instan begitu bayar.
                  <>
                    <p className="text-sm text-[#666666] mb-3">
                      ✅ Nanny ini sudah menyelesaikan Tes Sikap Kerja. Buka hasilnya untuk lihat gambaran gaya kerja & kepribadiannya.
                    </p>
                    {psikotesError && <p className="text-sm text-[#C75D5D] mb-2">{psikotesError}</p>}
                    <button
                      onClick={handleUnlockPsikotes}
                      disabled={unlockingPsikotes}
                      className="w-full py-2.5 rounded-lg font-semibold text-white text-sm disabled:opacity-50 transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "#A97CC4" }}
                    >
                      {unlockingPsikotes
                        ? "Memproses..."
                        : `Lihat Hasil Psikotes — Rp ${(detail.psikotes.priceIDR ?? 0).toLocaleString("id-ID")}`}
                    </button>
                  </>
                ) : detail.psikotes.invitedAt ? (
                  // Kondisi 2 — undangan sudah dibayar, menunggu nanny mengerjakan. Tidak ada
                  // jaminan waktu (ADR-014) — copy harus jujur & tidak terkesan macet/error.
                  <>
                    <div className="inline-flex items-center gap-1.5 mb-2 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: "#FDF0DC", color: "#9A6B1E" }}>
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#D9A441" }} />
                      Menunggu Nanny Mengerjakan
                    </div>
                    <p className="text-sm text-[#666666] mb-1 leading-relaxed">
                      Undangan sudah terkirim. Nanny mengerjakan 90 pertanyaan ini sendiri di waktu luangnya — kami kirim pengingat WhatsApp otomatis ke nanny sampai selesai.
                    </p>
                    <p className="text-xs text-[#999AAA] mb-3 leading-relaxed">
                      Waktu pengerjaan tidak bisa dipastikan platform. Begitu nanny submit jawabannya, hasil langsung muncul di sini dan Bunda akan dapat notifikasi.
                    </p>
                    {detail.kontakTerbuka && nanny?.phone && (
                      <a
                        href={`https://api.whatsapp.com/send?phone=${nanny.phone.replace(/\D/g, "").replace(/^0/, "62")}&text=${encodeURIComponent(
                          `Halo ${nanny.fullName}, saya sudah kirim undangan Tes Sikap Kerja di BundaYakin. Boleh dibantu dikerjakan kalau ada waktu ya, terima kasih!`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-sm font-semibold text-[#5BBFB0] hover:underline"
                      >
                        Ingatkan sendiri via WhatsApp →
                      </a>
                    )}
                  </>
                ) : (
                  // Kondisi 1 — belum ada undangan sama sekali. Nanny juga tetap bisa mengisi
                  // mandiri gratis dari dashboard-nya sendiri (lihat CONTEXT.md § Capture Work Style).
                  <>
                    <p className="text-sm text-[#666666] mb-1 leading-relaxed">
                      Nanny ini belum mengerjakan Tes Sikap Kerja (90 pertanyaan tentang gaya kerjanya).
                    </p>
                    <p className="text-xs text-[#999AAA] mb-3 leading-relaxed">
                      Kirim undangan — begitu nanny selesai mengerjakan, Bunda otomatis bisa lihat hasilnya tanpa bayar dua kali. Nanny mengerjakan sendiri, waktunya tidak bisa dipastikan.
                    </p>
                    {psikotesError && <p className="text-sm text-[#C75D5D] mb-2">{psikotesError}</p>}
                    <button
                      onClick={handleInvitePsikotes}
                      disabled={invitingPsikotes}
                      className="w-full py-2.5 rounded-lg font-semibold text-white text-sm disabled:opacity-50 transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "#A97CC4" }}
                    >
                      {invitingPsikotes
                        ? "Memproses..."
                        : `Kirim Undangan Psikotes — Rp ${(detail.psikotes.priceIDR ?? 0).toLocaleString("id-ID")}`}
                    </button>
                  </>
                )}
              </div>

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
                          style={{ backgroundColor: "#F5F5F8" }}
                        >
                          <span className="blur-sm select-none">{detail.potensiLemah[1]}</span>
                          <p className="mt-1 text-xs text-[#999AAA]">
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
                        href={`https://wa.me/${nanny.phone.replace(/\D/g, "").replace(/^0/, "62")}`}
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

        {/* Sticky CTA — di luar scroll area agar tidak tertutup footer */}
        {detail && !loading && !calculating && !detail.kontakTerbuka && (
          <div className="flex-shrink-0 px-5 py-4 border-t" style={{ borderColor: "#E0D0F0", backgroundColor: "#fff" }}>
            {flowType === "TALENT_POOL" ? (
              <UnlockContactButton
                nannyProfileId={nannyProfileId}
                contactApiPath={`/api/nanny/${nannyProfileId}/contact`}
                flowType="TALENT_POOL"
                remainingQuota={remainingQuota}
                alreadyUnlocked={false}
                hasGuarantee={hasGuarantee}
                connectionAddonFeeIDR={connectionAddonFeeIDR}
                onUnlocked={handleContactUnlocked}
              />
            ) : (
              <button
                onClick={() => setShowPayment(true)}
                className="w-full py-4 rounded-xl font-bold text-white text-base transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#5BBFB0" }}
              >
                Buka Kontak &amp; Laporan Lengkap — Rp 100.000
              </button>
            )}
          </div>
        )}
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
