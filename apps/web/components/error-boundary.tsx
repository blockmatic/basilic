'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'
import { zEnv } from '@/lib/env'

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <div role="alert" className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md space-y-4 text-center">
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="text-muted-foreground">{error.message}</p>
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
    const dsn = zEnv.NEXT_PUBLIC_SENTRY_DSN
    const environment = zEnv.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development'

    if (dsn && !Sentry.getClient()) {
      import('../sentry.client.config').then(({ initSentry }) => {
        initSentry({ dsn, environment })
      })
    }
  }, [])

  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
      onError={error => {
        // Report error to Sentry if initialized
        if (Sentry.getClient()) {
          Sentry.captureException(error)
        }
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}
