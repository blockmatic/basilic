'use client'

import { Button } from '@repo/ui/components/button'
import { Textarea } from '@repo/ui/components/textarea'
import { cn } from '@repo/ui/lib/utils'
import { SendIcon, SquareIcon } from 'lucide-react'
import type { ComponentProps, FormEvent, KeyboardEvent } from 'react'

type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error'

export type PromptInputFormProps = ComponentProps<'form'> & {
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void
}

export function Input({ onSubmit, className, children, ...props }: PromptInputFormProps) {
  return (
    <form
      className={cn('relative', className)}
      onSubmit={e => {
        e.preventDefault()
        onSubmit?.(e)
      }}
      {...props}
    >
      {children}
    </form>
  )
}

export type PromptInputTextareaProps = ComponentProps<typeof Textarea>

export function PromptInputTextarea({
  className,
  onKeyDown,
  onChange,
  ...props
}: PromptInputTextareaProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter') {
      onKeyDown?.(e)
      return
    }
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const el = e.currentTarget
      const { selectionStart, selectionEnd, value } = el
      const newValue = value.slice(0, selectionStart) + '\n' + value.slice(selectionEnd)
      onChange?.({ currentTarget: { value: newValue } } as React.ChangeEvent<HTMLTextAreaElement>)
      requestAnimationFrame(() => el.setSelectionRange(selectionStart + 1, selectionStart + 1))
    } else {
      e.preventDefault()
      e.currentTarget.form?.requestSubmit()
    }
    onKeyDown?.(e)
  }
  return (
    <Textarea
      className={cn('min-h-12 resize-none pr-12', className)}
      rows={1}
      onKeyDown={handleKeyDown}
      onChange={onChange}
      {...props}
    />
  )
}

export type PromptInputSubmitProps = ComponentProps<typeof Button> & {
  status?: ChatStatus
  onStop?: () => void
}

export function PromptInputSubmit({
  status = 'ready',
  disabled,
  onStop,
  className,
  ...props
}: PromptInputSubmitProps) {
  const isStreaming = status === 'streaming'
  return (
    <Button
      type={isStreaming ? 'button' : 'submit'}
      size="icon"
      disabled={disabled}
      onClick={isStreaming ? onStop : undefined}
      className={cn('absolute bottom-2 right-2 size-8', className)}
      {...props}
    >
      {isStreaming ? (
        <SquareIcon className="size-4" aria-label="Stop" />
      ) : (
        <SendIcon className="size-4" aria-label="Send" />
      )}
    </Button>
  )
}
