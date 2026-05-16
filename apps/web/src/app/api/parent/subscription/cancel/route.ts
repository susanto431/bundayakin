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
    if (session.user.role !== "PARENT") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const parentProfile = await prisma.parentProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        subscription: { select: { id: true, status: true, endDate: true } },
      },
    })

    const sub = parentProfile?.subscription
    if (!sub) {
      return NextResponse.json({ success: false, error: "Tidak ada langganan aktif" }, { status: 404 })
    }
    if (sub.status !== "ACTIVE") {
      return NextResponse.json({ success: false, error: "Langganan tidak aktif" }, { status: 400 })
    }

    // Mark as cancelled — access remains until end date
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "CANCELLED", autoRenew: false },
    })

    await logActivity({
      userId: session.user.id,
      action: "SUBSCRIPTION_CANCELLED",
      entity: "Subscription",
      entityId: sub.id,
    })

    return NextResponse.json({
      success: true,
      endDate: sub.endDate,
    })
  } catch (error) {
    console.error("[SUBSCRIPTION_CANCEL]", error)
    return NextResponse.json({ success: false, error: "Gagal membatalkan langganan" }, { status: 500 })
  }
}
