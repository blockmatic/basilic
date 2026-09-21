import { afterEach, beforeEach, vi } from 'vitest'
import { configureOnchain, resetOnchainConfig } from './config.js'

beforeEach(() => {
  configureOnchain({ alchemyApiKey: 'test-key' })
})

afterEach(() => {
  resetOnchainConfig()
  vi.unstubAllGlobals()
})

import './amount.test'
import './capabilities.test'
import './policy.test'
