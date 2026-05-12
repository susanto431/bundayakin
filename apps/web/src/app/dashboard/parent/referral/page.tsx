import { auth } from "@/lib/auth"

export const metadata = { title: "Referral — BundaYakin" }

export default async function ReferralPage() {
  const session = await auth()

  const referralCode = `BY-REF-${session?.user?.id?.slice(-4).toUpperCase() ?? "4829"}`

  // In production, fetch real referral stats from DB
  const totalEarned = 200000
  const pendingAmount = 125000

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-28">

      {/* Header */}
      <div className="border-b border-[#E0D0F0] pb-3 mb-4">
        <h1 className="text-[16px] font-bold text-[#5A3A7A]">Referral saya</h1>
        <p className="text-[12px] text-[#999AAA] mt-0.5">Pantau siapa yang bergabung lewat kode rekomendasimu</p>
      </div>

      {/* Stat cards */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 bg-white border border-[#E0D0F0] rounded-[14px] p-3.5">
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-1.5">Total diterima</p>
          <p className="font-[var(--font-dm-serif)] text-[20px] leading-none mb-1" style={{ color: "#2C5F5A" }}>
            Rp {(totalEarned / 1000).toFixed(0)}rb
          </p>
          <p className="text-[11px] text-[#999AAA]">
            <span className="text-[#5BBFB0] font-semibold">2 referral</span> berhasil
          </p>
        </div>
        <div className="flex-1 bg-white border border-[#E0D0F0] rounded-[14px] p-3.5">
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-1.5">Diproses</p>
          <p className="font-[var(--font-dm-serif)] text-[20px] leading-none mb-1 text-[#E07B39]">
            Rp {(pendingAmount / 1000).toFixed(0)}rb
          </p>
          <p className="text-[11px] text-[#999AAA]">Menunggu 3 bln</p>
        </div>
      </div>

      {/* Referred parents */}
      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Merekomendasikan orang tua</p>
      <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-3.5 mb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#E5F6F4] border-2 border-[#A8DDD8] flex items-center justify-center font-semibold text-[12px] text-[#2C5F5A]">
              BH
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#5A3A7A]">Bu Hana (orang tua)</p>
              <p className="text-[11px] text-[#999AAA]">Daftar lewat kodemu · deal 10 Mei</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold bg-[#E5F6F4] text-[#2C5F5A] border border-[#A8DDD8] px-2.5 py-0.5 rounded-full">
            Fee masuk
          </span>
        </div>
        <p className="text-[12px] font-bold text-[#2C5F5A] mt-2.5">+ Rp 100.000 sudah ditransfer ke rekeningmu</p>
      </div>

      {/* Referred nannies */}
      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Merekomendasikan nanny</p>
      <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-3.5 mb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#F3EEF8] border-2 border-[#E0D0F0] flex items-center justify-center font-semibold text-[12px] text-[#5A3A7A]">
              SD
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#5A3A7A]">Sus Dewi (nanny)</p>
              <p className="text-[11px] text-[#999AAA]">Dapat kerja via BY · mulai 1 Mar 2026</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold bg-[#FEF0E7] text-[#A35320] border border-[#F5C4A0] px-2.5 py-0.5 rounded-full">
            Menunggu bln ke-3
          </span>
        </div>
        <div className="mt-2.5">
          <p className="text-[12px] text-[#2C5F5A] font-semibold">+ Rp 75.000 sudah cair (tahap 1)</p>
          <p className="text-[12px] text-[#999AAA] mt-0.5">Tahap 2: Rp 125.000 cair 1 Jun jika Sus masih bekerja</p>
          <div className="bg-[#F3EEF8] rounded-full h-[7px] overflow-hidden mt-2">
            <div className="h-full rounded-full bg-[#E07B39] transition-all" style={{ width: "65%" }} />
          </div>
          <p className="text-[11px] text-[#999AAA] mt-1">65 hari dari 90 hari</p>
        </div>
      </div>

      {/* Referral code */}
      <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Kode rekomendasimu</p>
      <div className="bg-[#F3EEF8] border-2 border-dashed border-[#C8B8DC] rounded-[16px] p-4 mb-3 text-center">
        <p className="text-[11px] text-[#999AAA] mb-1">Bagikan ke siapa saja — untuk orang tua maupun nanny</p>
        <p className="font-[var(--font-dm-serif)] text-[24px] tracking-[4px] text-[#5A3A7A] my-1.5">{referralCode}</p>
        <p className="text-[11px] text-[#999AAA] mb-3 leading-relaxed">
          OT: Rp 100rb (jangka panjang) / Rp 75rb (temporer)<br />
          Nanny: Rp 75rb saat deal + Rp 125rb jika bertahan 3 bln
        </p>
        <div className="flex gap-2 justify-center">
          <a
            href={`https://wa.me/?text=Gunakan%20kode%20${referralCode}%20saat%20daftar%20di%20BundaYakin`}
            target="_blank" rel="noreferrer"
            className="inline-flex items-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[12px] px-3.5 py-1.5 rounded-[8px] min-h-[36px] transition-all"
          >
            Kirim via WA
          </a>
          <button className="inline-flex items-center bg-transparent border-[1.5px] border-[#C8B8DC] text-[#666666] font-semibold text-[12px] px-3.5 py-1.5 rounded-[8px] min-h-[36px] hover:bg-[#F3EEF8] transition-all">
            Salin kode
          </button>
        </div>
      </div>

      <div className="text-center">
        <button className="text-[12px] text-[#5B7EC9] font-semibold">
          Lihat syarat &amp; ketentuan referral →
        </button>
      </div>

    </div>
  )
}
