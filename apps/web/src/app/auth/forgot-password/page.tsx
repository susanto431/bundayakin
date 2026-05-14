"use client"

import { useState } from "react"
import Link from "next/link"

const ADMIN_WA = "6287888180363"

function BYLogo() {
  return (
    <svg width="56" height="56" viewBox="0 0 60 60" aria-hidden="true">
      <circle cx="22" cy="28" r="20" fill="#A97CC4" />
      <circle cx="38" cy="28" r="20" fill="#5BBFB0" />
      <circle cx="30" cy="20" r="9" fill="#fff" />
      <ellipse cx="30" cy="36" rx="12" ry="8" fill="#fff" opacity=".9" />
    </svg>
  )
}

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("")

  const waMessage = identifier
    ? `Halo, saya lupa kata sandi akun BundaYakin saya. Nomor HP/email saya: ${identifier}. Mohon bantu reset kata sandi. Terima kasih.`
    : "Halo, saya lupa kata sandi akun BundaYakin saya. Mohon bantu reset kata sandi. Terima kasih."

  const waUrl = `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(waMessage)}`

  return (
    <main className="min-h-screen bg-[#FDFBFF] font-[var(--font-jakarta)]">
      <div className="max-w-[480px] mx-auto px-4 py-10">

        <div className="flex flex-col items-center mb-8">
          <BYLogo />
          <p className="font-[var(--font-dm-serif)] text-[24px] text-[#5A3A7A] mt-2">BundaYakin</p>
          <p className="text-[11px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mt-0.5">Online Nanny Assessment</p>
        </div>

        <h1 className="font-[var(--font-dm-serif)] text-[20px] text-[#5A3A7A] mb-1">Lupa kata sandi?</h1>
        <p className="text-[13px] text-[#666666] leading-relaxed mb-6">
          Reset kata sandi dilakukan melalui WhatsApp — tim BundaYakin akan membantu Anda dalam hitungan menit.
        </p>

        <div className="mb-4">
          <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">
            Nomor HP atau email akun Anda <span className="text-[#999AAA] font-normal">(opsional)</span>
          </label>
          <input
            type="text"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            placeholder="0812... atau email@..."
            className="w-full px-3.5 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[48px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/15 placeholder:text-[#999AAA] outline-none transition-all"
          />
          <p className="text-[11px] text-[#999AAA] mt-1.5">
            Isi agar pesan ke admin sudah terisi otomatis — mempercepat proses reset.
          </p>
        </div>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1DA851] text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] mb-4 transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.554 4.103 1.523 5.824L.057 23.857a.75.75 0 00.916.916l6.033-1.466A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.693-.497-5.242-1.369l-.376-.218-3.9.948.967-3.793-.236-.389A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          </svg>
          Hubungi Admin via WhatsApp
        </a>

        <div className="bg-[#EEF2FC] border-l-4 border-[#5B7EC9] rounded-r-[12px] px-3.5 py-3 mb-6">
          <div className="text-[12px] font-bold text-[#5B7EC9] mb-1">Cara reset kata sandi</div>
          <ol className="text-[12px] text-[#3A5A9A] leading-relaxed list-decimal pl-4 space-y-1">
            <li>Klik tombol di atas untuk buka WhatsApp</li>
            <li>Kirim pesan — tim kami aktif setiap hari</li>
            <li>Kata sandi baru akan dikirim melalui WA</li>
            <li>Masuk dan ganti kata sandi di Pengaturan</li>
          </ol>
        </div>

        <div className="border-t border-[#E0D0F0] mb-4" />

        <Link
          href="/auth/login"
          className="flex items-center justify-center w-full bg-transparent border-[1.5px] border-[#C8B8DC] hover:bg-[#F3EEF8] text-[#666666] font-semibold text-[14px] min-h-[48px] rounded-[10px] transition-all"
        >
          ← Kembali ke halaman masuk
        </Link>

      </div>
    </main>
  )
}
