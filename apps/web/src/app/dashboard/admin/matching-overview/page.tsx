import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const metadata = { title: "Admin — Semua Data Matching" }

function ScoreBadge({ skor, dealbreaker }: { skor: number; dealbreaker: boolean }) {
  if (dealbreaker || skor === 0) {
    return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500">0% ❌</span>
  }
  let bg = "#FAEAEA"
  let color = "#C75D5D"
  if (skor >= 85) { bg = "#E5F6F4"; color = "#2C5F5A" }
  else if (skor >= 70) { bg = "#E5F6F4"; color = "#5BBFB0" }
  else if (skor >= 55) { bg = "#FEF0E7"; color = "#E07B39" }

  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: bg, color }}>
      {skor}%
    </span>
  )
}

export default async function AdminMatchingOverviewPage() {
  const session = await auth()
  if (!session?.user?.canSwitchRoles && session?.user?.role !== "ADMIN") {
    return <p className="p-4 text-red-500">Akses ditolak</p>
  }

  // Ambil semua MatchResult dengan data parent + nanny
  const results = await prisma.matchResult.findMany({
    include: {
      parentProfile: {
        select: {
          fullName: true,
          children: { select: { name: true }, orderBy: { sortOrder: "asc" }, take: 3 },
        },
      },
      nannyProfile: {
        select: {
          fullName: true,
          city: true,
          yearsOfExperience: true,
        },
      },
    },
    orderBy: [{ parentProfile: { fullName: "asc" } }, { skorKeseluruhan: "desc" }],
  })

  // Kelompokkan per parent
  const byParent = results.reduce<Record<string, typeof results>>((acc, r) => {
    const key = r.parentProfileId
    if (!acc[key]) acc[key] = []
    acc[key].push(r)
    return acc
  }, {})

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#5A3A7A]">Semua Data Matching</h1>
        <p className="text-sm text-[#666666] mt-1">
          {results.length} kombinasi · {Object.keys(byParent).length} orang tua · data dari MatchResult cache
        </p>
      </div>

      {Object.entries(byParent).map(([, parentResults]) => {
        const parent = parentResults[0].parentProfile
        const childNames = parent.children.map(c => c.name).join(", ")

        return (
          <div key={parentResults[0].parentProfileId} className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: "#A97CC4" }}>
                {parent.fullName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-[#5A3A7A] text-sm">{parent.fullName}</p>
                {childNames && <p className="text-xs text-[#999AAA]">Anak: {childNames}</p>}
              </div>
            </div>

            <div className="space-y-2 ml-10">
              {parentResults.map(r => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-xl px-4 py-3 bg-white border"
                  style={{ borderColor: "#E0D0F0" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: "#5BBFB0" }}>
                      {r.nannyProfile.fullName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-[#5A3A7A] text-sm">{r.nannyProfile.fullName}</p>
                      <p className="text-xs text-[#999AAA]">
                        {r.nannyProfile.city} · {r.nannyProfile.yearsOfExperience ?? 0} thn pengalaman
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <ScoreBadge skor={r.skorKeseluruhan} dealbreaker={r.adaDealbreaker} />
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-[#999AAA]">
                        A:{r.skorDomainA ?? "–"} B:{r.skorDomainB ?? "–"} C:{r.skorDomainC ?? "–"}
                      </p>
                      <p className="text-[10px] text-[#999AAA]">
                        {r.kontakTerbuka ? "✓ kontak terbuka" : "terkunci"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {results.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-semibold text-[#5A3A7A]">Belum ada data matching</p>
          <p className="text-sm text-[#666666] mt-1">Jalankan <code>npm run seed:matches</code> untuk data demo.</p>
        </div>
      )}

      <div className="mt-8 pt-4 border-t text-center" style={{ borderColor: "#E0D0F0" }}>
        <Link
          href="/dashboard/parent/cari-nanny/direktori"
          className="text-sm text-[#5BBFB0] underline mr-4"
        >
          Buka Direktori Nanny (PARENT view)
        </Link>
        <Link
          href="/dashboard/nanny"
          className="text-sm text-[#A97CC4] underline"
        >
          Buka Dashboard Nanny
        </Link>
      </div>
    </div>
  )
}
