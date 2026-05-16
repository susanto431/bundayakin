import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "NANNY") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json() as { childId?: string; notes?: string }
    if (!body.childId || !body.notes?.trim()) {
      return NextResponse.json({ success: false, error: "Data tidak lengkap" }, { status: 400 })
    }

    const nannyProfile = await prisma.nannyProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        nannyAssignments: {
          where: { isActive: true },
          take: 1,
          select: {
            parentProfile: {
              select: {
                children: { where: { id: body.childId }, select: { id: true } },
              },
            },
          },
        },
      },
    })

    // Verify nanny has active assignment linked to this child
    const hasAccess = nannyProfile?.nannyAssignments?.[0]?.parentProfile?.children?.some(c => c.id === body.childId)
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: "Akses tidak diizinkan" }, { status: 403 })
    }

    // Append nanny notes to additionalNotes field with timestamp prefix
    const child = await prisma.childProfile.findUnique({
      where: { id: body.childId },
      select: { additionalNotes: true },
    })

    const timestamp = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    const nannyNote = `[Catatan nanny · ${timestamp}]: ${body.notes.trim()}`
    const existing = child?.additionalNotes?.trim() ?? ""
    const updated = existing ? `${existing}\n\n${nannyNote}` : nannyNote

    await prisma.childProfile.update({
      where: { id: body.childId },
      data: { additionalNotes: updated },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[NANNY_CHILD_NOTES_POST]", error)
    return NextResponse.json({ success: false, error: "Gagal menyimpan catatan" }, { status: 500 })
  }
}
