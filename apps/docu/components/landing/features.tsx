import { Card, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card'
import {
  ArrowRightLeft,
  Blocks,
  Bot,
  FileCode2,
  MessageCircle,
  PackageCheck,
  Palette,
  ShieldCheck,
  Zap,
} from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Production-Ready REST API',
    description:
      'Fastify-powered backend with automatic OpenAPI documentation, JWT authentication, and optional AI and Web3 auth routes.',
  },
  {
    icon: PackageCheck,
    title: 'Auto-Generated SDKs',
    description:
      'Automatically generate fully typed client SDKs from your OpenAPI specs for both server and browser. One source of truth, zero manual sync.',
  },
  {
    icon: FileCode2,
    title: 'End-to-End Type Safety',
    description:
      'TypeScript from database to frontend with full IntelliSense support. Catch errors at compile time, not in production.',
  },
  {
    icon: Blocks,
    title: 'Next.js and Expo Starters',
    description:
      'Launch-ready boilerplates for web and mobile. Web is wired to `@repo/core` and `@repo/react`; mobile shares `@repo/ui` today.',
  },

  {
    icon: MessageCircle,
    title: 'AI Assistant Component',
    description:
      'Streaming AI chat UI with Vercel AI SDK, backed by Fastify `POST /ai/chat` and provider env vars (Anthropic, OpenRouter, Ollama).',
  },
  {
    icon: ArrowRightLeft,
    title: 'Zero Vendor Lock-in',
    description:
      'Portable architecture that runs anywhere—your VPS, AWS, Vercel, or locally. Own your stack, control your costs.',
  },

  {
    icon: Bot,
    title: 'AI-Assisted Development',
    description:
      'Pre-configured rules and skills for Cursor (primary) and Claude Code. Ship features faster with AI pair programming that understands your codebase.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality & Security Built-In',
    description:
      'Pre-commit hooks for secret scanning (Gitleaks) and dependency checks (OSV), plus blocked secret files.',
  },
  {
    icon: Palette,
    title: 'shadcn/ui Design System',
    description:
      'Integrated shadcn/ui design system for consistent, reusable UI and theme support across all apps.',
  },
]

export function Features() {
  return (
    <section id="features" className="px-4 py-16 sm:px-6 md:py-24 lg:py-32">
      <div className="mx-auto max-w-6xl">
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
