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
  validateUIMessages,
} from 'ai'

export async function parseChatRequest(
  body: unknown,
): Promise<{ ok: true; messages: UIMessage[] } | { ok: false; status: 400 }> {
  if (
    typeof body !== 'object' ||
    body === null ||
    !('messages' in body) ||
    !Array.isArray(body.messages)
  )
    return { ok: false, status: 400 }

  try {
    const messages = await validateUIMessages({ messages: body.messages })
    return { ok: true, messages }
  } catch {
    return { ok: false, status: 400 }
  }
}

export async function POST(req: Request) {
  const parsed = await parseChatRequest(await req.json())
  if (!parsed.ok) return new Response(null, { status: parsed.status })

  const result = streamText({
    model: openai('gpt-4.1'),
    instructions: 'You are a helpful assistant.',
    messages: await convertToModelMessages(parsed.messages),
    stopWhen: isStepCount(5),
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  })
}
