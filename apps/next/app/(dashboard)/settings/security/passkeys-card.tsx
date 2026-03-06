'use client'

import { Button } from '@repo/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card'
import { toast } from 'sonner'

export function PasskeysCard() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Passkeys</CardTitle>
        <CardDescription>
          Sign in securely with a passkey. No passwords to remember.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">No passkeys configured.</p>
        <Button variant="outline" onClick={() => toast.info('Passkeys coming soon')}>
          Add passkey
        </Button>
      </CardContent>
    </Card>
  )
}
