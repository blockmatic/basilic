import Link from 'next/link'
import { LandingSection } from '@/components/landing/section'

const facts = [
  {
    title: 'Fastify OpenAPI API',
    href: '/docs/architecture/api',
    body: 'Typed REST with generated OpenAPI, JWT and API key auth, discovery routes (`llms.txt`, RFC 9727 catalog), and optional `/ai/generate` chrome.',
  },
  {
    title: 'Auto-Generated SDKs',
    href: '/docs/development/openapi-generation',
    body: 'Generate fully typed clients from your OpenAPI spec for server and browser. One source of truth, zero manual sync.',
  },
  {
    title: 'End-to-End Type Safety',
    href: '/docs/architecture/data',
    body: 'TypeScript from database to frontend with full IntelliSense. Catch errors at compile time, not in production.',
  },
  {
    title: 'Next.js client + Expo scaffold',
    href: '/docs/architecture/frontend',
    body: 'Next.js client on `@repo/core`. Expo shares tokens via `@repo/ui`; not a mobile API client yet.',
  },
  {
    title: 'Agent skills and playbooks',
    href: '/docs/development/cursor-skills',
    body: 'Basilic `/w-*` on skills.sh for daily workflow; committed stack skills in git. `AGENTS.md` for any coding agent.',
  },
  {
    title: 'Vercel default, portable runtime',
    href: '/docs/architecture/portability',
    body: 'Shipped on Vercel + Supabase; Fastify `listen` and `eve start` when you leave. Ordinary Node, HTTP, and Postgres.',
  },
  {
    title: 'eve + json-render',
    href: '/docs/architecture/eve',
    body: 'Durable command and chat on a sibling host. Next composeSpec renders json-render specs. Needs keys or Ollama for LLM paths.',
  },
  {
    title: 'Quality & Security Built-In',
    href: '/docs/architecture/security',
    body: 'Pre-commit secret scanning, dependency CVE checks, and blocked secret files so you ship with confidence.',
  },
  {
    title: 'Design System',
    href: '/docs/adrs/004-design-system',
    body: 'A shared shadcn/ui + Base UI design system for consistent components, tokens, and theming across web, mobile, and docs.',
  },
]

export function Stack() {
  return (
    <LandingSection id="features" bordered>
      <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
        What ships in the tree
      </h2>
      <p className="mt-2 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
        Typed Fastify API, generated clients, Next.js sample, Expo UI scaffold, and an{' '}
        <code className="font-mono text-foreground">AGENTS.md</code> contract any coding agent can
        read. Each card links the how in the docs.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {facts.map(fact => (
          <article key={fact.title} className="h-full min-w-0">
            <Link
              href={fact.href}
              className="landing-card group block h-full min-h-44 rounded-lg bg-card p-6 text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <h3 className="font-heading text-lg font-semibold group-hover:underline">
                {fact.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{fact.body}</p>
            </Link>
          </article>
        ))}
      </div>
    </LandingSection>
  )
}
