import { Button } from '@repo/ui/components/button'
import Link from 'next/link'
import { CommandPanel } from '@/components/landing/command-panel'
import { LandingSection } from '@/components/landing/section'

export function Hero() {
  return (
    <LandingSection hero>
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl md:leading-[1.1]">
        API-First AI TypeScript
        <br />
        FullStack Starter
      </h1>
      <p className="mt-5 max-w-xl text-pretty text-base text-muted-foreground md:mt-6 md:text-lg">
        Typed Fastify + OpenAPI clients, Next.js and Expo, self-hosted auth, and an AGENTS.md
        contract plus skills any coding agent can read.
      </p>
      <div className="mt-10 md:mt-12">
        <CommandPanel />
      </div>
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-pretty text-sm text-muted-foreground">
          Then <code className="font-mono text-foreground">pnpm setup</code>, database,{' '}
          <code className="font-mono text-foreground">pnpm reset</code>, and{' '}
          <code className="font-mono text-foreground">pnpm dev</code>.
        </p>
        <Button size="lg" className="min-h-11 w-full sm:w-auto" asChild>
          <Link href="/docs/development">Getting Started</Link>
        </Button>
      </div>
    </LandingSection>
  )
}
