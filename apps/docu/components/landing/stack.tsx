import Link from 'next/link'
import type { ReactNode } from 'react'

interface Fact {
  title: string
  href: string
  body: ReactNode
}

const facts: Fact[] = [
  {
    title: 'REST API & JWT',
    href: '/docs/architecture/api',
    body: (
      <>
        Fastify + TypeBox, Scalar at <code className="font-mono text-foreground">/reference</code>,
        JWT and <code className="font-mono text-foreground">bask_</code> keys. Optional AI and Web3
        routes; no wallet UI in web.
      </>
    ),
  },
  {
    title: 'SDK generation',
    href: '/docs/development/openapi-generation',
    body: (
      <>
        OpenAPI → <code className="font-mono text-foreground">@repo/core</code> for server and
        browser. <code className="font-mono text-foreground">@repo/react</code> hooks are
        handwritten.
      </>
    ),
  },
  {
    title: 'TypeScript-first',
    href: '/docs/architecture/data',
    body: 'Drizzle schema and TypeBox routes flow into the generated client.',
  },
  {
    title: 'Next.js and Expo starters',
    href: '/docs/architecture/frontend',
    body: (
      <>
        Next 16 web proves auth and the API. Expo shares{' '}
        <code className="font-mono text-foreground">@repo/ui</code>; not a completed product
        surface.
      </>
    ),
  },
  {
    title: 'Zero vendor lock-in',
    href: '/docs/architecture/portability',
    body: 'Shipped path is Vercel + Supabase. Node, Fastify HTTP, Next.js, Postgres — a host change later, not a rewrite.',
  },
  {
    title: 'shadcn/ui',
    href: '/docs/adrs/004-design-system',
    body: (
      <>
        Shared <code className="font-mono text-foreground">@repo/ui</code> primitives and tokens for
        web, mobile, and docs.
      </>
    ),
  },
  {
    title: 'Security & quality',
    href: '/docs/architecture/security',
    body: 'Pre-commit Gitleaks, OSV, blocked secret files, CI.',
  },
  {
    title: 'Optional demo assistant',
    href: '/docs/architecture/ai',
    body: (
      <>
        In-shell chat is demo chrome:{' '}
        <code className="font-mono text-foreground">POST /ai/chat</code> (Anthropic → OpenRouter →
        Ollama). Not the Product Ready bar.
      </>
    ),
  },
]

export function Stack() {
  return (
    <section id="features" className="border-t border-border px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-heading text-lg font-semibold tracking-tight md:text-xl">
          What you get
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {facts.map(fact => (
            <article key={fact.title} className="h-full min-w-0">
              <Link
                href={fact.href}
                className="group block h-full rounded-lg border border-border bg-card p-6 text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <h3 className="font-heading text-lg font-semibold group-hover:underline">
                  {fact.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{fact.body}</p>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
