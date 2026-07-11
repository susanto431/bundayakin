import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { listActivePsikologsWithStats } from "@/lib/consultation"
import { NextResponse } from "next/server"

// GET /api/consultation/psikologs?childId=<opsional>
// Daftar psikolog aktif level peluncuran (Mid) + Jam Terbang + tanda "pernah
// menangani anak ini" (kalau childId diberikan) — entry "pilih psikolog dulu" (ADR-012).
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "PARENT") {
      return NextResponse.json({ success: false, error: "Hanya orang tua yang bisa memesan konsultasi" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const childId = searchParams.get("childId") ?? undefined

    if (childId) {
      const child = await prisma.childProfile.findFirst({
        where: { id: childId, parentProfile: { userId: session.user.id } },
        select: { id: true },
      })
      if (!child) {
        return NextResponse.json({ success: false, error: "Profil anak tidak ditemukan" }, { status: 404 })
      }
    }

    const psikologs = await listActivePsikologsWithStats(childId)
    return NextResponse.json({ success: true, data: { psikologs } })
  } catch (error) {
    console.error("[CONSULTATION_PSIKOLOGS_GET]", error)
    return NextResponse.json({ success: false, error: "Gagal memuat daftar psikolog" }, { status: 500 })
  }
}
