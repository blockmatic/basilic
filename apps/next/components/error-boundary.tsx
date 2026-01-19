'use client'

import { captureError, initSentry } from '@repo/error/nextjs'
import { useEffect } from 'react'
import { type FallbackProps, ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'
import { env } from '@/lib/env'

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const errorMessage = error instanceof Error ? error.message : String(error)

  return (
    <div role="alert" className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md space-y-4 text-center">
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="text-muted-foreground">{errorMessage}</p>
        <button
          onClick={resetErrorBoundary}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Sentry client-side if DSN is configured
    const dsn = env.NEXT_PUBLIC_SENTRY_DSN

    if (dsn) {
      initSentry({ dsn, environment: env.NEXT_PUBLIC_SENTRY_ENVIRONMENT })
    }
  }, [])

  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
      onError={(error, errorInfo) => {
        captureError({
          code: 'UNEXPECTED_ERROR',
          error,
          label: 'React Error Boundary',
          tags: { app: 'web', component: 'ErrorBoundary' },
          data: {
            componentStack: errorInfo.componentStack,
          },
        })
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}
