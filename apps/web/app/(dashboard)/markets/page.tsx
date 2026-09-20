import type { SearchParams } from 'nuqs/server'
import Home from '../(news)/page'

export default async function MarketsPage(props: { searchParams: Promise<SearchParams> }) {
  return Home(props)
}
