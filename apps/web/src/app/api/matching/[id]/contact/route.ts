import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET /api/matching/[id]/contact
// Returns { phone, whatsapp } from NannyProfile only if kontakTerbuka === true.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "PARENT") {
      return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 })
    }

    const matchingRequest = await prisma.matchingRequest.findUnique({
      where: { id: params.id },
      select: {
        parentProfileId: true,
        nannyProfileId: true,
        parentProfile: { select: { userId: true } },
        nannyProfile: { select: { phone: true } },
      },
    })

    if (!matchingRequest || matchingRequest.parentProfile.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Matching tidak ditemukan" }, { status: 404 })
    }

    if (!matchingRequest.nannyProfileId) {
      return NextResponse.json({ success: false, error: "Profil nanny tidak tersedia" }, { status: 404 })
    }

    const matchResult = await prisma.matchResult.findUnique({
      where: {
        parentProfileId_nannyProfileId: {
          parentProfileId: matchingRequest.parentProfileId,
          nannyProfileId: matchingRequest.nannyProfileId,
        },
      },
      select: { kontakTerbuka: true },
    })

    if (!matchResult?.kontakTerbuka) {
      return NextResponse.json({ success: false, error: "Kontak belum dibuka" }, { status: 403 })
    }

    const rawPhone = matchingRequest.nannyProfile?.phone ?? null
    // Normalise to WA-ready format: strip +/spaces/dashes, replace leading 0 with 62
    const whatsapp = rawPhone
      ? rawPhone.replace(/\D/g, "").replace(/^0/, "62")
      : null

    return NextResponse.json({ success: true, data: { phone: rawPhone, whatsapp } })
  } catch (error) {
    console.error("[MATCHING_CONTACT]", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
