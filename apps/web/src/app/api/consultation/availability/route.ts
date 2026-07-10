import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getAvailabilityForDate, getConsultationPrice } from "@/lib/consultation"
import { NextResponse } from "next/server"

// GET /api/consultation/availability?date=YYYY-MM-DD
// Slot & harga Konsultasi Psikolog Anak yang tersedia untuk satu tanggal.
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "PARENT") {
      return NextResponse.json({ success: false, error: "Hanya orang tua yang bisa memesan konsultasi" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get("date")
    if (!dateParam || Number.isNaN(new Date(dateParam).getTime())) {
      return NextResponse.json({ success: false, error: "Tanggal tidak valid" }, { status: 400 })
    }
    const bookingDate = new Date(dateParam)

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    if (bookingDate < startOfToday) {
      return NextResponse.json({ success: false, error: "Tanggal tidak boleh di masa lalu" }, { status: 400 })
    }

    const parentProfile = await prisma.parentProfile.findUnique({
      where: { userId: session.user.id },
      select: { subscription: { select: { status: true, endDate: true } } },
    })
    const sub = parentProfile?.subscription
    const isSubscriber = sub?.status === "ACTIVE" && sub?.endDate != null && sub.endDate > new Date()

    const [slots, price] = await Promise.all([
      getAvailabilityForDate(bookingDate),
      getConsultationPrice(isSubscriber ?? false),
    ])

    return NextResponse.json({ success: true, data: { slots, price, isSubscriber: Boolean(isSubscriber) } })
  } catch (error) {
    console.error("[CONSULTATION_AVAILABILITY_GET]", error)
    return NextResponse.json({ success: false, error: "Gagal memuat ketersediaan jadwal" }, { status: 500 })
  }
}
