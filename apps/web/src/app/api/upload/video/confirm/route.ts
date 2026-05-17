import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { cfStream } from "@/lib/cloudflare"
import { NextResponse } from "next/server"

// POST /api/upload/video/confirm
// Body JSON: { uid: string, type: "INTRO_VIDEO" | "SKILL_VIDEO", slug: string }
// Dipanggil setelah client selesai upload video ke Cloudflare Stream.
// Verifikasi video ada di CF, lalu simpan ke tabel NannyMedia.
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "NANNY") {
      return NextResponse.json({ success: false, error: "Hanya nanny yang bisa konfirmasi video" }, { status: 403 })
    }

    const nannyProfile = await prisma.nannyProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!nannyProfile) {
      return NextResponse.json({ success: false, error: "Profil nanny tidak ditemukan" }, { status: 404 })
    }

    const body = (await request.json()) as { uid?: string; type?: string; slug?: string }
    const { uid, slug = "video" } = body
    const type = body.type as "INTRO_VIDEO" | "SKILL_VIDEO"

    if (!uid) {
      return NextResponse.json({ success: false, error: "uid diperlukan" }, { status: 400 })
    }
    if (!["INTRO_VIDEO", "SKILL_VIDEO"].includes(type)) {
      return NextResponse.json({ success: false, error: "Tipe video tidak valid" }, { status: 400 })
    }

    // Verifikasi video sudah ada di Cloudflare Stream
    const videoDetails = await cfStream.getVideoDetails(uid)

    const existingCount = await prisma.nannyMedia.count({
      where: { nannyProfileId: nannyProfile.id, type, isActive: true },
    })

    const media = await prisma.nannyMedia.create({
      data: {
        nannyProfileId: nannyProfile.id,
        type,
        storageKey: uid, // CF Stream UID
        slug,
        sortOrder: existingCount,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        mediaId: media.id,
        uid,
        embedUrl: cfStream.embedUrl(uid),
        thumbnailUrl: videoDetails.thumbnailUrl,
      },
    })
  } catch (error) {
    console.error("[UPLOAD_VIDEO_CONFIRM]", error)
    return NextResponse.json({ success: false, error: "Gagal menyimpan data video" }, { status: 500 })
  }
}
