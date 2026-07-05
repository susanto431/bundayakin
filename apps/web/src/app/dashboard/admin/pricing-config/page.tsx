import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PRICING_CONFIG_KEYS, getEffectivePricing, listScheduleForKey } from "@/lib/pricing-config"
import PricingConfigClient from "./PricingConfigClient"

export const metadata = { title: "Konfigurasi Harga & Kuota — Admin BundaYakin" }
export const dynamic = "force-dynamic"

export default async function PricingConfigPage() {
  const session = await auth()
  if (!session?.user?.canSwitchRoles && session?.user?.role !== "ADMIN") {
    redirect("/auth/login")
  }

  const current = await getEffectivePricing()
  const items = await Promise.all(
    PRICING_CONFIG_KEYS.map(async (key) => ({
      key,
      currentValue: current[key],
      schedule: (await listScheduleForKey(key)).map(s => ({
        id: s.id,
        value: s.value,
        effectiveFromISO: s.effectiveFrom.toISOString(),
        reason: s.reason,
        cancelled: s.cancelled,
        cancelledAtISO: s.cancelledAt?.toISOString() ?? null,
        createdAtISO: s.createdAt.toISOString(),
        createdByName: s.createdBy.name ?? s.createdBy.email ?? "—",
        cancelledByName: s.cancelledBy?.name ?? s.cancelledBy?.email ?? null,
      })),
    }))
  )

  return <PricingConfigClient items={items} />
}
