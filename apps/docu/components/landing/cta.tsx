import { Button } from '@repo/ui/components/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function CTA() {
  return (
    <section className="px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Start building with Basilic
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-pretty text-sm text-muted-foreground md:mt-4 md:text-base">
          Clone the repo, run <code className="text-foreground">pnpm setup</code>, then follow
          Getting Started to run the API, web app, and docs locally.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <Button size="lg" asChild>
            <Link href="/docs/development">
              Getting Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="bg-transparent" asChild>
            <a
              href="https://github.com/blockmatic/basilic"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
