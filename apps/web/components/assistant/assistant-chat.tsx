'use client'

import { Renderer, type Spec, StateProvider, VisibilityProvider } from '@json-render/react'
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

export interface AssistantChatProps {
  className?: string
  header?: ReactNode
  hideHeader?: boolean
}

export function AssistantChat({ className, header, hideHeader }: AssistantChatProps) {
  const [input, setInput] = useState('')
  const { messages, status, sendMessage, stop, error, clearError } = useChatFromConfig()
  const conversationRef = useRef<HTMLDivElement>(null)
  const lastUserMessageRef = useRef<HTMLDivElement>(null)

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
    sendMessage({ text: input })
    setInput('')
  }

  const handleSuggestion = (text: string) => {
    sendMessage({ text })
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
                          <Renderer spec={output.spec as Spec} registry={userInfoRegistry} />
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
              disabled={status === 'streaming' || status === 'submitted'}
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
              disabled={status === 'streaming' || status === 'submitted'}
            />
            <PromptInputSubmit
              status={status}
              disabled={!input.trim() && status !== 'streaming'}
              onStop={stop}
            />
          </div>
        </Input>
      </div>
    </div>
  )
}
