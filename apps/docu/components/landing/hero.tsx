import { Button } from '@repo/ui/components/button'
import Link from 'next/link'
import { CommandPanel } from '@/components/landing/command-panel'

export function Hero() {
  return (
    <section className="px-4 pt-24 pb-16 md:px-6 md:pt-32 md:pb-24">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-heading text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          <span className="block">API-First AI TypeScript</span>
          <span className="block">FullStack Starter</span>
        </h1>
        <p className="mt-4 max-w-xl text-pretty text-base text-muted-foreground md:mt-6 md:text-lg">
          Typed Fastify + OpenAPI clients, Next.js and Expo, self-hosted auth, and an AGENTS.md
          workflow any coding agent can run.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Same <code className="font-mono text-foreground">AGENTS.md</code> in Cursor, Claude Code,
          Codex, and any agent that can read the files.{' '}
          <Link
            href="/docs/development/ai-workflow"
            className="text-primary underline-offset-4 hover:underline"
          >
            AI Workflow
          </Link>
        </p>
        <div className="mt-8 md:mt-10">
          <CommandPanel />
        </div>
        <div className="mt-6">
          <Button size="lg" className="min-h-11 w-full sm:w-auto" asChild>
            <Link href="/docs/development">Getting Started</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
