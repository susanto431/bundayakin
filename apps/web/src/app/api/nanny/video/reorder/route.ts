import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidateTag } from "next/cache"
import { NextResponse } from "next/server"

// PUT /api/nanny/video/reorder
// Body: { orderedIds: string[] }  — array ID NannyMedia (SKILL_VIDEO) sesuai urutan baru
// Update sortOrder setiap item berdasarkan posisinya di array.
export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "NANNY") {
      return NextResponse.json({ success: false, error: "Hanya nanny yang bisa reorder video" }, { status: 403 })
    }

    const nannyProfile = await prisma.nannyProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!nannyProfile) {
      return NextResponse.json({ success: false, error: "Profil nanny tidak ditemukan" }, { status: 404 })
    }

    const body = (await request.json()) as { orderedIds?: string[] }
    const orderedIds = body.orderedIds
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json({ success: false, error: "orderedIds harus berupa array" }, { status: 400 })
    }
    if (orderedIds.length > 10) {
      return NextResponse.json({ success: false, error: "Terlalu banyak ID dalam request" }, { status: 400 })
    }

    // Batch update sortOrder — verifikasi kepemilikan sekaligus
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.nannyMedia.updateMany({
          where: { id, nannyProfileId: nannyProfile.id, type: "SKILL_VIDEO", isActive: true },
          data: { sortOrder: index },
        })
      )
    )

    revalidateTag(`nanny-${session.user.id}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[VIDEO_REORDER]", error)
    return NextResponse.json({ success: false, error: "Gagal menyimpan urutan video" }, { status: 500 })
  }
}
