import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  const { pathname } = req.nextUrl
  const role = (token?.role as string) ?? undefined

  const isAuthPage = pathname.startsWith("/auth")
  const isParentRoute = pathname.startsWith("/dashboard/parent")
  const isNannyRoute = pathname.startsWith("/dashboard/nanny")

  if (isAuthPage && token) {
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
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*", "/onboarding/:path*"],
}
