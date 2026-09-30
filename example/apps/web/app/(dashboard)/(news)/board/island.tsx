"use client";

import { AccountRequiredProvider } from "./account-required";
import { BoardCanvas } from "./board-canvas";
import type { CoinBoardProps } from "./coin-board";
import { BoardLayout } from "./rail";
import { useCoinBoard } from "./use-coin-board";

export function CoinBoard(props: CoinBoardProps) {
  return (
    <AccountRequiredProvider>
      <CoinBoardIsland {...props} />
    </AccountRequiredProvider>
  );
}

function CoinBoardIsland(props: CoinBoardProps) {
  const board = useCoinBoard(props);
  return (
    <div
      className="flex h-full min-h-0 w-full flex-col"
      data-testid="coin-board"
      data-spec-root={board.liveSpec.root}
    >
      <BoardLayout initialChrome={props.initialChrome}>
        <div className="space-y-4">
          <BoardCanvas
            showAuthRequired={board.showAuthRequired}
            notices={board.notices}
            emptyWatchlist={board.emptyWatchlist}
            store={board.store}
            liveSpec={board.liveSpec}
            watchedIds={board.watchedIds}
            isAtCap={board.isAtCap}
            pendingAssetId={board.pendingAssetId}
            focusedAssetId={board.focusedAssetId}
            onToggleWatch={board.handleToggleWatch}
            onOpenChart={board.handleOpenChart}
            onResetView={board.handleResetView}
          />
        </div>
      </BoardLayout>
    </div>
  );
}
