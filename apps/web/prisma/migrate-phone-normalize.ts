/**
 * One-time migration: normalize all existing phone numbers to E.164-style 62XXXXXXXXXX format.
 * Run from apps/web/:
 *   npx tsx prisma/migrate-phone-normalize.ts
 *
 * Safe to run multiple times (idempotent — already-normalized numbers are not changed).
 */
import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

function normalizePhone(raw: string): string {
  let p = raw.replace(/\D/g, "")
  if (p.startsWith("0")) p = "62" + p.slice(1)
  if (!p.startsWith("62")) p = "62" + p
  return p
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const users = await prisma.user.findMany({
    where: { phone: { not: null } },
    select: { id: true, phone: true },
  })

  console.log(`Found ${users.length} users with phone numbers.`)

  let updated = 0
  let skipped = 0
  const conflicts: string[] = []

  for (const user of users) {
    const raw = user.phone!
    const normalized = normalizePhone(raw)

    if (raw === normalized) {
      skipped++
      continue
    }

    // Check if normalized number is already taken by another user
    const existing = await prisma.user.findFirst({
      where: { phone: normalized, id: { not: user.id } },
      select: { id: true },
    })

    if (existing) {
      conflicts.push(`User ${user.id}: "${raw}" → "${normalized}" CONFLICTS with user ${existing.id}`)
      continue
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { phone: normalized },
    })

    console.log(`  Updated: "${raw}" → "${normalized}"`)
    updated++
  }

  console.log(`\nDone. Updated: ${updated}, Already normalized: ${skipped}, Conflicts: ${conflicts.length}`)

  if (conflicts.length > 0) {
    console.log("\nCONFLICTS (perlu ditangani manual):")
    conflicts.forEach(c => console.log(" ", c))
  }
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
