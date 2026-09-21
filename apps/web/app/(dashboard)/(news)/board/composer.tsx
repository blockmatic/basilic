'use client'

import { Button } from '@repo/ui/components/button'
import { cn } from '@repo/ui/lib/utils'
import { useMutation } from '@tanstack/react-query'
import { useSessionStorageState } from 'ahooks'
import { MicIcon } from 'lucide-react'
import { useQueryStates } from 'nuqs'
import { useState } from 'react'
import { toast } from 'sonner'
import { Input, PromptInputSubmit, PromptInputTextarea } from '@/components/assistant/prompt-input'
import { type ChromeState, chromeParsers } from '@/lib/coins/chrome'
import { sendChatTurn, sendCommandTurn } from '@/lib/eve'
import {
  boardViewParsers,
  type CommandHistoryEntry,
  commandHistoryKey,
  parseCommandHistory,
  splitBoardView,
  viewConfigToSearchPatch,
  viewFromSearchQuery,
} from '@/lib/genui'
import { composeBoardSpec } from '@/lib/genui/compose-spec'
import type { ChatTurn } from './chat-pane'
import { useBoardDictation } from './use-board-dictation'

export function BoardComposer({
  rail,
  onChatTurns,
}: {
  rail: ChromeState['rail']
  onChatTurns: (update: (turns: ChatTurn[]) => ChatTurn[]) => void
}) {
  const [prompt, setPrompt] = useState('')
  const [, setChrome] = useQueryStates(chromeParsers)
  const [view, setView] = useQueryStates(boardViewParsers, { history: 'push', shallow: true })
  const [, setHistory] = useSessionStorageState<CommandHistoryEntry[]>(commandHistoryKey, {
    defaultValue: [],
    deserializer: value => parseCommandHistory({ value }),
  })
  const isChat = rail === 'chat'
  const mutation = useMutation({
    mutationFn: async () => {
      const text = prompt.trim()
      const split = splitBoardView({ view })
      if (isChat) {
        onChatTurns(turns => [...turns, { role: 'user', text }, { role: 'assistant', text: '' }])
        const viewConfig = viewFromSearchQuery({
          query: split.query,
          title: split.surface === 'account' ? 'Your profile' : 'Board',
          surface: split.surface,
          period: split.period,
          columns: split.columns,
          elements: split.elements,
        })
        return {
          kind: 'chat' as const,
          result: await sendChatTurn({
            prompt: text,
            boardQuery: split.query,
            viewConfig,
            elements: split.elements,
            onAssistantDelta: delta =>
              onChatTurns(turns => {
                if (turns.length === 0) return turns
                const last = turns.at(-1)
                if (last?.role !== 'assistant') return turns
                return [...turns.slice(0, -1), { role: 'assistant', text: delta }]
              }),
          }),
        }
      }
      return {
        kind: 'command' as const,
        result: await sendCommandTurn({
          prompt: text,
          boardQuery: split.query,
        }),
      }
    },
    async onSuccess(payload) {
      const command = prompt.trim()
      if (payload.kind === 'chat') {
        setPrompt('')
        return
      }
      const composed = await composeBoardSpec({
        prompt: command,
        view: payload.result.viewConfig,
      })
      const viewConfig =
        composed.skip || !composed.elements.length
          ? payload.result.viewConfig
          : { ...payload.result.viewConfig, elements: composed.elements }
      await setView(viewConfigToSearchPatch({ viewConfig }), {
        history: 'push',
        shallow: true,
      })
      await setChrome({ q: command })
      setHistory(current => [
        ...(current ?? []),
        { command, viewConfig, eveTurnId: payload.result.eveTurnId },
      ])
      if (payload.result.honesty) toast.message(payload.result.honesty)
      setPrompt('')
    },
    onError() {
      toast.error(isChat ? 'Chat failed' : 'Command failed')
    },
  })
  const canSend = prompt.trim().length > 0 && !mutation.isPending
  const dictation = useBoardDictation({ prompt, onDraft: setPrompt })

  return (
    <div className="space-y-2">
      <Input
        onSubmit={() => {
          if (dictation.listening || !canSend) return
          mutation.mutate()
        }}
      >
        <div className="relative">
          <PromptInputTextarea
            placeholder={isChat ? 'Ask about the board' : 'Ask the board'}
            aria-label={isChat ? 'Chat' : 'Command'}
            className={cn('min-h-11 rounded-lg', dictation.supported ? 'pr-28' : 'pr-14')}
            submitOnEnter={!dictation.listening}
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
                <MicIcon />
                {dictation.listening ? <span className="sr-only">Listening</span> : null}
              </Button>
            ) : null}
            <PromptInputSubmit
              disabled={!canSend || dictation.listening}
              status={mutation.isPending ? 'submitted' : 'ready'}
              aria-label="Send"
            />
          </div>
        </div>
      </Input>
      {dictation.supported ? (
        <p className="text-muted-foreground text-xs">
          Words stay in this box until you send. Chrome may use the browser recognizer; we do not
          upload audio to Basilic.
        </p>
      ) : null}
      {dictation.listening && dictation.interim ? (
        <p className="text-muted-foreground text-xs" aria-live="polite">
          {dictation.interim}
        </p>
      ) : null}
    </div>
  )
}
