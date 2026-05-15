export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// PATCH /api/nanny/open-to-job
// Body: { openToJob: boolean }
export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "NANNY") {
      return NextResponse.json({ success: false, error: "Hanya nanny yang bisa mengubah status ini" }, { status: 403 })
    }

    const { openToJob } = (await request.json()) as { openToJob: boolean }

    const profile = await prisma.nannyProfile.update({
      where: { userId: session.user.id },
      data: { openToJob },
      select: { openToJob: true },
    })

    return NextResponse.json({ success: true, data: { openToJob: profile.openToJob } })
  } catch (error) {
    console.error("[NANNY_OPEN_TO_JOB]", error)
    return NextResponse.json({ success: false, error: "Gagal memperbarui status" }, { status: 500 })
  }
}

// GET /api/nanny/open-to-job — baca status saat ini
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const profile = await prisma.nannyProfile.findUnique({
      where: { userId: session.user.id },
      select: { openToJob: true },
    })

    return NextResponse.json({ success: true, data: { openToJob: profile?.openToJob ?? false } })
  } catch (error) {
    console.error("[NANNY_OPEN_TO_JOB_GET]", error)
    return NextResponse.json({ success: false, error: "Gagal membaca status" }, { status: 500 })
  }
}
