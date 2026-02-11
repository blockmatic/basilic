import { Badge } from '@repo/ui/components/badge'
import { Button } from '@repo/ui/components/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-28 pb-16 sm:px-6 md:pt-44 md:pb-32">
      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-primary/5 blur-[100px] md:h-[500px] md:w-[800px] md:blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl text-center">
        {/* Version badge */}
        <Badge
          variant="outline"
          className="mb-6 gap-2 border-border/60 bg-secondary/50 px-3 py-1 text-xs font-normal text-muted-foreground md:mb-8"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          v2.0 now available
          <ArrowRight className="h-3 w-3" />
        </Badge>

        <h1 className="text-balance text-3xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-6xl lg:text-7xl">
          FullStack Framework <span className="text-primary">for AI and Web3</span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base md:mt-6 md:text-lg">
          Production-ready frontends and APIs with TypeScript, Next.js, Fastify, and OpenAPI.
          AI-native development, portable architecture, and first-class web3 support built in.
        </p>

        {/* CTA */}
        <div className="mt-8 flex justify-center md:mt-10">
          <Button size="lg" className="w-full sm:w-auto" asChild>
            <Link href="/docs">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
