import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidateTag } from "next/cache"
import { NextResponse } from "next/server"

// POST /api/matching/direct-invite
// Body: { nannyProfileId: string }
// Buat MatchingRequest langsung untuk nanny yang sudah terdaftar dan kontaknya sudah terbuka.
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "PARENT") {
      return NextResponse.json({ success: false, error: "Hanya orang tua yang bisa mengundang nanny" }, { status: 403 })
    }

    const body = (await request.json()) as { nannyProfileId?: string }
    const { nannyProfileId } = body

    if (!nannyProfileId) {
      return NextResponse.json({ success: false, error: "nannyProfileId diperlukan" }, { status: 400 })
    }

    const parentProfile = await prisma.parentProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!parentProfile) {
      return NextResponse.json({ success: false, error: "Profil orang tua tidak ditemukan" }, { status: 404 })
    }

    // Verifikasi kontak sudah terbuka
    const matchResult = await prisma.matchResult.findUnique({
      where: { parentProfileId_nannyProfileId: { parentProfileId: parentProfile.id, nannyProfileId } },
      select: { kontakTerbuka: true, flowType: true },
    })
    if (!matchResult?.kontakTerbuka) {
      return NextResponse.json({ success: false, error: "Buka kontak nanny terlebih dahulu" }, { status: 403 })
    }

    // Cek apakah MatchingRequest sudah ada
    const existing = await prisma.matchingRequest.findFirst({
      where: { parentProfileId: parentProfile.id, nannyProfileId },
      select: { id: true },
    })
    if (existing) {
      return NextResponse.json({ success: true, data: { matchingRequestId: existing.id, alreadyExists: true } })
    }

    const nanny = await prisma.nannyProfile.findUnique({
      where: { id: nannyProfileId },
      select: { id: true },
    })
    if (!nanny) {
      return NextResponse.json({ success: false, error: "Profil nanny tidak ditemukan" }, { status: 404 })
    }

    const exclusiveUntil = new Date()
    exclusiveUntil.setDate(exclusiveUntil.getDate() + 7)

    const matchingRequest = await prisma.matchingRequest.create({
      data: {
        parentProfileId: parentProfile.id,
        nannyProfileId,
        status: "PENDING",
        connectionFlow: (matchResult.flowType as "REFERRAL" | "TALENT_POOL") ?? "REFERRAL",
        exclusiveUntil,
      },
      select: { id: true },
    })

    revalidateTag(`parent-${session.user.id}`)
    console.info("[DIRECT_INVITE]", parentProfile.id, "→", nannyProfileId)

    return NextResponse.json({ success: true, data: { matchingRequestId: matchingRequest.id } })
  } catch (error) {
    console.error("[DIRECT_INVITE]", error)
    return NextResponse.json({ success: false, error: "Gagal membuat undangan matching" }, { status: 500 })
  }
}
