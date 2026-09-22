'use client'

import { useQuery } from '@tanstack/react-query'
import { useSessionStorageState } from 'ahooks'
import { type EveMessage, type UseEveAgentStatus, useEveAgent } from 'eve/react'
import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
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

export type BoardEveHostStatus = 'hydrating' | 'loading' | 'ready' | 'unavailable'

export type BoardEveHandle = {
  hasHost: boolean
  hostStatus: BoardEveHostStatus
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
  hostStatus: 'unavailable',
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
  onHandle,
}: {
  host: string
  storageKey: string
  onHandle: Dispatch<SetStateAction<BoardEveHandle>>
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
  const { cancel, error, send, session, status } = agent
  const messages = agent.data.messages
  const sessionId = session?.sessionId
  useLayoutEffect(() => {
    const next: BoardEveHandle = {
      hasHost: true,
      hostStatus: 'ready',
      status,
      sessionId,
      error,
      messages,
      send: (text, clientContext) =>
        sendWithEveRefresh({
          run: async () => {
            const eventsPromise = new Promise<readonly BoardEveEvent[]>(resolve => {
              finishWait.current = resolve
            })
            try {
              await send(text, { clientContext })
            } catch (caught) {
              finishWait.current = null
              throw caught
            }
            return eventsPromise
          },
        }),
      cancel: () => cancel().then(() => undefined),
    }
    onHandle(current =>
      current.hasHost === next.hasHost &&
      current.status === next.status &&
      current.sessionId === next.sessionId &&
      current.error === next.error &&
      current.messages === next.messages
        ? current
        : next,
    )
  }, [cancel, error, messages, onHandle, send, sessionId, status])
  useLayoutEffect(() => () => onHandle(idleHandle), [onHandle])
  return null
}

function idleHostStatus({
  hydrated,
  host,
}: {
  hydrated: boolean
  host: ReturnType<typeof useAgentHost>
}): BoardEveHostStatus {
  if (!hydrated) return 'hydrating'
  if (host.isPending) return 'loading'
  if (host.isError || !host.data) return 'unavailable'
  return 'ready'
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
  const [liveHandle, setLiveHandle] = useState(idleHandle)
  const endpoint = hydrated ? host.data : undefined
  const idle: BoardEveHandle = {
    ...idleHandle,
    hostStatus: idleHostStatus({ hydrated, host }),
  }
  return (
    <context.Provider value={endpoint ? liveHandle : idle}>
      {endpoint ? (
        <EveSession host={endpoint} storageKey={storageKey} onHandle={setLiveHandle} />
      ) : null}
      {children}
    </context.Provider>
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
