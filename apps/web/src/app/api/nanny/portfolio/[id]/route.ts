import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { r2 } from "@/lib/cloudflare"
import { revalidateTag } from "next/cache"
import { NextResponse } from "next/server"

type Params = { params: { id: string } }

// PUT /api/nanny/portfolio/:id
// Perbarui entri portofolio (judul, deskripsi, periode, foto).
export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "NANNY") {
      return NextResponse.json({ success: false, error: "Hanya nanny yang bisa mengelola portofolio" }, { status: 403 })
    }

    const nannyProfile = await prisma.nannyProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!nannyProfile) {
      return NextResponse.json({ success: false, error: "Profil nanny tidak ditemukan" }, { status: 404 })
    }

    const entry = await prisma.nannyPortfolio.findFirst({
      where: { id: params.id, nannyProfileId: nannyProfile.id },
    })
    if (!entry) {
      return NextResponse.json({ success: false, error: "Entri tidak ditemukan" }, { status: 404 })
    }

    const body = await request.json() as {
      title?: string
      description?: string
      startMonth?: number
      startYear?: number
      endMonth?: number
      endYear?: number
      isOngoing?: boolean
      photos?: { url: string; storageKey: string }[]
    }

    // Replace media: hapus lama, buat baru
    const photos = (body.photos ?? []).slice(0, 3)

    await prisma.$transaction([
      prisma.nannyPortfolioMedia.deleteMany({ where: { portfolioId: params.id } }),
      prisma.nannyPortfolio.update({
        where: { id: params.id },
        data: {
          ...(body.title ? { title: body.title.trim() } : {}),
          ...(body.description !== undefined ? { description: body.description?.trim() || null } : {}),
          ...(body.startMonth ? { startMonth: body.startMonth } : {}),
          ...(body.startYear ? { startYear: body.startYear } : {}),
          endMonth: body.isOngoing ? null : (body.endMonth ?? null),
          endYear: body.isOngoing ? null : (body.endYear ?? null),
          ...(body.isOngoing !== undefined ? { isOngoing: body.isOngoing } : {}),
          media: {
            create: photos.map((p, i) => ({ url: p.url, storageKey: p.storageKey, sortOrder: i })),
          },
        },
      }),
    ])

    revalidateTag(`nanny-${session.user.id}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[PORTFOLIO_PUT]", error)
    return NextResponse.json({ success: false, error: "Gagal memperbarui portofolio" }, { status: 500 })
  }
}

// DELETE /api/nanny/portfolio/:id
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "NANNY") {
      return NextResponse.json({ success: false, error: "Hanya nanny yang bisa mengelola portofolio" }, { status: 403 })
    }

    const nannyProfile = await prisma.nannyProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!nannyProfile) {
      return NextResponse.json({ success: false, error: "Profil nanny tidak ditemukan" }, { status: 404 })
    }

    const entry = await prisma.nannyPortfolio.findFirst({
      where: { id: params.id, nannyProfileId: nannyProfile.id },
      include: { media: true },
    })
    if (!entry) {
      return NextResponse.json({ success: false, error: "Entri tidak ditemukan" }, { status: 404 })
    }

    await prisma.nannyPortfolio.delete({ where: { id: params.id } })
    await Promise.allSettled(entry.media.map((m) => r2.deletePhoto(m.storageKey)))

    revalidateTag(`nanny-${session.user.id}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[PORTFOLIO_DELETE]", error)
    return NextResponse.json({ success: false, error: "Gagal menghapus portofolio" }, { status: 500 })
  }
}
