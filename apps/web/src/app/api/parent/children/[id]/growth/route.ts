import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidateTag } from "next/cache"
import { NextResponse } from "next/server"

// POST /api/parent/children/[id]/growth
// Body: { measuredAt: string, weightKg?, heightCm?, headCircumferenceCm?, notes? }
// Pencatatan Kurva Pertumbuhan — gratis untuk semua akun (PRD 13 §4).
async function getChildForUser(childId: string, userId: string) {
  return prisma.childProfile.findFirst({
    where: { id: childId, parentProfile: { userId } },
    select: { id: true },
  })
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const existing = await getChildForUser(id, session.user.id)
    if (!existing) {
      return NextResponse.json({ success: false, error: "Data anak tidak ditemukan" }, { status: 404 })
    }

    const body = (await request.json()) as {
      measuredAt?: string
      weightKg?: number
      heightCm?: number
      headCircumferenceCm?: number
      notes?: string
    }

    if (!body.measuredAt) {
      return NextResponse.json({ success: false, error: "Tanggal pengukuran diperlukan" }, { status: 400 })
    }
    if (body.weightKg == null && body.heightCm == null && body.headCircumferenceCm == null) {
      return NextResponse.json({ success: false, error: "Isi minimal salah satu: berat, tinggi, atau lingkar kepala" }, { status: 400 })
    }
    if (body.weightKg != null && (body.weightKg <= 0 || body.weightKg > 60)) {
      return NextResponse.json({ success: false, error: "Berat badan tidak valid" }, { status: 400 })
    }
    if (body.heightCm != null && (body.heightCm <= 0 || body.heightCm > 150)) {
      return NextResponse.json({ success: false, error: "Tinggi badan tidak valid" }, { status: 400 })
    }
    if (body.headCircumferenceCm != null && (body.headCircumferenceCm <= 0 || body.headCircumferenceCm > 70)) {
      return NextResponse.json({ success: false, error: "Lingkar kepala tidak valid" }, { status: 400 })
    }

    const record = await prisma.growthRecord.create({
      data: {
        childProfileId: id,
        measuredAt: new Date(body.measuredAt),
        weightKg: body.weightKg ?? null,
        heightCm: body.heightCm ?? null,
        headCircumferenceCm: body.headCircumferenceCm ?? null,
        notes: body.notes?.trim() || null,
      },
      select: { id: true },
    })

    revalidateTag(`parent-${session.user.id}`)

    return NextResponse.json({ success: true, data: { id: record.id } }, { status: 201 })
  } catch (error) {
    console.error("[GROWTH_RECORD_POST]", error)
    return NextResponse.json({ success: false, error: "Gagal menyimpan catatan pertumbuhan" }, { status: 500 })
  }
}
