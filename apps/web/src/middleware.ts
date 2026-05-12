import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth(function middleware(req) {
  const session = req.auth
  const { pathname } = req.nextUrl
  const role = session?.user?.role as string | undefined

  const isAuthPage = pathname.startsWith("/auth")
  const isParentRoute = pathname.startsWith("/dashboard/parent")
  const isNannyRoute = pathname.startsWith("/dashboard/nanny")

  if (isAuthPage && session) {
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
