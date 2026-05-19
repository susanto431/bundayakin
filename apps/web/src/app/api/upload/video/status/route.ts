import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { cfStream } from "@/lib/cloudflare"
import { NextResponse } from "next/server"

// GET /api/upload/video/status?uid=xxx
// Cek apakah video CF Stream sudah ready. Jika ya, update durationSec di DB
// supaya page refresh berikutnya juga langsung tampil ready (tidak perlu nunggu 10 menit).
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const uid = searchParams.get("uid")
    if (!uid) {
      return NextResponse.json({ success: false, error: "uid diperlukan" }, { status: 400 })
    }

    const videoDetails = await cfStream.getVideoDetails(uid)
    const isReady = videoDetails.state === "ready"

    if (isReady && videoDetails.duration !== undefined) {
      const durationSec = Math.max(1, Math.round(videoDetails.duration))
      await prisma.nannyMedia.updateMany({
        where: { storageKey: uid, durationSec: null },
        data: { durationSec },
      })
    }

    return NextResponse.json({ success: true, data: { isReady } })
  } catch (error) {
    console.error("[VIDEO_STATUS]", error)
    return NextResponse.json({ success: false, error: "Gagal cek status video" }, { status: 500 })
  }
}
