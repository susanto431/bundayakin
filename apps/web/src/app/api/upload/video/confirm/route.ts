import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { cfStream } from "@/lib/cloudflare"
import { revalidateTag } from "next/cache"
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

    // Atomic: count + create dalam satu transaksi — mencegah race condition double-upload
    const media = await prisma.$transaction(async (tx) => {
      const count = await tx.nannyMedia.count({
        where: { nannyProfileId: nannyProfile.id, type, isActive: true },
      })
      if (type === "INTRO_VIDEO" && count >= 1) {
        throw new Error("LIMIT|Sudah ada video perkenalan. Hapus dulu sebelum upload baru.")
      }
      if (type === "SKILL_VIDEO" && count >= 10) {
        throw new Error("LIMIT|Maksimal 10 video keahlian")
      }
      return tx.nannyMedia.create({
        data: {
          nannyProfileId: nannyProfile.id,
          type,
          storageKey: uid,
          slug,
          sortOrder: count,
        },
      })
    })

    revalidateTag(`nanny-${session.user.id}`)

    return NextResponse.json({
      success: true,
      data: {
        mediaId: media.id,
        uid,
        embedUrl: cfStream.embedUrl(uid),
        thumbnailUrl: videoDetails.thumbnailUrl,
        isReady: videoDetails.state === "ready",
      },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : ""
    if (msg.startsWith("LIMIT|")) {
      return NextResponse.json({ success: false, error: msg.slice(6) }, { status: 400 })
    }
    console.error("[UPLOAD_VIDEO_CONFIRM]", error)
    return NextResponse.json({ success: false, error: "Gagal menyimpan data video" }, { status: 500 })
  }
}
