'use client'

import { useQuery } from '@tanstack/react-query'
import { useSessionStorageState } from 'ahooks'
import { type EveMessage, type UseEveAgentStatus, useEveAgent } from 'eve/react'
import { createContext, type ReactNode, useContext, useRef, useSyncExternalStore } from 'react'
import { toast } from 'sonner'
import {
  chatSessionKey,
  commandSessionKey,
  type EveSessionCursor,
  eveAuthHeaders,
  listAgentEndpoint,
  parseEveSessionCursor,
  sendWithEveRefresh,
  serializeEveSessionCursor,
} from '@/lib/eve'
import { eveHostQueryKey } from '@/lib/query-keys'

export type BoardEveEvent = { type: string; data?: unknown }

export type BoardEveHandle = {
  hasHost: boolean
  status: UseEveAgentStatus
  sessionId: string | undefined
  error: Error | undefined
  messages: readonly EveMessage[]
  send: (
    text: string,
    clientContext: NonNullable<
      NonNullable<Parameters<ReturnType<typeof useEveAgent>['send']>[1]>['clientContext']
    >,
  ) => Promise<readonly BoardEveEvent[]>
  cancel: () => Promise<void>
}

const idleHandle: BoardEveHandle = {
  hasHost: false,
  status: 'ready',
  sessionId: undefined,
  error: undefined,
  messages: [],
  send: async () => {
    throw new Error('eve host is not ready')
  },
  cancel: async () => {},
}

const ChatEveContext = createContext<BoardEveHandle>(idleHandle)
const CommandEveContext = createContext<BoardEveHandle>(idleHandle)

export function useChatEve(): BoardEveHandle {
  return useContext(ChatEveContext)
}

export function useCommandEve(): BoardEveHandle {
  return useContext(CommandEveContext)
}

function useIsHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}

function useAgentHost({ id }: { id: 'chat' | 'command' }) {
  return useQuery({
    queryKey: eveHostQueryKey(id),
    queryFn: () => listAgentEndpoint({ id }),
    staleTime: Infinity,
  })
}

function EveSession({
  host,
  storageKey,
  context,
  children,
}: {
  host: string
  storageKey: string
  context: typeof ChatEveContext
  children: ReactNode
}) {
  const [raw, setRaw] = useSessionStorageState<string | undefined>(storageKey)
  const boot = parseEveSessionCursor({ value: raw })
  const finishWait = useRef<((events: readonly BoardEveEvent[]) => void) | null>(null)
  const agent = useEveAgent({
    host,
    headers: eveAuthHeaders,
    initialSession: boot,
    resume: Boolean(boot),
    onSessionChange: session => {
      setRaw(serializeEveSessionCursor({ session: session as EveSessionCursor | null }))
    },
    onFinish: snapshot => {
      finishWait.current?.(snapshot.events as readonly BoardEveEvent[])
      finishWait.current = null
    },
    onError: error => {
      toast.error(error.message || 'Agent failed')
    },
  })
  const handle: BoardEveHandle = {
    hasHost: true,
    status: agent.status,
    sessionId: agent.session?.sessionId,
    error: agent.error,
    messages: agent.data.messages,
    send: (text, clientContext) =>
      sendWithEveRefresh({
        run: async () => {
          const eventsPromise = new Promise<readonly BoardEveEvent[]>(resolve => {
            finishWait.current = resolve
          })
          try {
            await agent.send(text, { clientContext })
          } catch (error) {
            finishWait.current = null
            throw error
          }
          return eventsPromise
        },
      }),
    cancel: () => agent.cancel().then(() => undefined),
  }
  return <context.Provider value={handle}>{children}</context.Provider>
}

function EveHost({
  id,
  storageKey,
  context,
  children,
}: {
  id: 'chat' | 'command'
  storageKey: string
  context: typeof ChatEveContext
  children: ReactNode
}) {
  const hydrated = useIsHydrated()
  const host = useAgentHost({ id })
  if (!hydrated || !host.data)
    return <context.Provider value={idleHandle}>{children}</context.Provider>
  return (
    <EveSession host={host.data} storageKey={storageKey} context={context}>
      {children}
    </EveSession>
  )
}

export function BoardEveProviders({ children }: { children: ReactNode }) {
  return (
    <EveHost id="command" storageKey={commandSessionKey} context={CommandEveContext}>
      <EveHost id="chat" storageKey={chatSessionKey} context={ChatEveContext}>
        {children}
      </EveHost>
    </EveHost>
  )
}
