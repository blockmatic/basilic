/**
 * AI SDK UI v7 — basic chat
 * https://ai-sdk.dev/docs/ai-sdk-ui/chatbot
 */

'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { type FormEvent, useEffect, useRef, useState } from 'react'

export default function ChatBasic() {
  const { messages, sendMessage, status, error, stop } = useChat({
    transport: new DefaultChatTransport({ api: '/ai/chat' }),
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
    <div className="mx-auto flex h-screen max-w-2xl flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map(message => (
          <div key={message.id}>
            {message.parts.map((part, i) =>
              part.type === 'text' ? <span key={i}>{part.text}</span> : null,
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {error ? (
        <div className="border-t p-4 text-red-700">
          <strong>Error:</strong> {error.message}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex space-x-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={status !== 'ready'}
            className="flex-1 rounded-lg border p-2"
          />
          {status === 'streaming' ? (
            <button
              type="button"
              onClick={stop}
              className="rounded-lg bg-red-500 px-4 py-2 text-white"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={status !== 'ready' || !input.trim()}
              className="rounded-lg bg-blue-500 px-4 py-2 text-white"
            >
              Send
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
