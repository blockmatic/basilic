'use client'

import { Button } from '@repo/ui/components/button'
import { Tabs, TabsList, TabsTrigger } from '@repo/ui/components/tabs'
import { useSessionStorageState } from 'ahooks'
import { PanelRightCloseIcon } from 'lucide-react'
import { useQueryStates } from 'nuqs'
import { type ReactNode, useSyncExternalStore } from 'react'
import { toast } from 'sonner'
import { Input, PromptInputSubmit, PromptInputTextarea } from '@/components/assistant/prompt-input'
import { type ChromeState, chromeParsers, parseRailValue } from '@/lib/coins/chrome'
import {
  boardViewParsers,
  type CommandHistoryEntry,
  commandHistoryKey,
  parseCommandHistory,
  viewConfigToSearchPatch,
  whoamiCommand,
  whoamiViewConfig,
  whoamiViewPatch,
} from '@/lib/genui'
import { BoardChips } from './chips'

function useIsHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}

function ShareBoardButton() {
  async function handleShare() {
    if (!navigator.clipboard) {
      toast.error('Clipboard not available')
      return
    }
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Copied to clipboard')
    } catch (error) {
      toast.error(`Failed to copy: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="min-h-11 rounded-lg"
      data-testid="share-board"
      onClick={handleShare}
    >
      Share
    </Button>
  )
}

function BoardComposer() {
  return (
    <div className="space-y-2">
      <Input>
        <div className="relative">
          <PromptInputTextarea
            placeholder="Ask the board"
            aria-label="Command"
            className="min-h-11 rounded-lg pr-12"
          />
          <PromptInputSubmit disabled aria-label="Send, agent not wired" />
        </div>
      </Input>
      <p className="text-muted-foreground text-xs">Agent not wired</p>
    </div>
  )
}

function BoardRail({ onClose, rail }: { onClose: () => void; rail: ChromeState['rail'] }) {
  const [, setChrome] = useQueryStates(chromeParsers)
  const [, setView] = useQueryStates(boardViewParsers, { history: 'push', shallow: true })
  const [history, setHistory] = useSessionStorageState<CommandHistoryEntry[]>(commandHistoryKey, {
    defaultValue: [],
    deserializer: value => parseCommandHistory({ value }),
  })

  function handleRailChange(value: unknown) {
    const next = parseRailValue({ value })
    if (!next) return
    setChrome(next)
  }

  async function handleWhoami() {
    const viewConfig = whoamiViewConfig()
    await setView(whoamiViewPatch, { history: 'push', shallow: true })
    await setChrome({ q: whoamiCommand })
    setHistory(current => [...(current ?? []), { command: whoamiCommand, viewConfig }])
  }

  async function handleRestore({ entry }: { entry: CommandHistoryEntry }) {
    await setView(viewConfigToSearchPatch({ viewConfig: entry.viewConfig }), {
      history: 'push',
      shallow: true,
    })
    await setChrome({ q: entry.command })
  }

  return (
    <div data-testid="board-rail" className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex items-center gap-2">
        <Tabs value={rail} onValueChange={handleRailChange} className="min-w-0 flex-1">
          <TabsList variant="line" className="grid h-auto min-h-11 w-full grid-cols-2 rounded-lg">
            <TabsTrigger value="commands" className="min-h-11 rounded-lg">
              Commands
            </TabsTrigger>
            <TabsTrigger value="chat" className="min-h-11 rounded-lg">
              Chat
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11 shrink-0 rounded-lg"
          aria-label="Close commands"
          onClick={onClose}
        >
          <PanelRightCloseIcon />
        </Button>
      </div>
      <div
        hidden={rail !== 'commands'}
        inert={rail !== 'commands' ? true : undefined}
        className="min-h-0 flex-1 overflow-y-auto"
      >
        <div className="flex flex-col gap-4">
          <BoardChips />
          <Button
            type="button"
            variant="outline"
            className="min-h-11 rounded-lg"
            data-testid="whoami-command"
            onClick={handleWhoami}
          >
            {whoamiCommand}
          </Button>
          {(history ?? []).length === 0 ? (
            <p className="text-muted-foreground text-sm">No prompts yet</p>
          ) : (
            <ul className="flex flex-col gap-1" data-testid="command-history">
              {(history ?? []).map((entry, index) => (
                <li key={`${entry.command}-${index}`}>
                  <Button
                    type="button"
                    variant="ghost"
                    className="min-h-11 w-full justify-start rounded-lg"
                    data-testid="command-history-row"
                    onClick={() => handleRestore({ entry })}
                  >
                    {entry.command}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div
        hidden={rail !== 'chat'}
        inert={rail !== 'chat' ? true : undefined}
        className="min-h-0 flex-1 overflow-y-auto"
      >
        <p className="text-muted-foreground text-sm">
          Chat is not wired yet. Commands still change the board.
        </p>
      </div>
      <BoardComposer />
    </div>
  )
}

export function BoardLayout({
  children,
  initialChrome,
}: {
  children: ReactNode
  initialChrome: ChromeState
}) {
  const [chrome, setChrome] = useQueryStates(chromeParsers)
  const isHydrated = useIsHydrated()
  const sidebar = isHydrated ? chrome.sidebar : initialChrome.sidebar
  const rail = isHydrated ? chrome.rail : initialChrome.rail
  const isOpen = sidebar === 'open'

  function handleClose() {
    setChrome({ sidebar: 'close' })
  }

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem-2rem)] flex-col gap-4 md:h-[calc(100dvh-3.5rem-3rem)] md:flex-row md:items-stretch">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
        <div className="flex justify-end">
          <ShareBoardButton />
        </div>
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</div>
      </div>
      {isOpen ? (
        <aside className="flex max-h-[min(42vh,24rem)] w-full shrink-0 flex-col overflow-hidden rounded-3xl border bg-card p-4 md:sticky md:top-0 md:max-h-none md:h-full md:w-80">
          <BoardRail onClose={handleClose} rail={rail} />
        </aside>
      ) : null}
    </div>
  )
}
