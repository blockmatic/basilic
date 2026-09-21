import { configureOnchain } from '@repo/onchain'
import { env } from './env.js'

export function bootOnchain(): void {
  configureOnchain({ alchemyApiKey: env.ALCHEMY_API_KEY })
}

bootOnchain()
