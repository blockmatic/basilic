'use client'

import { createContext, type ReactNode, use } from 'react'

export type BoardWatchValue = {
  watchedIds: Set<string>
  isAtCap: boolean
  pendingAssetId?: string
  onToggleWatch: ({ assetId, watched }: { assetId: string; watched: boolean }) => void
}

const BoardWatchContext = createContext<BoardWatchValue | null>(null)

export function BoardWatchProvider({
  value,
  children,
}: {
  value: BoardWatchValue
  children: ReactNode
}) {
  return <BoardWatchContext value={value}>{children}</BoardWatchContext>
}

export function useBoardWatch() {
  const value = use(BoardWatchContext)
  if (!value) throw new Error('BoardWatchProvider is required')
  return value
}
