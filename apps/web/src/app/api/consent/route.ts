import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logActivity } from "@/lib/activity"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id: userId, role } = session.user
    const now = new Date()

    if (role === "PARENT") {
      await prisma.parentProfile.update({
        where: { userId },
        data: { consentGivenAt: now },
      })
    } else if (role === "NANNY") {
      await prisma.nannyProfile.update({
        where: { userId },
        data: { consentGivenAt: now },
      })
    } else {
      return NextResponse.json({ success: false, error: "Role tidak valid" }, { status: 400 })
    }

    await logActivity({
      userId,
      action: "CONSENT_GIVEN",
      entity: role === "PARENT" ? "ParentProfile" : "NannyProfile",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[CONSENT_POST]", error)
    return NextResponse.json({ success: false, error: "Gagal menyimpan consent" }, { status: 500 })
  }
}
