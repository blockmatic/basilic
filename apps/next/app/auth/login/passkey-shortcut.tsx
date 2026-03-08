'use client'

import { Button } from '@repo/ui/components/button'
import { Card } from '@repo/ui/components/card'
import { cn } from '@repo/ui/lib/utils'

type PasskeyShortcutProps = {
  email: string
  onUsePasskey: () => void
  onUseAnotherMethod: () => void
  isPending: boolean
}

export function PasskeyShortcut({
  email,
  onUsePasskey,
  onUseAnotherMethod,
  isPending,
}: PasskeyShortcutProps) {
  return (
    <Card className={cn('gap-4 p-4')} aria-busy={isPending}>
      <p className="text-sm text-muted-foreground">Login as {email}</p>
      <div className="flex flex-col gap-4">
        <Button
          onClick={onUsePasskey}
          disabled={isPending}
          aria-label={isPending ? 'Signing in with passkey' : 'Use passkey to sign in'}
          aria-busy={isPending}
        >
          {isPending ? 'Signing in…' : 'Use Passkey'}
        </Button>
        <button
          type="button"
          onClick={onUseAnotherMethod}
          className="text-muted-foreground hover:text-foreground text-sm underline underline-offset-4 transition-colors"
        >
          Use another method
        </button>
      </div>
    </Card>
  )
}
