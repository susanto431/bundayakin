import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

function normalizePhone(raw: string): string {
  let p = raw.replace(/\D/g, "")
  if (p.startsWith("0")) p = "62" + p.slice(1)
  if (!p.startsWith("62")) p = "62" + p
  return p
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { phone?: string; resetToken?: string; newPassword?: string }
    const { phone: rawPhone, resetToken, newPassword } = body

    if (!rawPhone || !resetToken || !newPassword) {
      return NextResponse.json({ success: false, error: "Data tidak lengkap" }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ success: false, error: "Kata sandi minimal 8 karakter" }, { status: 400 })
    }

    const phone = normalizePhone(rawPhone)

    const session = await prisma.otpToken.findFirst({
      where: { phone, code: resetToken, type: "RESET_SESSION", used: false },
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ success: false, error: "Sesi reset tidak valid atau sudah kedaluwarsa" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { phone }, select: { id: true } })
    if (!user) {
      return NextResponse.json({ success: false, error: "Akun tidak ditemukan" }, { status: 404 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await Promise.all([
      prisma.user.update({ where: { id: user.id }, data: { hashedPassword } }),
      prisma.otpToken.update({ where: { id: session.id }, data: { used: true } }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[RESET_PASSWORD]", error)
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
