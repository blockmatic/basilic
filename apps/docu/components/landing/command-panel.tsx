'use client'

import { Button } from '@repo/ui/components/button'
import { useRef, useState } from 'react'

const createCommand = 'npx create-basilic@latest my-app'

export function CommandPanel() {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef(0)

  async function copyCommand() {
    try {
      await navigator.clipboard.writeText(createCommand)
      setCopied(true)
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:gap-4">
      <pre className="m-0 min-w-0 flex-1 whitespace-pre-wrap font-mono text-sm md:text-base">
        <span className="text-muted-foreground" aria-hidden="true">
          {'$ '}
        </span>
        <code className="whitespace-pre-wrap text-foreground">{createCommand}</code>
      </pre>
      <Button
        type="button"
        variant="outline"
        className="min-h-11 min-w-11 shrink-0 motion-safe:transition-opacity motion-safe:duration-150 motion-safe:ease-out"
        onClick={copyCommand}
        aria-live="polite"
      >
        {copied ? 'Copied' : 'Copy'}
      </Button>
    </div>
  )
}
