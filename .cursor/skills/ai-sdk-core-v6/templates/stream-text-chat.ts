// Streaming chat with messages
// AI SDK Core - streamText() with chat messages

import { anthropic } from '@ai-sdk/anthropic'
import { logger } from '@repo/utils/logger'
import { streamText } from 'ai'

async function main() {
  const stream = streamText({
    model: anthropic('claude-sonnet-4-5'),
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that writes concise responses.',
      },
      {
        role: 'user',
        content: 'Tell me a short story about AI and humanity working together.',
      },
    ],
    maxOutputTokens: 500,
  })

  logger.info('Streaming response')
  logger.info('---')

  // Stream text chunks to stdout
  for await (const chunk of stream.textStream) {
    process.stdout.write(chunk)
  }

  logger.info('---')

  // Get final result with metadata
  const result = await stream.result
  logger.info(
    {
      tokens: result.usage.totalTokens,
      finishReason: result.finishReason,
    },
    'Stream completed',
  )
}

main().catch(error => {
  logger.error({ error }, 'Failed to stream text')
  process.exit(1)
})
