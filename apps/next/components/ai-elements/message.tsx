'use client'

import { cn } from '@repo/ui/lib/utils'
import type { ComponentProps } from 'react'
import { forwardRef } from 'react'
import ReactMarkdown from 'react-markdown'

type MessageRole = 'user' | 'assistant' | 'system'

export type MessageProps = ComponentProps<'div'> & {
  from?: MessageRole
}

export const Message = forwardRef<HTMLDivElement, MessageProps>(
  ({ from = 'assistant', className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex w-full',
        from === 'user' && 'justify-end',
        from === 'assistant' && 'justify-start',
        className,
      )}
      data-role={from}
      {...props}
    />
  ),
)
Message.displayName = 'Message'

export type MessageContentProps = ComponentProps<'div'> & {
  from?: MessageRole
}

export function MessageContent({ from = 'assistant', className, ...props }: MessageContentProps) {
  return (
    <div
      className={cn(
        'rounded-lg px-4 py-2 max-w-[85%] prose prose-sm dark:prose-invert max-w-none',
        from === 'user' ? 'bg-primary text-primary-foreground ml-auto' : 'bg-muted text-foreground',
        className,
      )}
      {...props}
    />
  )
}

export type MessageResponseProps = ComponentProps<'div'> & {
  children?: string
  /** When true, render plain text to avoid ReactMarkdown re-parse during streaming (fixes UI freeze) */
  isStreaming?: boolean
}

const markdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
  ),
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="bg-muted overflow-x-auto p-3 rounded-md text-xs my-2">{children}</pre>
  ),
  code: ({ className, children, ...rest }: { className?: string; children?: React.ReactNode }) =>
    className ? (
      <code className={className} {...rest}>
        {children}
      </code>
    ) : (
      <code className="bg-muted px-1.5 py-0.5 rounded text-xs" {...rest}>
        {children}
      </code>
    ),
}

export function MessageResponse({
  children = '',
  isStreaming = false,
  className,
  ...props
}: MessageResponseProps) {
  return (
    <div className={cn('text-sm', className)} {...props}>
      {isStreaming ? (
        <div className="whitespace-pre-wrap">{children}</div>
      ) : (
        <ReactMarkdown components={markdownComponents}>{children}</ReactMarkdown>
      )}
    </div>
  )
}
