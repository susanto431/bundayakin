import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const metadata = { title: "Notifikasi — BundaYakin" }

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diff < 60) return "Baru saja"
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`
  if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
}

const TYPE_ICON: Record<string, { bg: string; stroke: string; path: string }> = {
  MATCHING_READY: {
    bg: "#E5F6F4", stroke: "#5BBFB0",
    path: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  },
  EVALUATION_DUE: {
    bg: "#F3EEF8", stroke: "#A97CC4",
    path: "M12 2a10 10 0 1 1 0 20A10 10 0 0 1 12 2zm0 5v5l3 3",
  },
  PAYMENT: {
    bg: "#E5F6F4", stroke: "#5BBFB0",
    path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",
  },
  DEFAULT: {
    bg: "#F3EEF8", stroke: "#A97CC4",
    path: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  },
}

export default async function NannyNotificationsPage() {
  const session = await auth()

  const notifications = session?.user?.id
    ? await prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
    : []

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="px-4 pt-10 max-w-lg mx-auto pb-10">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-bold tracking-widest uppercase text-[#999AAA] mb-0.5">Pesan</p>
        <div className="flex items-center gap-2">
          <h1 className="font-serif text-3xl text-[#5A3A7A]">Notifikasi</h1>
          {unreadCount > 0 && (
            <span className="bg-[#5BBFB0] text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white border border-[#E0D0F0] rounded-[16px] p-10 text-center">
          <div className="w-14 h-14 bg-[#F3EEF8] rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A97CC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <p className="font-semibold text-[#5A3A7A] mb-1">Belum ada notifikasi</p>
          <p className="text-sm text-[#999AAA]">Notifikasi matching dan evaluasi akan muncul di sini</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const icon = TYPE_ICON[n.type] ?? TYPE_ICON.DEFAULT
            return (
              <div
                key={n.id}
                className={`bg-white border rounded-[14px] p-4 flex gap-3 transition-all ${
                  n.isRead ? "border-[#F3EEF8]" : "border-[#E0D0F0] shadow-sm"
                }`}
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: icon.bg }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={icon.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={icon.path} />
                  </svg>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold leading-tight ${n.isRead ? "text-[#666666]" : "text-[#5A3A7A]"}`}>
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#5BBFB0] flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-sm text-[#666666] mt-0.5 leading-relaxed">{n.body}</p>
                  <p className="text-xs text-[#999AAA] mt-1">{timeAgo(n.createdAt)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
