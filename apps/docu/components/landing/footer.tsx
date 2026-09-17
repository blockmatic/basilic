import { buttonVariants } from '@repo/ui/components/button'
import { cn } from '@repo/ui/lib/utils'
import Link from 'next/link'
import { LandingSection } from '@/components/landing/section'

const links = [
  { href: '/docs', label: 'Docs' },
  { href: '/docs/development/cursor-skills', label: 'Skills' },
  { href: '/llms.txt', label: 'LLM' },
  { href: 'https://github.com/blockmatic/basilic', label: 'GitHub', external: true },
  { href: 'https://github.com/blockmatic/basilic/blob/main/LICENSE', label: 'MIT', external: true },
]

export function Footer() {
  return (
    <LandingSection as="footer" bordered>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
          Fork it. Ship it.
        </h2>
        <Link
          href="/docs/development"
          className={cn(buttonVariants({ size: 'lg' }), 'min-h-11 w-full sm:w-auto')}
        >
          Getting Started
        </Link>
      </div>
      <nav
        aria-label="Footer"
        className="mt-8 flex flex-wrap gap-x-6 gap-y-4 text-sm text-muted-foreground"
      >
        {links.map(link =>
          link.external ? (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 hover:underline"
            >
              {link.label}
            </a>
          ) : (
            <Link key={link.href} href={link.href} className="underline-offset-4 hover:underline">
              {link.label}
            </Link>
          ),
        )}
      </nav>
    </LandingSection>
  )
}
