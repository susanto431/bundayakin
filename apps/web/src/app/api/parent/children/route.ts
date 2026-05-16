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

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const profile = await prisma.parentProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        children: {
          orderBy: [{ sortOrder: "asc" }, { dateOfBirth: "asc" }],
          select: {
            id: true, name: true, dateOfBirth: true, ageGroup: true,
            gender: true, profilePhotoUrl: true, allergies: true, medicalNotes: true,
            pantangan: true, schedule: true, schoolName: true, schoolSchedule: true,
            additionalNotes: true, caraMenenangkan: true, doList: true, dontList: true, sortOrder: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: profile?.children ?? [] })
  } catch (error) {
    console.error("[CHILDREN_GET]", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = (await request.json()) as {
      name: string
      dateOfBirth: string
      gender?: string
      profilePhotoUrl?: string
      allergies?: string
      medicalNotes?: string
      pantangan?: string
      schedule?: string
      schoolName?: string
      schoolSchedule?: string
      additionalNotes?: string
      caraMenenangkan?: string
      doList?: string[]
      dontList?: string[]
      sortOrder?: number
    }

    if (!body.name?.trim() || !body.dateOfBirth) {
      return NextResponse.json({ success: false, error: "Nama dan tanggal lahir wajib diisi" }, { status: 400 })
    }

    const dob = new Date(body.dateOfBirth)
    if (isNaN(dob.getTime())) {
      return NextResponse.json({ success: false, error: "Format tanggal tidak valid" }, { status: 400 })
    }

    const profile = await prisma.parentProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!profile) {
      return NextResponse.json({ success: false, error: "Profil orang tua belum dibuat" }, { status: 400 })
    }

    const child = await prisma.childProfile.create({
      data: {
        parentProfileId: profile.id,
        name: body.name.trim(),
        dateOfBirth: dob,
        ageGroup: deriveAgeGroup(dob),
        gender: body.gender?.trim() || null,
        profilePhotoUrl: body.profilePhotoUrl?.trim() || null,
        allergies: body.allergies?.trim() || null,
        medicalNotes: body.medicalNotes?.trim() || null,
        pantangan: body.pantangan?.trim() || null,
        schedule: body.schedule?.trim() || null,
        schoolName: body.schoolName?.trim() || null,
        schoolSchedule: body.schoolSchedule?.trim() || null,
        additionalNotes: body.additionalNotes?.trim() || null,
        caraMenenangkan: body.caraMenenangkan?.trim() || null,
        doList: body.doList ?? [],
        dontList: body.dontList ?? [],
        sortOrder: body.sortOrder ?? 0,
      },
      select: {
        id: true, name: true, dateOfBirth: true, ageGroup: true,
        gender: true, profilePhotoUrl: true, allergies: true, medicalNotes: true,
        pantangan: true, schedule: true, schoolName: true, schoolSchedule: true,
        additionalNotes: true, caraMenenangkan: true, doList: true, dontList: true, sortOrder: true,
      },
    })

    await logActivity({
      userId: session.user.id,
      action: "CHILD_ADDED",
      entity: "ChildProfile",
      entityId: child.id,
      metadata: { name: child.name },
    })

    return NextResponse.json({ success: true, data: child }, { status: 201 })
  } catch (error) {
    console.error("[CHILDREN_POST]", error)
    return NextResponse.json({ success: false, error: "Gagal menyimpan data anak" }, { status: 500 })
  }
}
