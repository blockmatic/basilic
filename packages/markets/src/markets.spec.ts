import { afterEach, beforeEach, vi } from 'vitest'
import { resetMarketsRuntime } from './cache.js'
import { resetCoinGeckoClient } from './coingecko.js'
import { configureMarkets } from './config.js'

beforeEach(() => {
  configureMarkets({ coinsUseFixture: false })
  resetMarketsRuntime()
  resetCoinGeckoClient()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

import './binance.test'
import './capabilities.test'
import './fixture.test'
import './policy.test'
