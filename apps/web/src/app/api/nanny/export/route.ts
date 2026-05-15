export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const data = await prisma.nannyProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        fullName: true,
        phone: true,
        city: true,
        district: true,
        address: true,
        dateOfBirth: true,
        educationLevel: true,
        yearsOfExperience: true,
        skills: true,
        languages: true,
        religion: true,
        nannyType: true,
        surveyCompletedAt: true,
      },
    })

    const payload = JSON.stringify(
      { exportedAt: new Date().toISOString(), profile: data },
      null,
      2
    )

    return new Response(payload, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="data-nanny-bundayakin.json"',
      },
    })
  } catch (error) {
    console.error("[NANNY_EXPORT]", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
