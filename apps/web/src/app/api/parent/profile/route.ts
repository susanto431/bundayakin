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

    const profile = await prisma.parentProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, fullName: true, phone: true, province: true, city: true, district: true, address: true },
    })

    return NextResponse.json({ success: true, data: profile })
  } catch (error) {
    console.error("[PARENT_PROFILE_GET]", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = (await request.json()) as {
      fullName?: string
      phone?: string
      province?: string
      city?: string
      district?: string
      address?: string
    }

    if (body.fullName !== undefined && body.fullName.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Nama tidak boleh kosong" }, { status: 400 })
    }

    const profile = await prisma.parentProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        fullName: body.fullName?.trim() ?? session.user.name ?? "Orang tua",
        phone: body.phone?.trim() || null,
        province: body.province?.trim() || null,
        city: body.city?.trim() || null,
        district: body.district?.trim() || null,
        address: body.address?.trim() || null,
      },
      update: {
        ...(body.fullName !== undefined && { fullName: body.fullName.trim() }),
        ...(body.phone !== undefined && { phone: body.phone.trim() || null }),
        ...(body.province !== undefined && { province: body.province.trim() || null }),
        ...(body.city !== undefined && { city: body.city.trim() || null }),
        ...(body.district !== undefined && { district: body.district.trim() || null }),
        ...(body.address !== undefined && { address: body.address.trim() || null }),
      },
      select: { id: true, fullName: true, phone: true, province: true, city: true, district: true, address: true },
    })

    await logActivity({
      userId: session.user.id,
      action: "PARENT_PROFILE_UPDATED",
      entity: "ParentProfile",
      entityId: profile.id,
    })

    return NextResponse.json({ success: true, data: profile })
  } catch (error) {
    console.error("[PARENT_PROFILE_PATCH]", error)
    return NextResponse.json({ success: false, error: "Gagal menyimpan profil" }, { status: 500 })
  }
}
