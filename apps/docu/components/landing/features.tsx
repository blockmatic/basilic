import { Card, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card'
import {
  ArrowRightLeft,
  Blocks,
  BookOpen,
  Bot,
  FileCode2,
  Network,
  PackageCheck,
  ShieldCheck,
  Zap,
} from 'lucide-react'

const features = [
  {
    icon: FileCode2,
    title: 'End-to-End Type Safety',
    description:
      'TypeScript from database to frontend with full IntelliSense support. Catch errors at compile time, not in production.',
  },
  {
    icon: Bot,
    title: 'AI-Native Development',
    description:
      'Pre-configured rules and skills for Cursor and Claude. Ship features faster with AI pair programming that understands your codebase.',
  },
  {
    icon: Zap,
    title: 'Production-Ready REST API',
    description:
      'Fastify-powered backend with automatic OpenAPI documentation, JWT authentication, and Web3 wallet integration out of the box.',
  },
  {
    icon: ArrowRightLeft,
    title: 'Zero Vendor Lock-in',
    description:
      'Portable architecture that runs anywhere—your VPS, AWS, Vercel, or locally. Own your stack, control your costs.',
  },
  {
    icon: Blocks,
    title: 'Web3 and AI Starters',
    description:
      'Launch-ready boilerplates for AI integrations, blockchain connectivity, payment processing, and more. Build MVPs in days, not months.',
  },
  {
    icon: PackageCheck,
    title: 'Auto-Generated SDKs',
    description:
      'Automatically generate fully typed client SDKs from your OpenAPI specs for both server and browser. One source of truth, zero manual sync.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality & Security Built-In',
    description:
      'Pre-commit hooks run secret scanning (Gitleaks), dependency vulnerability checks (OSV), and blocked secret files. Optional audit and security-check scripts keep the repo safe.',
  },
  {
    icon: Network,
    title: 'Multichain Support',
    description:
      'EVM, Solana, and Cosmos with shared validation and chain-specific rules. One codebase, multiple chains.',
  },
  {
    icon: BookOpen,
    title: 'Consistent Conventions',
    description:
      'Cursor rules and skills for frontend, backend, and tooling. Centralized error handling with `@repo/sentry` and Pino logging, plus shared TypeScript and style conventions.',
  },
]

export function Features() {
  return (
    <section id="features" className="px-4 py-16 sm:px-6 md:py-24 lg:py-32">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-10 text-center md:mb-16">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            Features
          </p>
          <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            Everything you need to ship fast
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm text-muted-foreground md:mt-4 md:text-base">
            A batteries-included framework designed for real-world backend development, with tools
            that adapt to your workflow.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(feature => (
            <Card
              key={feature.title}
              className="border-border/50 bg-card transition-colors hover:border-border"
            >
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-semibold sm:text-lg">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
