import { captureError } from '@repo/error/node'
import { tool } from 'ai'
import type { FastifyBaseLogger } from 'fastify'
import { z } from 'zod'
import { env } from '../../lib/env.js'

const maxBraveResults = 8

export function createBraveSearchTool(apiKey: string, log: FastifyBaseLogger) {
  return tool({
    description:
      'Search the web for current information. Use when the user asks about recent events, news, facts, or anything that requires up-to-date web results.',
    inputSchema: z.object({ query: z.string().min(1) }),
    execute: async ({ query }: { query: string }) => {
      try {
        const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}`
        const res = await fetch(url, {
          headers: { 'X-Subscription-Token': apiKey },
          signal: AbortSignal.timeout(env.AI_UPSTREAM_TIMEOUT_MS),
        })
        if (res.status === 401 || res.status === 403)
          return 'Brave Search API key invalid or missing.'
        if (res.status === 429) return 'Brave Search rate limit reached. Try again later.'
        if (!res.ok) {
          captureError({
            error: new Error(`Brave Search API error: ${res.status} ${res.statusText}`),
            label: 'Brave Search',
            logger: log,
          })
          return 'Search failed. Please try again.'
        }
        const data = (await res.json()) as {
          web?: { results?: Array<{ title?: string; url?: string; description?: string }> }
        }
        const results = data?.web?.results ?? []
        if (results.length === 0) return 'No results found for this query.'
        const lines = results.slice(0, maxBraveResults).map((r, i) => {
          const title = r.title ?? 'Untitled'
          const urlStr = r.url ?? ''
          const desc = r.description ?? ''
          return `${i + 1}. ${title} (${urlStr})\n   ${desc}`
        })
        return lines.join('\n\n')
      } catch (err) {
        captureError({
          error: err instanceof Error ? err : new Error(String(err)),
          label: 'Brave Search',
          logger: log,
        })
        return 'Search failed. Please try again.'
      }
    },
  })
}
