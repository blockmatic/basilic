'use client'

import { createClient } from '@repo/core'
import { ReactApiProvider } from '@repo/react'
import { logger } from '@repo/utils/logger/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getAuthToken, updateAuthTokens } from 'lib/auth/auth-client'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import type { ReactNode } from 'react'
import { env } from '@/lib/env'

logger.info('env.NEXT_PUBLIC_API_URL', env.NEXT_PUBLIC_API_URL)

const queryClient = new QueryClient()

export const coreClient = createClient({
  baseUrl: env.NEXT_PUBLIC_API_URL,
  getAuthToken: getAuthToken,
  getRefreshToken: getAuthToken,
  onTokensRefreshed: updateAuthTokens,
})

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactApiProvider client={coreClient} authCallbackUrl="/api/auth/callback?callbackURL=/">
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
