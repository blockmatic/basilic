'use client'

import { captureError } from '@repo/error/nextjs'

// eslint-disable-next-line import/no-default-export -- Next.js requires default export for error.tsx
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const catalogError = captureError({
    code: 'UNEXPECTED_ERROR',
    error,
    label: 'Next.js Error Page',
    tags: { app: 'web', module: 'error-page' },
    data: {
      digest: error.digest,
    },
  })

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md space-y-4 text-center">
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="text-muted-foreground">
          {catalogError?.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={() => reset()}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
