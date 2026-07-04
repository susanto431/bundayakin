import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidateTag } from "next/cache"
import { NextResponse } from "next/server"

// POST /api/parent/children/[id]/journal
// Body: { caption: string, momentDate?: string, photoUrl?: string, photoKey?: string }
// Jurnal Momen — gratis untuk semua akun (PRD 13 §4). Tahap 1: parent-only
// (Log Harian Nanny menyusul di Tahap 4 — schema authorRole sudah siap).
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
    if (session.user.role !== "PARENT") {
      return NextResponse.json({ success: false, error: "Hanya orang tua yang bisa menulis jurnal saat ini" }, { status: 403 })
    }

    const { id } = await params
    const existing = await getChildForUser(id, session.user.id)
    if (!existing) {
      return NextResponse.json({ success: false, error: "Data anak tidak ditemukan" }, { status: 404 })
    }

    const body = (await request.json()) as {
      caption?: string
      momentDate?: string
      photoUrl?: string
      photoKey?: string
    }

    if (!body.caption?.trim()) {
      return NextResponse.json({ success: false, error: "Cerita momen tidak boleh kosong" }, { status: 400 })
    }
    if (body.caption.trim().length > 1000) {
      return NextResponse.json({ success: false, error: "Cerita terlalu panjang (maks. 1000 karakter)" }, { status: 400 })
    }

    const entry = await prisma.childJournalEntry.create({
      data: {
        childProfileId: id,
        authorUserId: session.user.id,
        authorRole: "PARENT",
        caption: body.caption.trim(),
        momentDate: body.momentDate ? new Date(body.momentDate) : new Date(),
        photoUrl: body.photoUrl ?? null,
        photoKey: body.photoKey ?? null,
      },
      select: { id: true },
    })

    revalidateTag(`parent-${session.user.id}`)

    return NextResponse.json({ success: true, data: { id: entry.id } }, { status: 201 })
  } catch (error) {
    console.error("[CHILD_JOURNAL_POST]", error)
    return NextResponse.json({ success: false, error: "Gagal menyimpan jurnal" }, { status: 500 })
  }
}
