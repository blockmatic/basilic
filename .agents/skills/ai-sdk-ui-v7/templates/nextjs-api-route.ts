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
  validateUIMessages,
} from 'ai'

function invalidBodyResponse() {
  return new Response(JSON.stringify({ error: 'Invalid request body' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return invalidBodyResponse()
  }

  if (
    body === null ||
    typeof body !== 'object' ||
    !('messages' in body) ||
    !Array.isArray(body.messages)
  )
    return invalidBodyResponse()

  let messages
  try {
    messages = await validateUIMessages({ messages: body.messages })
  } catch {
    return invalidBodyResponse()
  }

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
