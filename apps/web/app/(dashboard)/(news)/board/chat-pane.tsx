'use client'

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
} from '@/components/assistant/conversation'
import { Message, MessageContent } from '@/components/assistant/message'
import { useChatEve } from './eve-session'

function textFromParts({ parts }: { parts: readonly { type: string; text?: string }[] }): string {
  return parts.flatMap(part => (part.type === 'text' && part.text ? [part.text] : [])).join('')
}

export function ChatPane() {
  const { messages, error, status } = useChatEve()
  if (messages.length === 0)
    return (
      <ConversationEmptyState data-testid="chat-empty">
        Ask about this board. Advice is not a trade. Use Commands to change the table.
      </ConversationEmptyState>
    )
  return (
    <Conversation>
      <ConversationContent data-testid="chat-transcript">
        {messages.map(message => (
          <Message key={message.id} from={message.role === 'user' ? 'user' : 'assistant'}>
            <MessageContent>{textFromParts({ parts: message.parts })}</MessageContent>
          </Message>
        ))}
        {status === 'error' && error ? (
          <p className="text-destructive text-sm" role="alert">
            {error.message || 'Chat failed'}
          </p>
        ) : null}
      </ConversationContent>
    </Conversation>
  )
}
