import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import NannyInviteForm from "@/components/matching/NannyInviteForm"

export const metadata = { title: "Cari Nanny — BundaYakin" }

type InvitedNanny = {
  id: string
  nannyName: string
  status: string
  updatedAt: Date
}

export default async function ParentMatchingPage() {
  const session = await auth()

  const profile = session?.user?.id
    ? await prisma.parentProfile.findUnique({
        where: { userId: session.user.id },
        select: {
          surveyCompletedAt: true,
          matchingRequests: {
            orderBy: { createdAt: "desc" },
            take: 10,
            select: {
              id: true,
              status: true,
              updatedAt: true,
              nannyProfile: { select: { fullName: true } },
            },
          },
        },
      })
    : null

  const surveyDone = !!profile?.surveyCompletedAt
  const invitedNannies: InvitedNanny[] = (profile?.matchingRequests ?? []).map(r => ({
    id: r.id,
    nannyName: r.nannyProfile?.fullName ?? "Nanny",
    status: r.status,
    updatedAt: r.updatedAt,
  }))

  const inviteCode = `BY-${session?.user?.id?.slice(-4).toUpperCase() ?? "4829"}`

  const statusLabel = (s: string) => {
    if (s === "COMPLETED" || s === "NEGOTIATING") return { label: "Sudah isi", color: "bg-[#E5F6F4] text-[#2C5F5A] border-[#A8DDD8]" }
    if (s === "PROCESSING") return { label: "Diproses", color: "bg-[#EEF2FC] text-[#5B7EC9] border-[#B5C8EF]" }
    return { label: "Menunggu", color: "bg-[#FEF0E7] text-[#A35320] border-[#F5C4A0]" }
  }

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-28">

      {/* Header */}
      <div className="border-b border-[#E0D0F0] pb-3 mb-4">
        <h1 className="text-[16px] font-bold text-[#5A3A7A]">Cocokkan dengan nanny</h1>
        <p className="text-[12px] text-[#999AAA] mt-0.5">Sudah punya kandidat? Ajak isi dari sini</p>
      </div>

      {/* Disclaimer */}
      <div className="bg-[#EEF2FC] border-l-4 border-[#5B7EC9] rounded-r-[12px] px-3.5 py-3 mb-4">
        <p className="text-[12px] font-bold text-[#5B7EC9]">Dapat nanny dari penyalur / kenalan? Tetap bisa pakai BY gratis</p>
        <p className="text-[11px] text-[#3A5A9A] mt-1 leading-relaxed">
          Gunakan fitur pencocokan dan pemantauan secara gratis tanpa kewajiban bayar ke BY. Biaya penempatan BY hanya berlaku jika deal terjadi lewat platform kami.
        </p>
        <Link
          href="/dashboard/parent/terms"
          className="inline-flex items-center mt-1.5 text-[11px] font-semibold text-[#5B7EC9] hover:underline"
        >
          Selengkapnya →
        </Link>
      </div>

      {/* CTA: cari nanny via platform */}
      <div className="bg-[#F3EEF8] border border-[#C8B8DC] rounded-[16px] p-3.5 mb-4">
        <p className="text-[12px] font-bold text-[#5A3A7A] mb-0.5">Belum punya kandidat nanny?</p>
        <p className="text-[11px] text-[#999AAA] leading-relaxed mb-2.5">
          BundaYakin punya database nanny terverifikasi. Daftarkan kebutuhan Bunda dan kami bantu carikan yang cocok.
        </p>
        <a
          href="https://wa.me/6287888180363?text=Halo%20tim%20BundaYakin%2C%20saya%20ingin%20mencari%20nanny%20lewat%20platform"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 bg-[#5A3A7A] hover:bg-[#3D2558] text-white text-[12px] font-semibold px-3.5 py-2 rounded-[10px] min-h-[36px] transition-all"
        >
          Minta bantu cari nanny →
        </a>
      </div>

      {/* Cara kerja */}
      <div className="bg-[#E5F6F4] border border-[#A8DDD8] rounded-[16px] p-3.5 mb-4">
        <p className="text-[12px] font-bold text-[#1E4A45] mb-1">Cara kerja</p>
        <p className="text-[12px] text-[#2C5F5A] leading-relaxed">
          Nanny terima link → isi preferensi → sistem cocokkan dua jawaban → laporan untuk keduanya.
        </p>
      </div>

      {/* Survey status */}
      {!surveyDone && (
        <div className="bg-[#5A3A7A] rounded-[20px] p-4 mb-4 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#A97CC4]/20 rounded-full" />
          <div className="relative z-10">
            <p className="text-[10px] font-bold tracking-[2px] uppercase text-[#A8DDD8] mb-1">Langkah pertama</p>
            <p className="text-white font-semibold text-[14px] mb-0.5">Isi preferensi Bunda dulu</p>
            <p className="text-white/60 text-[12px] mb-3">Agar sistem bisa mencocokkan jawaban kedua pihak</p>
            <Link
              href="/dashboard/parent/matching/survey"
              className="inline-flex items-center bg-[#5BBFB0] hover:bg-[#2C5F5A] text-white text-[13px] font-semibold px-4 py-2 rounded-[10px] min-h-[40px] transition-all"
            >
              Isi preferensi →
            </Link>
          </div>
        </div>
      )}

      <NannyInviteForm inviteCode={inviteCode} />

      {/* Invited nannies */}
      {invitedNannies.length > 0 && (
        <>
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#999AAA] mb-2">Nanny yang sudah diundang</p>
          <div className="space-y-2">
            {invitedNannies.map(n => {
              const st = statusLabel(n.status)
              return (
                <Link key={n.id} href={`/dashboard/parent/matching/${n.id}`}>
                  <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-3.5 flex justify-between items-center hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#F3EEF8] border-2 border-[#E0D0F0] flex items-center justify-center font-semibold text-[13px] text-[#5A3A7A]">
                        {n.nannyName.split(" ").map(w => w[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#5A3A7A]">{n.nannyName}</p>
                        <p className="text-[11px] text-[#999AAA]">
                          {n.updatedAt.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[11px] font-semibold border px-2.5 py-0.5 rounded-full ${st.color}`}>
                      {st.label}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}

    </div>
  )
}
