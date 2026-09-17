import Link from 'next/link'
import { LandingSection } from '@/components/landing/section'

const facts = [
  {
    title: 'Production-Ready REST API',
    href: '/docs/architecture/api',
    body: 'Ship a Fastify REST API with automatic OpenAPI docs, JWT authentication, and AI and Web3 routes included.',
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
    title: 'Next.js and Expo Starters',
    href: '/docs/architecture/frontend',
    body: 'Launch-ready web and mobile apps sharing one design system and a typed API—start shipping on day one.',
  },
  {
    title: 'Agent skills and playbooks',
    href: '/docs/development/cursor-skills',
    body: 'Plan, build, and review with `/plan`, `/build`, and `/review` plus versioned skills any coding agent can use.',
  },
  {
    title: 'Zero Vendor Lock-in',
    href: '/docs/architecture/portability',
    body: 'Shipped on Vercel and Supabase, built on ordinary Node, Fastify, Next.js, and Postgres—switch hosts, not stacks.',
  },
  {
    title: 'Agent Assistant Demo',
    href: '/docs/architecture/ai',
    body: 'A streaming in-app assistant with tools, UI catalogs, and core components you can extend for your product.',
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
        Everything you need to ship fast
      </h2>
      <p className="mt-2 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
        Typed Fastify API, generated clients, Next.js, an Expo UI scaffold, and an{' '}
        <code className="font-mono text-foreground">AGENTS.md</code> contract any coding agent can
        read. Each card is the pitch; the docs page has the how.
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
