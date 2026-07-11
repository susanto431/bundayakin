import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { CONSULTATION_SLOT_TIMES } from "../src/constants/consultation"

// Backfill satu-kali (ADR-012, 11 Juli 2026): sebelum ini, semua psikolog aktif
// dianggap buka tiap hari di 3 jam baku. Setelah PsikologWeeklySchedule ada,
// "tidak ada baris = tutup" — jadi psikolog yang sudah aktif harus dibuka
// penuh (21 baris) dulu supaya perilaku booking tidak berubah mendadak sampai
// psikolog itu sendiri mengatur ulang jadwalnya di Portal Psikolog.
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const psikologs = await prisma.psikologProfile.findMany({
    where: { isActive: true },
    select: { id: true, fullName: true },
  })

  console.log(`Backfill Jadwal Psikolog untuk ${psikologs.length} psikolog aktif...`)

  let created = 0
  for (const p of psikologs) {
    for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
      for (const slotTime of CONSULTATION_SLOT_TIMES) {
        const result = await prisma.psikologWeeklySchedule.upsert({
          where: { psikologId_dayOfWeek_slotTime: { psikologId: p.id, dayOfWeek, slotTime } },
          update: {},
          create: { psikologId: p.id, dayOfWeek, slotTime, isOpen: true },
        })
        if (result) created++
      }
    }
    console.log(`  ✓ ${p.fullName} — 21 slot dibuka`)
  }

  console.log(`Selesai. ${created} baris diproses (upsert, aman dijalankan ulang).`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
