import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// DELETE /api/upload/media/[id]
// Soft-delete NannyMedia record (isActive = false).
// Auth: NANNY only, ownership check included.
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "NANNY") {
      return NextResponse.json({ success: false, error: "Hanya nanny yang bisa menghapus media" }, { status: 403 })
    }

    const nannyProfile = await prisma.nannyProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!nannyProfile) {
      return NextResponse.json({ success: false, error: "Profil nanny tidak ditemukan" }, { status: 404 })
    }

    const media = await prisma.nannyMedia.findFirst({
      where: { id: params.id, nannyProfileId: nannyProfile.id, isActive: true },
    })
    if (!media) {
      return NextResponse.json({ success: false, error: "Media tidak ditemukan" }, { status: 404 })
    }

    await prisma.nannyMedia.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[MEDIA_DELETE]", error)
    return NextResponse.json({ success: false, error: "Gagal menghapus media" }, { status: 500 })
  }
}
