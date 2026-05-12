import { auth } from "@/lib/auth"

export const metadata = { title: "Bonus & Referral — BundaYakin" }

export default async function NannyReferralPage() {
  const session = await auth()
  const referralCode = `BY-REF-${session?.user?.id?.slice(-4).toUpperCase() ?? "2847"}`

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-28">

      <div className="border-b border-[#E0D0F0] pb-3 mb-4">
        <h1 className="text-[16px] font-bold text-[#5A3A7A]">Bonus &amp; referral</h1>
        <p className="text-[12px] text-[#999AAA] mt-0.5">Pantau bonus dan teman yang bergabung lewat kodemu</p>
      </div>

      {/* Stat cards */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 bg-white border border-[#E0D0F0] rounded-[14px] p-3.5">
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-1.5">Total diterima</p>
          <p className="font-[var(--font-dm-serif)] text-[20px] leading-none mb-1 text-[#5A3A7A]">Rp 75rb</p>
          <p className="text-[11px] text-[#999AAA]"><span className="text-[#5BBFB0] font-semibold">1 referral</span> berhasil</p>
        </div>
        <div className="flex-1 bg-white border border-[#E0D0F0] rounded-[14px] p-3.5">
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-1.5">Bonus bertahan</p>
          <p className="font-[var(--font-dm-serif)] text-[20px] leading-none mb-1 text-[#E07B39]">Rp 150rb</p>
          <p className="text-[11px] text-[#999AAA]">Cair di bulan ke-3</p>
        </div>
      </div>

      {/* Bonus countdown */}
      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Bonus bertahan 3 bulan</p>
      <div className="bg-[#FEF0E7] border border-[#F5C4A0] rounded-[16px] p-3.5 mb-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-[13px] font-bold text-[#A35320]">Bertahan sampai 15 Mei → Rp 150.000</p>
            <p className="text-[12px] text-[#7A4018] mt-0.5">Masih aktif bekerja di Keluarga Ria Putri</p>
          </div>
          <span className="text-[11px] font-semibold bg-[#FEF0E7] text-[#A35320] border border-[#F5C4A0] px-2.5 py-0.5 rounded-full">
            43 hari lagi
          </span>
        </div>
        <div className="bg-white rounded-full h-[7px] overflow-hidden">
          <div className="h-full rounded-full bg-[#E07B39]" style={{ width: "52%" }} />
        </div>
        <p className="text-[11px] text-[#999AAA] mt-1">47 dari 90 hari</p>
      </div>

      {/* Referral code */}
      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Kode rekomendasimu</p>
      <div className="bg-[#F3EEF8] border-2 border-dashed border-[#C8B8DC] rounded-[16px] p-4 mb-3 text-center">
        <p className="text-[11px] text-[#999AAA] mb-1">Ajak teman bergabung ke BundaYakin</p>
        <p className="font-[var(--font-dm-serif)] text-[24px] tracking-[4px] text-[#5A3A7A] my-1.5">{referralCode}</p>
        <p className="text-[11px] text-[#999AAA] mb-3 leading-relaxed">
          OT: Rp 100rb/75rb · Nanny: Rp 75rb + Rp 125rb jika bertahan 3 bln
        </p>
        <div className="flex gap-2 justify-center">
          <a
            href={`https://wa.me/?text=Gunakan%20kode%20${referralCode}%20saat%20daftar%20di%20BundaYakin`}
            target="_blank" rel="noreferrer"
            className="inline-flex items-center bg-[#A97CC4] hover:bg-[#5A3A7A] text-white font-semibold text-[12px] px-3.5 py-1.5 rounded-[8px] min-h-[36px] transition-all"
          >
            Kirim via WA
          </a>
          <button className="inline-flex items-center bg-transparent border-[1.5px] border-[#C8B8DC] text-[#666666] font-semibold text-[12px] px-3.5 py-1.5 rounded-[8px] min-h-[36px] hover:bg-[#F3EEF8] transition-all">
            Salin
          </button>
        </div>
      </div>

    </div>
  )
}
