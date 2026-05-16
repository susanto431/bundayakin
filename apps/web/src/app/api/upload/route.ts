import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import crypto from "crypto"

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads")

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

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
      return NextResponse.json(
        { success: false, error: "Ukuran file maksimal 5 MB" },
        { status: 400 }
      )
    }

    const ext = file.type === "image/webp" ? "webp" : file.type === "image/png" ? "png" : "jpg"
    const filename = `${crypto.randomUUID()}.${ext}`

    await mkdir(UPLOAD_DIR, { recursive: true })

    const bytes = await file.arrayBuffer()
    await writeFile(path.join(UPLOAD_DIR, filename), Buffer.from(bytes))

    return NextResponse.json({ success: true, url: `/uploads/${filename}` }, { status: 201 })
  } catch (error) {
    console.error("[UPLOAD_POST]", error)
    return NextResponse.json({ success: false, error: "Gagal menyimpan file" }, { status: 500 })
  }
}
