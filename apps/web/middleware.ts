import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const role = req.auth?.user?.role

  const isAuthPage = pathname.startsWith("/auth")
  const isParentRoute = pathname.startsWith("/dashboard/parent")
  const isNannyRoute = pathname.startsWith("/dashboard/nanny")

  if (isAuthPage && isLoggedIn) {
    if (role === "PARENT") return NextResponse.redirect(new URL("/dashboard/parent", req.url))
    if (role === "NANNY") return NextResponse.redirect(new URL("/dashboard/nanny", req.url))
  }

  if (isParentRoute && role !== "PARENT") {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  if (isNannyRoute && role !== "NANNY") {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*", "/onboarding/:path*"],
}
