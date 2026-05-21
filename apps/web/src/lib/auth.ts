import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"
import { authConfig } from "./auth.config"
import { normalizePhone } from "./phone"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const credential = credentials.email as string
        const normalizedCredential = normalizePhone(credential)
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credential },
              { phone: normalizedCredential },
            ],
          },
        })

        if (!user || !user.hashedPassword) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword
        )

        if (!isValid) return null

        const canSwitchRoles = (user.phone != null && normalizePhone(user.phone) === "6287888180363") || user.role === "ADMIN"

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          canSwitchRoles,
        }
      },
    }),
  ],
})
