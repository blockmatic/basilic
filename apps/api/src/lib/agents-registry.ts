import { Type } from '@sinclair/typebox'

export const agentIds = ['command', 'chat'] as const
export type AgentId = (typeof agentIds)[number]

export const AgentRecordSchema = Type.Object({
  id: Type.Union([Type.Literal('command'), Type.Literal('chat')]),
  name: Type.String(),
  endpoint: Type.String({ minLength: 1 }),
  transport: Type.Literal('eve'),
  presentation: Type.String(),
  capabilities: Type.Array(Type.String()),
  features: Type.Array(Type.String()),
})

export function agentCatalog({
  commandUrl,
  chatUrl,
}: {
  commandUrl: string
  chatUrl: string
}): Array<{
  id: AgentId
  name: string
  endpoint: string
  transport: 'eve'
  presentation: string
  capabilities: string[]
  features: string[]
}> {
  return [
    {
      id: 'command',
      name: 'Commands',
      endpoint: commandUrl.replace(/\/$/, ''),
      transport: 'eve',
      presentation: 'commands',
      capabilities: ['markets', 'watches'],
      features: ['tools'],
    },
    {
      id: 'chat',
      name: 'Chat',
      endpoint: chatUrl.replace(/\/$/, ''),
      transport: 'eve',
      presentation: 'chat',
      capabilities: ['watches-read'],
      features: ['transcript'],
    },
  ]
}

export function agentById({
  agentId,
  commandUrl,
  chatUrl,
}: {
  agentId: string
  commandUrl: string
  chatUrl: string
}) {
  return agentCatalog({ commandUrl, chatUrl }).find(row => row.id === agentId) ?? null
}
