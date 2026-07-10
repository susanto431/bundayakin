import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { normalizePhone } from "@/lib/phone"
import { CONSULTATION_MAX_DAILY_CAPACITY, CONSULTATION_DEFAULT_DAILY_CAPACITY } from "@/constants/consultation"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import type { PsikologLevel } from "@prisma/client"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" as const, status: 401 as const }
  if (session.user.role !== "ADMIN") return { error: "Akses ditolak" as const, status: 403 as const }
  return { session }
}

const VALID_LEVELS: PsikologLevel[] = ["JUNIOR", "MID", "SENIOR"]

// GET /api/admin/psikolog — daftar semua akun psikolog
export async function GET() {
  const guard = await requireAdmin()
  if ("error" in guard) {
    return NextResponse.json({ success: false, error: guard.error }, { status: guard.status })
  }

  try {
    const psikologs = await prisma.psikologProfile.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        level: true,
        isActive: true,
        dailyCapacity: true,
        createdAt: true,
        user: { select: { email: true, phone: true } },
      },
    })
    return NextResponse.json({ success: true, data: { psikologs } })
  } catch (error) {
    console.error("[ADMIN_PSIKOLOG_GET]", error)
    return NextResponse.json({ success: false, error: "Gagal memuat daftar psikolog" }, { status: 500 })
  }
}

// POST /api/admin/psikolog
// Body: { fullName, email, phone?, level, dailyCapacity? }
// Akun dibuat manual oleh admin (setelah screening HCC) — bukan pendaftaran mandiri.
// Password sementara dibuat otomatis & dikembalikan sekali di response untuk
// disampaikan admin ke psikolog; psikolog ganti password sendiri setelah login pertama.
export async function POST(request: Request) {
  const guard = await requireAdmin()
  if ("error" in guard) {
    return NextResponse.json({ success: false, error: guard.error }, { status: guard.status })
  }

  try {
    const body = (await request.json()) as {
      fullName?: string
      email?: string
      phone?: string
      level?: string
      dailyCapacity?: number
    }
    const { fullName, email, phone, level, dailyCapacity } = body

    if (!fullName?.trim() || !email?.trim() || !level) {
      return NextResponse.json({ success: false, error: "Nama, email, dan level psikolog wajib diisi" }, { status: 400 })
    }
    if (!VALID_LEVELS.includes(level as PsikologLevel)) {
      return NextResponse.json({ success: false, error: "Level psikolog tidak valid" }, { status: 400 })
    }
    const capacity = dailyCapacity ?? CONSULTATION_DEFAULT_DAILY_CAPACITY
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > CONSULTATION_MAX_DAILY_CAPACITY) {
      return NextResponse.json(
        { success: false, error: `Kapasitas harian harus antara 1–${CONSULTATION_MAX_DAILY_CAPACITY} sesi` },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({ where: { email: email.trim() } })
    if (existing) {
      return NextResponse.json({ success: false, error: "Email sudah terdaftar" }, { status: 409 })
    }

    const normalizedPhone = phone?.trim() ? normalizePhone(phone.trim()) : null
    if (normalizedPhone) {
      const existingPhone = await prisma.user.findUnique({ where: { phone: normalizedPhone } })
      if (existingPhone) {
        return NextResponse.json({ success: false, error: "Nomor HP sudah terdaftar" }, { status: 409 })
      }
    }

    const tempPassword = crypto.randomBytes(6).toString("base64url")
    const hashedPassword = await bcrypt.hash(tempPassword, 12)

    const psikolog = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: fullName.trim(),
          email: email.trim(),
          phone: normalizedPhone,
          hashedPassword,
          role: "PSIKOLOG",
        },
        select: { id: true },
      })
      return tx.psikologProfile.create({
        data: {
          userId: user.id,
          fullName: fullName.trim(),
          level: level as PsikologLevel,
          dailyCapacity: capacity,
        },
        select: { id: true, fullName: true, level: true, dailyCapacity: true, isActive: true },
      })
    })

    console.info("[ADMIN_PSIKOLOG_CREATE]", psikolog.id, "oleh", guard.session.user.id)

    return NextResponse.json({ success: true, data: { psikolog, tempPassword } }, { status: 201 })
  } catch (error) {
    console.error("[ADMIN_PSIKOLOG_POST]", error)
    return NextResponse.json({ success: false, error: "Gagal membuat akun psikolog" }, { status: 500 })
  }
}
