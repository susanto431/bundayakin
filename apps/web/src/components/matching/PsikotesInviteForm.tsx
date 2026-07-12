"use client"

import { useState } from "react"

type Props = {
  priceIDR: number
}

const PSIKOTES_INVITE_ENABLED = true

function toInternationalPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.startsWith("08")) return "62" + digits.slice(1)
  if (digits.startsWith("628")) return digits
  if (digits.startsWith("8")) return "62" + digits
  return digits
}

// Form undangan Psikotes Sikap Kerja untuk nanny yang BELUM terdaftar di BundaYakin
// (ADR-014) — sengaja dipisah dari NannyInviteForm (undangan Tes Kecocokan/Flow A) supaya
// Bunda tidak salah kirim undangan yang salah ke nanny yang salah tujuan.
export default function PsikotesInviteForm({ priceIDR }: Props) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const canSend = name.trim().length > 0 && phone.trim().length > 0 && PSIKOTES_INVITE_ENABLED

  async function handleSend() {
    if (!canSend || loading) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/payment/psikotes-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nannyName: name.trim(), nannyPhone: toInternationalPhone(phone) }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      window.location.href = json.data.paymentUrl
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal membuat pembayaran")
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#F3EEF8] border border-[#E0D0F0] rounded-[16px] p-3.5">
      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#5A3A7A] mb-1">
        Undangan Psikotes · Rp {priceIDR.toLocaleString("id-ID")}
      </p>
      <p className="text-[13px] font-bold text-[#5A3A7A] mb-0.5">Kenal calon nanny di luar BundaYakin?</p>
      <p className="text-[12px] text-[#999AAA] leading-relaxed mb-3">
        Misalnya ART langganan keluarga atau kenalan dari saudara — kirim Psikotes Karakter Kerja Nanny langsung ke dia, walau belum terdaftar di BundaYakin. Bukan Tes Kecocokan (itu di atas — beda tujuan).
      </p>

      <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">Nama calon nanny</label>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Siti Rahayu"
        disabled={!PSIKOTES_INVITE_ENABLED}
        className="w-full px-3.5 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[48px] focus:border-[#A97CC4] focus:ring-2 focus:ring-[#A97CC4]/15 placeholder:text-[#999AAA] outline-none transition-all mb-3 disabled:bg-[#F5F5F8] disabled:cursor-not-allowed"
      />
      <label className="block text-[13px] font-semibold text-[#5A3A7A] mb-1.5">Nomor HP calon nanny</label>
      <input
        type="tel"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        placeholder="0812 3456 7890"
        disabled={!PSIKOTES_INVITE_ENABLED}
        className="w-full px-3.5 py-2.5 text-[14px] text-[#5A3A7A] bg-white border-[1.5px] border-[#C8B8DC] rounded-[10px] min-h-[48px] focus:border-[#A97CC4] focus:ring-2 focus:ring-[#A97CC4]/15 placeholder:text-[#999AAA] outline-none transition-all mb-1 disabled:bg-[#F5F5F8] disabled:cursor-not-allowed"
      />
      <p className="text-[11px] text-[#999AAA] mb-3">Nomor ini yang kami pakai untuk kirim link Psikotes Karakter Kerja Nanny & pengingat WhatsApp.</p>

      {error && <p className="text-[12px] text-[#C75D5D] mb-2">{error}</p>}

      <button
        onClick={handleSend}
        disabled={!canSend || loading}
        className="w-full flex items-center justify-center bg-[#A97CC4] hover:opacity-90 disabled:bg-[#C8B8DC] disabled:cursor-not-allowed text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] transition-all"
      >
        {loading
          ? "Memproses..."
          : PSIKOTES_INVITE_ENABLED
            ? `Bayar & Kirim Undangan — Rp ${priceIDR.toLocaleString("id-ID")}`
            : "Segera Hadir"}
      </button>
      {!PSIKOTES_INVITE_ENABLED ? (
        <p className="text-[11px] text-[#999AAA] text-center mt-1.5">Fitur ini sedang disiapkan, belum bisa dipakai.</p>
      ) : !canSend && !loading ? (
        <p className="text-[11px] text-[#999AAA] text-center mt-1.5">Isi nama dan nomor HP calon nanny terlebih dahulu</p>
      ) : null}
      <p className="text-[11px] text-[#999AAA] text-center mt-2 leading-relaxed">
        Setelah dibayar, dia akan terdaftar otomatis di BundaYakin dan menerima link Psikotes Karakter Kerja Nanny via WhatsApp & email. Waktu pengerjaan tidak dijamin — Bunda otomatis dapat akses hasil begitu dia selesai.
      </p>
    </div>
  )
}
