'use client'

import {
  ActionProvider,
  Renderer,
  type Spec,
  StateProvider,
  VisibilityProvider,
} from '@json-render/react'
import { useChatFromConfig } from '@repo/react'
import { Button } from '@repo/ui/components/button'
import { cn } from '@repo/ui/lib/utils'
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
} from 'components/assistant/conversation'
import { Message, MessageContent, MessageResponse } from 'components/assistant/message'
import { Input, PromptInputSubmit, PromptInputTextarea } from 'components/assistant/prompt-input'
import { userInfoRegistry } from 'components/assistant/user-info-catalog'
import { MessageCircleIcon } from 'lucide-react'
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react'
import { capture } from '@/lib/analytics'

const suggestions = ['Who am I?', 'What can you help with?']

function isUserInfoSpecOutput(
  output: unknown,
): output is { __render: 'user-info'; spec: { root: string; elements: Record<string, unknown> } } {
  return (
    typeof output === 'object' &&
    output !== null &&
    '__render' in output &&
    (output as { __render?: unknown }).__render === 'user-info' &&
    'spec' in output &&
    typeof (output as { spec?: unknown }).spec === 'object' &&
    (output as { spec?: object }).spec !== null
  )
}

function partsHaveAccountRender(parts: unknown): boolean {
  if (!Array.isArray(parts)) return false
  return parts.some(part => {
    if (!part || typeof part !== 'object' || !('type' in part)) return false
    const type = (part as { type?: unknown }).type
    if (typeof type !== 'string' || !type.startsWith('tool-')) return false
    const toolName = type.replace(/^tool-/, '')
    if (toolName !== 'getAccountInfo') return false
    if (!('state' in part) || (part as { state?: unknown }).state !== 'output-available')
      return false
    return isUserInfoSpecOutput((part as { output?: unknown }).output)
  })
}

function accountRenderFromFinishArg(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  if ('parts' in value) return partsHaveAccountRender(value.parts)
  if ('message' in value && value.message && typeof value.message === 'object')
    return accountRenderFromFinishArg(value.message)
  return false
}

export interface AssistantChatProps {
  className?: string
  header?: ReactNode
  hideHeader?: boolean
}

export function AssistantChat({ className, header, hideHeader }: AssistantChatProps) {
  const [input, setInput] = useState('')
  const turnCaptured = useRef(false)
  const pendingOutcome = useRef<'stopped' | null>(null)
  const { messages, status, sendMessage, stop, error, clearError } = useChatFromConfig({
    onFinish: (...args: unknown[]) => {
      const accountRender = args.some(accountRenderFromFinishArg)
      const outcome = pendingOutcome.current ?? 'completed'
      pendingOutcome.current = null
      if (turnCaptured.current) return
      turnCaptured.current = true
      capture({ name: 'assistant_turn', outcome, accountRender })
    },
    onError: () => {
      pendingOutcome.current = null
      if (turnCaptured.current) return
      turnCaptured.current = true
      capture({ name: 'assistant_turn', outcome: 'error', accountRender: false })
    },
  })
  const conversationRef = useRef<HTMLDivElement>(null)
  const lastUserMessageRef = useRef<HTMLDivElement>(null)

  const beginTurn = () => {
    turnCaptured.current = false
    pendingOutcome.current = null
  }

  useEffect(() => {
    const last = messages.at(-1)
    if (last?.role !== 'user') return
    const el = lastUserMessageRef.current
    const container = conversationRef.current
    if (!el || !container) return
    const scrollToTop = () => {
      const msgTop = el.getBoundingClientRect().top
      const containerTop = container.getBoundingClientRect().top
      const targetScroll = container.scrollTop + (msgTop - containerTop)
      container.scrollTo({ top: targetScroll, behavior: 'smooth' })
    }
    requestAnimationFrame(() => requestAnimationFrame(scrollToTop))
  }, [messages])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    beginTurn()
    sendMessage({ text: input })
    setInput('')
  }

  const handleSuggestion = (text: string) => {
    beginTurn()
    sendMessage({ text })
  }

  const handleStop = () => {
    pendingOutcome.current = 'stopped'
    const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant')
    stop()
    if (turnCaptured.current) return
    turnCaptured.current = true
    capture({
      name: 'assistant_turn',
      outcome: 'stopped',
      accountRender: partsHaveAccountRender(lastAssistant?.parts),
    })
  }

  const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant')

  const headerContent = hideHeader
    ? null
    : (header ?? (
        <div className="border-b px-4 py-3">
          <h2 className="font-heading text-lg font-semibold md:text-xl">Assistant</h2>
        </div>
      ))

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', className)}>
      {headerContent}
      <Conversation ref={conversationRef} className="flex-1">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<MessageCircleIcon className="text-muted-foreground size-12" />}
              title="Start a conversation"
              description="Type a message below or try a suggestion"
            />
          ) : (
            messages.map(message => {
              const isStreamingAssistant =
                status === 'streaming' &&
                message.role === 'assistant' &&
                message.id === lastAssistantMessage?.id
              const elements: ReactNode[] = []
              let hasContent = false
              message.parts.forEach((p, i) => {
                if (p.type === 'text' && 'text' in p) {
                  if (p.text.length > 0) hasContent = true
                  elements.push(
                    <MessageResponse
                      key={`${message.id}-text-${i}`}
                      isStreaming={isStreamingAssistant}
                    >
                      {p.text}
                    </MessageResponse>,
                  )
                } else if (p.type === 'reasoning' && 'text' in p) {
                  if (p.text.length > 0) hasContent = true
                  elements.push(
                    <MessageResponse key={`${message.id}-reasoning-${i}`}>
                      {p.text}
                    </MessageResponse>,
                  )
                } else if (
                  typeof p.type === 'string' &&
                  p.type.startsWith('tool-') &&
                  'state' in p &&
                  (p as { state: string; output?: unknown }).state === 'output-available' &&
                  (p as { output?: unknown }).output != null
                ) {
                  const output = (p as { output?: unknown }).output
                  const toolName = p.type.replace(/^tool-/, '')
                  if (
                    toolName === 'getAccountInfo' &&
                    isUserInfoSpecOutput(output) &&
                    output.spec
                  ) {
                    hasContent = true
                    elements.push(
                      <StateProvider key={`${message.id}-tool-${i}`} initialState={{}}>
                        <VisibilityProvider>
                          <ActionProvider>
                            <Renderer spec={output.spec as Spec} registry={userInfoRegistry} />
                          </ActionProvider>
                        </VisibilityProvider>
                      </StateProvider>,
                    )
                  } else {
                    let str: string
                    try {
                      str = typeof output === 'string' ? output : JSON.stringify(output)
                    } catch {
                      str =
                        typeof output === 'object' && output !== null
                          ? '[unserializable output]'
                          : String(output)
                    }
                    if (str.length > 0) hasContent = true
                    elements.push(
                      <MessageResponse key={`${message.id}-tool-${i}`}>{str}</MessageResponse>,
                    )
                  }
                }
              })
              const showThinking = isStreamingAssistant && !hasContent
              const isLastUserMessage = message.role === 'user' && message === messages.at(-1)
              return (
                <Message
                  ref={isLastUserMessage ? lastUserMessageRef : undefined}
                  from={message.role}
                  key={message.id}
                >
                  <MessageContent from={message.role}>
                    {elements}
                    {showThinking && (
                      <span className="text-muted-foreground text-sm" aria-busy="true">
                        Thinking…
                      </span>
                    )}
                  </MessageContent>
                </Message>
              )
            })
          )}
        </ConversationContent>
      </Conversation>

      {error && (
        <div
          data-testid="chat-error"
          className="border-destructive/50 bg-destructive/10 text-destructive mx-4 mb-2 rounded-md border px-3 py-2 text-sm"
        >
          <p>{error.message}</p>
          <Button
            variant="link"
            className="text-destructive h-auto p-0 mt-1"
            onClick={() => clearError()}
          >
            Dismiss
          </Button>
        </div>
      )}

      <div className="border-t p-4">
        <div className="mb-4 flex flex-wrap gap-2">
          {suggestions.map(s => (
            <Button
              key={s}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handleSuggestion(s)}
              disabled={status !== 'ready'}
            >
              {s}
            </Button>
          ))}
        </div>
        <Input onSubmit={handleSubmit}>
          <div className="relative">
            <PromptInputTextarea
              value={input}
              placeholder="Type a message..."
              onChange={e => setInput(e.currentTarget.value)}
              disabled={status !== 'ready'}
            />
            <PromptInputSubmit
              status={status}
              disabled={!input.trim() && status !== 'streaming'}
              onStop={handleStop}
            />
          </div>
        </Input>
      </div>
    </div>
  )
}
