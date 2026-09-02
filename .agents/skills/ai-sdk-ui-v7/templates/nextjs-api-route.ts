/**
 * HTTP handler for useChat (AI SDK v7)
 * https://ai-sdk.dev/docs/ai-sdk-ui/chatbot
 *
 * Works as a Next.js Route Handler or any runtime that returns Response.
 * Fastify: build the same Response and return it from the route.
 */

import { openai } from '@ai-sdk/openai'
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from 'ai'

function parseUIMessages(body: unknown): UIMessage[] | null {
  if (typeof body !== 'object' || body === null || !('messages' in body)) return null
  const messages = (body as { messages?: unknown }).messages
  if (!Array.isArray(messages) || messages.length === 0) return null
  for (const msg of messages) {
    if (typeof msg !== 'object' || msg === null) return null
    if (!('role' in msg) || typeof (msg as { role: unknown }).role !== 'string') return null
    if (!('parts' in msg) || !Array.isArray((msg as { parts?: unknown }).parts)) return null
  }
  return messages as UIMessage[]
}

export async function POST(req: Request) {
  const body = await req.json()
  const messages = parseUIMessages(body)
  if (!messages)
    return new Response(JSON.stringify({ error: 'Invalid request: messages required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })

  const result = streamText({
    model: openai('gpt-4.1'),
    instructions: 'You are a helpful assistant.',
    messages: await convertToModelMessages(messages),
    stopWhen: isStepCount(5),
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  })
}
