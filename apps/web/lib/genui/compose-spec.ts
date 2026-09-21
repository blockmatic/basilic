'use server'

import { logger } from '@repo/utils/logger/server'
import { getUserInfo } from '@/lib/auth/auth-utils'
import { env } from '@/lib/env'
import { type ComposeBoardResult, runComposeBoardSpec } from './compose-run'
import { accountFromUser, parseViewConfig, type ViewConfig } from './view-config'

export async function composeBoardSpec({
  prompt,
  view,
}: {
  prompt: string
  view: ViewConfig
}): Promise<ComposeBoardResult> {
  const parsed = parseViewConfig({ value: view })
  if (!parsed) return { skip: true, reason: 'unavailable' }
  try {
    return await runComposeBoardSpec({
      prompt,
      view: parsed,
      caption: parsed.title,
      account: accountFromUser({ user: await getUserInfo() }),
      apiKey: env.AI_GATEWAY_API_KEY,
      model: env.JEV_MODEL,
    })
  } catch (error) {
    logger.error({ err: error }, 'composeBoardSpec failed')
    return { skip: true, reason: 'unavailable' }
  }
}
