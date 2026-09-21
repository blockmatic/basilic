'use client'

import { cn } from '@repo/ui/lib/utils'
import type { HTMLAttributes } from 'react'

export function Message({
  className,
  from,
  ...props
}: HTMLAttributes<HTMLElement> & { from: 'user' | 'assistant' | 'system' }) {
  return (
    <article
      data-role={from}
      className={cn(
        'max-w-[95%] rounded-lg px-3 py-2 text-sm text-pretty',
        from === 'user'
          ? 'self-end bg-primary text-primary-foreground'
          : 'self-start bg-muted text-foreground',
        className,
      )}
      {...props}
    />
  )
}

export function MessageContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('whitespace-pre-wrap', className)} {...props} />
}
