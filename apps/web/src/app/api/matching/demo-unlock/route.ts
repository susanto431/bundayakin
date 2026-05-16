// POST /api/matching/demo-unlock
// Body: { nannyProfileId: string }
// Demo only — set kontakTerbuka = true tanpa payment. Ganti dengan Midtrans di Sprint 3.

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "PARENT") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { nannyProfileId } = await req.json() as { nannyProfileId: string }
    if (!nannyProfileId) {
      return NextResponse.json({ success: false, error: "nannyProfileId diperlukan" }, { status: 400 })
    }

    const parentProfile = await prisma.parentProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!parentProfile) {
      return NextResponse.json({ success: false, error: "Profil orang tua tidak ditemukan" }, { status: 404 })
    }

    const matchResult = await prisma.matchResult.update({
      where: { parentProfileId_nannyProfileId: { parentProfileId: parentProfile.id, nannyProfileId } },
      data: { kontakTerbuka: true, dibayarAt: new Date() },
    })

    console.info("[DEMO_UNLOCK]", parentProfile.id, nannyProfileId)
    return NextResponse.json({ success: true, data: matchResult })
  } catch (error) {
    console.error("[DEMO_UNLOCK]", error)
    return NextResponse.json({ success: false, error: "Gagal membuka kontak" }, { status: 500 })
  }
}
