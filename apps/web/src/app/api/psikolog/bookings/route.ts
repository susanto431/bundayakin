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

// GET /api/psikolog/bookings — antrean sesi konsultasi milik psikolog yang login
export async function GET() {
  const guard = await requirePsikolog()
  if ("error" in guard) {
    return NextResponse.json({ success: false, error: guard.error }, { status: guard.status })
  }

  try {
    const bookings = await prisma.consultationBooking.findMany({
      where: { psikologId: guard.psikologProfileId, status: { in: ["CONFIRMED", "COMPLETED"] } },
      orderBy: [{ bookingDate: "asc" }, { slotTime: "asc" }],
      select: {
        id: true,
        bookingDate: true,
        slotTime: true,
        status: true,
        psychologistNotes: true,
        completedAt: true,
        childProfile: { select: { name: true, dateOfBirth: true } },
        parentProfile: { select: { fullName: true } },
      },
    })
    return NextResponse.json({ success: true, data: { bookings } })
  } catch (error) {
    console.error("[PSIKOLOG_BOOKINGS_GET]", error)
    return NextResponse.json({ success: false, error: "Gagal memuat antrean konsultasi" }, { status: 500 })
  }
}
