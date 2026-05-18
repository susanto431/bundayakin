import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { cfStream } from "@/lib/cloudflare"
import { NextResponse } from "next/server"

// POST /api/upload/video
// Body JSON: { type: "INTRO_VIDEO" | "SKILL_VIDEO", slug: string }
// Mengembalikan uploadUrl dari Cloudflare Stream untuk direct upload dari browser.
// Client upload video langsung ke CF Stream (bukan lewat server ini).
//
// Flow:
// 1. Client POST ke sini → dapat { uploadUrl, uid }
// 2. Client PUT video ke uploadUrl (direct ke Cloudflare)
// 3. Client POST ke /api/upload/video/confirm dengan uid → simpan ke DB
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "NANNY") {
      return NextResponse.json({ success: false, error: "Hanya nanny yang bisa upload video" }, { status: 403 })
    }

    const nannyProfile = await prisma.nannyProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!nannyProfile) {
      return NextResponse.json({ success: false, error: "Profil nanny tidak ditemukan" }, { status: 404 })
    }

    const body = (await request.json()) as { type?: string; slug?: string }
    const type = body.type as "INTRO_VIDEO" | "SKILL_VIDEO"
    const slug = body.slug ?? "video"

    if (!["INTRO_VIDEO", "SKILL_VIDEO"].includes(type)) {
      return NextResponse.json({ success: false, error: "Tipe video tidak valid" }, { status: 400 })
    }

    // Max 1 INTRO_VIDEO, max 10 SKILL_VIDEO
    const existingCount = await prisma.nannyMedia.count({
      where: { nannyProfileId: nannyProfile.id, type, isActive: true },
    })
    if (type === "INTRO_VIDEO" && existingCount >= 1) {
      return NextResponse.json(
        { success: false, error: "Sudah ada video perkenalan. Hapus dulu sebelum upload baru." },
        { status: 400 }
      )
    }
    if (type === "SKILL_VIDEO" && existingCount >= 10) {
      return NextResponse.json({ success: false, error: "Maksimal 10 video keahlian" }, { status: 400 })
    }

    const { uploadUrl, uid } = await cfStream.getUploadUrl({
      userId: session.user.id,
      nannyId: nannyProfile.id,
      type,
      slug,
      maxDurationSeconds: 180, // 3 menit
    })

    return NextResponse.json({ success: true, data: { uploadUrl, uid, type, slug } })
  } catch (error) {
    console.error("[UPLOAD_VIDEO_POST]", error)
    return NextResponse.json({ success: false, error: "Gagal membuat upload URL" }, { status: 500 })
  }
}
