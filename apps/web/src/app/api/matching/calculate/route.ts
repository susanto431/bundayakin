export const dynamic = "force-dynamic"
export const maxDuration = 60

// POST /api/matching/calculate
// Body: { nannyProfileId: string }
// Auth: hanya parent yang login
// Menghitung skor kecocokan via Claude API dan menyimpan ke MatchResult (cache 7 hari).

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Anthropic from "@anthropic-ai/sdk"
import { buildMatchingPrompt, type MatchingPromptResult } from "@/lib/prompts/matching"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "PARENT") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json() as { nannyProfileId: string }
    const { nannyProfileId } = body
    if (!nannyProfileId) {
      return NextResponse.json({ success: false, error: "nannyProfileId diperlukan" }, { status: 400 })
    }

    // Ambil parentProfile
    const parentProfile = await prisma.parentProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        fullName: true,
        surveyAnswers: true,
        surveyResponses: {
          select: { questionCode: true, answerValue: true, isDealbreaker: true },
        },
        children: {
          select: { name: true, dateOfBirth: true, medicalNotes: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    })
    if (!parentProfile) {
      return NextResponse.json({ success: false, error: "Profil orang tua tidak ditemukan" }, { status: 404 })
    }

    // Cek cache MatchResult (< 7 hari)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const existing = await prisma.matchResult.findUnique({
      where: { parentProfileId_nannyProfileId: { parentProfileId: parentProfile.id, nannyProfileId } },
    })
    if (existing && existing.generatedAt > sevenDaysAgo) {
      return NextResponse.json({ success: true, data: existing })
    }

    // Ambil nannyProfile
    const nannyProfile = await prisma.nannyProfile.findUnique({
      where: { id: nannyProfileId },
      select: {
        id: true,
        fullName: true,
        dateOfBirth: true,
        yearsOfExperience: true,
        city: true,
        nannyType: true,
        surveyAnswers: true,
        surveyResponses: {
          select: { questionCode: true, answerValue: true },
        },
      },
    })
    if (!nannyProfile) {
      return NextResponse.json({ success: false, error: "Profil nanny tidak ditemukan" }, { status: 404 })
    }

    // Build survey answer maps dari SurveyResponse rows (lebih akurat dari JSON snapshot)
    const parentAnswers: Record<string, string> = {}
    for (const r of parentProfile.surveyResponses) {
      if (r.answerValue) parentAnswers[r.questionCode] = r.answerValue
    }
    // Fallback ke snapshot JSON jika tidak ada SurveyResponse rows
    if (Object.keys(parentAnswers).length === 0 && parentProfile.surveyAnswers) {
      const snap = parentProfile.surveyAnswers as Record<string, { value: string }>
      for (const [k, v] of Object.entries(snap)) {
        if (v?.value) parentAnswers[k] = v.value
      }
    }

    const nannyAnswers: Record<string, string> = {}
    for (const r of nannyProfile.surveyResponses) {
      if (r.answerValue) nannyAnswers[r.questionCode] = r.answerValue
    }
    if (Object.keys(nannyAnswers).length === 0 && nannyProfile.surveyAnswers) {
      const snap = nannyProfile.surveyAnswers as Record<string, { value: string }>
      for (const [k, v] of Object.entries(snap)) {
        if (v?.value) nannyAnswers[k] = v.value
      }
    }

    const dealbreakers = parentProfile.surveyResponses
      .filter(r => r.isDealbreaker)
      .map(r => r.questionCode)

    const nannyUsia = nannyProfile.dateOfBirth
      ? Math.floor((Date.now() - new Date(nannyProfile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : 30

    const prompt = buildMatchingPrompt({
      parent: {
        nama: parentProfile.fullName,
        surveyAnswers: parentAnswers,
        dealbreakers,
        anak: parentProfile.children.map(c => ({
          nama: c.name,
          usia: Math.floor((Date.now() - new Date(c.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)),
          kondisiKhusus: c.medicalNotes ?? undefined,
        })),
      },
      nanny: {
        nama: nannyProfile.fullName,
        usia: nannyUsia,
        pengalamanTahun: nannyProfile.yearsOfExperience ?? 0,
        kotaDomisili: nannyProfile.city ?? "Indonesia",
        tipeKerja: nannyProfile.nannyType as string[],
        surveyAnswers: nannyAnswers,
      },
    })

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    })

    const rawText = response.content[0].type === "text" ? response.content[0].text : "{}"
    // Extract JSON — strip markdown code fences and any leading/trailing text
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("Claude tidak mengembalikan JSON yang valid")
    const result = JSON.parse(jsonMatch[0]) as MatchingPromptResult

    const skorKeseluruhan = Math.round(result.skor_keseluruhan ?? 0)
    const skorDomainA = result.skor_domain?.A != null ? Math.round(result.skor_domain.A) : null
    const skorDomainB = result.skor_domain?.B != null ? Math.round(result.skor_domain.B) : null
    const skorDomainC = result.skor_domain?.C != null ? Math.round(result.skor_domain.C) : null

    await prisma.matchResult.upsert({
      where: { parentProfileId_nannyProfileId: { parentProfileId: parentProfile.id, nannyProfileId } },
      update: {
        skorKeseluruhan,
        skorDomainA,
        skorDomainB,
        skorDomainC,
        kekuatan: result.kekuatan ?? [],
        potensiLemah: result.potensi_lemah ?? [],
        potensiKonflik: result.potensi_konflik ?? [],
        caraMengatasi: result.cara_mengatasi ?? [],
        tipsOrangTua: result.tips_orang_tua ?? [],
        tipsNanny: result.tips_nanny ?? [],
        dealbreakerFlags: result.dealbreaker_flags ?? [],
        adaDealbreaker: result.ada_dealbreaker ?? false,
        generatedAt: new Date(),
      },
      create: {
        parentProfileId: parentProfile.id,
        nannyProfileId,
        skorKeseluruhan,
        skorDomainA,
        skorDomainB,
        skorDomainC,
        kekuatan: result.kekuatan ?? [],
        potensiLemah: result.potensi_lemah ?? [],
        potensiKonflik: result.potensi_konflik ?? [],
        caraMengatasi: result.cara_mengatasi ?? [],
        tipsOrangTua: result.tips_orang_tua ?? [],
        tipsNanny: result.tips_nanny ?? [],
        dealbreakerFlags: result.dealbreaker_flags ?? [],
        adaDealbreaker: result.ada_dealbreaker ?? false,
      },
    })

    // Return with nannyProfile included so the drawer can render without a second fetch
    const matchResult = await prisma.matchResult.findUnique({
      where: { parentProfileId_nannyProfileId: { parentProfileId: parentProfile.id, nannyProfileId } },
      include: {
        nannyProfile: {
          select: {
            id: true, userId: true, fullName: true, dateOfBirth: true, city: true,
            educationLevel: true, yearsOfExperience: true, nannyType: true,
            profilePhotoUrl: true, phone: true, bio: true,
          },
        },
      },
    })

    console.info("[MATCHING_CALCULATE]", parentProfile.id, nannyProfileId, `skor=${result.skor_keseluruhan}`)
    return NextResponse.json({ success: true, data: matchResult })
  } catch (error) {
    console.error("[MATCHING_CALCULATE]", error)
    const raw = error instanceof Error ? error.message : String(error)
    const userMsg = raw.includes("credit balance is too low")
      ? "Fitur kalkulasi AI sedang tidak tersedia. Silakan coba beberapa saat lagi."
      : "Kalkulasi matching gagal. Silakan coba lagi."
    return NextResponse.json({ success: false, error: userMsg }, { status: 500 })
  }
}
