/**
 * One-time script: jadikan satu akun sebagai ADMIN (akses Pricing Config Panel, dll).
 * Run dari apps/web/:
 *   npx tsx prisma/set-admin-role.ts <email-atau-nomor-hp>
 *
 * Aman dijalankan berkali-kali (idempotent — kalau sudah ADMIN, tidak diubah lagi).
 * Hanya butuh identifier (email/HP) — TIDAK butuh dan TIDAK menerima password.
 */
import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

function normalizePhone(raw: string): string {
  let p = raw.replace(/\D/g, "")
  if (p.startsWith("0")) p = "62" + p.slice(1)
  if (!p.startsWith("62")) p = "62" + p
  return p
}

async function main() {
  const identifier = process.argv[2]
  if (!identifier) {
    console.error("Penggunaan: npx tsx prisma/set-admin-role.ts <email-atau-nomor-hp>")
    process.exit(1)
  }

  const isEmail = identifier.includes("@")
  const user = isEmail
    ? await prisma.user.findUnique({
        where: { email: identifier },
        select: { id: true, email: true, phone: true, name: true, role: true },
      })
    : await prisma.user.findUnique({
        where: { phone: normalizePhone(identifier) },
        select: { id: true, email: true, phone: true, name: true, role: true },
      })

  if (!user) {
    console.error(`User dengan identifier "${identifier}" tidak ditemukan.`)
    process.exit(1)
  }

  if (user.role === "ADMIN") {
    console.log(`✓ ${user.email} (${user.name ?? "-"}) sudah ADMIN. Tidak ada perubahan.`)
    return
  }

  const previousRole = user.role
  await prisma.user.update({
    where: { id: user.id },
    data: { role: "ADMIN" },
  })

  console.log(`✓ ${user.email} (${user.name ?? "-"}) diubah dari ${previousRole} → ADMIN.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
