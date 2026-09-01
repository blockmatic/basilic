'use client'

import { captureError } from '@repo/error/nextjs'
import { Button } from '@repo/ui/components/button'
import { logger } from '@repo/utils/logger/client'
import Link from 'next/link'
import { useEffect } from 'react'

// eslint-disable-next-line import/no-default-export -- Next.js requires default export for error.tsx
export default function DashboardError({
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
      label: 'Next.js dashboard error.tsx',
      tags: { runtime: 'nextjs' },
    })
    logger.error({ digest: error.digest }, 'Unhandled error in dashboard segment')
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-4">
      <div className="max-w-md space-y-4 text-center">
        <h2 className="font-heading text-xl font-bold md:text-2xl">Something went wrong</h2>
        <p className="text-muted-foreground">Could not load this page. Try again.</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button type="button" onClick={() => reset()}>
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
