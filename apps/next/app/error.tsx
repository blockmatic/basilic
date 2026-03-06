'use client'

import { env } from 'lib/env'

// eslint-disable-next-line import/no-default-export -- Next.js requires default export for error.tsx
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md space-y-4 text-center">
        <h2 className="font-heading text-xl font-bold md:text-2xl">Something went wrong</h2>
        <p className="text-muted-foreground">An unexpected error occurred</p>
        {env.NEXT_PUBLIC_NODE_ENV === 'development' && error?.message && (
          <pre className="bg-muted text-left text-xs overflow-auto max-h-32 p-3 rounded-md">
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
  )
}
