import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logActivity } from "@/lib/activity"
import { NextResponse } from "next/server"
import type { ChildAgeGroup } from "@prisma/client"

function deriveAgeGroup(dob: Date): ChildAgeGroup {
  const months = (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  if (months < 6) return "INFANT_0_6M"
  if (months < 12) return "INFANT_6_12M"
  if (months < 36) return "TODDLER_1_3Y"
  return "PRESCHOOL_3_6Y"
}

async function getChildForUser(childId: string, userId: string) {
  return prisma.childProfile.findFirst({
    where: { id: childId, parentProfile: { userId } },
    select: { id: true },
  })
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const existing = await getChildForUser(params.id, session.user.id)
    if (!existing) {
      return NextResponse.json({ success: false, error: "Data anak tidak ditemukan" }, { status: 404 })
    }

    const body = (await request.json()) as {
      name?: string
      dateOfBirth?: string
      gender?: string
      allergies?: string
      medicalNotes?: string
      pantangan?: string
      schedule?: string
      schoolName?: string
      additionalNotes?: string
    }

    const dobUpdate = body.dateOfBirth ? new Date(body.dateOfBirth) : undefined

    const child = await prisma.childProfile.update({
      where: { id: params.id },
      data: {
        ...(body.name !== undefined && { name: body.name.trim() }),
        ...(dobUpdate !== undefined && {
          dateOfBirth: dobUpdate,
          ageGroup: deriveAgeGroup(dobUpdate),
        }),
        ...(body.gender !== undefined && { gender: body.gender.trim() || null }),
        ...(body.allergies !== undefined && { allergies: body.allergies.trim() || null }),
        ...(body.medicalNotes !== undefined && { medicalNotes: body.medicalNotes.trim() || null }),
        ...(body.pantangan !== undefined && { pantangan: body.pantangan.trim() || null }),
        ...(body.schedule !== undefined && { schedule: body.schedule.trim() || null }),
        ...(body.schoolName !== undefined && { schoolName: body.schoolName.trim() || null }),
        ...(body.additionalNotes !== undefined && { additionalNotes: body.additionalNotes.trim() || null }),
      },
      select: {
        id: true, name: true, dateOfBirth: true, ageGroup: true,
        gender: true, allergies: true, medicalNotes: true,
        pantangan: true, schedule: true, schoolName: true, additionalNotes: true,
      },
    })

    await logActivity({
      userId: session.user.id,
      action: "CHILD_UPDATED",
      entity: "ChildProfile",
      entityId: child.id,
      metadata: { name: child.name },
    })

    return NextResponse.json({ success: true, data: child })
  } catch (error) {
    console.error("[CHILDREN_PATCH]", error)
    return NextResponse.json({ success: false, error: "Gagal memperbarui data anak" }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const existing = await getChildForUser(params.id, session.user.id)
    if (!existing) {
      return NextResponse.json({ success: false, error: "Data anak tidak ditemukan" }, { status: 404 })
    }

    await prisma.childProfile.delete({ where: { id: params.id } })

    await logActivity({
      userId: session.user.id,
      action: "CHILD_DELETED",
      entity: "ChildProfile",
      entityId: params.id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[CHILDREN_DELETE]", error)
    return NextResponse.json({ success: false, error: "Gagal menghapus data anak" }, { status: 500 })
  }
}
