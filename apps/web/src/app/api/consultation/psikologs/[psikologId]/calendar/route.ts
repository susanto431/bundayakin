import { auth } from "@/lib/auth"
import { getPsikologAvailabilityForMonth } from "@/lib/consultation"
import { NextResponse } from "next/server"

const MONTH_RE = /^\d{4}-\d{2}$/

// GET /api/consultation/psikologs/[psikologId]/calendar?month=YYYY-MM
// Kalender bulan untuk SATU psikolog — entry "pilih psikolog dulu" (ADR-012).
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
    const month = searchParams.get("month")
    if (!month || !MONTH_RE.test(month)) {
      return NextResponse.json({ success: false, error: "Format bulan tidak valid (YYYY-MM)" }, { status: 400 })
    }

    const calendar = await getPsikologAvailabilityForMonth(psikologId, month)
    return NextResponse.json({ success: true, data: { calendar } })
  } catch (error) {
    console.error("[CONSULTATION_PSIKOLOG_CALENDAR_GET]", error)
    return NextResponse.json({ success: false, error: "Gagal memuat kalender psikolog" }, { status: 500 })
  }
}
