import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { r2 } from "@/lib/cloudflare"
import { revalidateTag } from "next/cache"
import { NextResponse } from "next/server"

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

// POST /api/upload
// FormData: { file: File, type: "AVATAR" | "PORTFOLIO_PHOTO", slug?: string }
// Upload foto ke Cloudflare R2 dan simpan ke NannyMedia (portfolio) atau profile (avatar)
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const type = (formData.get("type") as string) ?? "AVATAR"
    const slug = (formData.get("slug") as string) ?? "foto"

    if (!file) {
      return NextResponse.json({ success: false, error: "Tidak ada file yang dikirim" }, { status: 400 })
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { success: false, error: "Format tidak didukung. Gunakan JPG, PNG, atau WebP" },
        { status: 400 }
      )
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: "Ukuran file maksimal 5 MB" }, { status: 400 })
    }

    const ext = file.type === "image/webp" ? "webp" : file.type === "image/png" ? "png" : "jpg"
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const storageMB = parseFloat((file.size / (1024 * 1024)).toFixed(3))

    if (type === "AVATAR") {
      const key = `${r2.keys.avatar(session.user.id)}.${ext}`
      const url = await r2.uploadPhoto(key, buffer, file.type)

      // Update profilePhotoUrl di tabel yang sesuai
      if (session.user.role === "NANNY") {
        await prisma.nannyProfile.update({
          where: { userId: session.user.id },
          data: { profilePhotoUrl: url },
        })
        revalidateTag(`nanny-${session.user.id}`)
      } else if (session.user.role === "PARENT") {
        await prisma.parentProfile.update({
          where: { userId: session.user.id },
          data: { profilePhotoUrl: url },
        })
        revalidateTag(`parent-${session.user.id}`)
      }

      return NextResponse.json({ success: true, url }, { status: 201 })
    }

    if (type === "PORTFOLIO_PHOTO") {
      if (session.user.role !== "NANNY") {
        return NextResponse.json({ success: false, error: "Hanya nanny yang bisa upload portfolio" }, { status: 403 })
      }

      const nannyProfile = await prisma.nannyProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      })
      if (!nannyProfile) {
        return NextResponse.json({ success: false, error: "Profil nanny tidak ditemukan" }, { status: 404 })
      }

      // Cek jumlah foto — max 9
      const photoCount = await prisma.nannyMedia.count({
        where: { nannyProfileId: nannyProfile.id, type: "PORTFOLIO_PHOTO", isActive: true },
      })
      if (photoCount >= 9) {
        return NextResponse.json({ success: false, error: "Maksimal 9 foto portfolio" }, { status: 400 })
      }

      const key = r2.keys.portfolioPhoto(session.user.id, `${slug}.${ext}`)
      const url = await r2.uploadPhoto(key, buffer, file.type)

      const media = await prisma.nannyMedia.create({
        data: {
          nannyProfileId: nannyProfile.id,
          type: "PORTFOLIO_PHOTO",
          storageKey: key,
          storageMB,
          slug,
          sortOrder: photoCount,
        },
      })

      revalidateTag(`nanny-${session.user.id}`)
      return NextResponse.json({ success: true, url, mediaId: media.id }, { status: 201 })
    }

    // Foto untuk entri portofolio (NannyPortfolioMedia) — upload ke R2, return URL+key saja
    // Tidak disimpan ke NannyMedia; akan disimpan saat POST /api/nanny/portfolio
    if (type === "PORTFOLIO_ENTRY_PHOTO") {
      if (session.user.role !== "NANNY") {
        return NextResponse.json({ success: false, error: "Hanya nanny yang bisa upload foto portofolio" }, { status: 403 })
      }
      const key = r2.keys.portfolioPhoto(session.user.id, `entry-${Date.now()}-${slug}.${ext}`)
      const url = await r2.uploadPhoto(key, buffer, file.type)
      return NextResponse.json({ success: true, url, storageKey: key }, { status: 201 })
    }

    return NextResponse.json({ success: false, error: "Tipe upload tidak valid" }, { status: 400 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    // Log detail lengkap di server untuk Vercel Function Logs
    console.error("[UPLOAD_POST] error:", msg)
    console.error("[UPLOAD_POST] R2_ENDPOINT configured:", !!process.env.R2_ENDPOINT)
    console.error("[UPLOAD_POST] R2_ACCESS_KEY_ID configured:", !!process.env.R2_ACCESS_KEY_ID)
    console.error("[UPLOAD_POST] R2_BUCKET_NAME configured:", !!process.env.R2_BUCKET_NAME)
    return NextResponse.json({ success: false, error: "Gagal mengupload file" }, { status: 500 })
  }
}
