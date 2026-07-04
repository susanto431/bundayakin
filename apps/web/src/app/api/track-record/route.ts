import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidateTag } from "next/cache"
import { NextResponse } from "next/server"

// POST /api/track-record
// Body: { assignmentId: string, rating: 1–5, reviewText?: string, isPublic?: boolean }
// Orang tua menulis rekam jejak setelah penugasan berakhir.
// Terverifikasi otomatis (isVerified) karena terikat ke penugasan nyata — satu review per penugasan.

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]

function formatPeriod(start: Date, end: Date): string {
  const f = (d: Date) => `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`
  return `${f(start)} – ${f(end)}`
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "PARENT") {
      return NextResponse.json({ success: false, error: "Hanya orang tua yang bisa menulis rekam jejak" }, { status: 403 })
    }

    const body = (await request.json()) as {
      assignmentId?: string
      rating?: number
      reviewText?: string
      isPublic?: boolean
    }

    if (!body.assignmentId) {
      return NextResponse.json({ success: false, error: "assignmentId diperlukan" }, { status: 400 })
    }
    const rating = Number(body.rating)
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: "Rating harus 1–5" }, { status: 400 })
    }

    const assignment = await prisma.nannyAssignment.findUnique({
      where: { id: body.assignmentId },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        isActive: true,
        parentProfileId: true,
        nannyProfileId: true,
        parentProfile: { select: { userId: true, fullName: true } },
        nannyProfile: { select: { userId: true } },
      },
    })
    if (!assignment || assignment.parentProfile.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Penugasan tidak ditemukan" }, { status: 404 })
    }
    if (assignment.isActive || !assignment.endDate) {
      return NextResponse.json(
        { success: false, error: "Rekam jejak hanya bisa ditulis setelah penugasan berakhir" },
        { status: 400 }
      )
    }

    // Satu review per penugasan (assignmentId unique di schema — cek dulu untuk pesan yang ramah)
    const existing = await prisma.trackRecordEntry.findUnique({
      where: { assignmentId: assignment.id },
      select: { id: true },
    })
    if (existing) {
      return NextResponse.json({ success: false, error: "Rekam jejak untuk penugasan ini sudah ditulis" }, { status: 400 })
    }

    const isPublic = body.isPublic === true
    const durationMonths = Math.max(
      1,
      Math.round((assignment.endDate.getTime() - assignment.startDate.getTime()) / (30 * 24 * 60 * 60 * 1000))
    )

    const entry = await prisma.trackRecordEntry.create({
      data: {
        nannyProfileId: assignment.nannyProfileId,
        parentProfileId: assignment.parentProfileId,
        assignmentId: assignment.id,
        rating,
        reviewText: body.reviewText?.trim() || null,
        isPublic,
        reviewerName: isPublic ? assignment.parentProfile.fullName : null, // anonim kecuali opt-in
        workPeriod: formatPeriod(assignment.startDate, assignment.endDate),
        durationMonths,
        isVerified: true, // terikat penugasan nyata di platform
      },
      select: { id: true },
    })

    await prisma.notification.create({
      data: {
        userId: assignment.nannyProfile.userId,
        type: "TRACK_RECORD_ADDED",
        title: "Rekam jejak baru untuk Sus",
        body: "Keluarga yang pernah Sus bantu menuliskan rekam jejak. Ini memperkuat profil Sus untuk keluarga berikutnya.",
      },
    })

    revalidateTag(`nanny-${assignment.nannyProfile.userId}`)
    revalidateTag(`parent-${session.user.id}`)

    console.info("[TRACK_RECORD]", entry.id, "assignment:", assignment.id, `rating=${rating}`)

    return NextResponse.json({ success: true, data: { id: entry.id } })
  } catch (error) {
    console.error("[TRACK_RECORD]", error)
    return NextResponse.json({ success: false, error: "Gagal menyimpan rekam jejak" }, { status: 500 })
  }
}
