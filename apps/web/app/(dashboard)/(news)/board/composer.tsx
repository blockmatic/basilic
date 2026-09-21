'use client'

import { useMutation } from '@tanstack/react-query'
import { useSessionStorageState } from 'ahooks'
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

  return (
    <div className="space-y-2">
      <Input
        onSubmit={() => {
          if (canSend) mutation.mutate()
        }}
      >
        <div className="relative">
          <PromptInputTextarea
            placeholder={isChat ? 'Ask about the board' : 'Ask the board'}
            aria-label={isChat ? 'Chat' : 'Command'}
            className="min-h-11 rounded-lg pr-12"
            value={prompt}
            onChange={event => setPrompt(event.target.value)}
          />
          <PromptInputSubmit
            disabled={!canSend}
            status={mutation.isPending ? 'submitted' : 'ready'}
            aria-label="Send"
          />
        </div>
      </Input>
    </div>
  )
}
