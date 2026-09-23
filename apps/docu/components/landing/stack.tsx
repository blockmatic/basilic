import Link from 'next/link'
import { LandingSection } from '@/components/landing/section'

const groups = [
  {
    title: 'Product contract',
    facts: [
      {
        title: 'Product API',
        href: '/docs/architecture/api',
        body: 'Typed REST on Fastify. Generated OpenAPI. Discovery via `/llms.txt` and the RFC 9727 catalog. No product MCP.',
      },
      {
        title: 'Multi-client auth',
        href: '/docs/architecture/authentication',
        body: 'Session JWT for the browser. API keys for CLI, SDK, and scripts. OAuth, passkey, magic link, SIWE/SIWS.',
      },
      {
        title: 'Generated clients',
        href: '/docs/development/openapi-generation',
        body: 'HeyAPI writes `@repo/core` from the spec. `@repo/react` adds handwritten React Query hooks.',
      },
    ],
  },
  {
    title: 'Agentic surfaces',
    facts: [
      {
        title: 'Durable agents',
        href: '/docs/architecture/eve',
        body: 'eve `command` and `chat` on a sibling host. Clone this repo; `create-basilic` omits `apps/agents`.',
      },
      {
        title: 'Generative UI',
        href: '/docs/architecture/ai',
        body: 'Jev triages command turns. Next `composeSpec` authors json-render specs. `@repo/ui` (shadcn/Base UI) is the catalog.',
      },
      {
        title: 'API CLI',
        href: '/docs/development/cli',
        body: '`basilic` binary for humans, scripts, and shell agents. API key auth. JSON on stdout.',
      },
      {
        title: 'Coding-agent contract',
        href: '/docs/development/ai-workflow',
        body: '`AGENTS.md`, Basilic `/w-*` playbooks, and lock-installed stack skills any coding agent can read.',
      },
    ],
  },
  {
    title: 'Human clients',
    facts: [
      {
        title: 'Web client',
        href: '/docs/architecture/frontend',
        body: 'Next.js on `@repo/core`. Host for Generative UI. In-box sample is a demo shell, not the product definition.',
      },
      {
        title: 'Mobile',
        href: '/docs/architecture/frontend',
        body: 'Expo UI scaffold sharing `@repo/ui`. Not an API client yet.',
      },
      {
        title: 'End-to-end TypeScript',
        href: '/docs/architecture/data',
        body: 'Drizzle schema to OpenAPI to generated clients. Catch contract errors at compile time.',
      },
    ],
  },
  {
    title: 'How you ship',
    facts: [
      {
        title: 'Deploy',
        href: '/docs/architecture/portability',
        body: 'Shipped path is Vercel + Supabase. Exit is Fastify `listen`, `eve start`, and PostgreSQL.',
      },
      {
        title: 'Quality and security',
        href: '/docs/architecture/security',
        body: 'Biome, pre-commit secret scanning, OSV, and DeepSec in CI.',
      },
      {
        title: 'Multichain',
        href: '/docs/architecture/authentication',
        body: 'SIWE/SIWS, wallet modal, Alchemy reads. Not send or swap.',
      },
    ],
  },
]

export function Stack() {
  return (
    <LandingSection id="features" bordered>
      <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
        What ships in the tree
      </h2>
      <p className="mt-2 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
        One product API. Agents participate through eve, the CLI, generated clients, and Generative
        UI. Each card links the how in the docs.
      </p>
      {groups.map(section => (
        <div key={section.title} className="mt-10">
          <h3 className="font-heading text-lg font-semibold tracking-tight">{section.title}</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {section.facts.map(fact => (
              <article key={fact.title} className="h-full min-w-0">
                <Link
                  href={fact.href}
                  className="landing-card group block h-full min-h-44 rounded-lg bg-card p-6 text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <h4 className="font-heading text-lg font-semibold group-hover:underline">
                    {fact.title}
                  </h4>
                  <p className="mt-2 text-sm text-muted-foreground">{fact.body}</p>
                </Link>
              </article>
            ))}
          </div>
        </div>
      ))}
    </LandingSection>
  )
}
