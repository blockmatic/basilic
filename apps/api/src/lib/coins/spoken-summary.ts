import type { SearchQuery } from './search-query.js'

const small = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
] as const

const tens = [
  '',
  '',
  'twenty',
  'thirty',
  'forty',
  'fifty',
  'sixty',
  'seventy',
  'eighty',
  'ninety',
] as const

const maxSpokenChars = 320
const maxSpokenNames = 4
const staleAfterMs = 5 * 60 * 1000

type SpokenCoin = { name: string; change24h: number }
type SpokenSync = { fetchedAt: string | null; stale?: boolean }

export function spokenDigits({ value }: { value: number }): string {
  const n = Math.round(Math.abs(value))
  if (n < 20) return small[n] ?? String(n)
  if (n < 100) {
    const o = n % 10
    const t = tens[Math.floor(n / 10)]
    if (o === 0) return t || String(n)
    return `${t}-${small[o]}`
  }
  if (n === 100) return 'one hundred'
  return String(n)
}

function spokenList({ names }: { names: string[] }): string {
  if (names.length === 1) return names[0] ?? ''
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(', ')}, and ${names.at(-1)}`
}

function spokenMovers({ coins }: { coins: SpokenCoin[] }): string {
  if (coins.length === 1) {
    const coin = coins[0]
    if (!coin) return 'Nothing matches that filter.'
    const direction = coin.change24h >= 0 ? 'up' : 'down'
    return `${coin.name} is ${direction} ${spokenDigits({ value: coin.change24h })} percent.`
  }
  return `${spokenList({ names: coins.map(coin => coin.name) })}.`
}

function spokenStale({ sync, now }: { sync: SpokenSync; now: number }): string | undefined {
  if (!sync.stale || !sync.fetchedAt) return undefined
  const ageMs = now - new Date(sync.fetchedAt).getTime()
  if (!Number.isFinite(ageMs) || ageMs < staleAfterMs) return undefined
  const minutes = Math.max(1, Math.round(ageMs / 60_000))
  if (minutes < 60) return `as of ${spokenDigits({ value: minutes })} minutes ago`
  const hours = Math.round(minutes / 60)
  return `as of ${spokenDigits({ value: hours })} hours ago`
}

function clipSpoken({ text }: { text: string }): string {
  if (text.length <= maxSpokenChars) return text
  return `${text.slice(0, maxSpokenChars - 3)}...`
}

function spokenSignedPercent({ value }: { value: number }): string {
  const digits = spokenDigits({ value })
  if (value < 0) return `minus ${digits} percent`
  return `${digits} percent`
}

function changeThresholdPhrase({ kind, value }: { kind: 'min' | 'max'; value: number }): string {
  if (kind === 'min') {
    if (value < 0) return `change at least ${spokenSignedPercent({ value })}`
    return `up at least ${spokenSignedPercent({ value })}`
  }
  if (value < 0) return `change at most ${spokenSignedPercent({ value })}`
  return `at most ${spokenSignedPercent({ value })} change`
}

export function describeQuery({ query }: { query: SearchQuery }): string {
  const universe =
    query.universe === 'watchlist'
      ? 'Watchlist'
      : query.universe === 'majors'
        ? 'Majors'
        : 'All coins'
  const filters: string[] = []
  if (query.text) filters.push(`matching ${query.text}`)
  if (query.symbols) filters.push('selected symbols')
  if (query.minChangePct != null)
    filters.push(changeThresholdPhrase({ kind: 'min', value: query.minChangePct }))
  if (query.maxChangePct != null)
    filters.push(changeThresholdPhrase({ kind: 'max', value: query.maxChangePct }))
  if (query.minPrice != null || query.maxPrice != null) filters.push('price filtered')

  let sort = 'by rank'
  if (query.sortBy === 'change24h' && query.sortDir === 'desc') sort = 'biggest movers'
  else if (query.sortBy === 'change24h' && query.sortDir === 'asc') sort = 'biggest losers'
  else if (query.sortBy === 'volume') sort = 'by volume'
  else if (query.sortBy === 'marketCap') sort = 'by market cap'
  else if (query.sortBy === 'price') sort = 'by price'
  else if (query.sortBy === 'rank' && query.sortDir === 'desc') sort = 'by rank, descending'
  if (query.topN != null) sort = `${sort}, top ${spokenDigits({ value: query.topN })}`

  const extra = filters.length > 0 ? `, ${filters.join(', ')}` : ''
  return `${universe}${extra}, ${sort}.`
}

export function spokenSummary({
  coins,
  query,
  sync,
  watchlistEmpty = false,
  now = Date.now(),
}: {
  coins: SpokenCoin[]
  query: SearchQuery
  sync: SpokenSync
  watchlistEmpty?: boolean
  now?: number
}): string {
  if (query.universe === 'watchlist' && watchlistEmpty) return 'Your list is empty.'
  if (coins.length === 0) return 'Nothing matches that filter.'

  const shown = coins.slice(0, maxSpokenNames)
  const lead =
    query.minChangePct != null || query.maxChangePct != null || query.sortBy === 'change24h'
      ? spokenMovers({ coins: shown })
      : `${spokenList({ names: shown.map(coin => coin.name) })}.`
  const stale = spokenStale({ sync, now })
  return clipSpoken({ text: stale ? `${lead} ${stale}` : lead })
}
