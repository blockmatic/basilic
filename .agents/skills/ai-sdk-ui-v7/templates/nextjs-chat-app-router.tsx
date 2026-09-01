/**
 * Chat page for AI SDK v7
 * Pair with nextjs-api-route.ts or a Fastify handler that returns createUIMessageStreamResponse.
 * https://ai-sdk.dev/docs/ai-sdk-ui/chatbot
 */

'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { type FormEvent, useEffect, useRef, useState } from 'react'

const logger = {
  error: (..._args: unknown[]) => {},
}

export default function ChatPage() {
  const { messages, sendMessage, status, error, stop } = useChat({
    transport: new DefaultChatTransport({ api: '/ai/chat' }),
    onError: err => {
      logger.error({ error: err }, 'Chat error')
    },
  })
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || status !== 'ready') return
    sendMessage({ text: input })
    setInput('')
  }

  return (
    <div className="mx-auto flex h-screen max-w-4xl flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map(message => (
          <div key={message.id} className="mb-4">
            {message.parts.map((part, i) =>
              part.type === 'text' ? (
                <div key={i} className="whitespace-pre-wrap">
                  {part.text}
                </div>
              ) : null,
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {error ? <div className="border-t p-4 text-red-700">{error.message}</div> : null}

      <form onSubmit={handleSubmit} className="border-t p-4">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={status !== 'ready'}
          placeholder="Type a message..."
          className="mr-2 rounded-lg border p-3"
        />
        {status === 'streaming' ? (
          <button type="button" onClick={stop}>
            Stop
          </button>
        ) : (
          <button type="submit" disabled={status !== 'ready' || !input.trim()}>
            Send
          </button>
        )}
      </form>
    </div>
  )
}
