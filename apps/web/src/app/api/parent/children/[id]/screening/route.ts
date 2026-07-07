import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { KPSP_QUESTIONNAIRES, KPSP_AGE_BANDS, type KpspAgeBand } from "@/lib/kpsp-instrument"
import { kpspRoundedAgeMonths, applyPrematureCorrection, selectKpspAgeBand, scoreKpsp } from "@/lib/kpsp-scoring"
import { revalidateTag } from "next/cache"
import { NextResponse } from "next/server"

// POST /api/parent/children/[id]/screening
// Body: { ageBand: number, answers: boolean[] }
// Skrining Perkembangan (KPSP) — mengisi gratis untuk semua akun; hasil/interpretasi
// khusus pelanggan (PRD 13 §4, konsisten dengan Kurva Pertumbuhan Tahap 1).
async function getChildForUser(childId: string, userId: string) {
  return prisma.childProfile.findFirst({
    where: { id: childId, parentProfile: { userId } },
    select: { id: true, name: true, dateOfBirth: true, gestationalWeeksAtBirth: true },
  })
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const child = await getChildForUser(id, session.user.id)
    if (!child) {
      return NextResponse.json({ success: false, error: "Data anak tidak ditemukan" }, { status: 404 })
    }

    const body = (await request.json()) as { ageBand?: number; answers?: boolean[] }

    if (typeof body.ageBand !== "number" || !KPSP_AGE_BANDS.includes(body.ageBand as KpspAgeBand)) {
      return NextResponse.json({ success: false, error: "Kelompok usia tidak valid" }, { status: 400 })
    }
    const ageBand = body.ageBand as KpspAgeBand

    // Validasi ulang di server: ageBand yang dikirim client harus cocok dengan usia anak SEKARANG
    // (mencegah manipulasi/formulir usia yang salah — tidak sekadar percaya kiriman client).
    const now = new Date()
    const rawAge = kpspRoundedAgeMonths(child.dateOfBirth, now)
    const correctedAge = applyPrematureCorrection(rawAge, child.gestationalWeeksAtBirth)
    const expectedAgeBand = selectKpspAgeBand(correctedAge)
    if (expectedAgeBand !== ageBand) {
      return NextResponse.json(
        { success: false, error: "Kelompok usia sudah berubah, muat ulang halaman dan coba lagi" },
        { status: 409 }
      )
    }

    const questionnaire = KPSP_QUESTIONNAIRES[ageBand]
    if (!Array.isArray(body.answers) || body.answers.length !== questionnaire.length) {
      return NextResponse.json(
        { success: false, error: `Jawaban harus lengkap (${questionnaire.length} pertanyaan)` },
        { status: 400 }
      )
    }
    if (body.answers.some((a) => typeof a !== "boolean")) {
      return NextResponse.json({ success: false, error: "Format jawaban tidak valid" }, { status: 400 })
    }

    const { yaCount, category } = scoreKpsp(body.answers)

    const record = await prisma.developmentScreeningRecord.create({
      data: {
        childProfileId: id,
        screeningDate: now,
        ageMonthsUsed: correctedAge,
        ageBand,
        answers: body.answers,
        yaCount,
        category,
      },
      select: { id: true },
    })

    revalidateTag(`parent-${session.user.id}`)

    return NextResponse.json({ success: true, data: { id: record.id, yaCount, category } }, { status: 201 })
  } catch (error) {
    console.error("[DEVELOPMENT_SCREENING_POST]", error)
    return NextResponse.json({ success: false, error: "Gagal menyimpan hasil skrining" }, { status: 500 })
  }
}
