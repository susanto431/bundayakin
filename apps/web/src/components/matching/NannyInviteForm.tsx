"use client"

import { useState } from "react"
import { CopyButton } from "@/components/settings/CopyButton"

function toInternationalPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.startsWith("08")) return "62" + digits.slice(1)
  if (digits.startsWith("628")) return digits
  if (digits.startsWith("8")) return "62" + digits
  return digits
}

export default function NannyInviteForm({ inviteCode }: { inviteCode: string }) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")

  function handleSend() {
    const intlPhone = toInternationalPhone(phone)
    const msg = encodeURIComponent(
      `Halo ${name || "Kak"}, saya mengundang Anda untuk bergabung di BundaYakin. ` +
      `Gunakan kode undangan *${inviteCode}* saat mendaftar agar kita langsung terhubung. ` +
      `Daftar di: https://bundayakin.com/auth/register/nanny`
    )
    const url = phone
      ? `https://api.whatsapp.com/send?phone=${intlPhone}&text=${msg}`
      : `https://api.whatsapp.com/send?text=${msg}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <>
      {/* Direct invite form */}
      <div className="mb-4">
        <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">Nama nanny</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Siti Rahayu"
          className="w-full px-3.5 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[48px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/15 placeholder:text-[#999AAA] outline-none transition-all mb-3"
        />
        <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">Nomor HP nanny</label>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="0812..."
          className="w-full px-3.5 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[48px] focus:border-[#5BBFB0] focus:ring-2 focus:ring-[#5BBFB0]/15 placeholder:text-[#999AAA] outline-none transition-all mb-3"
        />
        <button
          onClick={handleSend}
          className="w-full flex items-center justify-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] transition-all"
        >
          Kirim link via WhatsApp
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-[#E0D0F0] my-4" />

      {/* Invite code */}
      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Atau bagikan kode undangan keluarga</p>
      <div className="bg-[#F3EEF8] border-2 border-dashed border-[#C8B8DC] rounded-[16px] p-4 mb-4 text-center">
        <p className="text-[11px] text-[#999AAA] mb-1">Kode undangan (untuk matching)</p>
        <p className="font-[var(--font-dm-serif)] text-[24px] tracking-[4px] text-[#5A3A7A] my-1.5">{inviteCode}</p>
        <p className="text-[11px] text-[#999AAA] mb-1 leading-relaxed">
          Nanny / penyalur input kode ini saat daftar — langsung terhubung ke profil Bunda.
        </p>
        <p className="text-[11px] text-[#999AAA] italic mb-3">
          Berbeda dari kode rekomendasi BY-REF-XXXX untuk fee referral.
        </p>
        <div className="flex gap-2 justify-center">
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
              `Gunakan kode undangan *${inviteCode}* saat daftar di BundaYakin: https://bundayakin.com/auth/register/nanny`
            )}`}
            target="_blank" rel="noreferrer"
            className="inline-flex items-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[12px] px-3.5 py-1.5 rounded-[8px] min-h-[36px] transition-all"
          >
            Kirim via WA
          </a>
          <CopyButton text={inviteCode} />
        </div>
      </div>
    </>
  )
}
