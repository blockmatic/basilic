'use client'

import type { Spec } from '@json-render/core'
import {
  ActionProvider,
  type createStateStore,
  Renderer,
  StateProvider,
  VisibilityProvider,
} from '@json-render/react'
import { BoardWatchProvider, boardRegistry } from '@/components/genui'
import { AuthRequired } from './auth-required'

type BoardStore = ReturnType<typeof createStateStore>

export function BoardCanvas({
  showAuthRequired,
  notices,
  emptyWatchlist,
  store,
  liveSpec,
  watchedIds,
  isAtCap,
  pendingAssetId,
  focusedAssetId,
  onToggleWatch,
  onOpenChart,
  onResetView,
}: {
  showAuthRequired: boolean
  notices: string[]
  emptyWatchlist: boolean
  store: BoardStore
  liveSpec: Spec
  watchedIds: Set<string>
  isAtCap: boolean
  pendingAssetId: string | undefined
  focusedAssetId: string | null
  onToggleWatch: ({ assetId, watched }: { assetId: string; watched: boolean }) => void
  onOpenChart: ({ assetId }: { assetId: string }) => void
  onResetView: () => Promise<void>
}) {
  if (showAuthRequired) return <AuthRequired />
  return (
    <>
      {notices.map(notice => (
        <p key={notice} className="text-muted-foreground text-sm">
          {notice}
        </p>
      ))}
      {emptyWatchlist ? (
        <p className="text-muted-foreground text-sm">Nothing on your list yet.</p>
      ) : null}
      <StateProvider store={store}>
        <VisibilityProvider>
          <ActionProvider handlers={{ reset_view: onResetView }}>
            <BoardWatchProvider
              value={{
                watchedIds,
                isAtCap,
                pendingAssetId,
                focusedAssetId,
                onToggleWatch,
                onOpenChart,
              }}
            >
              <Renderer spec={liveSpec} registry={boardRegistry} />
            </BoardWatchProvider>
          </ActionProvider>
        </VisibilityProvider>
      </StateProvider>
    </>
  )
}
