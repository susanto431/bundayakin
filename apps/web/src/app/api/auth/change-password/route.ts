import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json() as { currentPassword?: string; newPassword?: string }
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: "Data tidak lengkap" }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ success: false, error: "Kata sandi baru minimal 8 karakter" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { hashedPassword: true },
    })

    if (!user?.hashedPassword) {
      return NextResponse.json({ success: false, error: "Akun tidak mendukung ganti kata sandi" }, { status: 400 })
    }

    const valid = await bcrypt.compare(currentPassword, user.hashedPassword)
    if (!valid) {
      return NextResponse.json({ success: false, error: "Kata sandi saat ini salah" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { hashedPassword },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[CHANGE_PASSWORD]", error)
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
