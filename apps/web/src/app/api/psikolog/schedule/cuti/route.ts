import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { addPsikologCuti } from "@/lib/consultation"
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

// POST /api/psikolog/schedule/cuti
// Body: { cutiDate: "YYYY-MM-DD", reason?: string }
export async function POST(request: Request) {
  const guard = await requirePsikolog()
  if ("error" in guard) {
    return NextResponse.json({ success: false, error: guard.error }, { status: guard.status })
  }

  try {
    const body = (await request.json()) as { cutiDate?: string; reason?: string }
    if (!body.cutiDate || Number.isNaN(new Date(body.cutiDate).getTime())) {
      return NextResponse.json({ success: false, error: "Tanggal cuti tidak valid" }, { status: 400 })
    }

    await addPsikologCuti(guard.psikologProfileId, new Date(body.cutiDate), body.reason ?? null)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[PSIKOLOG_SCHEDULE_CUTI_POST]", error)
    return NextResponse.json({ success: false, error: "Gagal menambah cuti" }, { status: 500 })
  }
}
