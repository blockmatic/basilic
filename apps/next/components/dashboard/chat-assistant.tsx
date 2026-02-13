'use client'

import { useChatFromConfig } from '@repo/react'
import { Button } from '@repo/ui/components/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@repo/ui/components/sheet'
import { MessageCircleIcon } from 'lucide-react'
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react'
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
} from '@/components/ai-elements/conversation'
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message'
import {
  Input,
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input'

const SUGGESTIONS = ['Who am I?', 'What can you help with?', 'Tell me a joke']

export function ChatAssistant() {
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

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-4 right-4 z-40 size-12 rounded-full shadow-lg sm:bottom-6 sm:right-6"
          size="icon"
          aria-label="Open assistant"
        >
          <MessageCircleIcon className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-[85vw] flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle>Assistant</SheetTitle>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col">
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
                    message.role === 'assistant' && status === 'streaming'
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
                      const str = typeof output === 'string' ? output : JSON.stringify(output)
                      if (str.length > 0) hasContent = true
                      elements.push(
                        <MessageResponse key={`${message.id}-tool-${i}`}>{str}</MessageResponse>,
                      )
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
            <div className="border-destructive/50 bg-destructive/10 text-destructive mx-4 mb-2 rounded-md border px-3 py-2 text-sm">
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
            <div className="mb-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
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
      </SheetContent>
    </Sheet>
  )
}
