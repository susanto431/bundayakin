import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  getPsikologWeeklySchedule,
  upsertPsikologWeeklySchedule,
  listPsikologCuti,
  type WeeklyScheduleEntry,
} from "@/lib/consultation"
import { isValidSlotTime } from "@/constants/consultation"
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

function isValidUpdates(updates: unknown): updates is WeeklyScheduleEntry[] {
  if (!Array.isArray(updates)) return false
  return updates.every(
    (u) =>
      typeof u === "object" &&
      u !== null &&
      typeof (u as WeeklyScheduleEntry).dayOfWeek === "number" &&
      (u as WeeklyScheduleEntry).dayOfWeek >= 0 &&
      (u as WeeklyScheduleEntry).dayOfWeek <= 6 &&
      isValidSlotTime((u as WeeklyScheduleEntry).slotTime) &&
      typeof (u as WeeklyScheduleEntry).isOpen === "boolean"
  )
}

// GET /api/psikolog/schedule — jadwal mingguan + cuti mendatang milik psikolog yang login
export async function GET() {
  const guard = await requirePsikolog()
  if ("error" in guard) {
    return NextResponse.json({ success: false, error: guard.error }, { status: guard.status })
  }

  try {
    const [weeklySchedule, cutiDates] = await Promise.all([
      getPsikologWeeklySchedule(guard.psikologProfileId),
      listPsikologCuti(guard.psikologProfileId),
    ])
    return NextResponse.json({
      success: true,
      data: {
        weeklySchedule,
        cutiDates: cutiDates.map((c) => ({ id: c.id, cutiDateISO: c.cutiDate.toISOString(), reason: c.reason })),
      },
    })
  } catch (error) {
    console.error("[PSIKOLOG_SCHEDULE_GET]", error)
    return NextResponse.json({ success: false, error: "Gagal memuat jadwal" }, { status: 500 })
  }
}

// PUT /api/psikolog/schedule
// Body: { updates: Array<{ dayOfWeek, slotTime, isOpen }> }
export async function PUT(request: Request) {
  const guard = await requirePsikolog()
  if ("error" in guard) {
    return NextResponse.json({ success: false, error: guard.error }, { status: guard.status })
  }

  try {
    const body = (await request.json()) as { updates?: unknown }
    if (!isValidUpdates(body.updates)) {
      return NextResponse.json({ success: false, error: "Data jadwal tidak valid" }, { status: 400 })
    }

    await upsertPsikologWeeklySchedule(guard.psikologProfileId, body.updates)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[PSIKOLOG_SCHEDULE_PUT]", error)
    return NextResponse.json({ success: false, error: "Gagal menyimpan jadwal" }, { status: 500 })
  }
}
