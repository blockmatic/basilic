import { getErrorMessage } from '@repo/utils/error'
import { getAuthStatus } from 'lib/auth/auth-utils'
import { redirect } from 'next/navigation'
import { env } from '@/lib/env'
import { NewsList, type NewsListArticle } from './news-list'

const newsQuery =
  '(crypto OR bitcoin OR ethereum OR blockchain) OR (AI OR "artificial intelligence" OR "machine learning")'

async function fetchHeadlines() {
  const key = env.NEWSAPI_KEY
  if (!key) return { articles: null, error: null, hasKey: false }

  try {
    const res = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(newsQuery)}&pageSize=20&sortBy=publishedAt&language=en`,
      { headers: { 'X-Api-Key': key }, next: { revalidate: 300 } },
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as { status?: string; articles?: NewsListArticle[] }
    if (data.status !== 'ok') throw new Error('NewsAPI returned an error')
    return { articles: data.articles ?? [], error: null, hasKey: true }
  } catch (error) {
    return { articles: null, error: getErrorMessage(error), hasKey: true }
  }
}

export default async function Home() {
  const { authenticated } = await getAuthStatus()
  if (!authenticated) redirect('/auth/login')

  const { articles, error, hasKey } = await fetchHeadlines()

  const fallback = !hasKey ? (
    <p className="text-muted-foreground text-sm">
      Add NEWSAPI_KEY to .env.local to load headlines.
    </p>
  ) : undefined

  return (
    <div className="space-y-6">
      <NewsList articles={articles ?? undefined} error={error ?? undefined} fallback={fallback} />
    </div>
  )
}
