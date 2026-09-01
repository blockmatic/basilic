// Simple text generation with OpenAI
// AI SDK Core - generateText() basic example

import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

const logger = {
  info: (..._args: unknown[]) => {},
  error: (..._args: unknown[]) => {},
}

async function main() {
  const result = await generateText({
    model: openai('gpt-4.1'),
    instructions: 'Answer in two sentences.',
    prompt: 'What is TypeScript?',
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
