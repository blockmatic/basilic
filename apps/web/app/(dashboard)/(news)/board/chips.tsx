'use client'

import { Button } from '@repo/ui/components/button'
import { cn } from '@repo/ui/lib/utils'
import { useQueryStates } from 'nuqs'
import { chromeParsers } from '@/lib/coins/chrome'
import { type SearchQueryState, searchQueryParsers } from '@/lib/coins/search-query'

interface BoardChip {
  label: string
  patch: Partial<SearchQueryState>
}

export const boardChips: BoardChip[] = [
  { label: 'What moved?', patch: { sortBy: 'change24h', sortDir: 'desc' } },
  { label: 'Biggest losers', patch: { sortBy: 'change24h', sortDir: 'asc' } },
  { label: 'Sort by volume', patch: { sortBy: 'volume', sortDir: 'desc' } },
  { label: 'Only majors', patch: { universe: 'majors' } },
  { label: 'Under a dollar', patch: { maxPrice: 1 } },
  { label: "What's on my list?", patch: { universe: 'watchlist' } },
]

const chipUrlParsers = {
  ...searchQueryParsers,
  q: chromeParsers.q,
}

export function matchesChipPatch({
  query,
  patch,
}: {
  query: SearchQueryState
  patch: Partial<SearchQueryState>
}): boolean {
  return (Object.keys(patch) as (keyof SearchQueryState)[]).every(key => query[key] === patch[key])
}

export function BoardChips() {
  const [state, setState] = useQueryStates(chipUrlParsers, { history: 'push', shallow: true })
  const { q: _q, ...query } = state

  return (
    <div className="flex flex-wrap gap-2">
      {boardChips.map(chip => {
        const isActive = matchesChipPatch({ query, patch: chip.patch })
        return (
          <Button
            key={chip.label}
            type="button"
            variant="outline"
            aria-pressed={isActive}
            className={cn(
              'min-h-11 rounded-lg px-3 transition-[color,transform] duration-150 ease-out',
              'active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100',
              isActive && 'bg-secondary text-secondary-foreground',
            )}
            onClick={() => setState({ ...chip.patch, q: null }, { history: 'push', shallow: true })}
          >
            {chip.label}
          </Button>
        )
      })}
    </div>
  )
}
