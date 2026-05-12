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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = (user as { role?: string }).role ?? ""
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = (token.id as string) ?? ""
        session.user.role = (token.role as string) ?? ""
      }
      return session
    },
  },
}
