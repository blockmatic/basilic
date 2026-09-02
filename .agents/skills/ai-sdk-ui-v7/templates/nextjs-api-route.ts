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

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

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
