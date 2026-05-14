import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

function normalizePhone(raw: string): string {
  let p = raw.replace(/\D/g, "")
  if (p.startsWith("0")) p = "62" + p.slice(1)
  if (!p.startsWith("62")) p = "62" + p
  return p
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { phone?: string }
    if (!body.phone) {
      return NextResponse.json({ success: false, error: "Nomor WA wajib diisi" }, { status: 400 })
    }

    const phone = normalizePhone(body.phone)

    const user = await prisma.user.findUnique({
      where: { phone },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: "Nomor WA tidak terdaftar di BundaYakin" }, { status: 404 })
    }

    // Hapus OTP lama yang belum dipakai untuk nomor ini
    await prisma.otpToken.deleteMany({
      where: { phone, type: "RESET_OTP" },
    })

    const code = generateOtp()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 menit

    await prisma.otpToken.create({
      data: { phone, code, type: "RESET_OTP", expiresAt },
    })

    const message = `Kode verifikasi BundaYakin Anda: *${code}*\n\nBerlaku 10 menit. Jangan bagikan kode ini ke siapapun.`

    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: process.env.FONNTE_API_TOKEN!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ target: phone, message, countryCode: "62" }),
    })

    if (!res.ok) {
      console.error("[SEND_OTP] Fonnte error", await res.text())
      return NextResponse.json({ success: false, error: "Gagal mengirim OTP, coba lagi" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[SEND_OTP]", error)
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
