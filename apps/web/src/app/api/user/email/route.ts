import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    })

    if (user?.email) {
      return NextResponse.json(
        { success: false, error: "Email sudah terdaftar dan tidak dapat diubah lewat aplikasi" },
        { status: 400 }
      )
    }

    const body = (await request.json()) as { email?: string }
    const email = body.email?.trim().toLowerCase()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: "Format email tidak valid" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ success: false, error: "Email sudah digunakan akun lain" }, { status: 409 })
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { email },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[USER_EMAIL_PATCH]", error)
    return NextResponse.json({ success: false, error: "Gagal menyimpan email" }, { status: 500 })
  }
}
