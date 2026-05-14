import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function LandingPage() {
  const session = await auth()
  if (session?.user?.role === "PARENT") redirect("/dashboard/parent")
  if (session?.user?.role === "NANNY") redirect("/dashboard/nanny")

  return (
    <main className="min-h-screen bg-[#FDFBFF] font-[var(--font-jakarta)]">
      <div className="max-w-[480px] mx-auto px-4 py-6">

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-5">
          <svg width="44" height="44" viewBox="0 0 60 60" aria-hidden="true">
            <circle cx="22" cy="28" r="20" fill="#A97CC4" />
            <circle cx="38" cy="28" r="20" fill="#5BBFB0" />
            <circle cx="30" cy="20" r="9" fill="#fff" />
            <ellipse cx="30" cy="36" rx="12" ry="8" fill="#fff" opacity=".9" />
          </svg>
          <div>
            <div className="font-[var(--font-dm-serif)] text-xl text-[#5A3A7A] leading-none">BundaYakin</div>
            <div className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mt-0.5">Online Nanny Assessment</div>
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 bg-[#E5F6F4] text-[#2C5F5A] text-[11px] font-semibold px-2.5 py-1 rounded-full border border-[#A8DDD8] mb-3">
          <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#5BBFB0" /></svg>
          Kecocokan berbasis psikologi
        </div>

        {/* Hero */}
        <h1 className="font-[var(--font-dm-serif)] text-[22px] text-[#5A3A7A] leading-[1.25] mb-2">
          Nanny yang cocok bukan kebetulan — bisa diukur.
        </h1>
        <p className="text-[13px] text-[#666666] leading-relaxed mb-5">
          BundaYakin mencocokkan nanny dan keluarga berdasarkan nilai, kebiasaan, dan kebutuhan nyata — bukan sekadar pengalaman di atas kertas.
        </p>

        {/* Pilih cara pakai */}
        <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-3">Pilih cara pakai</p>

        {/* Paket gratis */}
        <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-3.5 mb-2">
          <div className="flex justify-between items-center mb-1.5">
            <div className="text-[14px] font-bold text-[#5A3A7A]">Coba dulu — gratis</div>
            <div className="font-[var(--font-dm-serif)] text-[18px] text-[#999AAA]">Rp 0</div>
          </div>
          <ul className="text-[12px] text-[#999AAA] pl-4 leading-[1.8] list-disc">
            <li>3 jatah pencocokan gratis per bulan</li>
            <li>Profil anak tersimpan</li>
            <li>Lihat skor kecocokan (identitas nanny belum terlihat)</li>
          </ul>
        </div>

        {/* Paket berlangganan */}
        <div className="bg-[#E5F6F4] border border-[#A8DDD8] rounded-[16px] p-3.5 mb-2">
          <div className="flex justify-between items-center mb-1">
            <div className="text-[14px] font-bold text-[#1E4A45]">Berlangganan</div>
            <span className="text-[11px] font-semibold bg-[#E5F6F4] text-[#2C5F5A] border border-[#A8DDD8] px-2.5 py-0.5 rounded-full">Paling worth it</span>
          </div>
          <div className="font-[var(--font-dm-serif)] text-[22px] text-[#2C5F5A] mb-0.5">
            Rp 500.000<span className="text-[13px] font-normal text-[#999AAA] font-[var(--font-jakarta)]"> / tahun</span>
          </div>
          <div className="text-[11px] text-[#2C5F5A] mb-2">≈ Rp 42.000/bulan · all-in</div>
          <ul className="text-[12px] text-[#1E4A45] pl-4 leading-[1.8] list-disc">
            <li>Pencocokan nanny sepuasnya</li>
            <li>Pantau nanny lewat pemantauan otomatis tiap bulan</li>
            <li>Catatan anak tersimpan — tidak mulai dari nol saat ganti nanny</li>
            <li>Notifikasi langsung via WA</li>
          </ul>
        </div>

        {/* Bayar saat perlu */}
        <div className="bg-[#FEF0E7] border border-[#F5C4A0] rounded-[16px] p-3.5 mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <div className="text-[14px] font-bold text-[#A35320]">Bayar saat perlu</div>
            <span className="text-[11px] font-semibold bg-[#FEF0E7] text-[#A35320] border border-[#F5C4A0] px-2.5 py-0.5 rounded-full">Pilih yang dibutuhkan</span>
          </div>
          <ul className="text-[12px] text-[#7A4018] pl-4 leading-[1.8] list-disc">
            <li>Lihat identitas nanny yang cocok → <strong>Rp 100.000</strong>/nanny</li>
            <li>Tes kepribadian &amp; sikap kerja → <strong>Rp 300.000</strong>/nanny</li>
            <li>Penilaian langsung psikolog → <strong>Rp 1.000.000</strong>/sesi</li>
          </ul>
        </div>

        {/* Placement fee alert */}
        <div className="bg-[#EEF2FC] border-l-4 border-[#5B7EC9] rounded-r-[12px] px-3.5 py-3 mb-4">
          <div className="text-[12px] font-bold text-[#5B7EC9] mb-1">Biaya penempatan nanny</div>
          <div className="text-[11px] text-[#3A5A9A] leading-relaxed">
            Jika nanny deal lewat BY: Rp 1.200.000 (jangka panjang) atau Rp 600.000 (temporer). Termasuk bonus untuk nanny yang bertahan dan fee untuk referrer.{" "}
            <Link href="/pricing" className="text-[#5B7EC9] font-semibold hover:underline">Selengkapnya →</Link>
          </div>
        </div>

        {/* CTAs */}
        <Link
          href="/auth/register/parent"
          className="flex items-center justify-center w-full bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white font-semibold text-[14px] min-h-[48px] rounded-[10px] mb-2 transition-all"
        >
          Mulai gratis — daftar sebagai orang tua
        </Link>
        <Link
          href="/auth/register/nanny"
          className="flex items-center justify-center w-full bg-transparent border-[1.5px] border-[#C8B8DC] hover:bg-[#F3EEF8] text-[#666666] font-semibold text-[14px] min-h-[48px] rounded-[10px] mb-4 transition-all"
        >
          Saya nanny — daftar gratis
        </Link>

        <div className="text-center text-[12px] text-[#999AAA]">
          Sudah punya akun?{" "}
          <Link href="/auth/login" className="text-[#5BBFB0] font-semibold">Masuk di sini</Link>
        </div>

      </div>
    </main>
  )
}
