import { fetchWithTimeout } from '@repo/utils/async'
import { logger } from '@repo/utils/logger/server'

export const allowedHosts = ['api.coingecko.com', 'data-api.binance.vision'] as const
export const binanceOrigin = 'https://data-api.binance.vision'
export const fetchTimeoutMs = 8_000
const maxRedirects = 3

type FetchInput = string | URL | Request

export function isAllowedUrl(url: string | URL): boolean {
  try {
    const parsed = typeof url === 'string' ? new URL(url) : url
    return (
      parsed.protocol === 'https:' && (allowedHosts as readonly string[]).includes(parsed.hostname)
    )
  } catch {
    return false
  }
}

export function assertAllowedUrl(url: string | URL): URL {
  const parsed = typeof url === 'string' ? new URL(url) : new URL(url.href)
  if (isAllowedUrl(parsed)) return parsed
  logger.warn({ host: parsed.hostname }, 'markets url not allowlisted')
  throw new Error('markets url not allowlisted')
}

export function toRequestUrl(input: FetchInput): string {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.href
  return input.url
}

export async function fetchAllowed(input: FetchInput, init?: RequestInit): Promise<Response> {
  return followAllowed({ url: toRequestUrl(input), init, hops: 0 })
}

async function followAllowed({
  url,
  init,
  hops,
}: {
  url: string
  init?: RequestInit
  hops: number
}): Promise<Response> {
  assertAllowedUrl(url)
  const response = await fetchWithTimeout({
    url,
    options: { ...init, redirect: 'manual' },
    timeoutMs: fetchTimeoutMs,
  })
  if (response.status < 300 || response.status >= 400) return response
  if (hops >= maxRedirects) throw new Error('markets redirect hop limit')
  const location = response.headers.get('location')
  if (!location) throw new Error('markets redirect missing location')
  const next = new URL(location, url)
  if (next.origin !== new URL(url).origin) {
    logger.warn({ host: next.hostname }, 'markets redirect cross origin')
    throw new Error('markets redirect cross origin')
  }
  if (!isAllowedUrl(next)) {
    logger.warn({ host: next.hostname }, 'markets redirect off allowlist')
    throw new Error('markets redirect off allowlist')
  }
  return followAllowed({ url: next.href, init, hops: hops + 1 })
}

export function quoteProvider({
  binanceSymbol,
}: {
  binanceSymbol?: string
}): 'binance' | 'coingecko' {
  return binanceSymbol ? 'binance' : 'coingecko'
}

export function candlesProvider({ binanceSymbol }: { binanceSymbol?: string }): 'binance' | 'none' {
  return binanceSymbol ? 'binance' : 'none'
}

export function vendorStatus(err: unknown): number | undefined {
  if (typeof err !== 'object' || err === null) return undefined
  const status = (err as { status?: unknown }).status
  return typeof status === 'number' ? status : undefined
}
