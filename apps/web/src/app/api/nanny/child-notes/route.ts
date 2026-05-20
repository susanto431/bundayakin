import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidateTag } from "next/cache"
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
    if (body.notes.trim().length > 2000) {
      return NextResponse.json({ success: false, error: "Catatan terlalu panjang (maks. 2000 karakter)" }, { status: 400 })
    }

    const nannyProfile = await prisma.nannyProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        nannyAssignments: {
          where: { isActive: true },
          take: 1,
          select: {
            assignedChildren: {
              where: { childProfileId: body.childId },
              select: { childProfileId: true },
            },
          },
        },
      },
    })

    // Verify nanny has active assignment with this specific child
    const hasAccess = (nannyProfile?.nannyAssignments?.[0]?.assignedChildren?.length ?? 0) > 0
    if (!hasAccess) {
      return NextResponse.json({ success: false, error: "Akses tidak diizinkan" }, { status: 403 })
    }

    const child = await prisma.childProfile.findUnique({
      where: { id: body.childId },
      select: { nannyNotes: true },
    })

    const timestamp = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    const newEntry = `[${timestamp}]: ${body.notes.trim()}`
    const existing = child?.nannyNotes?.trim() ?? ""
    const updated = existing ? `${existing}\n\n${newEntry}` : newEntry

    await prisma.childProfile.update({
      where: { id: body.childId },
      data: { nannyNotes: updated },
    })
    revalidateTag(`nanny-${session.user.id}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[NANNY_CHILD_NOTES_POST]", error)
    return NextResponse.json({ success: false, error: "Gagal menyimpan catatan" }, { status: 500 })
  }
}
