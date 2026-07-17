import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { upsertCustomer } from "./db"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  callbacks: {
    async signIn({ user }) {
      try {
        if (user.email) {
          await upsertCustomer({ email: user.email, name: user.name, image: user.image })
        }
      } catch (error) {
        console.error("Failed to save customer to database:", error)
        // Do not block login if the DB write fails
      }
      return true
    },
    async session({ session }) {
      return session
    },
  },
})
