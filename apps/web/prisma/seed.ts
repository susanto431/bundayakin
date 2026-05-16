import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"
import { SURVEY_QUESTIONS } from "../src/constants/survey-questions"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding SurveyQuestion table…")

  let upserted = 0

  for (let i = 0; i < SURVEY_QUESTIONS.length; i++) {
    const q = SURVEY_QUESTIONS[i]

    await prisma.surveyQuestion.upsert({
      where: { code: q.id },
      update: {
        domain: q.domain,
        aspect: q.subdomain,
        aspectLabel: q.subdomainLabel,
        layer: q.layer,
        weight: q.weight,
        order: i,
        isActive: true,
        canBeDealbreaker: q.canBeDealbreaker,

        questionTextNanny: q.forNanny.question,
        optionsNanny: q.forNanny.options.length > 0 ? q.forNanny.options : undefined,
        hasFreeTextNanny: q.forNanny.hasFreeText ?? false,
        freeTextTriggersNanny: q.forNanny.freeTextTriggers ?? [],

        questionTextParent: q.forParent?.question ?? null,
        optionsParent: q.forParent && q.forParent.options.length > 0 ? q.forParent.options : undefined,
        hasFreeTextParent: q.forParent?.hasFreeText ?? false,
        freeTextTriggersParent: q.forParent?.freeTextTriggers ?? [],

        popupFollowUp: q.popupFollowUp ?? undefined,
      },
      create: {
        code: q.id,
        domain: q.domain,
        aspect: q.subdomain,
        aspectLabel: q.subdomainLabel,
        layer: q.layer,
        weight: q.weight,
        order: i,
        isActive: true,
        canBeDealbreaker: q.canBeDealbreaker,

        questionTextNanny: q.forNanny.question,
        optionsNanny: q.forNanny.options.length > 0 ? q.forNanny.options : undefined,
        hasFreeTextNanny: q.forNanny.hasFreeText ?? false,
        freeTextTriggersNanny: q.forNanny.freeTextTriggers ?? [],

        questionTextParent: q.forParent?.question ?? null,
        optionsParent: q.forParent && q.forParent.options.length > 0 ? q.forParent.options : undefined,
        hasFreeTextParent: q.forParent?.hasFreeText ?? false,
        freeTextTriggersParent: q.forParent?.freeTextTriggers ?? [],

        popupFollowUp: q.popupFollowUp ?? undefined,
      },
    })
    upserted++
  }

  console.log(`Done — ${upserted} questions upserted.`)

  // ── Demo Users ─────────────────────────────────────────────────
  console.log("\nSeeding demo users…")
  const pw = await bcrypt.hash("demo123", 10)

  // 3 Akun Orang Tua
  const bundaA = await prisma.user.upsert({
    where: { email: "ria.putri@demo.bundayakin.com" },
    update: {},
    create: {
      email: "ria.putri@demo.bundayakin.com",
      name: "Ria Putri",
      hashedPassword: pw,
      role: "PARENT",
    },
  })
  const bundaAProfile = await prisma.parentProfile.upsert({
    where: { userId: bundaA.id },
    update: {},
    create: { userId: bundaA.id, fullName: "Ria Putri" },
  })
  await prisma.childProfile.upsert({
    where: { id: "demo-child-kira" },
    update: {},
    create: {
      id: "demo-child-kira",
      parentProfileId: bundaAProfile.id,
      name: "Kira",
      dateOfBirth: new Date("2022-03-15"),
      ageGroup: "TODDLER_1_3Y",
      gender: "Perempuan",
      sortOrder: 0,
    },
  })

  const bundaB = await prisma.user.upsert({
    where: { email: "sandra.dewi@demo.bundayakin.com" },
    update: {},
    create: {
      email: "sandra.dewi@demo.bundayakin.com",
      name: "Sandra Dewi",
      hashedPassword: pw,
      role: "PARENT",
    },
  })
  const bundaBProfile = await prisma.parentProfile.upsert({
    where: { userId: bundaB.id },
    update: {},
    create: { userId: bundaB.id, fullName: "Sandra Dewi" },
  })
  await prisma.childProfile.upsert({
    where: { id: "demo-child-rafi" },
    update: {},
    create: {
      id: "demo-child-rafi",
      parentProfileId: bundaBProfile.id,
      name: "Rafi",
      dateOfBirth: new Date("2020-07-10"),
      ageGroup: "PRESCHOOL_3_6Y",
      gender: "Laki-laki",
      sortOrder: 0,
    },
  })
  await prisma.childProfile.upsert({
    where: { id: "demo-child-naila" },
    update: {},
    create: {
      id: "demo-child-naila",
      parentProfileId: bundaBProfile.id,
      name: "Naila",
      dateOfBirth: new Date("2023-01-20"),
      ageGroup: "TODDLER_1_3Y",
      gender: "Perempuan",
      medicalNotes: "Kolik — perlu teknik penanganan khusus",
      sortOrder: 1,
    },
  })

  const bundaC = await prisma.user.upsert({
    where: { email: "mega.sari@demo.bundayakin.com" },
    update: {},
    create: {
      email: "mega.sari@demo.bundayakin.com",
      name: "Mega Sari",
      hashedPassword: pw,
      role: "PARENT",
    },
  })
  const bundaCProfile = await prisma.parentProfile.upsert({
    where: { userId: bundaC.id },
    update: {},
    create: { userId: bundaC.id, fullName: "Mega Sari" },
  })
  await prisma.childProfile.upsert({
    where: { id: "demo-child-zayn" },
    update: {},
    create: {
      id: "demo-child-zayn",
      parentProfileId: bundaCProfile.id,
      name: "Zayn",
      dateOfBirth: new Date("2025-12-01"),
      ageGroup: "INFANT_0_6M",
      gender: "Laki-laki",
      allergies: "Susu sapi",
      medicalNotes: "Alergi susu sapi — wajib formula khusus",
      sortOrder: 0,
    },
  })

  // 3 Akun Nanny
  const nannyA = await prisma.user.upsert({
    where: { email: "siti.rahayu@demo.bundayakin.com" },
    update: {},
    create: {
      email: "siti.rahayu@demo.bundayakin.com",
      name: "Siti Rahayu",
      hashedPassword: pw,
      role: "NANNY",
    },
  })
  await prisma.nannyProfile.upsert({
    where: { userId: nannyA.id },
    update: {},
    create: {
      userId: nannyA.id,
      fullName: "Siti Rahayu",
      city: "Jakarta Selatan",
      educationLevel: "SMA",
      nannyType: ["LIVE_IN"],
      yearsOfExperience: 4,
      bio: "Sudah 4 tahun merawat anak usia 1–5 tahun di 2 keluarga Jakarta.",
      expectedSalaryMin: 3000000,
      expectedSalaryMax: 3500000,
      openToJob: true,
      isAvailable: true,
    },
  })

  const nannyB = await prisma.user.upsert({
    where: { email: "dewi.lestari@demo.bundayakin.com" },
    update: {},
    create: {
      email: "dewi.lestari@demo.bundayakin.com",
      name: "Dewi Lestari",
      hashedPassword: pw,
      role: "NANNY",
    },
  })
  await prisma.nannyProfile.upsert({
    where: { userId: nannyB.id },
    update: {},
    create: {
      userId: nannyB.id,
      fullName: "Dewi Lestari",
      city: "Jakarta Timur",
      educationLevel: "D3 Keperawatan",
      nannyType: ["LIVE_OUT"],
      yearsOfExperience: 7,
      bio: "Latar belakang keperawatan. Terbiasa tangani anak dengan kondisi medis khusus.",
      expectedSalaryMin: 4000000,
      expectedSalaryMax: 4500000,
      openToJob: true,
      isAvailable: true,
    },
  })

  const nannyC = await prisma.user.upsert({
    where: { email: "ratna.wulandari@demo.bundayakin.com" },
    update: {},
    create: {
      email: "ratna.wulandari@demo.bundayakin.com",
      name: "Ratna Wulandari",
      hashedPassword: pw,
      role: "NANNY",
    },
  })
  await prisma.nannyProfile.upsert({
    where: { userId: nannyC.id },
    update: {},
    create: {
      userId: nannyC.id,
      fullName: "Ratna Wulandari",
      city: "Bekasi",
      educationLevel: "SMA",
      nannyType: ["LIVE_IN", "LIVE_OUT"],
      yearsOfExperience: 1,
      bio: "Pengalaman 1 tahun menjaga balita usia 2–3 tahun.",
      expectedSalaryMin: 2500000,
      expectedSalaryMax: 3000000,
      openToJob: true,
      isAvailable: true,
    },
  })

  console.log("✅ Demo users selesai:")
  console.log("  Bunda A: ria.putri@demo.bundayakin.com / demo123 (1 anak: Kira)")
  console.log("  Bunda B: sandra.dewi@demo.bundayakin.com / demo123 (2 anak: Rafi, Naila)")
  console.log("  Bunda C: mega.sari@demo.bundayakin.com / demo123 (1 anak: Zayn)")
  console.log("  Nanny A: siti.rahayu@demo.bundayakin.com / demo123")
  console.log("  Nanny B: dewi.lestari@demo.bundayakin.com / demo123")
  console.log("  Nanny C: ratna.wulandari@demo.bundayakin.com / demo123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
