import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" as const, status: 401 as const }
  if (session.user.role !== "ADMIN") return { error: "Akses ditolak" as const, status: 403 as const }
  return { session }
}

// POST /api/admin/psikolog/[id]/reset-password
// Buat password sementara BARU untuk akun psikolog (bukan membuka password lama —
// password lama tidak pernah bisa dibaca ulang, cuma tersimpan terenkripsi).
// Dipakai kalau psikolog lupa/belum sempat mencatat kredensial dari pembuatan akun.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if ("error" in guard) {
    return NextResponse.json({ success: false, error: guard.error }, { status: guard.status })
  }

  try {
    const { id } = await params

    const psikolog = await prisma.psikologProfile.findUnique({
      where: { id },
      select: { userId: true, fullName: true, user: { select: { email: true } } },
    })
    if (!psikolog) {
      return NextResponse.json({ success: false, error: "Psikolog tidak ditemukan" }, { status: 404 })
    }

    const tempPassword = crypto.randomBytes(6).toString("base64url")
    const hashedPassword = await bcrypt.hash(tempPassword, 12)

    await prisma.user.update({
      where: { id: psikolog.userId },
      data: { hashedPassword },
    })

    console.info("[ADMIN_PSIKOLOG_RESET_PASSWORD]", id, "oleh", guard.session.user.id)

    return NextResponse.json({
      success: true,
      data: { email: psikolog.user.email, tempPassword },
    })
  } catch (error) {
    console.error("[ADMIN_PSIKOLOG_RESET_PASSWORD]", error)
    return NextResponse.json({ success: false, error: "Gagal membuat password baru" }, { status: 500 })
  }
}
