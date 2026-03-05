'use client'

import { Button } from '@repo/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@repo/ui/components/input-otp'
import { useState } from 'react'
import { toast } from 'sonner'

export function TotpCard() {
  const [code, setCode] = useState('')

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
          <InputOTP maxLength={6} value={code} onChange={setCode}>
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
