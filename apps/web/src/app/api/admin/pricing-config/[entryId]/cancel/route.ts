import { auth } from "@/lib/auth"
import { cancelScheduledChange } from "@/lib/pricing-config"
import { NextResponse } from "next/server"

// POST /api/admin/pricing-config/[entryId]/cancel
// Batalkan jadwal perubahan yang BELUM berlaku. Tidak bisa membatalkan
// perubahan yang sudah lewat tanggal efektifnya (prinsip tidak retroaktif).
export async function POST(_request: Request, { params }: { params: Promise<{ entryId: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 })
    }

    const { entryId } = await params
    const result = await cancelScheduledChange(entryId, session.user.id)

    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[ADMIN_PRICING_CONFIG_CANCEL]", error)
    return NextResponse.json({ success: false, error: "Gagal membatalkan jadwal" }, { status: 500 })
  }
}
