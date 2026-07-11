import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { submitConsultationReview } from "@/lib/consultation"
import { NextResponse } from "next/server"

// POST /api/consultation/reviews
// Body: { bookingId, isGood, scores?: Record<string,string>, narrative? }
// Ulasan Psikolog — internal-only untuk pemantauan kualitas HCC (ADR-012).
// Response TIDAK PERNAH mengembalikan isi ulasan, hanya konfirmasi sukses.
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "PARENT") {
      return NextResponse.json({ success: false, error: "Hanya orang tua yang bisa memberi ulasan" }, { status: 403 })
    }

    const body = (await request.json()) as {
      bookingId?: string
      isGood?: boolean
      scores?: Record<string, string>
      narrative?: string
    }
    const { bookingId, isGood, scores, narrative } = body
    if (!bookingId || typeof isGood !== "boolean") {
      return NextResponse.json({ success: false, error: "Data ulasan tidak lengkap" }, { status: 400 })
    }

    const parentProfile = await prisma.parentProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!parentProfile) {
      return NextResponse.json({ success: false, error: "Profil orang tua tidak ditemukan" }, { status: 404 })
    }

    const result = await submitConsultationReview({
      bookingId,
      parentProfileId: parentProfile.id,
      isGood,
      scores,
      narrative: narrative ?? null,
    })
    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error }, { status: 409 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[CONSULTATION_REVIEWS_POST]", error)
    return NextResponse.json({ success: false, error: "Gagal menyimpan ulasan" }, { status: 500 })
  }
}
