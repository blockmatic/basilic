import { getErrorMessage } from '@repo/error'
import { env } from '@/lib/env'
import type { NewsListArticle } from './news-list'

const newsQuery =
  '(crypto OR bitcoin OR ethereum OR blockchain) OR (AI OR "artificial intelligence" OR "machine learning")'

export async function fetchHeadlines() {
  const key = env.NEWSAPI_KEY
  if (!key) return { articles: null, error: null, hasKey: false }

  try {
    const res = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(newsQuery)}&pageSize=5&sortBy=publishedAt&language=en`,
      { headers: { 'X-Api-Key': key }, next: { revalidate: 300 } },
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as { status?: string; articles?: NewsListArticle[] }
    if (data.status !== 'ok') throw new Error('NewsAPI returned an error')
    return { articles: (data.articles ?? []).slice(0, 3), error: null, hasKey: true }
  } catch (error) {
    return { articles: null, error: getErrorMessage(error), hasKey: true }
  }
}
