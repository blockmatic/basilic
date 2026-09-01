import { Button } from '@repo/ui/components/button'
import Link from 'next/link'

// eslint-disable-next-line import/no-default-export -- Next.js requires default export for not-found.tsx
export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md space-y-4 text-center">
        <h2 className="font-heading text-xl font-bold md:text-2xl">Page not found</h2>
        <p className="text-muted-foreground">The page you are looking for does not exist.</p>
        <Button asChild className="min-h-11 min-w-11">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  )
}
