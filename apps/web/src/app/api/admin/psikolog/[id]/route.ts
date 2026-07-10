import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CONSULTATION_MAX_DAILY_CAPACITY } from "@/constants/consultation"
import { NextResponse } from "next/server"
import type { PsikologLevel } from "@prisma/client"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" as const, status: 401 as const }
  if (session.user.role !== "ADMIN") return { error: "Akses ditolak" as const, status: 403 as const }
  return { session }
}

const VALID_LEVELS: PsikologLevel[] = ["JUNIOR", "MID", "SENIOR"]

// PATCH /api/admin/psikolog/[id]
// Body: { level?, dailyCapacity?, isActive? } — edit level/kapasitas/status aktif
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if ("error" in guard) {
    return NextResponse.json({ success: false, error: guard.error }, { status: guard.status })
  }

  try {
    const { id } = await params
    const body = (await request.json()) as {
      level?: string
      dailyCapacity?: number
      isActive?: boolean
    }

    const data: { level?: PsikologLevel; dailyCapacity?: number; isActive?: boolean } = {}

    if (body.level !== undefined) {
      if (!VALID_LEVELS.includes(body.level as PsikologLevel)) {
        return NextResponse.json({ success: false, error: "Level psikolog tidak valid" }, { status: 400 })
      }
      data.level = body.level as PsikologLevel
    }
    if (body.dailyCapacity !== undefined) {
      if (!Number.isInteger(body.dailyCapacity) || body.dailyCapacity < 1 || body.dailyCapacity > CONSULTATION_MAX_DAILY_CAPACITY) {
        return NextResponse.json(
          { success: false, error: `Kapasitas harian harus antara 1–${CONSULTATION_MAX_DAILY_CAPACITY} sesi` },
          { status: 400 }
        )
      }
      data.dailyCapacity = body.dailyCapacity
    }
    if (body.isActive !== undefined) {
      data.isActive = body.isActive
    }

    const psikolog = await prisma.psikologProfile.update({
      where: { id },
      data,
      select: { id: true, fullName: true, level: true, dailyCapacity: true, isActive: true },
    })

    console.info("[ADMIN_PSIKOLOG_UPDATE]", id, data, "oleh", guard.session.user.id)

    return NextResponse.json({ success: true, data: { psikolog } })
  } catch (error) {
    console.error("[ADMIN_PSIKOLOG_PATCH]", error)
    return NextResponse.json({ success: false, error: "Gagal memperbarui data psikolog" }, { status: 500 })
  }
}
