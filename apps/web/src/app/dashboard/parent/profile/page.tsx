import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import ParentProfileForm from "@/components/profile/ParentProfileForm"

export const metadata = { title: "Profil Saya — BundaYakin" }

export default async function ParentProfilePage() {
  const session = await auth()

  const profile = session?.user?.id
    ? await prisma.parentProfile.findUnique({
        where: { userId: session.user.id },
        select: { fullName: true, phone: true, city: true, district: true, address: true },
      })
    : null

  const initial = {
    fullName: profile?.fullName ?? session?.user?.name ?? "",
    phone: profile?.phone ?? "",
    city: profile?.city ?? "",
    district: profile?.district ?? "",
    address: profile?.address ?? "",
  }

  const email = session?.user?.email ?? ""
  const initials = initial.fullName
    .split(" ")
    .map(w => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?"

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-28">

      {/* Header */}
      <div className="border-b border-[#E0D0F0] pb-3 mb-5">
        <Link
          href="/dashboard/parent/settings"
          className="inline-flex items-center text-[12px] text-[#999AAA] hover:text-[#5A3A7A] mb-2 transition-colors"
        >
          ← Kembali ke pengaturan
        </Link>
        <h1 className="text-[16px] font-bold text-[#5A3A7A]">Profil saya</h1>
        <p className="text-[12px] text-[#999AAA] mt-0.5">Informasi yang digunakan untuk proses matching</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-3.5 mb-5">
        <div className="w-14 h-14 bg-[#F3EEF8] rounded-full flex items-center justify-center flex-shrink-0 border-2 border-[#E0D0F0]">
          <span className="font-bold text-[18px] text-[#5A3A7A]">{initials}</span>
        </div>
        <div>
          <p className="text-[14px] font-bold text-[#5A3A7A]">{initial.fullName || "—"}</p>
          <p className="text-[12px] text-[#999AAA]">{email}</p>
        </div>
      </div>

      {/* Email — read only */}
      <div className="bg-[#F3EEF8] border border-[#E0D0F0] rounded-[12px] px-3.5 py-2.5 mb-5 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[1px] uppercase text-[#999AAA] mb-0.5">Email</p>
          <p className="text-[13px] text-[#5A3A7A]">{email || "—"}</p>
        </div>
        <span className="text-[11px] text-[#C8B8DC] font-medium">Tidak dapat diubah</span>
      </div>

      {/* Form */}
      <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-4">
        <ParentProfileForm initial={initial} />
      </div>

    </div>
  )
}
