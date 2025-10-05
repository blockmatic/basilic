import NextAuth, { type AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { SiweMessage } from 'siwe'

const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Ethereum',
      credentials: {
        message: { label: 'Message', type: 'text' },
        signature: { label: 'Signature', type: 'text' },
      },
      async authorize(credentials) {
        try {
          if (!credentials) return null

          const { message, signature } = credentials
          const siwe = new SiweMessage(message)
          const result = await siwe.verify({ signature })

          if (!result.success) return null
          return { id: result.data.address }
        } catch (_error) {
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt', // must be "jwt" or "database"
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub) session.address = token.sub
      return session
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

declare module 'next-auth' {
  interface Session {
    address?: string
  }

  interface User {
    address?: string
  }
}
