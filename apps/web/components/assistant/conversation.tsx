'use client'

import { cn } from '@repo/ui/lib/utils'
import type { ComponentProps, HTMLAttributes } from 'react'
import { StickToBottom } from 'use-stick-to-bottom'

export function Conversation({ className, ...props }: ComponentProps<typeof StickToBottom>) {
  return (
    <StickToBottom
      className={cn('relative flex min-h-0 flex-1 flex-col overflow-y-auto', className)}
      initial="smooth"
      resize="smooth"
      {...props}
    />
  )
}

export function ConversationContent({
  className,
  ...props
}: ComponentProps<typeof StickToBottom.Content>) {
  return <StickToBottom.Content className={cn('flex flex-col gap-3', className)} {...props} />
}

export function ConversationEmptyState({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-muted-foreground text-sm', className)} {...props}>
      {children}
    </p>
  )
}
