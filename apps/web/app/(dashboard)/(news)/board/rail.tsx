'use client'

import { Button } from '@repo/ui/components/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
} from '@repo/ui/components/sidebar'
import { Tabs, TabsList, TabsTrigger } from '@repo/ui/components/tabs'
import { cn } from '@repo/ui/lib/utils'
import { useSessionStorageState } from 'ahooks'
import { PanelRightCloseIcon } from 'lucide-react'
import { useQueryStates } from 'nuqs'
import { type ReactNode, useSyncExternalStore } from 'react'
import { toast } from 'sonner'
import { type ChromeState, chromeParsers, parseRailValue } from '@/lib/coins/chrome'
import {
  boardViewParsers,
  type CommandHistoryEntry,
  commandHistoryKey,
  isActiveCommandHistoryEntry,
  parseCommandHistory,
  viewConfigToSearchPatch,
  whoamiCommand,
  whoamiViewConfig,
  whoamiViewPatch,
} from '@/lib/genui'
import { ChatPane } from './chat-pane'
import { BoardComposer } from './composer'
import { BoardEveProviders } from './eve-session'

const commandRowClass =
  'min-h-11 min-w-0 w-full cursor-pointer truncate rounded-lg px-3 text-left text-sm outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50'

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
      variant="ghost"
      className="min-h-11 shrink-0 rounded-lg px-3"
      data-testid="share-board"
      onClick={handleShare}
    >
      Copy link
    </Button>
  )
}

function BoardRail({ onClose, rail }: { onClose: () => void; rail: ChromeState['rail'] }) {
  const [chrome, setChrome] = useQueryStates(chromeParsers)
  const [view, setView] = useQueryStates(boardViewParsers, { history: 'push', shallow: true })
  const [history, setHistory] = useSessionStorageState<CommandHistoryEntry[]>(commandHistoryKey, {
    defaultValue: [],
    deserializer: value => parseCommandHistory({ value }),
  })
  function handleRailChange(value: unknown) {
    const next = parseRailValue({ value })
    if (!next) return
    setChrome(next)
  }

  function handleRecord({ entry }: { entry: CommandHistoryEntry }) {
    setHistory(current => [entry, ...(current ?? [])])
  }

  async function handleWhoami() {
    const viewConfig = whoamiViewConfig()
    await setView(whoamiViewPatch, { history: 'push', shallow: true })
    await setChrome({ q: whoamiCommand })
    handleRecord({ entry: { command: whoamiCommand, viewConfig } })
  }

  async function handleRestore({ entry }: { entry: CommandHistoryEntry }) {
    await setView(viewConfigToSearchPatch({ viewConfig: entry.viewConfig }), {
      history: 'push',
      shallow: true,
    })
    await setChrome({ q: entry.command })
  }

  return (
    <Sidebar
      side="right"
      variant="sidebar"
      collapsible="none"
      data-testid="board-rail"
      className="h-full w-full border-t md:border-t-0 md:border-l"
    >
      <SidebarHeader>
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
          <ShareBoardButton />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 shrink-0 rounded-lg"
            aria-label="Close commands"
            onClick={onClose}
          >
            <PanelRightCloseIcon aria-hidden="true" />
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent className={rail === 'chat' ? 'overflow-hidden' : undefined}>
        <div
          hidden={rail !== 'commands'}
          inert={rail !== 'commands' ? true : undefined}
          className="min-h-0 flex-1 overflow-y-auto p-4"
        >
          <div className="flex flex-col gap-4">
            <button
              type="button"
              className={commandRowClass}
              data-testid="whoami-command"
              onClick={handleWhoami}
            >
              {whoamiCommand}
            </button>
            {(history ?? []).length === 0 ? (
              <p className="text-muted-foreground text-sm">No prompts yet</p>
            ) : (
              <ul className="flex flex-col gap-1" data-testid="command-history">
                {(history ?? []).map((entry, index) => {
                  const isActive = isActiveCommandHistoryEntry({
                    entry,
                    q: chrome.q,
                    view,
                  })
                  return (
                    <li key={`${entry.command}-${index}`} className="min-w-0">
                      <button
                        type="button"
                        aria-current={isActive ? 'true' : undefined}
                        className={cn(commandRowClass, isActive && 'bg-muted')}
                        data-testid="command-history-row"
                        onClick={() => handleRestore({ entry })}
                      >
                        {entry.command}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
        <div
          hidden={rail !== 'chat'}
          inert={rail !== 'chat' ? true : undefined}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <ChatPane />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <BoardComposer rail={rail} onRecord={handleRecord} />
      </SidebarFooter>
    </Sidebar>
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
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col md:h-[calc(100dvh-3.5rem)] md:flex-row md:items-stretch">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col p-4 md:p-6">
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</div>
      </div>
      {isOpen ? (
        <SidebarProvider
          className="flex h-full min-h-0 max-h-[min(42vh,24rem)] w-full shrink-0 md:max-h-none md:w-(--sidebar-width)"
          style={{ '--sidebar-width': '24rem' } as React.CSSProperties}
        >
          <BoardEveProviders>
            <BoardRail onClose={handleClose} rail={rail} />
          </BoardEveProviders>
        </SidebarProvider>
      ) : null}
    </div>
  )
}
