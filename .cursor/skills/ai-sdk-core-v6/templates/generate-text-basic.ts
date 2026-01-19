// Simple text generation with OpenAI
// AI SDK Core - generateText() basic example

import { openai } from '@ai-sdk/openai'
import { logger } from '@repo/utils/logger'
import { generateText } from 'ai'

async function main() {
  const result = await generateText({
    model: openai('gpt-4-turbo'),
    prompt: 'What is TypeScript? Explain in 2 sentences.',
    maxOutputTokens: 100,
    temperature: 0.7,
  })

  logger.info(
    {
      text: result.text,
      tokens: result.usage.totalTokens,
      finishReason: result.finishReason,
    },
    'Generated text',
  )
}

main().catch(error => {
  logger.error({ error }, 'Failed to generate text')
  process.exit(1)
})
