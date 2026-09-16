import Link from 'next/link'
import type { ReactNode } from 'react'

interface Fact {
  title: string
  href: string
  body: ReactNode
}

interface Group {
  title: string
  facts: Fact[]
}

const groups: Group[] = [
  {
    title: 'API, types, and auth',
    facts: [
      {
        title: 'Fastify + OpenAPI',
        href: '/docs/architecture/api',
        body: (
          <>
            TypeBox REST API with Scalar at{' '}
            <code className="font-mono text-foreground">/reference</code>, JWT sessions, and
            optional AI and Web3 routes.
          </>
        ),
      },
      {
        title: 'Generated clients',
        href: '/docs/development/openapi-generation',
        body: (
          <>
            OpenAPI generates <code className="font-mono text-foreground">@repo/core</code> for
            server and browser. <code className="font-mono text-foreground">@repo/react</code> hooks
            are handwritten on top.
          </>
        ),
      },
      {
        title: 'Typed through the stack',
        href: '/docs/architecture/data',
        body: 'Drizzle schema and TypeBox routes flow into the generated client. Errors show up at compile time.',
      },
      {
        title: 'Self-hosted auth',
        href: '/docs/architecture/authentication',
        body: (
          <>
            Magic link, optional OAuth, passkeys, sessions, and{' '}
            <code className="font-mono text-foreground">bask_</code> API keys. Web3 exists on
            Fastify; the web app has no wallet UI.
          </>
        ),
      },
    ],
  },
  {
    title: 'Web, mobile, and agents',
    facts: [
      {
        title: 'Next 16 web',
        href: '/docs/architecture/frontend',
        body: 'App Router demo that proves auth and the typed API.',
      },
      {
        title: 'Expo scaffold',
        href: '/docs/architecture/frontend',
        body: (
          <>
            Mobile starter sharing <code className="font-mono text-foreground">@repo/ui</code>{' '}
            tokens. Not a completed product surface.
          </>
        ),
      },
      {
        title: 'AGENTS.md',
        href: '/docs/development/ai-workflow',
        body: (
          <>
            Portable agent contract plus <code className="font-mono text-foreground">/plan</code>,{' '}
            <code className="font-mono text-foreground">/build</code>, and{' '}
            <code className="font-mono text-foreground">/workflow</code> playbooks and versioned
            skills. Slash is Cursor UX.
          </>
        ),
      },
      {
        title: 'shadcn/ui',
        href: '/docs/adrs/004-design-system',
        body: (
          <>
            Shared <code className="font-mono text-foreground">@repo/ui</code> primitives and tokens
            for web, mobile, and docs.
          </>
        ),
      },
    ],
  },
  {
    title: 'Hosts, security, demo chrome',
    facts: [
      {
        title: 'Ordinary hosts',
        href: '/docs/architecture/portability',
        body: 'Shipped path is Vercel + Supabase. Node, Fastify HTTP, Next.js, and Postgres — a later host change, not a rewrite.',
      },
      {
        title: 'Secrets and CVEs',
        href: '/docs/architecture/security',
        body: 'Pre-commit Gitleaks, OSV, and blocked secret files.',
      },
      {
        title: 'Demo assistant',
        href: '/docs/architecture/ai',
        body: (
          <>
            In-shell chat is demo chrome: Vercel AI SDK and Fastify{' '}
            <code className="font-mono text-foreground">POST /ai/chat</code> (Anthropic → OpenRouter
            → Ollama). Not the Product Ready bar.
          </>
        ),
      },
    ],
  },
]

function FactCard({ title, href, body }: Fact) {
  return (
    <article className="h-full min-w-0">
      <Link
        href={href}
        className="group block h-full rounded-lg border border-border bg-card p-6 text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <h3 className="font-heading text-lg font-semibold group-hover:underline">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      </Link>
    </article>
  )
}

export function Stack() {
  return (
    <section id="features" className="border-t border-border px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-heading text-lg font-semibold tracking-tight md:text-xl">
          What you get
        </h2>
        <div className="mt-8 flex flex-col gap-10 md:gap-12">
          {groups.map(group => (
            <div key={group.title}>
              <p className="text-sm font-medium text-muted-foreground">{group.title}</p>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                {group.facts.map(fact => (
                  <FactCard key={fact.title} {...fact} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
