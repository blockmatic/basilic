import type { LanguageModel } from 'ai'
import { createGateway } from 'ai'
import { env } from './env.js'

export function getProvider(): LanguageModel | null {
  const apiKey = env.AI_GATEWAY_API_KEY ?? env.VERCEL_OIDC_TOKEN
  if (!apiKey) return null
  return createGateway({ apiKey }).languageModel(
    env.AI_DEFAULT_MODEL ?? 'anthropic/claude-haiku-4.5',
  )
}

export const getCommandModel = getProvider
