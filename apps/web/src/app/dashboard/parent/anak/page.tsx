import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ChildrenManager from "@/components/profile/ChildrenManager"

export const metadata = { title: "Profil Anak — BundaYakin" }

export default async function AnakPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/login")

  const profile = await prisma.parentProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      children: {
        orderBy: [{ sortOrder: "asc" }, { dateOfBirth: "asc" }],
        select: {
          id: true, name: true, dateOfBirth: true, ageGroup: true,
          gender: true, profilePhotoUrl: true, allergies: true, medicalNotes: true,
          pantangan: true, schedule: true, schoolName: true, schoolSchedule: true,
          additionalNotes: true, caraMenenangkan: true, doList: true, dontList: true, sortOrder: true,
        },
      },
    },
  })

  const children = (profile?.children ?? []).map(c => ({
    ...c,
    dateOfBirth: c.dateOfBirth.toISOString(),
  }))

  const childCount = children.length

  return (
    <div className="max-w-[480px] mx-auto px-4 pt-5 pb-28">

      {/* Header */}
      <div className="border-b border-[#E0D0F0] pb-3 mb-5">
        <h1 className="text-[16px] font-bold text-[#5A3A7A]">Profil Anak</h1>
        <p className="text-[12px] text-[#999AAA] mt-0.5">
          {childCount === 0
            ? "Tambahkan profil si kecil untuk mulai matching dengan nanny"
            : `${childCount} anak terdaftar · klik "Cari Nanny" untuk mulai matching`}
        </p>
      </div>

      {/* Info box — benefit */}
      {childCount === 0 && (
        <div className="bg-[#E5F6F4] border border-[#A8DDD8] rounded-[14px] p-4 mb-5">
          <p className="text-[12px] font-bold text-[#1E4A45] mb-2">Mengapa perlu profil anak?</p>
          <ul className="text-[12px] text-[#2C5F5A] space-y-1.5 pl-4 list-disc leading-relaxed">
            <li>Sistem matching akan mempertimbangkan usia &amp; kebutuhan si kecil</li>
            <li>Nanny baru langsung tahu alergi, rutinitas, dan aturan rumah</li>
            <li>Bunda bisa tambah lebih dari satu anak (kakak adik)</li>
          </ul>
        </div>
      )}

      {/* Children list + add button */}
      <ChildrenManager initial={children} />

      {/* Tips setelah anak terdaftar */}
      {childCount > 0 && (
        <div className="mt-5 bg-[#F3EEF8] border border-[#C8B8DC] rounded-[12px] px-4 py-3">
          <p className="text-[12px] font-bold text-[#5A3A7A] mb-1">Tips</p>
          <p className="text-[12px] text-[#666666] leading-relaxed">
            Lengkapi catatan &ldquo;do list&rdquo; dan &ldquo;don&apos;t list&rdquo; — nanny yang cocok
            akan langsung paham ekspektasi Bunda tanpa perlu dijelaskan berulang.
          </p>
        </div>
      )}

    </div>
  )
}
