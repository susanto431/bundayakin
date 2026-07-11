"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type Props = {
  nannyProfileId: string
  matchingRequestId?: string
  contactApiPath?: string
  flowType: "REFERRAL" | "TALENT_POOL"
  remainingQuota: number
  alreadyUnlocked: boolean
  hasGuarantee?: boolean // Jaminan Kecocokan aktif → unlock gratis tanpa kuota
  connectionAddonFeeIDR?: number // Referral: harga add-on setelah kuota referral habis; default 100rb kalau tidak dipass
  talentPoolContactFeeIDR?: number // Talent Pool: harga buka kontak, SELALU berlaku (tidak ada jalur gratis); default 250rb kalau tidak dipass
  onUnlocked?: () => void
}

type ContactInfo = { phone: string | null; whatsapp: string | null }

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "unlocking" }
  | { kind: "buying" } // membuat invoice Connection Add-on, akan redirect ke Mayar
  | { kind: "payment_pending" } // kembali dari Mayar, webhook belum terkonfirmasi
  | { kind: "done"; contact: ContactInfo }
  | { kind: "error"; message: string }

const POLL_ATTEMPTS = 5
const POLL_INTERVAL_MS = 2500

export default function UnlockContactButton({
  nannyProfileId,
  matchingRequestId,
  contactApiPath,
  flowType,
  remainingQuota,
  alreadyUnlocked,
  hasGuarantee = false,
  connectionAddonFeeIDR = 100_000,
  talentPoolContactFeeIDR = 250_000,
  onUnlocked,
}: Props) {
  const [viaGuarantee, setViaGuarantee] = useState(false)
  const [buyError, setBuyError] = useState<string | null>(null)
  const [state, setState] = useState<State>(
    alreadyUnlocked ? { kind: "loading" } : { kind: "idle" }
  )

  useEffect(() => {
    if (alreadyUnlocked) {
      void loadContact()
      return
    }
    // Kembali dari pembayaran Connection Add-on — webhook mungkin belum sampai, poll beberapa kali.
    // Dibaca langsung dari window.location (bukan useSearchParams) agar tidak perlu Suspense boundary.
    const params = new URLSearchParams(window.location.search)
    if (params.get("connection") === "success") {
      void pollAfterPayment()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function tryFetchContact(): Promise<ContactInfo | null> {
    const path = contactApiPath ?? `/api/matching/${matchingRequestId}/contact`
    const res = await fetch(path)
    const data = (await res.json()) as { success: boolean; data?: ContactInfo; error?: string }
    return data.success && data.data ? data.data : null
  }

  async function loadContact() {
    setState({ kind: "loading" })
    try {
      const contact = await tryFetchContact()
      if (contact) {
        setState({ kind: "done", contact })
      } else {
        setState({ kind: "error", message: "Gagal memuat kontak" })
      }
    } catch {
      setState({ kind: "error", message: "Terjadi kesalahan. Coba lagi." })
    }
  }

  async function pollAfterPayment() {
    setState({ kind: "payment_pending" })
    for (let i = 0; i < POLL_ATTEMPTS; i++) {
      await new Promise(r => setTimeout(r, POLL_INTERVAL_MS))
      try {
        const contact = await tryFetchContact()
        if (contact) {
          setState({ kind: "done", contact })
          return
        }
      } catch {
        // coba lagi di percobaan berikutnya
      }
    }
    // Tetap di "payment_pending" — tombol cek manual tersedia di render-nya
  }

  async function handleBuyAddon() {
    setState({ kind: "buying" })
    setBuyError(null)
    try {
      const res = await fetch("/api/payment/connection-addon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nannyProfileId, flowType, matchingRequestId }),
      })
      const data = (await res.json()) as { success: boolean; data?: { paymentUrl?: string }; error?: string }
      if (data.success && data.data?.paymentUrl) {
        window.location.href = data.data.paymentUrl
      } else {
        setBuyError(data.error ?? "Gagal membuat pembayaran")
        setState({ kind: "idle" })
      }
    } catch {
      setBuyError("Terjadi kesalahan. Coba lagi.")
      setState({ kind: "idle" })
    }
  }

  async function handleUnlock() {
    if (state.kind === "unlocking") return
    setState({ kind: "unlocking" })
    try {
      const res = await fetch("/api/matching/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nannyProfileId, flowType }),
      })
      const data = (await res.json()) as { success: boolean; error?: string; data?: { viaGuarantee?: boolean } }
      if (!data.success) {
        setState({ kind: "error", message: data.error ?? "Gagal membuka kontak" })
        return
      }
      if (data.data?.viaGuarantee) setViaGuarantee(true)
      onUnlocked?.()
      await loadContact()
    } catch {
      setState({ kind: "error", message: "Terjadi kesalahan. Coba lagi." })
    }
  }

  // Talent Pool: nomor WA nanny SELALU berbayar per kontak, tidak ada jalur gratis
  // lewat kuota (keputusan Kartika, Juli 2026) — jadi gate ini selalu tampil untuk
  // TALENT_POOL. Referral: gate hanya tampil setelah kuota bulanannya habis.
  // Keduanya lewati gate ini kalau pemegang Jaminan Kecocokan (unlock gratis).
  const isTalentPool = flowType === "TALENT_POOL"
  const feeIDR = isTalentPool ? talentPoolContactFeeIDR : connectionAddonFeeIDR
  if (!alreadyUnlocked && !hasGuarantee && state.kind !== "buying" && (isTalentPool || remainingQuota === 0)) {
    return (
      <div className="bg-[#5A3A7A] rounded-[16px] p-4">
        <p className="text-[13px] font-bold text-white mb-1">
          {isTalentPool ? "Buka nomor WhatsApp nanny" : "Kuota koneksi habis"}
        </p>
        <p className="text-[12px] text-white/70 mb-3 leading-relaxed">
          {isTalentPool
            ? "Data kontak nanny di AI Talent Pool tidak dibagikan gratis — buka nomor WhatsApp-nya dengan sekali bayar per nanny."
            : "Semua kuota koneksi bulan ini sudah terpakai. Upgrade langganan untuk kuota lebih banyak, atau buka kontak ini saja dengan biaya tambahan."}
        </p>
        {buyError && <p className="text-[12px] text-red-300 mb-2" role="alert">{buyError}</p>}
        <div className="flex flex-col gap-2">
          {!isTalentPool && (
            <Link
              href="/dashboard/parent/subscription"
              className="inline-flex items-center justify-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white text-[13px] font-semibold px-4 py-2 rounded-[10px] min-h-[40px] transition-all"
            >
              Upgrade langganan →
            </Link>
          )}
          <button
            type="button"
            onClick={handleBuyAddon}
            className={`inline-flex items-center justify-center text-[13px] font-semibold px-4 py-2 rounded-[10px] min-h-[40px] transition-all ${
              isTalentPool
                ? "bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white"
                : "bg-transparent border-[1.5px] border-white/40 text-white hover:bg-white/10"
            }`}
          >
            Bayar Rp {feeIDR.toLocaleString("id-ID")} — buka kontak ini →
          </button>
        </div>
      </div>
    )
  }

  if (state.kind === "buying") {
    return (
      <div className="w-full flex items-center justify-center gap-2 bg-[#5A3A7A] text-white font-semibold text-[14px] min-h-[48px] rounded-[10px]">
        <Spinner />
        Menyiapkan pembayaran...
      </div>
    )
  }

  if (state.kind === "payment_pending") {
    return (
      <div className="bg-[#F3EEF8] border border-[#C8B8DC] rounded-[16px] p-4 flex items-start gap-3">
        <Spinner />
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-[#5A3A7A]">Pembayaran diterima, sedang diproses...</p>
          <p className="text-[12px] text-[#666666] mt-0.5 mb-2">Kontak akan terbuka otomatis dalam beberapa saat.</p>
          <button
            type="button"
            onClick={async () => {
              const contact = await tryFetchContact().catch(() => null)
              if (contact) setState({ kind: "done", contact })
              // Kalau belum, tetap di "payment_pending" — tidak dianggap gagal
            }}
            className="text-[12px] font-semibold text-[#A97CC4] underline"
          >
            Cek status pembayaran
          </button>
        </div>
      </div>
    )
  }

  if (state.kind === "loading") {
    return <div className="h-[88px] bg-[#F3EEF8] rounded-[16px] animate-pulse" />
  }

  if (state.kind === "done") {
    const { contact } = state
    const waMessage = encodeURIComponent(
      "Halo Sus, saya dari BundaYakin. Boleh ngobrol sebentar soal posisi nanny? 🙏"
    )
    return (
      <div className="bg-[#E5F6F4] border border-[#A8DDD8] rounded-[16px] p-4">
        <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#2C5F5A] mb-3">
          Kontak nanny
        </p>
        {viaGuarantee && (
          <p className="text-[11px] font-semibold bg-white text-[#2C5F5A] border border-[#A8DDD8] px-2.5 py-1 rounded-full inline-block mb-2.5">
            Gratis — Jaminan Kecocokan · kuota tidak terpotong
          </p>
        )}
        <div className="space-y-2.5">
          {contact.phone && (
            <div className="flex items-center gap-2.5">
              <span className="text-[12px] text-[#666666] w-[60px] flex-shrink-0">Telepon</span>
              <a
                href={`tel:${contact.phone}`}
                className="text-[14px] font-semibold text-[#2C5F5A] hover:underline"
              >
                {contact.phone}
              </a>
            </div>
          )}
          {contact.whatsapp && (
            <a
              href={`https://wa.me/${contact.whatsapp}?text=${waMessage}`}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] transition-all"
            >
              <WhatsAppIcon />
              Hubungi via WhatsApp
            </a>
          )}
          {!contact.phone && !contact.whatsapp && (
            <p className="text-[13px] text-[#999AAA]">Nanny belum mengisi nomor kontak.</p>
          )}
        </div>
      </div>
    )
  }

  if (state.kind === "error") {
    return (
      <div className="bg-[#FEF0E7] border border-[#F5C4A0] rounded-[16px] p-3.5">
        <p className="text-[12px] font-semibold text-[#A35320] mb-0.5">Gagal memuat kontak</p>
        <p className="text-[12px] text-[#7A4018]">{state.message}</p>
      </div>
    )
  }

  // idle or unlocking — show the unlock button
  const isUnlocking = state.kind === "unlocking"
  const quotaLabel = flowType === "REFERRAL" ? "referral" : "talent pool"

  return (
    <div>
      <button
        type="button"
        onClick={handleUnlock}
        disabled={isUnlocking}
        className="w-full flex items-center justify-center gap-2 bg-[#5A3A7A] hover:bg-[#3D2558] disabled:bg-[#C8B8DC] text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] transition-all"
      >
        {isUnlocking ? (
          <>
            <Spinner />
            Membuka kontak...
          </>
        ) : (
          <>
            <LockIcon />
            {hasGuarantee
              ? "Buka kontak — Gratis (Jaminan Kecocokan)"
              : `Buka kontak · Pakai kuota ${quotaLabel} (sisa ${remainingQuota}×)`}
          </>
        )}
      </button>
    </div>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}
