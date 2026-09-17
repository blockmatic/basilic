import { Button } from '@repo/ui/components/button'
import Link from 'next/link'
import { CommandPanel } from '@/components/landing/command-panel'

export function CTA() {
  return (
    <section className="border-t border-border px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-3xl">
        <CommandPanel />
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button size="lg" className="min-h-11 w-full sm:w-auto" asChild>
            <Link href="/docs/development">Getting Started</Link>
          </Button>
          <Button size="lg" variant="outline" className="min-h-11 w-full sm:w-auto" asChild>
            <Link href="/docs/development/cursor-skills">Skills</Link>
          </Button>
          <Button size="lg" variant="outline" className="min-h-11 w-full sm:w-auto" asChild>
            <a
              href="https://github.com/blockmatic/basilic"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
