import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidateTag } from "next/cache"
import { NextResponse } from "next/server"

// POST /api/assignment/[id]/end
// Body: { reason: string }
// Orang tua mengakhiri penugasan nanny.
// Jaminan Kecocokan (PRD 06 §5): berakhir ≤30 hari sejak mulai DAN penugasan bukan
// hasil klaim jaminan → terbit MatchGuarantee (matching ulang tanpa kuota + penempatan ulang gratis).

const GUARANTEE_WINDOW_DAYS = 30

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "PARENT") {
      return NextResponse.json({ success: false, error: "Hanya orang tua yang bisa mengakhiri penugasan" }, { status: 403 })
    }

    const { id } = await params
    const body = (await request.json()) as { reason?: string }
    const reason = body.reason?.trim()
    if (!reason) {
      return NextResponse.json({ success: false, error: "Alasan mengakhiri penugasan wajib diisi" }, { status: 400 })
    }

    const assignment = await prisma.nannyAssignment.findUnique({
      where: { id },
      select: {
        id: true,
        startDate: true,
        isActive: true,
        fromGuarantee: true,
        parentProfileId: true,
        parentProfile: { select: { userId: true } },
        nannyProfile: { select: { id: true, userId: true, fullName: true } },
      },
    })
    if (!assignment || assignment.parentProfile.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Penugasan tidak ditemukan" }, { status: 404 })
    }
    if (!assignment.isActive) {
      return NextResponse.json({ success: false, error: "Penugasan sudah berakhir" }, { status: 400 })
    }

    const now = new Date()
    const durationDays = Math.floor((now.getTime() - assignment.startDate.getTime()) / (24 * 60 * 60 * 1000))
    const guaranteeEligible = durationDays <= GUARANTEE_WINDOW_DAYS && !assignment.fromGuarantee

    let guaranteeGranted = false

    await prisma.$transaction(async (tx) => {
      await tx.nannyAssignment.update({
        where: { id: assignment.id },
        data: { isActive: false, endDate: now, endReason: reason },
      })

      // Nanny kembali tersedia untuk keluarga lain
      await tx.nannyProfile.update({
        where: { id: assignment.nannyProfile.id },
        data: { isAvailable: true },
      })

      if (guaranteeEligible) {
        // sourceAssignmentId unique → aman dari double-submit
        await tx.matchGuarantee.create({
          data: {
            parentProfileId: assignment.parentProfileId,
            sourceAssignmentId: assignment.id,
            reason,
          },
        })
        guaranteeGranted = true
      }

      await tx.notification.create({
        data: {
          userId: assignment.nannyProfile.userId,
          type: "ASSIGNMENT_ENDED",
          title: "Penugasan berakhir",
          body: "Penugasan Sus telah diakhiri oleh keluarga. Profil Sus kembali terlihat oleh keluarga lain.",
        },
      })
    })

    revalidateTag(`parent-${session.user.id}`)
    revalidateTag(`nanny-${assignment.nannyProfile.userId}`)

    console.info("[ASSIGNMENT_END]", assignment.id, `duration=${durationDays}d`, `guarantee=${guaranteeGranted}`)

    return NextResponse.json({
      success: true,
      data: { ended: true, durationDays, guaranteeGranted },
    })
  } catch (error) {
    console.error("[ASSIGNMENT_END]", error)
    return NextResponse.json({ success: false, error: "Gagal mengakhiri penugasan" }, { status: 500 })
  }
}
