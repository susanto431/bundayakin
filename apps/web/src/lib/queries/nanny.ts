import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"

// --- Dashboard home (/dashboard/nanny) ---
export function getNannyDashboard(userId: string) {
  return unstable_cache(
    async () =>
      prisma.nannyProfile.findUnique({
        where: { userId },
        select: {
          fullName: true,
          gender: true,
          city: true,
          surveyCompletedAt: true,
          matchingRequests: {
            where: { status: { in: ["PENDING", "PROCESSING", "COMPLETED", "NEGOTIATING"] } },
            orderBy: { updatedAt: "desc" },
            take: 3,
            select: {
              id: true,
              status: true,
              parentProfileId: true,
              matchingResult: { select: { scoreOverall: true } },
              parentProfile: { select: { fullName: true } },
            },
          },
          nannyAssignments: {
            where: { isActive: true },
            orderBy: { startDate: "desc" },
            take: 1,
            select: {
              id: true,
              startDate: true,
              parentProfileId: true,
              parentProfile: {
                select: {
                  fullName: true,
                  children: {
                    orderBy: { createdAt: "asc" },
                    select: { name: true, ageGroup: true },
                  },
                },
              },
              checkins: {
                where: { nannyDoneAt: null },
                orderBy: { scheduledAt: "asc" },
                take: 1,
                select: { timing: true },
              },
            },
          },
          referralsGiven: {
            select: { bonusReferrerIDR: true, bonusPaidAt: true },
          },
          evaluations: {
            where: {
              status: { in: ["PENDING", "PARENT_DONE"] },
              nannyDoneAt: null,
            },
            orderBy: { scheduledAt: "asc" },
            take: 1,
            select: {
              assignmentId: true,
              timing: true,
              status: true,
              parentProfile: { select: { fullName: true } },
            },
          },
        },
      }),
    [`nanny-dashboard`, userId],
    { revalidate: 60, tags: [`nanny-${userId}`] }
  )()
}

// --- Profile page (/dashboard/nanny/profile) ---
export function getNannyProfile(userId: string) {
  return unstable_cache(
    async () =>
      prisma.nannyProfile.findUnique({
        where: { userId },
        select: {
          fullName: true,
          user: { select: { phone: true } },
          dateOfBirth: true,
          province: true,
          city: true,
          district: true,
          bio: true,
          nannyType: true,
          preferredAgeGroup: true,
          expectedSalaryMin: true,
          expectedSalaryMax: true,
          educationLevel: true,
          yearsOfExperience: true,
          skills: true,
          languages: true,
          religion: true,
        },
      }),
    [`nanny-profile`, userId],
    { revalidate: 60, tags: [`nanny-${userId}`] }
  )()
}

// --- Referral page (/dashboard/nanny/referral) ---
export function getNannyReferral(userId: string) {
  return unstable_cache(
    async () =>
      prisma.nannyProfile.findUnique({
        where: { userId },
        select: {
          id: true,
          referralsGiven: {
            select: {
              id: true,
              status: true,
              bonusReferrerIDR: true,
              bonusPaidAt: true,
              hiredAt: true,
              month3At: true,
            },
          },
          nannyAssignments: {
            where: { isActive: true },
            orderBy: { startDate: "desc" },
            take: 1,
            select: {
              startDate: true,
              parentProfile: { select: { fullName: true } },
            },
          },
        },
      }),
    [`nanny-referral`, userId],
    { revalidate: 60, tags: [`nanny-${userId}`] }
  )()
}

// --- Media page (/dashboard/nanny/media) ---
export function getNannyMedia(userId: string) {
  return unstable_cache(
    async () =>
      prisma.nannyProfile.findUnique({
        where: { userId },
        select: {
          id: true,
          profilePhotoUrl: true,
          fullName: true,
          city: true,
          yearsOfExperience: true,
          bio: true,
          media: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
            select: { id: true, type: true, storageKey: true, slug: true, sortOrder: true, durationSec: true, createdAt: true },
          },
          portfolios: {
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              title: true,
              description: true,
              startMonth: true,
              startYear: true,
              endMonth: true,
              endYear: true,
              isOngoing: true,
              sortOrder: true,
              media: {
                orderBy: { sortOrder: "asc" },
                select: { id: true, url: true, storageKey: true },
              },
            },
          },
        },
      }),
    [`nanny-media`, userId],
    { revalidate: 60, tags: [`nanny-${userId}`] }
  )()
}

// --- Notifications page (/dashboard/nanny/notifications) ---
export function getNannyNotifications(userId: string) {
  return unstable_cache(
    async () =>
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    [`nanny-notifications`, userId],
    { revalidate: 30, tags: [`nanny-${userId}`] }
  )()
}

// --- Survey status check (/dashboard/nanny/survey) ---
export function getNannySurveyStatus(userId: string) {
  return unstable_cache(
    async () =>
      prisma.nannyProfile.findUnique({
        where: { userId },
        select: { surveyCompletedAt: true },
      }),
    [`nanny-survey-status`, userId],
    { revalidate: 60, tags: [`nanny-${userId}`] }
  )()
}

// --- Children/assignment page (/dashboard/nanny/children) ---
export function getNannyChildren(userId: string) {
  return unstable_cache(
    async () =>
      prisma.nannyProfile.findUnique({
        where: { userId },
        select: {
          id: true,
          fullName: true,
          matchingRequests: {
            where: { status: { in: ["PENDING", "PROCESSING", "COMPLETED", "NEGOTIATING", "ACCEPTED"] } },
            orderBy: { updatedAt: "desc" },
            take: 1,
            select: {
              id: true,
              status: true,
              parentProfile: { select: { fullName: true } },
            },
          },
          nannyAssignments: {
            where: { isActive: true },
            take: 1,
            select: {
              id: true,
              parentProfile: {
                select: {
                  fullName: true,
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
              },
            },
          },
        },
      }),
    [`nanny-children`, userId],
    { revalidate: 60, tags: [`nanny-${userId}`] }
  )()
}

// --- Monitoring page — profile + assignment lookup (minimal, parameterized) ---
export function getNannyMonitoringBase(userId: string) {
  return unstable_cache(
    async () =>
      prisma.nannyProfile.findUnique({
        where: { userId },
        select: { id: true, gender: true },
      }),
    [`nanny-monitoring-base`, userId],
    { revalidate: 60, tags: [`nanny-${userId}`] }
  )()
}
