import { afterEach, beforeEach, vi } from 'vitest'
import { resetMarketsRuntime } from './cache.js'
import { resetCoinGeckoClient } from './coingecko.js'

beforeEach(() => {
  resetMarketsRuntime()
  resetCoinGeckoClient()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

import './binance.test'
import './capabilities.test'
import './policy.test'
