import { buttonVariants } from '@repo/ui/components/button'
import { cn } from '@repo/ui/lib/utils'
import Link from 'next/link'
import { CommandPanel } from '@/components/landing/command-panel'
import { LandingSection } from '@/components/landing/section'

export function Hero() {
  return (
    <LandingSection hero>
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl md:leading-[1.1]">
        API-First Agentic TypeScript
        <br />
        FullStack Swissknife
      </h1>
      <p className="mt-5 max-w-xl text-pretty text-base text-muted-foreground md:mt-6 md:text-lg">
        Basilic is a starter for Agentic Systems. Own the API. Hang web, mobile, and coding agents
        off it.
      </p>
      <div className="mt-10 md:mt-12">
        <CommandPanel />
      </div>
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-pretty text-sm text-muted-foreground">
          Then <code className="font-mono text-foreground">pnpm setup</code>,{' '}
          <code className="font-mono text-foreground">pnpm db:start</code> and{' '}
          <code className="font-mono text-foreground">pnpm dev</code>.
        </p>
        <Link
          href="/docs/development"
          className={cn(buttonVariants({ size: 'lg' }), 'min-h-11 w-full sm:w-auto')}
        >
          Getting Started
        </Link>
      </div>
    </LandingSection>
  )
}
