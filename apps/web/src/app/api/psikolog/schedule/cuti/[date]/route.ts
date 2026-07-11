import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { removePsikologCuti } from "@/lib/consultation"
import { NextResponse } from "next/server"

async function requirePsikolog() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" as const, status: 401 as const }
  if (session.user.role !== "PSIKOLOG") return { error: "Akses ditolak" as const, status: 403 as const }

  const psikologProfile = await prisma.psikologProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!psikologProfile) return { error: "Profil psikolog tidak ditemukan" as const, status: 404 as const }

  return { psikologProfileId: psikologProfile.id }
}

// DELETE /api/psikolog/schedule/cuti/[date] — date = "YYYY-MM-DD"
export async function DELETE(_request: Request, { params }: { params: Promise<{ date: string }> }) {
  const guard = await requirePsikolog()
  if ("error" in guard) {
    return NextResponse.json({ success: false, error: guard.error }, { status: guard.status })
  }

  try {
    const { date } = await params
    if (Number.isNaN(new Date(date).getTime())) {
      return NextResponse.json({ success: false, error: "Tanggal tidak valid" }, { status: 400 })
    }

    await removePsikologCuti(guard.psikologProfileId, new Date(date))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[PSIKOLOG_SCHEDULE_CUTI_DELETE]", error)
    return NextResponse.json({ success: false, error: "Gagal menghapus cuti" }, { status: 500 })
  }
}
