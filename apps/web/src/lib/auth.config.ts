import type { NextAuthConfig } from "next-auth"

// Edge-compatible config — no Node.js imports (no Prisma, no pg, no bcrypt)
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    newUser: "/onboarding",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string
        token.role = (user as { role?: string }).role ?? ""
        token.originalRole = (user as { role?: string }).role ?? ""
        token.canSwitchRoles = (user as { canSwitchRoles?: boolean }).canSwitchRoles ?? false
      }
      // Role switcher: hanya user dengan canSwitchRoles yang bisa ganti role via update()
      if (trigger === "update" && token.canSwitchRoles) {
        const incoming = session as { switchToRole?: string } | undefined
        if (incoming?.switchToRole) {
          token.role = incoming.switchToRole
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = (token.id as string) ?? ""
        session.user.role = (token.role as string) ?? ""
        session.user.originalRole = (token.originalRole as string) ?? token.role as string ?? ""
        session.user.canSwitchRoles = (token.canSwitchRoles as boolean) ?? false
      }
      return session
    },
  },
}
