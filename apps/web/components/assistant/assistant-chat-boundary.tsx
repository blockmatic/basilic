'use client'

import { Button } from '@repo/ui/components/button'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import { AssistantChat, type AssistantChatProps } from './assistant-chat'

function AssistantChatError({ error, resetErrorBoundary }: FallbackProps) {
  const message = error instanceof Error ? error.message : 'Chat failed'

  return (
    <div
      data-testid="chat-error"
      className="border-destructive/50 bg-destructive/10 text-destructive m-4 flex flex-1 flex-col justify-center rounded-md border px-3 py-2 text-sm"
    >
      <p>{message}</p>
      <Button
        variant="link"
        className="text-destructive mt-1 h-auto self-start p-0"
        onClick={resetErrorBoundary}
      >
        Dismiss
      </Button>
    </div>
  )
}

export function AssistantChatBoundary(props: AssistantChatProps) {
  return (
    <ErrorBoundary FallbackComponent={AssistantChatError} onReset={() => {}}>
      <AssistantChat {...props} />
    </ErrorBoundary>
  )
}
