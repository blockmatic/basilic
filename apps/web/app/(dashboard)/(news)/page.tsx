import { getErrorMessage } from '@repo/error'
import { env } from '@/lib/env'
import { fetchMarkets, isSampleBoard } from '../markets/fetch-markets'
import { MarketsTable } from '../markets/markets-table'
import { NewsList, type NewsListArticle } from './news-list'

const newsQuery =
  '(crypto OR bitcoin OR ethereum OR blockchain) OR (AI OR "artificial intelligence" OR "machine learning")'

async function fetchHeadlines() {
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

export default async function Home() {
  const [markets, headlines] = await Promise.all([fetchMarkets(), fetchHeadlines()])

  return (
    <div className="w-full space-y-8">
      <section className="space-y-4">
        <p className="text-muted-foreground max-w-2xl text-sm">
          Snapshot prices from the API. Ask the assistant what moved.
        </p>
        {isSampleBoard(markets.sync) ? (
          <p className="text-muted-foreground text-sm">Showing a sample board.</p>
        ) : null}
        <MarketsTable coins={markets.coins} error={markets.error ?? undefined} />
      </section>
      <section className="space-y-3">
        <h2 className="font-heading text-base font-semibold md:text-lg">Headlines</h2>
        <NewsList
          compact
          articles={headlines.articles ?? undefined}
          error={headlines.error ?? undefined}
          fallback={
            headlines.hasKey ? undefined : (
              <p className="text-muted-foreground text-sm">
                Headlines need NEWSAPI_KEY in .env.local.
              </p>
            )
          }
        />
      </section>
    </div>
  )
}
