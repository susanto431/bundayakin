/**
 * Migration: copy parentProfile.phone / nannyProfile.phone → User.phone
 * Jalankan sekali sebelum deploy schema baru:
 *   cd apps/web && DATABASE_URL=... npx tsx scripts/migrate-phone.ts
 */
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  // Parent: User.phone kosong tapi parentProfile.phone ada
  const parents = await (prisma as any).parentProfile.findMany({
    where: { phone: { not: null }, user: { phone: null } },
    select: { userId: true, phone: true },
  })

  for (const p of parents) {
    await prisma.user.update({ where: { id: p.userId }, data: { phone: p.phone } })
    console.log(`[PARENT] userId=${p.userId} phone=${p.phone}`)
  }

  // Nanny: sama
  const nannies = await (prisma as any).nannyProfile.findMany({
    where: { phone: { not: null }, user: { phone: null } },
    select: { userId: true, phone: true },
  })

  for (const n of nannies) {
    await prisma.user.update({ where: { id: n.userId }, data: { phone: n.phone } })
    console.log(`[NANNY]  userId=${n.userId} phone=${n.phone}`)
  }

  console.log(`\nSelesai. Parent: ${parents.length}, Nanny: ${nannies.length}`)
}

main()
  .catch(console.error)
  .finally(() => { prisma.$disconnect(); pool.end() })
