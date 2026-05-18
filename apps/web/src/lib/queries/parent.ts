import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import type { EvaluationTiming } from "@prisma/client"

// --- Dashboard home (/dashboard/parent) ---
export function getParentDashboard(userId: string) {
  return unstable_cache(
    async () => {
      const now = new Date()
      const profile = await prisma.parentProfile.findUnique({
        where: { userId },
        select: {
          id: true,
          city: true,
          surveyCompletedAt: true,
          createdAt: true,
          subscription: { select: { status: true, startDate: true, endDate: true } },
          connectionQuotas: {
            where: { periodEnd: { gt: now } },
            orderBy: { periodEnd: "desc" },
            take: 1,
            select: { referralUsed: true, referralLimit: true, talentPoolUsed: true, talentPoolLimit: true },
          },
          children: { orderBy: { createdAt: "asc" }, take: 1, select: { id: true, name: true } },
          matchingRequests: {
            orderBy: { updatedAt: "desc" },
            take: 1,
            select: {
              id: true, status: true, updatedAt: true,
              nannyProfile: { select: { fullName: true, city: true } },
              matchingResult: { select: { scoreOverall: true } },
            },
          },
          evaluations: { select: { timing: true, status: true, parentDoneAt: true } },
          nannyAssignments: { where: { isActive: true }, take: 1, select: { id: true } },
          matchResults: { where: { kontakTerbuka: true }, select: { nannyProfileId: true } },
        },
      })

      const unlockedIds = (profile?.matchResults ?? []).map(r => r.nannyProfileId)
      const openToJobNannies = profile
        ? await prisma.nannyProfile.findMany({
            where: {
              openToJob: true,
              isAvailable: true,
              ...(profile.city ? { city: profile.city } : {}),
            },
            select: {
              id: true,
              city: true,
              yearsOfExperience: true,
              nannyType: true,
              preferredAgeGroup: true,
            },
            take: 5,
            orderBy: { updatedAt: "desc" },
          })
        : []

      return { profile, openToJobNannies, unlockedIds }
    },
    [`parent-dashboard`, userId],
    { revalidate: 60, tags: [`parent-${userId}`] }
  )()
}

// --- Matching page (/dashboard/parent/matching) ---
export function getParentMatchingData(userId: string) {
  return unstable_cache(
    async () => {
      const now = new Date()
      return prisma.parentProfile.findUnique({
        where: { userId },
        select: {
          fullName: true,
          phone: true,
          city: true,
          district: true,
          surveyCompletedAt: true,
          subscription: { select: { status: true, endDate: true } },
          connectionQuotas: {
            where: { periodEnd: { gt: now } },
            orderBy: { periodEnd: "desc" },
            take: 1,
            select: { referralUsed: true, referralLimit: true, talentPoolUsed: true, talentPoolLimit: true },
          },
          matchingRequests: {
            orderBy: { createdAt: "desc" },
            take: 10,
            select: {
              id: true, status: true, updatedAt: true,
              nannyProfile: { select: { fullName: true } },
            },
          },
        },
      })
    },
    [`parent-matching`, userId],
    { revalidate: 60, tags: [`parent-${userId}`] }
  )()
}

// --- Profile page (/dashboard/parent/profile) ---
export function getParentProfile(userId: string) {
  return unstable_cache(
    async () =>
      prisma.parentProfile.findUnique({
        where: { userId },
        select: { fullName: true, phone: true, province: true, city: true, district: true, address: true },
      }),
    [`parent-profile`, userId],
    { revalidate: 60, tags: [`parent-${userId}`] }
  )()
}

// --- Settings page (/dashboard/parent/settings) ---
export function getParentSettings(userId: string) {
  return unstable_cache(
    async () =>
      prisma.parentProfile.findUnique({
        where: { userId },
        select: {
          subscription: { select: { status: true, startDate: true, endDate: true } },
          children: {
            orderBy: { createdAt: "asc" },
            select: { id: true, name: true, ageGroup: true, gender: true },
          },
        },
      }),
    [`parent-settings`, userId],
    { revalidate: 60, tags: [`parent-${userId}`] }
  )()
}

// --- Subscription page (/dashboard/parent/subscription) ---
export function getParentSubscription(userId: string) {
  return unstable_cache(
    async () =>
      prisma.parentProfile.findUnique({
        where: { userId },
        select: {
          subscription: { select: { status: true, startDate: true, endDate: true } },
        },
      }),
    [`parent-subscription`, userId],
    { revalidate: 30, tags: [`parent-${userId}`] }
  )()
}

// --- Children page (/dashboard/parent/children) ---
export function getParentChildren(userId: string) {
  return unstable_cache(
    async () =>
      prisma.parentProfile.findUnique({
        where: { userId },
        select: {
          children: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              name: true,
              ageGroup: true,
              gender: true,
              allergies: true,
              medicalNotes: true,
              pantangan: true,
              schedule: true,
              schoolName: true,
              schoolSchedule: true,
              additionalNotes: true,
              updatedAt: true,
            },
          },
        },
      }),
    [`parent-children`, userId],
    { revalidate: 60, tags: [`parent-${userId}`] }
  )()
}

// --- Referral page (/dashboard/parent/referral) ---
export function getParentReferral(userId: string) {
  return unstable_cache(
    async () =>
      prisma.parentProfile.findUnique({
        where: { userId },
        select: {
          referralsGiven: {
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              refereeType: true,
              refereeName: true,
              status: true,
              bonusIDR: true,
              bonusPaidAt: true,
              dealAt: true,
              createdAt: true,
              updatedAt: true,
              notes: true,
            },
          },
        },
      }),
    [`parent-referral`, userId],
    { revalidate: 60, tags: [`parent-${userId}`] }
  )()
}

// --- Monitoring page (/dashboard/parent/monitoring) ---
export function getParentMonitoring(userId: string) {
  return unstable_cache(
    async () =>
      prisma.parentProfile.findUnique({
        where: { userId },
        select: {
          id: true,
          nannyAssignments: {
            where: { isActive: true },
            take: 1,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              nannyProfile: { select: { fullName: true } },
              checkins: { select: { timing: true, status: true, parentDoneAt: true } },
              evaluations: { select: { timing: true, status: true, parentDoneAt: true } },
            },
          },
        },
      }),
    [`parent-monitoring`, userId],
    { revalidate: 30, tags: [`parent-${userId}`] }
  )()
}

// --- Monitoring summary (/dashboard/parent/monitoring/summary) ---
export function getParentMonitoringSummary(userId: string, timing: EvaluationTiming) {
  return unstable_cache(
    async () =>
      prisma.parentProfile.findUnique({
        where: { userId },
        select: {
          nannyAssignments: {
            where: { isActive: true },
            take: 1,
            orderBy: { createdAt: "desc" },
            select: {
              nannyProfile: { select: { fullName: true } },
              checkins: { where: { timing }, select: { timing: true, status: true, parentConditionRating: true, parentConcernFlag: true, parentAdaptRating: true, parentFreeText: true, parentDoneAt: true } },
              evaluations: { where: { timing }, select: { timing: true, status: true, parentScores: true, parentNarrative: true, parentDoneAt: true, nannyDoneAt: true, aiSummary: true } },
            },
          },
        },
      }),
    [`parent-monitoring-summary`, userId, timing],
    { revalidate: 30, tags: [`parent-${userId}`] }
  )()
}

// --- Cari Nanny / Talent Pool page (/dashboard/parent/cari-nanny) ---
export function getParentCariNanny(userId: string) {
  return unstable_cache(
    async () => {
      const now = new Date()
      return prisma.parentProfile.findUnique({
        where: { userId },
        select: {
          subscription: { select: { status: true, endDate: true } },
          connectionQuotas: {
            where: { periodEnd: { gt: now } },
            orderBy: { periodEnd: "desc" },
            take: 1,
            select: { talentPoolUsed: true, talentPoolLimit: true },
          },
        },
      })
    },
    [`parent-cari-nanny`, userId],
    { revalidate: 30, tags: [`parent-${userId}`] }
  )()
}

// --- Matching result page (/dashboard/parent/matching/[id]) ---
export function getMatchingRequest(requestId: string, parentProfileId: string) {
  return unstable_cache(
    async () => {
      const now = new Date()
      const request = await prisma.matchingRequest.findUnique({
        where: { id: requestId },
        select: {
          id: true,
          status: true,
          parentProfileId: true,
          nannyProfileId: true,
          parentProfile: { select: { userId: true, surveyCompletedAt: true } },
          nannyProfile: {
            select: { id: true, userId: true, fullName: true, city: true, surveyCompletedAt: true },
          },
          matchingResult: {
            select: {
              scoreOverall: true,
              scoreDomainA: true,
              scoreDomainB: true,
              scoreDomainC: true,
              negotiationPoints: true,
              mismatchAreas: true,
              matchHighlights: true,
              tipsForParent: true,
            },
          },
          updatedAt: true,
        },
      })

      if (!request) return { request: null, matchResult: null, quota: null }

      const [matchResult, quota] = await Promise.all([
        request.nannyProfileId
          ? prisma.matchResult.findUnique({
              where: {
                parentProfileId_nannyProfileId: {
                  parentProfileId: request.parentProfileId,
                  nannyProfileId: request.nannyProfileId,
                },
              },
              select: { kontakTerbuka: true },
            })
          : Promise.resolve(null),
        prisma.connectionQuota.findFirst({
          where: { parentProfileId, periodEnd: { gt: now } },
          orderBy: { periodEnd: "desc" },
          select: { referralUsed: true, referralLimit: true },
        }),
      ])

      return { request, matchResult, quota }
    },
    [`matching-request`, requestId],
    { revalidate: 30, tags: [`matching-${requestId}`, `parent-${parentProfileId}`] }
  )()
}

// --- Survey status (minimal check for survey pages) ---
export function getParentSurveyStatus(userId: string) {
  return unstable_cache(
    async () =>
      prisma.parentProfile.findUnique({
        where: { userId },
        select: { surveyCompletedAt: true },
      }),
    [`parent-survey-status`, userId],
    { revalidate: 60, tags: [`parent-${userId}`] }
  )()
}
