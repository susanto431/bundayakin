import { prisma } from "@/lib/prisma"
import type { NannyType, Prisma } from "@prisma/client"

// Aktivasi penempatan nanny: buat NannyAssignment + anak + jadwal check-in/evaluasi,
// tandai matching ACCEPTED, dan kirim notifikasi kedua pihak.
// Dipakai oleh: webhook Mayar (PLACEMENT_FEE sukses) dan klaim Jaminan Kecocokan (gratis).
// Return: { assignmentId } atau null jika matching request tidak valid / sudah diproses.

export type ActivatePlacementInput = {
  matchingRequestId: string
  childIds: string[]
  startDate: Date
  fromGuarantee?: boolean
  // Dijalankan di dalam transaction yang sama (mis. update Transaction / MatchGuarantee)
  extraTx?: (tx: Prisma.TransactionClient) => Promise<void>
}

export type ActivatePlacementResult =
  | { status: "CREATED"; assignmentId: string; parentUserId: string; nannyUserId: string }
  | { status: "ALREADY_ACCEPTED" }
  | { status: "NOT_FOUND" }

export async function activatePlacement({
  matchingRequestId,
  childIds,
  startDate,
  fromGuarantee = false,
  extraTx,
}: ActivatePlacementInput): Promise<ActivatePlacementResult> {
  const matchingRequest = await prisma.matchingRequest.findUnique({
    where: { id: matchingRequestId },
    select: {
      id: true,
      parentProfileId: true,
      nannyProfileId: true,
      nannyTypeRequested: true,
      status: true,
      nannyProfile: { select: { userId: true } },
      parentProfile: { select: { userId: true } },
    },
  })

  if (!matchingRequest?.nannyProfileId || !matchingRequest.nannyProfile) {
    console.error("[PLACEMENT] matching request atau nannyProfileId tidak ditemukan:", matchingRequestId)
    return { status: "NOT_FOUND" }
  }

  // Idempotency: kalau sudah ACCEPTED, assignment sudah dibuat sebelumnya
  if (matchingRequest.status === "ACCEPTED") {
    console.info("[PLACEMENT] Sudah diproses sebelumnya:", matchingRequestId)
    return { status: "ALREADY_ACCEPTED" }
  }

  const week1At = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000)
  const week2At = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000)
  const month1At = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000)
  const month3At = new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000)

  const nannyType = (matchingRequest.nannyTypeRequested ?? "LIVE_IN") as NannyType

  let assignmentId = ""

  await prisma.$transaction(async (tx) => {
    if (extraTx) await extraTx(tx)

    const assignment = await tx.nannyAssignment.create({
      data: {
        parentProfileId: matchingRequest.parentProfileId,
        nannyProfileId: matchingRequest.nannyProfileId!,
        startDate,
        isActive: true,
        nannyType,
        fromGuarantee,
      },
      select: { id: true },
    })
    assignmentId = assignment.id

    await tx.assignmentChild.createMany({
      data: childIds.map((childProfileId, idx) => ({
        assignmentId: assignment.id,
        childProfileId,
        isPrimary: idx === 0,
      })),
    })

    await tx.checkin.createMany({
      data: [
        { assignmentId: assignment.id, timing: "WEEK_1", scheduledAt: week1At },
        { assignmentId: assignment.id, timing: "WEEK_2", scheduledAt: week2At },
      ],
    })

    await tx.evaluation.createMany({
      data: [
        {
          assignmentId: assignment.id,
          parentProfileId: matchingRequest.parentProfileId,
          nannyProfileId: matchingRequest.nannyProfileId!,
          timing: "MONTH_1",
          scheduledAt: month1At,
        },
        {
          assignmentId: assignment.id,
          parentProfileId: matchingRequest.parentProfileId,
          nannyProfileId: matchingRequest.nannyProfileId!,
          timing: "MONTH_3",
          scheduledAt: month3At,
        },
      ],
    })

    await tx.matchingRequest.update({
      where: { id: matchingRequestId },
      data: { status: "ACCEPTED" },
    })

    await tx.notification.create({
      data: {
        userId: matchingRequest.parentProfile.userId,
        type: "PLACEMENT_CONFIRMED",
        title: fromGuarantee
          ? "Penempatan ulang berhasil — Jaminan Kecocokan"
          : "Penempatan nanny berhasil dikonfirmasi",
        body: "Sus sudah siap mulai. Cek jadwal check-in minggu pertama di dashboard.",
      },
    })

    await tx.notification.create({
      data: {
        userId: matchingRequest.nannyProfile!.userId,
        type: "PLACEMENT_CONFIRMED",
        title: "Selamat! Sus resmi ditempatkan",
        body: "Penempatan sudah dikonfirmasi. Cek catatan anak dan jadwal check-in di dashboard.",
      },
    })
  })

  console.info("[PLACEMENT] Assignment created:", assignmentId, "matchingRequest:", matchingRequestId, fromGuarantee ? "(via jaminan)" : "")

  return {
    status: "CREATED",
    assignmentId,
    parentUserId: matchingRequest.parentProfile.userId,
    nannyUserId: matchingRequest.nannyProfile.userId,
  }
}

// Ambil Jaminan Kecocokan yang masih tersedia untuk parent (jika ada)
export async function getAvailableGuarantee(parentProfileId: string) {
  return prisma.matchGuarantee.findFirst({
    where: { parentProfileId, status: "AVAILABLE" },
    orderBy: { createdAt: "desc" },
    select: { id: true, createdAt: true, sourceAssignmentId: true },
  })
}
