'use client'

import { captureError } from '@repo/error/nextjs'
import { useEffect } from 'react'

import '@repo/ui/styles/globals.css'

import { env } from 'lib/env'

// eslint-disable-next-line import/no-default-export -- Next.js requires default export for global-error.tsx
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    captureError({
      code: 'UNEXPECTED_ERROR',
      data: { digest: error.digest },
      error,
      label: 'Next.js global-error.tsx',
      tags: { runtime: 'nextjs' },
    })
  }, [error])

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="max-w-md space-y-4 text-center">
            <h2 className="font-heading text-xl font-bold md:text-2xl">Something went wrong</h2>
            <p className="text-muted-foreground">An unexpected error occurred</p>
            {env.NEXT_PUBLIC_NODE_ENV === 'development' && error?.message && (
              <pre className="bg-muted max-h-32 overflow-auto rounded-md p-3 text-left text-xs">
                {error.message}
              </pre>
            )}
            <button
              onClick={() => reset()}
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
