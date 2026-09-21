'use client'

import { Button } from '@repo/ui/components/button'
import { Textarea } from '@repo/ui/components/textarea'
import { cn } from '@repo/ui/lib/utils'
import { SendIcon, SquareIcon } from 'lucide-react'
import type { ChangeEvent, ComponentProps, FormEvent, KeyboardEvent } from 'react'

type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error'

export type PromptInputProps = ComponentProps<'form'> & {
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void
}

export function PromptInput({ onSubmit, className, children, ...props }: PromptInputProps) {
  return (
    <form
      className={cn('relative rounded-xl bg-muted/40 p-1', className)}
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

export const Input = PromptInput

export type PromptInputTextareaProps = ComponentProps<typeof Textarea> & {
  submitOnEnter?: boolean
}

export function PromptInputTextarea({
  className,
  onKeyDown,
  onChange,
  submitOnEnter = true,
  ...props
}: PromptInputTextareaProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) {
      onKeyDown?.(e)
      return
    }
    if (e.key !== 'Enter') {
      onKeyDown?.(e)
      return
    }
    if (props.readOnly) {
      onKeyDown?.(e)
      return
    }
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const el = e.currentTarget
      const { selectionStart, selectionEnd, value } = el
      const newValue = `${value.slice(0, selectionStart)}\n${value.slice(selectionEnd)}`
      const syntheticTarget = Object.assign({}, el, { value: newValue })
      const syntheticEvent = {
        target: syntheticTarget,
        currentTarget: syntheticTarget,
        nativeEvent: e.nativeEvent,
      } as unknown as ChangeEvent<HTMLTextAreaElement>
      onChange?.(syntheticEvent)
      requestAnimationFrame(() => el.setSelectionRange(selectionStart + 1, selectionStart + 1))
    } else if (submitOnEnter) {
      e.preventDefault()
      e.currentTarget.form?.requestSubmit()
    } else {
      e.preventDefault()
    }
    onKeyDown?.(e)
  }
  return (
    <Textarea
      className={cn(
        'min-h-11 resize-none rounded-lg border-0 bg-transparent shadow-none dark:bg-transparent',
        className,
      )}
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
  children,
  ...props
}: PromptInputSubmitProps) {
  const isStreaming = status === 'streaming' || status === 'submitted'
  return (
    <Button
      type={isStreaming ? 'button' : 'submit'}
      size="icon"
      disabled={disabled && !isStreaming}
      onClick={isStreaming ? onStop : undefined}
      className={cn('size-11 rounded-lg active:scale-[0.96]', className)}
      {...props}
    >
      {children ??
        (isStreaming ? <SquareIcon className="size-4" /> : <SendIcon className="size-4" />)}
    </Button>
  )
}
