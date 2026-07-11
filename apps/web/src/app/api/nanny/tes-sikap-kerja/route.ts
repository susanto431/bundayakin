import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CAPTURE_WORK_STYLE_ITEMS } from "@/lib/capture-work-style-instrument"
import { scoreCaptureWorkStyle, type CaptureWorkStyleAnswer } from "@/lib/capture-work-style-scoring"
import { NextResponse } from "next/server"

// POST /api/nanny/tes-sikap-kerja
// Body: { answers: ("A"|"B")[] } — 90 jawaban forced-choice Capture Work Style (Layer 2).
// Skoring otomatis (deterministik) — hasil disimpan sebagai AssessmentResult LAYER_2.
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "NANNY") {
      return NextResponse.json({ success: false, error: "Hanya nanny yang bisa mengisi tes ini" }, { status: 403 })
    }

    const nannyProfile = await prisma.nannyProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!nannyProfile) {
      return NextResponse.json({ success: false, error: "Profil nanny tidak ditemukan" }, { status: 404 })
    }

    const existing = await prisma.assessmentResult.findFirst({
      where: { nannyProfileId: nannyProfile.id, layer: "LAYER_2", testType: "Capture Work Style" },
      select: { id: true },
    })
    if (existing) {
      return NextResponse.json({ success: false, error: "Psikotes Karakter Kerja Nanny sudah pernah diisi" }, { status: 409 })
    }

    const body = (await request.json()) as { answers?: unknown }
    const { answers } = body

    if (!Array.isArray(answers) || answers.length !== CAPTURE_WORK_STYLE_ITEMS.length) {
      return NextResponse.json(
        { success: false, error: `Jawaban harus lengkap (${CAPTURE_WORK_STYLE_ITEMS.length} soal)` },
        { status: 400 }
      )
    }
    if (answers.some((a) => a !== "A" && a !== "B")) {
      return NextResponse.json({ success: false, error: "Format jawaban tidak valid" }, { status: 400 })
    }

    const result = scoreCaptureWorkStyle(answers as CaptureWorkStyleAnswer[])

    await prisma.assessmentResult.create({
      data: {
        nannyProfileId: nannyProfile.id,
        layer: "LAYER_2",
        testType: "Capture Work Style",
        rawScores: {
          answers,
          dimensionRaw: result.dimensionRaw,
          dimensionScore100: result.dimensionScore100,
          aspects: result.aspects,
          flags: result.flags,
        },
        interpretedBy: "AI",
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[NANNY_TES_SIKAP_KERJA_POST]", error)
    return NextResponse.json({ success: false, error: "Gagal menyimpan hasil tes" }, { status: 500 })
  }
}
