import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
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

// PATCH /api/psikolog/bookings/[id]
// Body: { psychologistNotes?, markCompleted? }
// Catatan hasil sesi untuk orang tua — hanya ditulis psikolog, tidak pernah
// diubah/diparafrase sistem (aturan lama, lihat CLAUDE.md §5).
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requirePsikolog()
  if ("error" in guard) {
    return NextResponse.json({ success: false, error: guard.error }, { status: guard.status })
  }

  try {
    const { id } = await params
    const body = (await request.json()) as { psychologistNotes?: string; markCompleted?: boolean }

    const booking = await prisma.consultationBooking.findUnique({
      where: { id },
      select: { id: true, psikologId: true, status: true },
    })
    if (!booking || booking.psikologId !== guard.psikologProfileId) {
      return NextResponse.json({ success: false, error: "Sesi tidak ditemukan" }, { status: 404 })
    }
    if (booking.status !== "CONFIRMED" && booking.status !== "COMPLETED") {
      return NextResponse.json({ success: false, error: "Sesi ini belum bisa diisi catatannya" }, { status: 400 })
    }

    const updated = await prisma.consultationBooking.update({
      where: { id },
      data: {
        ...(body.psychologistNotes !== undefined ? { psychologistNotes: body.psychologistNotes } : {}),
        ...(body.markCompleted ? { status: "COMPLETED", completedAt: new Date() } : {}),
      },
      select: { id: true, status: true, psychologistNotes: true, completedAt: true },
    })

    return NextResponse.json({ success: true, data: { booking: updated } })
  } catch (error) {
    console.error("[PSIKOLOG_BOOKING_PATCH]", error)
    return NextResponse.json({ success: false, error: "Gagal menyimpan catatan sesi" }, { status: 500 })
  }
}
