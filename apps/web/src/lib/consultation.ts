import { prisma } from "@/lib/prisma"
import { getEffectiveValue } from "@/lib/pricing-config"
import {
  CONSULTATION_SLOT_TIMES,
  CONSULTATION_DEFAULT_DAILY_CAPACITY,
  type ConsultationSlotTime,
} from "@/constants/consultation"
import type { PsikologLevel, Prisma } from "@prisma/client"

// Strategi peluncuran (PRD 13 §4 & §7c, koreksi 11 Juli 2026): sesi dijual
// dan dikerjakan langsung oleh psikolog level MID (harga dan level assignment
// harus sama). Junior baru dibuka belakangan — lihat PRD 13 §7b keputusan 3.
// Ubah konstanta ini saat level lain resmi dibuka untuk assignment nyata.
const LAUNCH_ASSIGNMENT_LEVEL: PsikologLevel = "MID"

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

function isoDate(date: Date): string {
  return date.toISOString().split("T")[0]
}

function daysInMonth(yearMonth: string): Date[] {
  const [year, month] = yearMonth.split("-").map(Number)
  const days: Date[] = []
  const cursor = new Date(Date.UTC(year, month - 1, 1))
  while (cursor.getUTCMonth() === month - 1) {
    days.push(new Date(cursor))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return days
}

// ============================================================
// JAM TERBANG & DAFTAR PSIKOLOG — dihitung langsung dari ConsultationBooking,
// tidak disimpan sebagai kolom (ADR-012, 11 Juli 2026).
// ============================================================

export type PsikologListItem = {
  id: string
  fullName: string
  level: PsikologLevel
  jamTerbang: number
  hasHandledThisChild: boolean
}

/** Psikolog aktif level peluncuran (Mid) + Jam Terbang (jumlah sesi selesai) +
 * tanda "pernah menangani anak ini" kalau childProfileId diberikan. Jam Terbang
 * & tanda kontinuitas ditampilkan publik ke orang tua (beda dari Ulasan Psikolog
 * yang internal-only). */
export async function listActivePsikologsWithStats(childProfileId?: string): Promise<PsikologListItem[]> {
  const psikologs = await prisma.psikologProfile.findMany({
    where: { isActive: true, level: LAUNCH_ASSIGNMENT_LEVEL },
    select: { id: true, fullName: true, level: true },
  })

  return Promise.all(
    psikologs.map(async (p) => {
      const [jamTerbang, handledCount] = await Promise.all([
        prisma.consultationBooking.count({ where: { psikologId: p.id, status: "COMPLETED" } }),
        childProfileId
          ? prisma.consultationBooking.count({
              where: { psikologId: p.id, childProfileId, status: { in: ["CONFIRMED", "COMPLETED"] } },
            })
          : Promise.resolve(0),
      ])
      return { id: p.id, fullName: p.fullName, level: p.level, jamTerbang, hasHandledThisChild: handledCount > 0 }
    })
  )
}

// ============================================================
// JADWAL PSIKOLOG — pola mingguan + cuti (ADR-012). "Tidak ada baris = tutup".
// Cuti menang mutlak atas pola mingguan.
// ============================================================

/** Peta psikolog yang buka per slot jam pada SATU tanggal — dipakai untuk
 * ketersediaan booking (bukan tampilan kalender bulan, lihat getPooledAvailabilityForMonth
 * untuk itu). Satu pasang query untuk semua psikolog & slot sekaligus (bukan N+1). */
async function getOpenPsikologsMapForDate(
  psikologIds: string[],
  dateOnly: Date
): Promise<Map<ConsultationSlotTime, Set<string>>> {
  const map = new Map<ConsultationSlotTime, Set<string>>()
  for (const slotTime of CONSULTATION_SLOT_TIMES) map.set(slotTime, new Set())
  if (psikologIds.length === 0) return map

  const dayOfWeek = dateOnly.getUTCDay()
  const [weeklyRows, cutiRows] = await Promise.all([
    prisma.psikologWeeklySchedule.findMany({
      where: { psikologId: { in: psikologIds }, dayOfWeek, isOpen: true },
      select: { psikologId: true, slotTime: true },
    }),
    prisma.psikologCuti.findMany({
      where: { psikologId: { in: psikologIds }, cutiDate: dateOnly },
      select: { psikologId: true },
    }),
  ])
  const cutiSet = new Set(cutiRows.map((r) => r.psikologId))
  for (const row of weeklyRows) {
    if (cutiSet.has(row.psikologId)) continue
    map.get(row.slotTime as ConsultationSlotTime)?.add(row.psikologId)
  }
  return map
}

export type DateAvailabilityStatus = "AVAILABLE" | "FULL"

/** Kalender bulan gabungan semua psikolog aktif — untuk entry "pilih tanggal dulu".
 * Satu tanggal berstatus AVAILABLE kalau MINIMAL SATU psikolog masih punya slot. */
export async function getPooledAvailabilityForMonth(yearMonth: string): Promise<Record<string, DateAvailabilityStatus>> {
  const days = daysInMonth(yearMonth)
  const monthStart = days[0]
  const monthEnd = days[days.length - 1]

  const psikologs = await prisma.psikologProfile.findMany({
    where: { isActive: true, level: LAUNCH_ASSIGNMENT_LEVEL },
    select: { id: true, dailyCapacity: true },
  })
  const psikologIds = psikologs.map((p) => p.id)
  const capacityById = new Map(psikologs.map((p) => [p.id, p.dailyCapacity]))

  const result: Record<string, DateAvailabilityStatus> = {}
  if (psikologIds.length === 0) {
    for (const day of days) result[isoDate(day)] = "FULL"
    return result
  }

  const [weeklyRows, cutiRows, bookings] = await Promise.all([
    prisma.psikologWeeklySchedule.findMany({
      where: { psikologId: { in: psikologIds }, isOpen: true },
      select: { psikologId: true, dayOfWeek: true, slotTime: true },
    }),
    prisma.psikologCuti.findMany({
      where: { psikologId: { in: psikologIds }, cutiDate: { gte: monthStart, lte: monthEnd } },
      select: { psikologId: true, cutiDate: true },
    }),
    prisma.consultationBooking.findMany({
      where: {
        psikologId: { in: psikologIds },
        bookingDate: { gte: monthStart, lte: monthEnd },
        status: { in: ["PENDING_PAYMENT", "CONFIRMED"] },
      },
      select: { psikologId: true, bookingDate: true, slotTime: true },
    }),
  ])

  const openByPsikolog = new Map<string, Set<string>>()
  for (const r of weeklyRows) {
    if (!openByPsikolog.has(r.psikologId)) openByPsikolog.set(r.psikologId, new Set())
    openByPsikolog.get(r.psikologId)!.add(`${r.dayOfWeek}-${r.slotTime}`)
  }
  const cutiByPsikolog = new Map<string, Set<string>>()
  for (const r of cutiRows) {
    if (!cutiByPsikolog.has(r.psikologId)) cutiByPsikolog.set(r.psikologId, new Set())
    cutiByPsikolog.get(r.psikologId)!.add(isoDate(r.cutiDate))
  }
  const bookedSlotsByPsikologDate = new Map<string, string[]>()
  for (const b of bookings) {
    const key = `${b.psikologId}|${isoDate(b.bookingDate)}`
    bookedSlotsByPsikologDate.set(key, [...(bookedSlotsByPsikologDate.get(key) ?? []), b.slotTime])
  }

  for (const day of days) {
    const iso = isoDate(day)
    const dayOfWeek = day.getUTCDay()
    const anyAvailable = psikologIds.some((id) => {
      if (cutiByPsikolog.get(id)?.has(iso)) return false
      const bookedSlots = bookedSlotsByPsikologDate.get(`${id}|${iso}`) ?? []
      const cap = capacityById.get(id) ?? CONSULTATION_DEFAULT_DAILY_CAPACITY
      if (bookedSlots.length >= cap) return false
      const openSet = openByPsikolog.get(id)
      if (!openSet) return false
      return CONSULTATION_SLOT_TIMES.some((slotTime) => openSet.has(`${dayOfWeek}-${slotTime}`) && !bookedSlots.includes(slotTime))
    })
    result[iso] = anyAvailable ? "AVAILABLE" : "FULL"
  }
  return result
}

/** Kalender bulan untuk SATU psikolog — untuk entry "pilih psikolog dulu". */
export async function getPsikologAvailabilityForMonth(
  psikologId: string,
  yearMonth: string
): Promise<Record<string, DateAvailabilityStatus>> {
  const days = daysInMonth(yearMonth)
  const monthStart = days[0]
  const monthEnd = days[days.length - 1]

  const [psikolog, weeklyRows, cutiRows, bookings] = await Promise.all([
    prisma.psikologProfile.findUnique({ where: { id: psikologId }, select: { dailyCapacity: true } }),
    prisma.psikologWeeklySchedule.findMany({ where: { psikologId, isOpen: true }, select: { dayOfWeek: true, slotTime: true } }),
    prisma.psikologCuti.findMany({
      where: { psikologId, cutiDate: { gte: monthStart, lte: monthEnd } },
      select: { cutiDate: true },
    }),
    prisma.consultationBooking.findMany({
      where: { psikologId, bookingDate: { gte: monthStart, lte: monthEnd }, status: { in: ["PENDING_PAYMENT", "CONFIRMED"] } },
      select: { bookingDate: true, slotTime: true },
    }),
  ])
  const cap = psikolog?.dailyCapacity ?? CONSULTATION_DEFAULT_DAILY_CAPACITY
  const openSet = new Set(weeklyRows.map((r) => `${r.dayOfWeek}-${r.slotTime}`))
  const cutiSet = new Set(cutiRows.map((r) => isoDate(r.cutiDate)))
  const bookedSlotsByDate = new Map<string, string[]>()
  for (const b of bookings) {
    const iso = isoDate(b.bookingDate)
    bookedSlotsByDate.set(iso, [...(bookedSlotsByDate.get(iso) ?? []), b.slotTime])
  }

  const result: Record<string, DateAvailabilityStatus> = {}
  for (const day of days) {
    const iso = isoDate(day)
    if (cutiSet.has(iso)) {
      result[iso] = "FULL"
      continue
    }
    const bookedSlots = bookedSlotsByDate.get(iso) ?? []
    if (bookedSlots.length >= cap) {
      result[iso] = "FULL"
      continue
    }
    const dayOfWeek = day.getUTCDay()
    const hasOpenSlot = CONSULTATION_SLOT_TIMES.some(
      (slotTime) => openSet.has(`${dayOfWeek}-${slotTime}`) && !bookedSlots.includes(slotTime)
    )
    result[iso] = hasOpenSlot ? "AVAILABLE" : "FULL"
  }
  return result
}

/** Ketersediaan satu tanggal, per slot jam, dengan DAFTAR psikolog spesifik yang
 * masih bisa menerima (bukan cuma angka) — dipakai entry "pilih tanggal dulu"
 * (menampilkan siapa saja yang tersedia) dan sebagai basis harga/validasi booking. */
export async function getPsikologsAvailableForDate(
  bookingDate: Date,
  childProfileId?: string
): Promise<Array<{ slotTime: ConsultationSlotTime; psikologs: PsikologListItem[] }>> {
  const dateOnly = toDateOnly(bookingDate)

  const [statsList, capacities] = await Promise.all([
    listActivePsikologsWithStats(childProfileId),
    prisma.psikologProfile.findMany({
      where: { isActive: true, level: LAUNCH_ASSIGNMENT_LEVEL },
      select: { id: true, dailyCapacity: true },
    }),
  ])
  const capacityById = new Map(capacities.map((p) => [p.id, p.dailyCapacity]))
  const psikologIds = statsList.map((p) => p.id)

  const [openMap, bookings] = await Promise.all([
    getOpenPsikologsMapForDate(psikologIds, dateOnly),
    prisma.consultationBooking.findMany({
      where: { bookingDate: dateOnly, status: { in: ["PENDING_PAYMENT", "CONFIRMED"] } },
      select: { psikologId: true, slotTime: true },
    }),
  ])
  const dailyCountByPsikolog = new Map<string, number>()
  for (const b of bookings) dailyCountByPsikolog.set(b.psikologId, (dailyCountByPsikolog.get(b.psikologId) ?? 0) + 1)

  return CONSULTATION_SLOT_TIMES.map((slotTime) => {
    const openIds = openMap.get(slotTime) ?? new Set<string>()
    const psikologsForSlot = statsList.filter((p) => {
      if (!openIds.has(p.id)) return false
      const cap = capacityById.get(p.id) ?? CONSULTATION_DEFAULT_DAILY_CAPACITY
      const hasCapacityLeft = (dailyCountByPsikolog.get(p.id) ?? 0) < cap
      const alreadyBookedThisSlot = bookings.some((b) => b.psikologId === p.id && b.slotTime === slotTime)
      return hasCapacityLeft && !alreadyBookedThisSlot
    })
    return { slotTime, psikologs: psikologsForSlot }
  })
}

export type CreateBookingResult =
  | { ok: true; bookingId: string; psikologId: string }
  | { ok: false; error: string }

/** Buat ConsultationBooking untuk psikolog yang SUDAH DIPILIH (kedua entry point
 * booking — pilih psikolog dulu atau pilih tanggal dulu — sama-sama tahu psikolog
 * mana sebelum konfirmasi, lihat ADR-012). Divalidasi ulang di sini (jadwal, cuti,
 * kapasitas) supaya tidak bergantung ke state UI yang bisa basi. Race condition dua
 * parent booking bersamaan tetap ditangani constraint unik [psikologId, bookingDate,
 * slotTime] di database. */
export async function createConsultationBooking(input: {
  parentProfileId: string
  childProfileId: string
  psikologId: string
  bookingDate: Date
  slotTime: ConsultationSlotTime
  priceIDR: number
  level: PsikologLevel
  sourceScreeningId?: string | null
}): Promise<CreateBookingResult> {
  const dateOnly = toDateOnly(input.bookingDate)

  const psikolog = await prisma.psikologProfile.findUnique({
    where: { id: input.psikologId },
    select: { id: true, isActive: true, level: true, dailyCapacity: true },
  })
  if (!psikolog || !psikolog.isActive || psikolog.level !== LAUNCH_ASSIGNMENT_LEVEL) {
    return { ok: false, error: "Psikolog tidak ditemukan atau sedang tidak aktif" }
  }

  const openMap = await getOpenPsikologsMapForDate([psikolog.id], dateOnly)
  if (!openMap.get(input.slotTime)?.has(psikolog.id)) {
    return { ok: false, error: "Psikolog ini tidak membuka jam tersebut pada tanggal yang dipilih" }
  }

  const bookedCount = await prisma.consultationBooking.count({
    where: { psikologId: psikolog.id, bookingDate: dateOnly, status: { in: ["PENDING_PAYMENT", "CONFIRMED"] } },
  })
  if (bookedCount >= psikolog.dailyCapacity) {
    return { ok: false, error: "Kapasitas psikolog ini pada tanggal tersebut sudah penuh. Pilih psikolog atau tanggal lain." }
  }

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
    // P2002 = unique constraint violation ([psikologId, bookingDate, slotTime]) — slot
    // ini baru saja diambil booking lain persis di antara pengecekan dan insert.
    const isUniqueViolation = (error as Prisma.PrismaClientKnownRequestError)?.code === "P2002"
    if (isUniqueViolation) {
      return { ok: false, error: "Slot ini baru saja diambil orang lain. Pilih jam, psikolog, atau tanggal lain." }
    }
    throw error
  }
}

// ============================================================
// JADWAL PSIKOLOG — CRUD self-service (Portal Psikolog, role PSIKOLOG atas
// psikologId milik sesi sendiri).
// ============================================================

export type WeeklyScheduleEntry = { dayOfWeek: number; slotTime: ConsultationSlotTime; isOpen: boolean }

export async function getPsikologWeeklySchedule(psikologId: string): Promise<WeeklyScheduleEntry[]> {
  const rows = await prisma.psikologWeeklySchedule.findMany({
    where: { psikologId },
    select: { dayOfWeek: true, slotTime: true, isOpen: true },
  })
  return rows.map((r) => ({ dayOfWeek: r.dayOfWeek, slotTime: r.slotTime as ConsultationSlotTime, isOpen: r.isOpen }))
}

export async function upsertPsikologWeeklySchedule(psikologId: string, updates: WeeklyScheduleEntry[]): Promise<void> {
  await prisma.$transaction(
    updates.map((u) =>
      prisma.psikologWeeklySchedule.upsert({
        where: { psikologId_dayOfWeek_slotTime: { psikologId, dayOfWeek: u.dayOfWeek, slotTime: u.slotTime } },
        update: { isOpen: u.isOpen },
        create: { psikologId, dayOfWeek: u.dayOfWeek, slotTime: u.slotTime, isOpen: u.isOpen },
      })
    )
  )
}

export type PsikologCutiEntry = { id: string; cutiDate: Date; reason: string | null }

export async function listPsikologCuti(psikologId: string): Promise<PsikologCutiEntry[]> {
  return prisma.psikologCuti.findMany({
    where: { psikologId, cutiDate: { gte: toDateOnly(new Date()) } },
    orderBy: { cutiDate: "asc" },
    select: { id: true, cutiDate: true, reason: true },
  })
}

export async function addPsikologCuti(psikologId: string, cutiDate: Date, reason?: string | null): Promise<void> {
  const dateOnly = toDateOnly(cutiDate)
  await prisma.psikologCuti.upsert({
    where: { psikologId_cutiDate: { psikologId, cutiDate: dateOnly } },
    update: { reason: reason ?? null },
    create: { psikologId, cutiDate: dateOnly, reason: reason ?? null },
  })
}

export async function removePsikologCuti(psikologId: string, cutiDate: Date): Promise<void> {
  await prisma.psikologCuti.deleteMany({ where: { psikologId, cutiDate: toDateOnly(cutiDate) } })
}

// ============================================================
// ULASAN PSIKOLOG — internal-only (ADR-012). Endpoint pemanggil WAJIB tidak
// pernah expose hasil fungsi-fungsi lain yang mem-select ConsultationReview ke
// response PARENT/PSIKOLOG — hanya submit (tulis) yang dibuka untuk PARENT.
// ============================================================

export async function submitConsultationReview(params: {
  bookingId: string
  parentProfileId: string
  isGood: boolean
  scores?: Record<string, string>
  narrative?: string | null
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const booking = await prisma.consultationBooking.findUnique({
    where: { id: params.bookingId },
    select: { id: true, parentProfileId: true, psikologId: true, status: true, review: { select: { id: true } } },
  })
  if (!booking || booking.parentProfileId !== params.parentProfileId) {
    return { ok: false, error: "Sesi konsultasi tidak ditemukan" }
  }
  if (booking.status !== "COMPLETED") {
    return { ok: false, error: "Ulasan hanya bisa diberikan untuk sesi yang sudah selesai" }
  }
  if (booking.review) {
    return { ok: false, error: "Sesi ini sudah pernah diberi ulasan" }
  }

  await prisma.consultationReview.create({
    data: {
      bookingId: booking.id,
      parentProfileId: params.parentProfileId,
      psikologId: booking.psikologId,
      isGood: params.isGood,
      scores: params.scores ?? undefined,
      narrative: params.narrative ?? null,
    },
  })
  return { ok: true }
}
