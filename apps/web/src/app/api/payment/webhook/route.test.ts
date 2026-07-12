import { describe, expect, test, vi, beforeEach } from "vitest"
import { prisma } from "@/lib/prisma"
import { sendWhatsAppMessage } from "@/lib/fonnte"
import { resend } from "@/lib/resend"
import { POST } from "./route"

// Mock hanya di batas sistem (database, WA, email, Next.js runtime) — bukan modul
// internal kita sendiri (lib/psikotes, lib/psikotes-invitation tetap jalan asli,
// dipanggil lewat prisma tiruan di atas).
vi.mock("@/lib/prisma", () => ({
  prisma: {
    transaction: { findUnique: vi.fn(), update: vi.fn() },
    parentProfile: { findUnique: vi.fn() },
    nannyProfile: { findUnique: vi.fn(), create: vi.fn() },
    user: { findUnique: vi.fn(), create: vi.fn() },
    psikotesInvitation: { create: vi.fn() },
    matchResult: { updateMany: vi.fn() },
    notification: { create: vi.fn() },
    otpToken: { deleteMany: vi.fn(), create: vi.fn() },
    assessmentResult: { findFirst: vi.fn() },
    $transaction: vi.fn(async (ops: unknown) => (Array.isArray(ops) ? Promise.all(ops) : undefined)),
  },
}))

vi.mock("@/lib/fonnte", () => ({
  sendWhatsAppMessage: vi.fn(async () => ({ success: true })),
}))

vi.mock("@/lib/resend", () => ({
  resend: { emails: { send: vi.fn(async () => ({})) } },
  EMAIL_FROM: "BundaYakin <noreply@bundayakin.com>",
}))

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

const SAMPLE_RAW_SCORES = {
  dimensionRaw: {
    N: 5, G: 5, L: 5, P: 5, I: 5, T: 5, V: 5, F: 5, W: 5, X: 5,
    S: 5, B: 5, O: 5, Z: 5, E: 5, K: 5, R: 5, D: 5, C: 5, A: 5,
  },
}

function webhookRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/payment/webhook", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

function mayarSuccessPayload(productId: string) {
  return {
    event: "payment",
    data: {
      id: "mayar-payment-id",
      productId,
      status: "SUCCESS",
      transactionStatus: "paid",
      amount: 300_000,
      updatedAt: new Date().toISOString(),
    },
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  // Aman kalau MAYAR_WEBHOOK_SECRET tidak diset di lingkungan test — verifyMayarWebhookToken
  // melewatkan verifikasi kalau secret kosong (perilaku asli di lib/mayar.ts).
  delete process.env.MAYAR_WEBHOOK_SECRET
})

describe("POST /api/payment/webhook — PSIKOTES_INVITE, nanny sudah match", () => {
  test("nanny belum isi tes → undangan dibuat menunggu, WA suruh isi tes dikirim", async () => {
    ;(prisma.transaction.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "txn-1",
      subscriptionId: null,
      status: "PENDING",
      type: "PSIKOTES_INVITE",
      parentProfileId: "parent-1",
      metadata: { nannyProfileId: "nanny-1" },
    })
    ;(prisma.parentProfile.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      userId: "user-parent-1",
      fullName: "Sari Dewi",
      user: { email: "sari@example.com" },
    })
    ;(prisma.nannyProfile.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      fullName: "Siti Rahayu",
      user: { phone: "6281234567890" },
      assessmentResults: [],
    })
    ;(prisma.transaction.update as ReturnType<typeof vi.fn>).mockResolvedValue({})
    ;(prisma.psikotesInvitation.create as ReturnType<typeof vi.fn>).mockResolvedValue({})
    ;(prisma.notification.create as ReturnType<typeof vi.fn>).mockResolvedValue({})

    const res = await POST(webhookRequest(mayarSuccessPayload("invoice-1")))
    const json = await res.json()

    expect(json.success).toBe(true)

    // Undangan dibuat berstatus menunggu, bukan langsung selesai
    expect(prisma.psikotesInvitation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "WAITING_COMPLETION", nannyProfileId: "nanny-1" }),
      })
    )

    // Nanny (sudah punya akun) dapat WA suruh isi tes, bukan WA aktivasi akun
    expect(sendWhatsAppMessage).toHaveBeenCalledTimes(1)
    const [phoneArg, messageArg] = (sendWhatsAppMessage as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(phoneArg).toBe("6281234567890")
    expect(messageArg).toContain("tes-sikap-kerja")
    expect(messageArg).not.toContain("Kode verifikasi")

    // Tidak ada akun baru dibuat — dia sudah terdaftar
    expect(prisma.user.create).not.toHaveBeenCalled()
  })

  test("nanny sudah selesai tes lebih dulu → hasil langsung dikirim email, tanpa WA undangan", async () => {
    ;(prisma.transaction.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "txn-4",
      subscriptionId: null,
      status: "PENDING",
      type: "PSIKOTES_INVITE",
      parentProfileId: "parent-1",
      metadata: { nannyProfileId: "nanny-1" },
    })
    ;(prisma.parentProfile.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      userId: "user-parent-1",
      fullName: "Sari Dewi",
      user: { email: "sari@example.com" },
    })
    ;(prisma.nannyProfile.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      fullName: "Siti Rahayu",
      user: { phone: "6281234567890" },
      assessmentResults: [{ id: "assessment-1" }], // sudah pernah isi
    })
    ;(prisma.assessmentResult.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ rawScores: SAMPLE_RAW_SCORES })
    ;(prisma.transaction.update as ReturnType<typeof vi.fn>).mockResolvedValue({})
    ;(prisma.psikotesInvitation.create as ReturnType<typeof vi.fn>).mockResolvedValue({})
    ;(prisma.matchResult.updateMany as ReturnType<typeof vi.fn>).mockResolvedValue({ count: 1 })

    const res = await POST(webhookRequest(mayarSuccessPayload("invoice-4")))
    const json = await res.json()

    expect(json.success).toBe(true)

    expect(prisma.psikotesInvitation.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "COMPLETED" }) })
    )
    // Parent yang undang otomatis dapat akses — tanpa bayar dua kali (ADR-014)
    expect(prisma.matchResult.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ psikotesUnlocked: true }) })
    )
    expect(resend.emails.send).toHaveBeenCalledWith(expect.objectContaining({ to: "sari@example.com" }))
    expect(sendWhatsAppMessage).not.toHaveBeenCalled()
  })
})

describe("POST /api/payment/webhook — PSIKOTES_INVITE, nanny off-platform (ADR-017)", () => {
  test("nomor belum pernah terdaftar → buat akun shell tersembunyi dari direktori, kirim OTP aktivasi", async () => {
    ;(prisma.transaction.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "txn-2",
      subscriptionId: null,
      status: "PENDING",
      type: "PSIKOTES_INVITE",
      parentProfileId: "parent-1",
      metadata: { nannyName: "Siti Rahayu", nannyPhone: "6281234567890" },
    })
    ;(prisma.parentProfile.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      userId: "user-parent-1",
      fullName: "Sari Dewi",
      user: { email: "sari@example.com" },
    })
    ;(prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null) // nomor belum terdaftar
    ;(prisma.user.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "new-user-1" })
    ;(prisma.nannyProfile.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "new-nanny-1" })
    ;(prisma.transaction.update as ReturnType<typeof vi.fn>).mockResolvedValue({})
    ;(prisma.psikotesInvitation.create as ReturnType<typeof vi.fn>).mockResolvedValue({})
    ;(prisma.notification.create as ReturnType<typeof vi.fn>).mockResolvedValue({})
    ;(prisma.otpToken.deleteMany as ReturnType<typeof vi.fn>).mockResolvedValue({})
    ;(prisma.otpToken.create as ReturnType<typeof vi.fn>).mockResolvedValue({})

    const res = await POST(webhookRequest(mayarSuccessPayload("invoice-2")))
    const json = await res.json()

    expect(json.success).toBe(true)

    // Akun dibuat langsung — TIDAK menunggu dia daftar sendiri lewat Flow A
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ phone: "6281234567890", role: "NANNY" }) })
    )
    // Shell account tidak boleh muncul di direktori/Talent Pool sebelum lengkap (ADR-017)
    expect(prisma.nannyProfile.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "new-user-1",
          openToJob: false,
          isAvailable: false,
          psikotesOnlyOnboarding: true,
        }),
      })
    )

    expect(prisma.psikotesInvitation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "WAITING_COMPLETION", nannyProfileId: "new-nanny-1" }),
      })
    )

    // Belum ada password — WA berisi kode OTP + link atur kata sandi, bukan link langsung ke tes
    expect(prisma.otpToken.create).toHaveBeenCalledOnce()
    const [phoneArg, messageArg] = (sendWhatsAppMessage as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(phoneArg).toBe("6281234567890")
    expect(messageArg).toContain("Kode verifikasi")
    expect(messageArg).toContain("forgot-password")
  })

  test("nomor ternyata sudah terdaftar → reuse akun yang ada, tidak buat akun dobel", async () => {
    ;(prisma.transaction.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "txn-3",
      subscriptionId: null,
      status: "PENDING",
      type: "PSIKOTES_INVITE",
      parentProfileId: "parent-1",
      metadata: { nannyName: "Siti Rahayu", nannyPhone: "6281234567890" },
    })
    ;(prisma.parentProfile.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      userId: "user-parent-1",
      fullName: "Sari Dewi",
      user: { email: "sari@example.com" },
    })
    ;(prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "existing-user-1", role: "NANNY" })
    ;(prisma.nannyProfile.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "existing-nanny-1",
      fullName: "Siti Rahayu Terdaftar",
      assessmentResults: [],
    })
    ;(prisma.transaction.update as ReturnType<typeof vi.fn>).mockResolvedValue({})
    ;(prisma.psikotesInvitation.create as ReturnType<typeof vi.fn>).mockResolvedValue({})
    ;(prisma.notification.create as ReturnType<typeof vi.fn>).mockResolvedValue({})

    const res = await POST(webhookRequest(mayarSuccessPayload("invoice-3")))
    const json = await res.json()

    expect(json.success).toBe(true)
    expect(prisma.user.create).not.toHaveBeenCalled()
    expect(prisma.nannyProfile.create).not.toHaveBeenCalled()
    expect(prisma.psikotesInvitation.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ nannyProfileId: "existing-nanny-1" }) })
    )
  })
})
