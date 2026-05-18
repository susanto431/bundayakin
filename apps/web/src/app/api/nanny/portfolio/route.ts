import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidateTag } from "next/cache"
import { NextResponse } from "next/server"

// POST /api/nanny/portfolio
// Body: { title, description?, startMonth, startYear, endMonth?, endYear?, isOngoing, photos: { url, storageKey }[] }
// Buat entri portofolio baru beserta media foto-nya.
export async function POST(request: Request) {
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

    if (!body.title?.trim()) {
      return NextResponse.json({ success: false, error: "Judul pengalaman wajib diisi" }, { status: 400 })
    }
    if (!body.startMonth || !body.startYear) {
      return NextResponse.json({ success: false, error: "Periode mulai wajib diisi" }, { status: 400 })
    }

    const photos = (body.photos ?? []).slice(0, 3) // max 3 foto per entri

    const entry = await prisma.$transaction(async (tx) => {
      const count = await tx.nannyPortfolio.count({ where: { nannyProfileId: nannyProfile.id } })
      if (count >= 10) throw new Error("LIMIT|Maksimal 10 entri portofolio")
      return tx.nannyPortfolio.create({
        data: {
          nannyProfileId: nannyProfile.id,
          title: body.title.trim(),
          description: body.description?.trim() || null,
          startMonth: body.startMonth,
          startYear: body.startYear,
          endMonth: body.isOngoing ? null : (body.endMonth ?? null),
          endYear: body.isOngoing ? null : (body.endYear ?? null),
          isOngoing: body.isOngoing ?? false,
          sortOrder: count,
          media: {
            create: photos.map((p, i) => ({ url: p.url, storageKey: p.storageKey, sortOrder: i })),
          },
        },
        include: { media: true },
      })
    })

    revalidateTag(`nanny-${session.user.id}`)
    return NextResponse.json({ success: true, data: entry }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("LIMIT|")) {
      return NextResponse.json({ success: false, error: error.message.slice(6) }, { status: 400 })
    }
    console.error("[PORTFOLIO_POST]", error)
    return NextResponse.json({ success: false, error: "Gagal menyimpan portofolio" }, { status: 500 })
  }
}
