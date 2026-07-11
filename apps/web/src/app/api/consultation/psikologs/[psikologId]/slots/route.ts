import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getPsikologsAvailableForDate, getConsultationPrice } from "@/lib/consultation"
import { NextResponse } from "next/server"

// GET /api/consultation/psikologs/[psikologId]/slots?date=YYYY-MM-DD
// Jam tersedia untuk SATU psikolog pada satu tanggal — entry "pilih psikolog dulu" (ADR-012).
export async function GET(request: Request, { params }: { params: Promise<{ psikologId: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "PARENT") {
      return NextResponse.json({ success: false, error: "Hanya orang tua yang bisa memesan konsultasi" }, { status: 403 })
    }

    const { psikologId } = await params
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get("date")
    if (!dateParam || Number.isNaN(new Date(dateParam).getTime())) {
      return NextResponse.json({ success: false, error: "Tanggal tidak valid" }, { status: 400 })
    }

    const parentProfile = await prisma.parentProfile.findUnique({
      where: { userId: session.user.id },
      select: { subscription: { select: { status: true, endDate: true } } },
    })
    const sub = parentProfile?.subscription
    const isSubscriber = sub?.status === "ACTIVE" && sub?.endDate != null && sub.endDate > new Date()

    const [allSlots, price] = await Promise.all([
      getPsikologsAvailableForDate(new Date(dateParam)),
      getConsultationPrice(isSubscriber ?? false),
    ])

    const slots = allSlots.map((s) => ({ slotTime: s.slotTime, available: s.psikologs.some((p) => p.id === psikologId) }))

    return NextResponse.json({ success: true, data: { slots, price, isSubscriber: Boolean(isSubscriber) } })
  } catch (error) {
    console.error("[CONSULTATION_PSIKOLOG_SLOTS_GET]", error)
    return NextResponse.json({ success: false, error: "Gagal memuat jam tersedia" }, { status: 500 })
  }
}
