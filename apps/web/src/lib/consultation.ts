import { prisma } from "@/lib/prisma"
import { getEffectiveValue } from "@/lib/pricing-config"
import { CONSULTATION_SLOT_TIMES, type ConsultationSlotTime } from "@/constants/consultation"
import type { PsikologLevel, Prisma } from "@prisma/client"

// Strategi peluncuran (PRD 13 §4, Juli 2026): sesi dijual dengan harga Mid,
// tapi dikerjakan/disupervisi langsung psikolog SENIOR selama 2–3 bulan
// pertama. Junior baru dibuka belakangan — lihat PRD 13 §7b keputusan 3.
// Ubah konstanta ini saat level lain resmi dibuka untuk assignment nyata.
const LAUNCH_ASSIGNMENT_LEVEL: PsikologLevel = "SENIOR"

/** Harga sesi yang benar-benar dijual saat ini (Tahap 2 peluncuran): hanya tarif Mid,
 * dengan harga khusus untuk pelanggan aktif. Junior/Senior belum dibuka untuk dibeli
 * (PRD 13 §7b keputusan 3) walau sudah dikonfigurasi di Pricing Config Panel. */
export async function getConsultationPrice(isSubscriber: boolean): Promise<{ level: PsikologLevel; priceIDR: number }> {
  const priceIDR = isSubscriber
    ? await getEffectiveValue("CONSULTATION_CUSTOMER_FEE_IDR")
    : await getEffectiveValue("CONSULTATION_MID_FEE_IDR")
  return { level: "MID", priceIDR }
}

function toDateOnly(date: Date): Date {
  const d = new Date(date)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

/** Sisa kapasitas per slot jam pada satu tanggal, dijumlah dari semua psikolog
 * aktif level SENIOR (lihat LAUNCH_ASSIGNMENT_LEVEL) dikurangi booking yang
 * masih menahan slot (PENDING_PAYMENT/CONFIRMED). */
export async function getAvailabilityForDate(bookingDate: Date): Promise<Array<{ slotTime: ConsultationSlotTime; remaining: number }>> {
  const dateOnly = toDateOnly(bookingDate)

  const psikologs = await prisma.psikologProfile.findMany({
    where: { isActive: true, level: LAUNCH_ASSIGNMENT_LEVEL },
    select: { id: true, dailyCapacity: true },
  })

  const bookings = await prisma.consultationBooking.findMany({
    where: { bookingDate: dateOnly, status: { in: ["PENDING_PAYMENT", "CONFIRMED"] } },
    select: { psikologId: true, slotTime: true },
  })
  const dailyCountByPsikolog = new Map<string, number>()
  for (const b of bookings) {
    dailyCountByPsikolog.set(b.psikologId, (dailyCountByPsikolog.get(b.psikologId) ?? 0) + 1)
  }

  // Satu slot tersedia untuk psikolog X hanya jika X belum habis kapasitas
  // hariannya DAN belum punya booking lain persis di jam itu (unique constraint
  // [psikologId, bookingDate, slotTime] mencegah dua booking di psikolog+slot yang sama).
  return CONSULTATION_SLOT_TIMES.map((slotTime) => {
    const eligiblePsikologCount = psikologs.filter((p) => {
      const hasCapacityLeft = (dailyCountByPsikolog.get(p.id) ?? 0) < p.dailyCapacity
      const alreadyBookedThisSlot = bookings.some((b) => b.psikologId === p.id && b.slotTime === slotTime)
      return hasCapacityLeft && !alreadyBookedThisSlot
    }).length

    return { slotTime, remaining: eligiblePsikologCount }
  })
}

export type CreateBookingResult =
  | { ok: true; bookingId: string; psikologId: string }
  | { ok: false; error: string }

/** Cari psikolog aktif (level SENIOR, strategi peluncuran) yang masih punya
 * kapasitas harian & belum dibooking di slot ini, lalu buat ConsultationBooking.
 * Race condition dua parent booking bersamaan ditangani oleh unique constraint
 * [psikologId, bookingDate, slotTime] di database — kalau psikolog pertama yang
 * dicoba sudah keburu diambil, coba psikolog berikutnya. */
export async function createConsultationBooking(input: {
  parentProfileId: string
  childProfileId: string
  bookingDate: Date
  slotTime: ConsultationSlotTime
  priceIDR: number
  level: PsikologLevel
  sourceScreeningId?: string | null
}): Promise<CreateBookingResult> {
  const dateOnly = toDateOnly(input.bookingDate)

  const candidates = await prisma.psikologProfile.findMany({
    where: { isActive: true, level: LAUNCH_ASSIGNMENT_LEVEL },
    select: { id: true, dailyCapacity: true },
  })
  if (candidates.length === 0) {
    return { ok: false, error: "Belum ada psikolog aktif yang bisa menerima sesi. Coba lagi nanti." }
  }

  const bookingCounts = await prisma.consultationBooking.groupBy({
    by: ["psikologId"],
    where: { bookingDate: dateOnly, status: { in: ["PENDING_PAYMENT", "CONFIRMED"] } },
    _count: { _all: true },
  })
  const countMap = new Map(bookingCounts.map((b) => [b.psikologId, b._count._all]))

  // Urutkan yang paling lowong dulu (load balancing) dan yang masih punya kapasitas
  const eligible = candidates
    .filter((p) => (countMap.get(p.id) ?? 0) < p.dailyCapacity)
    .sort((a, b) => (countMap.get(a.id) ?? 0) - (countMap.get(b.id) ?? 0))

  if (eligible.length === 0) {
    return { ok: false, error: "Slot pada tanggal ini sudah penuh. Pilih tanggal lain." }
  }

  for (const psikolog of eligible) {
    try {
      const booking = await prisma.consultationBooking.create({
        data: {
          parentProfileId: input.parentProfileId,
          childProfileId: input.childProfileId,
          psikologId: psikolog.id,
          level: input.level,
          priceIDR: input.priceIDR,
          bookingDate: dateOnly,
          slotTime: input.slotTime,
          sourceScreeningId: input.sourceScreeningId ?? null,
          status: "PENDING_PAYMENT",
        },
        select: { id: true, psikologId: true },
      })
      return { ok: true, bookingId: booking.id, psikologId: booking.psikologId }
    } catch (error) {
      // P2002 = unique constraint violation ([psikologId, bookingDate, slotTime]) — psikolog ini
      // baru saja diambil booking lain, coba kandidat berikutnya.
      const isUniqueViolation = (error as Prisma.PrismaClientKnownRequestError)?.code === "P2002"
      if (!isUniqueViolation) throw error
    }
  }

  return { ok: false, error: "Slot pada tanggal ini baru saja penuh. Pilih slot atau tanggal lain." }
}
