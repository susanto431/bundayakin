import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

type LogActivityParams = {
  userId: string | null | undefined
  action: string
  entity?: string
  entityId?: string
  metadata?: Record<string, unknown>
}

/**
 * Fire-and-forget ActivityLog write.
 * Never throws — logging must not break the main request flow.
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: params.userId ?? null,
        action: params.action,
        entity: params.entity ?? null,
        entityId: params.entityId ?? null,
        metadata: params.metadata
          ? (params.metadata as Prisma.InputJsonValue)
          : Prisma.DbNull,
      },
    })
  } catch (err) {
    console.error("[ACTIVITY_LOG]", err)
  }
}
