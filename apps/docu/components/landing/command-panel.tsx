'use client'

import { Button } from '@repo/ui/components/button'
import { useRef, useState } from 'react'

const setupCommand =
  'git clone https://github.com/blockmatic/basilic.git && cd basilic && pnpm setup'

export function CommandPanel() {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef(0)

  async function copyCommand() {
    try {
      await navigator.clipboard.writeText(setupCommand)
      setCopied(true)
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="landing-slab flex flex-col gap-4 rounded-lg bg-card p-4 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
      <pre className="m-0 min-w-0 flex-1 overflow-x-auto font-mono text-sm whitespace-nowrap md:text-base">
        <span className="text-muted-foreground" aria-hidden="true">
          {'$ '}
        </span>
        <code className="whitespace-nowrap text-foreground">{setupCommand}</code>
      </pre>
      <Button
        type="button"
        variant="outline"
        className="min-h-11 min-w-20 w-full shrink-0 motion-safe:transition-opacity motion-safe:duration-150 motion-safe:ease-out sm:w-auto"
        onClick={copyCommand}
        aria-live="polite"
      >
        {copied ? 'Copied' : 'Copy'}
      </Button>
    </div>
  )
}
