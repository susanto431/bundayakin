// POST /api/user/switch-role
// Body: { role: "PARENT" | "NANNY" | "ADMIN" }
// Hanya untuk akun dengan canSwitchRoles = true (phone 087888180363 atau ADMIN).
// Tidak mengubah DB — hanya token JWT (via session update di client).

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

const ALLOWED_ROLES = ["PARENT", "NANNY", "ADMIN"] as const
type AllowedRole = (typeof ALLOWED_ROLES)[number]

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    if (!session.user.canSwitchRoles) {
      return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 })
    }

    const { role } = await req.json() as { role: AllowedRole }
    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ success: false, error: "Role tidak valid" }, { status: 400 })
    }

    // Kembalikan role yang dipilih — client yang menjalankan update() via useSession
    return NextResponse.json({ success: true, data: { switchToRole: role } })
  } catch (error) {
    console.error("[SWITCH_ROLE]", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
