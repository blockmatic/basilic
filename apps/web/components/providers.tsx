'use client'

import { ReactApiProvider } from '@repo/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { type ReactNode, useState } from 'react'
import { env } from '@/lib/env'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ReactApiProvider baseUrl={env.NEXT_PUBLIC_API_URL}>
        <NuqsAdapter>
          <NextThemesProvider
            attribute="class"
            defaultTheme="system"
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
