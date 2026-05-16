import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      originalRole: string
      canSwitchRoles: boolean
    } & DefaultSession["user"]
  }

  interface User {
    role: string
    canSwitchRoles?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    originalRole: string
    canSwitchRoles: boolean
  }
}
