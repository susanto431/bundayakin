import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import {
  PRICING_CONFIG_KEYS,
  getEffectivePricing,
  listScheduleForKey,
  scheduleConfigChange,
} from "@/lib/pricing-config"
import type { PricingConfigKey } from "@prisma/client"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" as const, status: 401 as const }
  if (session.user.role !== "ADMIN") return { error: "Akses ditolak" as const, status: 403 as const }
  return { session }
}

// GET /api/admin/pricing-config
// Return semua item konfigurasi: nilai efektif hari ini + riwayat/jadwal lengkap.
export async function GET() {
  const guard = await requireAdmin()
  if ("error" in guard) {
    return NextResponse.json({ success: false, error: guard.error }, { status: guard.status })
  }

  try {
    const current = await getEffectivePricing()
    const items = await Promise.all(
      PRICING_CONFIG_KEYS.map(async (key) => ({
        key,
        currentValue: current[key],
        schedule: await listScheduleForKey(key),
      }))
    )
    return NextResponse.json({ success: true, data: { items } })
  } catch (error) {
    console.error("[ADMIN_PRICING_CONFIG_GET]", error)
    return NextResponse.json({ success: false, error: "Gagal memuat konfigurasi" }, { status: 500 })
  }
}

// POST /api/admin/pricing-config
// Body: { key, value, effectiveFrom (ISO date), reason }
// Jadwalkan perubahan harga/kuota — tidak retroaktif, selalu berlaku maju.
export async function POST(request: Request) {
  const guard = await requireAdmin()
  if ("error" in guard) {
    return NextResponse.json({ success: false, error: guard.error }, { status: guard.status })
  }

  try {
    const body = (await request.json()) as {
      key?: string
      value?: number
      effectiveFrom?: string
      reason?: string
    }

    if (!body.key || !PRICING_CONFIG_KEYS.includes(body.key as PricingConfigKey)) {
      return NextResponse.json({ success: false, error: "Item konfigurasi tidak valid" }, { status: 400 })
    }
    if (typeof body.value !== "number") {
      return NextResponse.json({ success: false, error: "Nilai diperlukan" }, { status: 400 })
    }
    if (!body.effectiveFrom) {
      return NextResponse.json({ success: false, error: "Tanggal mulai berlaku diperlukan" }, { status: 400 })
    }

    const result = await scheduleConfigChange({
      key: body.key as PricingConfigKey,
      value: body.value,
      effectiveFrom: new Date(body.effectiveFrom),
      reason: body.reason ?? "",
      createdByUserId: guard.session.user.id,
    })

    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }
    return NextResponse.json({ success: true, data: { id: result.id } }, { status: 201 })
  } catch (error) {
    console.error("[ADMIN_PRICING_CONFIG_POST]", error)
    return NextResponse.json({ success: false, error: "Gagal menjadwalkan perubahan" }, { status: 500 })
  }
}
