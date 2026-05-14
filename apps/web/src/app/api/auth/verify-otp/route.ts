import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"

function normalizePhone(raw: string): string {
  let p = raw.replace(/\D/g, "")
  if (p.startsWith("0")) p = "62" + p.slice(1)
  if (!p.startsWith("62")) p = "62" + p
  return p
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { phone?: string; code?: string }
    if (!body.phone || !body.code) {
      return NextResponse.json({ success: false, error: "Data tidak lengkap" }, { status: 400 })
    }

    const phone = normalizePhone(body.phone)

    const otp = await prisma.otpToken.findFirst({
      where: { phone, code: body.code, type: "RESET_OTP", used: false },
    })

    if (!otp) {
      return NextResponse.json({ success: false, error: "Kode OTP salah" }, { status: 400 })
    }

    if (otp.expiresAt < new Date()) {
      return NextResponse.json({ success: false, error: "Kode OTP sudah kedaluwarsa, minta kode baru" }, { status: 400 })
    }

    // Tandai OTP sebagai terpakai
    await prisma.otpToken.update({ where: { id: otp.id }, data: { used: true } })

    // Buat reset session token (berlaku 15 menit)
    const resetToken = randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    await prisma.otpToken.create({
      data: { phone, code: resetToken, type: "RESET_SESSION", expiresAt },
    })

    return NextResponse.json({ success: true, resetToken })
  } catch (error) {
    console.error("[VERIFY_OTP]", error)
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
