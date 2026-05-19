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
      if (trigger === "update") {
        const incoming = session as { switchToRole?: string; email?: string } | undefined
        // Role switcher: hanya user dengan canSwitchRoles
        if (incoming?.switchToRole && token.canSwitchRoles) {
          token.role = incoming.switchToRole
        }
        // Email update: simpan email baru ke JWT
        if (incoming?.email) {
          token.email = incoming.email
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
