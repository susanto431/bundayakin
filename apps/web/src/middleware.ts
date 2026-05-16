import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth(function middleware(req) {
  const session = req.auth
  const { pathname } = req.nextUrl
  const role = session?.user?.role as string | undefined
  const canSwitchRoles = session?.user?.canSwitchRoles as boolean | undefined

  const isAuthPage = pathname.startsWith("/auth")
  const isParentRoute = pathname.startsWith("/dashboard/parent")
  const isNannyRoute = pathname.startsWith("/dashboard/nanny")
  const isAdminRoute = pathname.startsWith("/dashboard/admin")

  // Redirect logged-in users away from auth pages
  if (isAuthPage && session) {
    if (role === "PARENT") return NextResponse.redirect(new URL("/dashboard/parent", req.url))
    if (role === "NANNY") return NextResponse.redirect(new URL("/dashboard/nanny", req.url))
    if (role === "ADMIN" || canSwitchRoles) return NextResponse.redirect(new URL("/dashboard/admin", req.url))
  }

  // Admin atau canSwitchRoles: akses semua dashboard tanpa batasan
  if (canSwitchRoles || role === "ADMIN") {
    return NextResponse.next()
  }

  // Role-based route guards
  if (isParentRoute && role !== "PARENT") {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }
  if (isNannyRoute && role !== "NANNY") {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }
  if (isAdminRoute && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*", "/onboarding/:path*"],
}
