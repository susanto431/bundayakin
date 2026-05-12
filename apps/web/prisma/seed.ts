import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
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
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
