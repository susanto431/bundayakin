import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      name?: string
      email?: string
      password?: string
      role?: string
      phone?: string
      familyCode?: string
    }
    const { name, email, password, role, phone, familyCode } = body

    if (!name || !password || !role) {
      return NextResponse.json({ success: false, error: "Data tidak lengkap" }, { status: 400 })
    }

    if (role !== "PARENT" && role !== "NANNY") {
      return NextResponse.json({ success: false, error: "Role tidak valid" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, error: "Password minimal 8 karakter" }, { status: 400 })
    }

    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) {
        return NextResponse.json({ success: false, error: "Email sudah terdaftar" }, { status: 409 })
      }
    }

    if (phone) {
      const existingPhone = await prisma.user.findUnique({ where: { phone } })
      if (existingPhone) {
        return NextResponse.json({ success: false, error: "Nomor HP sudah terdaftar" }, { status: 409 })
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        role: role as "PARENT" | "NANNY",
        phone: phone ?? null,
      },
      select: { id: true, email: true, name: true, role: true },
    })

    // Always create the role-specific profile immediately so survey and matching work.
    if (role === "NANNY") {
      const nannyProfile = await prisma.nannyProfile.create({
        data: { userId: user.id, fullName: name, phone: phone ?? null, openToJob: true },
        select: { id: true },
      })

      // Link to parent via familyCode if provided (format: BY-XXXX)
      if (familyCode) {
        const suffix = familyCode.replace(/^BY-/i, "").toLowerCase()
        if (suffix.length >= 4) {
          try {
            const parentUser = await prisma.user.findFirst({
              where: { role: "PARENT", id: { endsWith: suffix } },
              select: { id: true },
            })
            if (parentUser) {
              const parentProfile = await prisma.parentProfile.findUnique({
                where: { userId: parentUser.id },
                select: { id: true },
              })
              if (parentProfile) {
                await prisma.matchingRequest.create({
                  data: {
                    parentProfileId: parentProfile.id,
                    nannyProfileId: nannyProfile.id,
                    status: "PENDING",
                  },
                })
                console.info("[REGISTER] MatchingRequest created via familyCode", familyCode)
              }
            }
          } catch (e) {
            // Non-fatal: matching link failure shouldn't block registration
            console.error("[REGISTER] familyCode link failed", e)
          }
        }
      }
    } else if (role === "PARENT") {
      await prisma.parentProfile.create({
        data: { userId: user.id, fullName: name, phone: phone ?? null },
        select: { id: true },
      })
    }

    return NextResponse.json({ success: true, data: user }, { status: 201 })
  } catch (error) {
    console.error("[REGISTER]", error)
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
