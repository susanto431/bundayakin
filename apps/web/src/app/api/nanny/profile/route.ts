import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logActivity } from "@/lib/activity"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "NANNY") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const profile = await prisma.nannyProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        fullName: true,
        phone: true,
        dateOfBirth: true,
        city: true,
        district: true,
        bio: true,
        nannyType: true,
        workScope: true,
        preferredAgeGroup: true,
        expectedSalaryMin: true,
        expectedSalaryMax: true,
        educationLevel: true,
        yearsOfExperience: true,
        skills: true,
        languages: true,
        religion: true,
      },
    })

    return NextResponse.json({ success: true, data: profile })
  } catch (error) {
    console.error("[NANNY_PROFILE_GET]", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "NANNY") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json() as {
      fullName?: string
      phone?: string
      dateOfBirth?: string
      city?: string
      district?: string
      bio?: string
      nannyType?: string[]
      workScope?: string | null
      preferredAgeGroup?: string[]
      expectedSalaryMin?: number | null
      expectedSalaryMax?: number | null
      educationLevel?: string
      yearsOfExperience?: number
      skills?: string[]
      languages?: string[]
      religion?: string
    }

    if (body.fullName !== undefined && body.fullName.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Nama tidak boleh kosong" }, { status: 400 })
    }

    const profile = await prisma.nannyProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        fullName: body.fullName?.trim() ?? session.user.name ?? "Nanny",
        phone: body.phone?.trim() || null,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        city: body.city?.trim() || null,
        district: body.district?.trim() || null,
        bio: body.bio?.trim() || null,
        nannyType: (body.nannyType ?? []) as never,
        workScope: (body.workScope ?? null) as never,
        preferredAgeGroup: (body.preferredAgeGroup ?? []) as never,
        expectedSalaryMin: body.expectedSalaryMin ?? null,
        expectedSalaryMax: body.expectedSalaryMax ?? null,
        educationLevel: body.educationLevel?.trim() || null,
        yearsOfExperience: body.yearsOfExperience ?? 0,
        skills: body.skills ?? [],
        languages: body.languages ?? [],
        religion: body.religion?.trim() || null,
      },
      update: {
        ...(body.fullName !== undefined && { fullName: body.fullName.trim() }),
        ...(body.phone !== undefined && { phone: body.phone.trim() || null }),
        ...(body.dateOfBirth !== undefined && { dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null }),
        ...(body.city !== undefined && { city: body.city.trim() || null }),
        ...(body.district !== undefined && { district: body.district.trim() || null }),
        ...(body.bio !== undefined && { bio: body.bio.trim() || null }),
        ...(body.nannyType !== undefined && { nannyType: body.nannyType as never }),
        ...(body.workScope !== undefined && { workScope: body.workScope as never }),
        ...(body.preferredAgeGroup !== undefined && { preferredAgeGroup: body.preferredAgeGroup as never }),
        ...(body.expectedSalaryMin !== undefined && { expectedSalaryMin: body.expectedSalaryMin }),
        ...(body.expectedSalaryMax !== undefined && { expectedSalaryMax: body.expectedSalaryMax }),
        ...(body.educationLevel !== undefined && { educationLevel: body.educationLevel.trim() || null }),
        ...(body.yearsOfExperience !== undefined && { yearsOfExperience: body.yearsOfExperience }),
        ...(body.skills !== undefined && { skills: body.skills }),
        ...(body.languages !== undefined && { languages: body.languages }),
        ...(body.religion !== undefined && { religion: body.religion.trim() || null }),
      },
      select: { id: true, fullName: true },
    })

    await logActivity({
      userId: session.user.id,
      action: "NANNY_PROFILE_UPDATED",
      entity: "NannyProfile",
      entityId: profile.id,
    })

    return NextResponse.json({ success: true, data: profile })
  } catch (error) {
    console.error("[NANNY_PROFILE_PATCH]", error)
    return NextResponse.json({ success: false, error: "Gagal menyimpan profil" }, { status: 500 })
  }
}
