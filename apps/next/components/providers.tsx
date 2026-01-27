'use client'

import { createClient } from '@repo/core'
import { ReactApiProvider } from '@repo/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import type { ReactNode } from 'react'
import { env } from '@/lib/env'

// Create clients at module level (singleton pattern)
const queryClient = new QueryClient()

const coreClient = createClient({
  baseUrl: env.NEXT_PUBLIC_API_URL,
  getAuthToken: async () => {
    const response = await fetch('/api/auth/get-session')
    if (!response.ok) return null
    const data = await response.json()
    return data.token ?? null
  },
  getRefreshToken: async () => {
    const response = await fetch('/api/auth/get-session')
    if (!response.ok) return null
    const data = await response.json()
    return data.refreshToken ?? null
  },
  onTokensRefreshed: async ({ token, refreshToken }) => {
    await fetch('/api/auth/update-tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, refreshToken }),
    })
  },
})

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactApiProvider client={coreClient}>
        <NuqsAdapter>
          <NextThemesProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            {children}
          </NextThemesProvider>
        </NuqsAdapter>
      </ReactApiProvider>
    </QueryClientProvider>
  )
}
