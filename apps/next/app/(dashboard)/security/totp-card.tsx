'use client'

import { Button } from '@repo/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@repo/ui/components/input-otp'
import { useSetState } from 'ahooks'
import { toast } from 'sonner'
import { z } from 'zod'

// For when submit is implemented: z.string().length(6).regex(/^\d+$/)
export const totpCodeSchema = z.object({ code: z.string().length(6).regex(/^\d+$/) })

export function TotpCard() {
  const [state, setState] = useSetState({ code: '' })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authenticator app</CardTitle>
        <CardDescription>Use an authenticator app to generate one-time codes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium">Scan QR code</p>
          <div className="flex size-40 items-center justify-center rounded-lg border bg-muted">
            <span className="text-muted-foreground text-xs">QR Code</span>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Or enter key manually</p>
          <p className="font-mono text-muted-foreground text-sm">XXXX-XXXX-XXXX-XXXX</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Enter verification code</p>
          <InputOTP maxLength={6} value={state.code} onChange={code => setState({ code })}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button onClick={() => toast.info('TOTP coming soon')}>Enable authenticator</Button>
      </CardContent>
    </Card>
  )
}
