'use client'

import { Button } from '@repo/ui/components/button'
import { cn } from '@repo/ui/lib/utils'
import { MicIcon } from 'lucide-react'
import { useQueryStates } from 'nuqs'
import { useState } from 'react'
import { toast } from 'sonner'
import { Input, PromptInputSubmit, PromptInputTextarea } from '@/components/assistant/prompt-input'
import { type ChromeState, chromeParsers } from '@/lib/coins/chrome'
import { accountRequiredFromEvents, viewConfigFromEvents } from '@/lib/eve'
import {
  boardViewParsers,
  type CommandHistoryEntry,
  splitBoardView,
  viewConfigToSearchPatch,
  viewFromSearchQuery,
} from '@/lib/genui'
import { composeBoardSpec } from '@/lib/genui/compose-spec'
import { useAccountRequiredPrompt } from './account-required'
import { useChatEve, useCommandEve } from './eve-session'
import { useBoardDictation } from './use-board-dictation'

function promptStatus({
  status,
}: {
  status: ReturnType<typeof useChatEve>['status']
}): 'ready' | 'submitted' | 'streaming' | 'error' {
  if (status === 'streaming') return 'streaming'
  if (status === 'submitted' || status === 'resuming') return 'submitted'
  if (status === 'error') return 'error'
  return 'ready'
}

export function BoardComposer({
  rail,
  onRecord,
}: {
  rail: ChromeState['rail']
  onRecord: ({ entry }: { entry: CommandHistoryEntry }) => void
}) {
  const [prompt, setPrompt] = useState('')
  const [, setChrome] = useQueryStates(chromeParsers)
  const [view, setView] = useQueryStates(boardViewParsers, { history: 'push', shallow: true })
  const chat = useChatEve()
  const command = useCommandEve()
  const isChat = rail === 'chat'
  const agent = isChat ? chat : command
  const status = promptStatus({ status: agent.status })
  const isBusy = status === 'submitted' || status === 'streaming'
  const dictation = useBoardDictation({ prompt, onDraft: setPrompt })
  const { setPrompted } = useAccountRequiredPrompt()
  const canSend = prompt.trim().length > 0 && agent.hasHost && !isBusy
  const hostHint =
    agent.hostStatus === 'hydrating' || agent.hostStatus === 'loading'
      ? 'Connecting to the agent host…'
      : agent.hostStatus === 'unavailable'
        ? 'Commands and Chat need the eve host. In this repo run `pnpm dev` (agents on Portless). Generated projects without `apps/agents` omit eve.'
        : null

  async function handleSubmit() {
    const text = prompt.trim()
    if (dictation.listening || !text || isBusy || !agent.hasHost) return
    const split = splitBoardView({ view })
    if (isChat) {
      const viewConfig = viewFromSearchQuery({
        query: split.query,
        title: split.surface === 'account' ? 'Your profile' : 'Board',
        surface: split.surface,
        period: split.period,
        columns: split.columns,
        elements: split.elements,
      })
      try {
        const events = await chat.send(text, {
          boardQuery: split.query,
          viewConfig,
          elements: split.elements,
        })
        if (accountRequiredFromEvents({ events })) setPrompted(true)
        else setPrompted(false)
        setPrompt('')
      } catch {
        return
      }
      return
    }
    let events: readonly { type: string; data?: unknown }[]
    try {
      events = await command.send(text, { boardQuery: split.query })
    } catch {
      return
    }
    const parsed = viewConfigFromEvents({ events })
    if (accountRequiredFromEvents({ events })) {
      setPrompted(true)
      setPrompt('')
      return
    }
    if (!parsed) {
      toast.error('command agent did not return a ViewConfig')
      return
    }
    try {
      const composed = await composeBoardSpec({ prompt: text, view: parsed.viewConfig })
      const viewConfig =
        composed.skip || !composed.elements.length
          ? parsed.viewConfig
          : { ...parsed.viewConfig, elements: composed.elements }
      await setView(viewConfigToSearchPatch({ viewConfig }), { history: 'push', shallow: true })
      await setChrome({ q: text })
      onRecord({
        entry: { command: text, viewConfig, eveTurnId: command.sessionId },
      })
      setPrompted(false)
      if (parsed.honesty) toast.message(parsed.honesty)
      setPrompt('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Command failed')
    }
  }

  return (
    <div className="space-y-2">
      <Input onSubmit={() => void handleSubmit()}>
        <div className="relative">
          <PromptInputTextarea
            placeholder={isChat ? 'Ask about the board…' : 'Ask the board…'}
            aria-label={isChat ? 'Chat' : 'Command'}
            className={cn('min-h-11 rounded-lg', dictation.supported ? 'pr-28' : 'pr-14')}
            submitOnEnter={!dictation.listening}
            readOnly={dictation.listening}
            value={prompt}
            onChange={event => setPrompt(event.target.value)}
          />
          <div className="absolute right-1 bottom-1 flex gap-1">
            {dictation.supported ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  'size-11 rounded-lg',
                  dictation.listening &&
                    'text-primary ring-2 ring-primary motion-safe:animate-pulse',
                )}
                aria-label="Dictate to the board"
                aria-pressed={dictation.listening}
                disabled={dictation.blocked}
                onClick={dictation.toggle}
              >
                <MicIcon aria-hidden="true" />
                {dictation.listening ? <span className="sr-only">Listening</span> : null}
              </Button>
            ) : null}
            <PromptInputSubmit
              disabled={!canSend || dictation.listening}
              status={isBusy ? status : 'ready'}
              onStop={() => void agent.cancel()}
              aria-label={isBusy ? 'Stop' : 'Send'}
            />
          </div>
        </div>
      </Input>
      {hostHint ? (
        <p className="text-muted-foreground text-xs" role="status">
          {hostHint}
        </p>
      ) : null}
      {dictation.supported ? (
        <p className="text-muted-foreground text-xs">Words stay in this box until you send.</p>
      ) : null}
      {dictation.listening && dictation.interim ? (
        <p className="text-muted-foreground text-xs" aria-live="polite">
          {dictation.interim}
        </p>
      ) : null}
    </div>
  )
}
