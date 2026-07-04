"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
  isSubscriptionActive: boolean
}

export default function PaymentReturnBanner({ isSubscriptionActive }: Props) {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)
  const [autoRefreshed, setAutoRefreshed] = useState(false)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (isSubscriptionActive) return

    // Langganan belum aktif — webhook mungkin belum sampai, refresh otomatis sekali
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval)
          router.refresh()
          setAutoRefreshed(true)
          return 0
        }
        return c - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isSubscriptionActive, router])

  function handleManualCheck() {
    setChecking(true)
    router.refresh()
    // Reset tombol agar tidak terlihat "macet" kalau webhook masih belum sampai
    setTimeout(() => setChecking(false), 1500)
  }

  if (isSubscriptionActive) {
    return (
      <div className="bg-[#E5F6F4] border border-[#A8DDD8] rounded-[16px] p-4 mb-5 flex items-start gap-3">
        <div className="w-8 h-8 bg-[#5BBFB0] rounded-full flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#2C5F5A]">Pembayaran berhasil!</p>
          <p className="text-xs text-[#2C5F5A]/70 mt-0.5">Langganan Anda sudah aktif. Selamat menggunakan BundaYakin.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#F3EEF8] border border-[#C8B8DC] rounded-[16px] p-4 mb-5 flex items-start gap-3">
      <svg className="animate-spin w-5 h-5 text-[#A97CC4] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <div className="flex-1">
        <p className="text-sm font-semibold text-[#5A3A7A]">Pembayaran diterima, sedang diproses...</p>
        <p className="text-xs text-[#666666] mt-0.5">
          {autoRefreshed
            ? "Masih memproses. Konfirmasi biasanya masuk dalam 1–2 menit."
            : `Langganan akan aktif dalam beberapa saat. Memeriksa ulang dalam ${countdown} detik...`}
        </p>
        {/* Jaring pengaman setelah auto-refresh sekali — jangan biarkan user macet tanpa aksi (walkthrough #2 temuan #2) */}
        {autoRefreshed && (
          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={handleManualCheck}
              disabled={checking}
              className="text-xs font-semibold text-[#A97CC4] underline disabled:opacity-50"
            >
              {checking ? "Memeriksa..." : "Cek status pembayaran"}
            </button>
            <a
              href="https://wa.me/6287888180363?text=Halo%2C%20pembayaran%20langganan%20saya%20belum%20aktif%20setelah%20beberapa%20saat"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-[#A97CC4] underline"
            >
              Hubungi CS
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
