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
  onUnlocked?: () => void
}

type ContactInfo = { phone: string | null; whatsapp: string | null }

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "unlocking" }
  | { kind: "done"; contact: ContactInfo }
  | { kind: "error"; message: string }

export default function UnlockContactButton({
  nannyProfileId,
  matchingRequestId,
  contactApiPath,
  flowType,
  remainingQuota,
  alreadyUnlocked,
  hasGuarantee = false,
  onUnlocked,
}: Props) {
  const [viaGuarantee, setViaGuarantee] = useState(false)
  const [state, setState] = useState<State>(
    alreadyUnlocked ? { kind: "loading" } : { kind: "idle" }
  )

  useEffect(() => {
    if (alreadyUnlocked) {
      void loadContact()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadContact() {
    setState({ kind: "loading" })
    try {
      const path = contactApiPath ?? `/api/matching/${matchingRequestId}/contact`
      const res = await fetch(path)
      const data = (await res.json()) as {
        success: boolean
        data?: ContactInfo
        error?: string
      }
      if (data.success && data.data) {
        setState({ kind: "done", contact: data.data })
      } else {
        setState({ kind: "error", message: data.error ?? "Gagal memuat kontak" })
      }
    } catch {
      setState({ kind: "error", message: "Terjadi kesalahan. Coba lagi." })
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

  // Kuota habis dan kontak belum terbuka — kecuali pemegang Jaminan Kecocokan (gratis)
  if (!alreadyUnlocked && remainingQuota === 0 && !hasGuarantee) {
    // TALENT_POOL hanya tersedia untuk pelanggan aktif — jadi kalau kuotanya habis,
    // "upgrade langganan" adalah jalan buntu (sudah berlangganan). Arahkan ke CS,
    // bukan ke halaman yang tidak menawarkan apa pun (walkthrough #2 temuan #3).
    const isSubscriberOutOfQuota = flowType === "TALENT_POOL"
    return (
      <div className="bg-[#5A3A7A] rounded-[16px] p-4">
        <p className="text-[13px] font-bold text-white mb-1">Kuota koneksi habis</p>
        <p className="text-[12px] text-white/70 mb-3 leading-relaxed">
          {isSubscriberOutOfQuota
            ? "Kuota Talent Pool bulan ini sudah terpakai semua. Kuota akan terisi ulang di periode berikutnya — atau hubungi CS untuk tambahan sekarang."
            : "Semua kuota koneksi bulan ini sudah terpakai. Upgrade langganan untuk mendapatkan lebih banyak koneksi."}
        </p>
        {isSubscriberOutOfQuota ? (
          <a
            href="https://wa.me/6287888180363?text=Halo%2C%20kuota%20Talent%20Pool%20saya%20sudah%20habis%2C%20apakah%20bisa%20tambah%20koneksi%3F"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white text-[13px] font-semibold px-4 py-2 rounded-[10px] min-h-[40px] transition-all"
          >
            Hubungi CS →
          </a>
        ) : (
          <Link
            href="/dashboard/parent/subscription"
            className="inline-flex items-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white text-[13px] font-semibold px-4 py-2 rounded-[10px] min-h-[40px] transition-all"
          >
            Upgrade langganan →
          </Link>
        )}
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
