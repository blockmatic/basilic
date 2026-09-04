import { beforeEach, describe, expect, it, vi } from 'vitest'
import { initErrorReporting as initErrorReportingBrowser } from '../browser/sentry.js'
import { initErrorReporting as initErrorReportingNextjs } from '../nextjs/sentry.js'
import { initErrorReporting as initErrorReportingNode } from '../node/sentry.js'

const { mockInit } = vi.hoisted(() => ({
  mockInit: vi.fn(),
}))

vi.mock('@sentry/node', () => ({ init: mockInit }))
vi.mock('@sentry/nextjs', () => ({ init: mockInit }))
vi.mock('@sentry/browser', () => ({ init: mockInit }))

describe('error reporting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe.each([
    ['Node.js', initErrorReportingNode],
    ['Next.js', initErrorReportingNextjs],
    ['Browser', initErrorReportingBrowser],
  ])('initErrorReporting (%s)', (_name, initErrorReporting) => {
    it('does not call Sentry.init', () => {
      initErrorReporting({
        dsn: 'https://test@sentry.io/123',
        environment: 'test',
      })
      expect(mockInit).not.toHaveBeenCalled()
    })

    it('is a no-op without a DSN', () => {
      initErrorReporting({ dsn: undefined })
      expect(mockInit).not.toHaveBeenCalled()
    })
  })
})
