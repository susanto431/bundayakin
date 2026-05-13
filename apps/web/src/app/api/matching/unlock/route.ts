import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createSnapToken } from "@/lib/midtrans"
import { NextResponse } from "next/server"

const UNLOCK_AMOUNT = 100_000  // Rp 100.000 per nanny

// POST /api/matching/unlock
// Body: { nannyId: string }  — nannyProfile.id (bukan userId)
// Membuat transaksi NANNY_UNLOCK dan mengembalikan snapToken Midtrans.
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "PARENT") {
      return NextResponse.json({ success: false, error: "Hanya orang tua yang bisa membuka profil nanny" }, { status: 403 })
    }

    const { nannyId } = (await request.json()) as { nannyId: string }
    if (!nannyId) {
      return NextResponse.json({ success: false, error: "nannyId diperlukan" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true },
    })
    if (!user?.email) {
      return NextResponse.json({ success: false, error: "Email pengguna tidak ditemukan" }, { status: 400 })
    }

    const parentProfile = await prisma.parentProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    })
    if (!parentProfile) {
      return NextResponse.json({ success: false, error: "Profil orang tua tidak ditemukan" }, { status: 404 })
    }

    // Cek apakah nanny ada dan openToJob
    const nanny = await prisma.nannyProfile.findUnique({
      where: { id: nannyId },
      select: { id: true, fullName: true, openToJob: true },
    })
    if (!nanny) {
      return NextResponse.json({ success: false, error: "Profil nanny tidak ditemukan" }, { status: 404 })
    }
    if (!nanny.openToJob) {
      return NextResponse.json({ success: false, error: "Nanny tidak sedang mencari keluarga" }, { status: 400 })
    }

    // Cek apakah sudah unlock sebelumnya
    const existing = await prisma.unlockedNanny.findUnique({
      where: { parentId_nannyId: { parentId: parentProfile.id, nannyId } },
    })
    if (existing) {
      return NextResponse.json({ success: false, error: "Profil nanny ini sudah pernah dibuka" }, { status: 400 })
    }

    // Cek apakah PAID tier — jika ya, tidak perlu bayar 100k
    const sub = await prisma.subscription.findUnique({
      where: { parentProfileId: parentProfile.id },
      select: { status: true, endDate: true },
    })
    const isPaid = sub?.status === "ACTIVE" && sub?.endDate != null && sub.endDate > new Date()
    if (isPaid) {
      // Paid tier: langsung buka tanpa bayar
      await prisma.unlockedNanny.create({
        data: { parentId: parentProfile.id, nannyId, amountIDR: 0 },
      })
      return NextResponse.json({ success: true, data: { unlocked: true, free: true } })
    }

    const orderId = `UNLOCK-${parentProfile.id.slice(-6).toUpperCase()}-${nannyId.slice(-6).toUpperCase()}-${Date.now()}`

    const snapToken = await createSnapToken({
      orderId,
      amount: UNLOCK_AMOUNT,
      customerName: user.name ?? "Orang tua BundaYakin",
      customerEmail: user.email,
      itemName: `Buka profil nanny`,
    })

    await prisma.transaction.create({
      data: {
        parentProfileId: parentProfile.id,
        nannyProfileId: nannyId,
        type: "NANNY_UNLOCK",
        status: "PENDING",
        amountIDR: UNLOCK_AMOUNT,
        midtransOrderId: orderId,
        midtransToken: snapToken,
        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        notes: nannyId,
      },
    })

    console.info("[UNLOCK_CREATE]", orderId, parentProfile.id, nannyId)

    return NextResponse.json({ success: true, data: { snapToken, orderId, unlocked: false } })
  } catch (error) {
    console.error("[UNLOCK_CREATE]", error)
    return NextResponse.json({ success: false, error: "Gagal membuat pembayaran" }, { status: 500 })
  }
}
