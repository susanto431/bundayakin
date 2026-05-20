import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(_req: Request, { params }: { params: { nannyId: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "PARENT") {
      return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 })
    }

    const parentProfile = await prisma.parentProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!parentProfile) {
      return NextResponse.json({ success: false, error: "Profil parent tidak ditemukan" }, { status: 404 })
    }

    const matchResult = await prisma.matchResult.findUnique({
      where: {
        parentProfileId_nannyProfileId: {
          parentProfileId: parentProfile.id,
          nannyProfileId: params.nannyId,
        },
      },
      select: { kontakTerbuka: true },
    })

    if (!matchResult?.kontakTerbuka) {
      return NextResponse.json({ success: false, error: "Kontak belum dibuka" }, { status: 403 })
    }

    const nanny = await prisma.nannyProfile.findUnique({
      where: { id: params.nannyId },
      select: { user: { select: { phone: true } } },
    })

    if (!nanny) {
      return NextResponse.json({ success: false, error: "Nanny tidak ditemukan" }, { status: 404 })
    }

    const rawPhone = nanny.user?.phone ?? null
    const whatsapp = rawPhone
      ? rawPhone.replace(/\D/g, "").replace(/^0/, "62")
      : null

    return NextResponse.json({ success: true, data: { phone: rawPhone, whatsapp } })
  } catch (error) {
    console.error("[NANNY_CONTACT]", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
