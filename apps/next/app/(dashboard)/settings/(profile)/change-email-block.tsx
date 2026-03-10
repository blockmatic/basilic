'use client'

import { useChangeEmail } from '@repo/react'
import { Button } from '@repo/ui/components/button'
import { Input } from '@repo/ui/components/input'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { updateAuthTokens } from '@/lib/auth/auth-client'

export function ChangeEmailBlock({ email }: { email: string | null }) {
  const [step, setStep] = useState<'idle' | 'enter' | 'requested'>('idle')
  const [newEmail, setNewEmail] = useState('')
  const [code, setCode] = useState('')
  const changeEmail = useChangeEmail({
    onVerifySuccess: async ({ token, refreshToken }) => {
      await updateAuthTokens({ token, refreshToken })
      toast.success('Email updated')
      setStep('idle')
      setNewEmail('')
      setCode('')
    },
  })

  const handleRequest = useCallback(async () => {
    if (!newEmail.trim()) return
    try {
      const callbackUrl =
        typeof window !== 'undefined' ? `${window.location.origin}/auth/callback/change-email` : ''
      await changeEmail.requestChange({ email: newEmail.trim(), callbackUrl })
      setStep('requested')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send verification email')
    }
  }, [newEmail, changeEmail])

  const handleVerify = useCallback(async () => {
    if (!code.trim() || !newEmail.trim()) return
    try {
      await changeEmail.verify({ token: code.trim(), email: newEmail.trim() })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Verification failed')
    }
  }, [code, newEmail, changeEmail])

  if (step === 'requested')
    return (
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm">Check your inbox for the verification code.</p>
        <div className="flex gap-2">
          <Input
            type="text"
            inputMode="numeric"
            placeholder="6-digit code"
            maxLength={6}
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
          />
          <Button
            onClick={handleVerify}
            disabled={code.length !== 6 || changeEmail.isVerifyPending}
          >
            {changeEmail.isVerifyPending ? 'Verifying…' : 'Verify'}
          </Button>
        </div>
        <p className="text-muted-foreground text-xs">Or click the link in the email to verify.</p>
      </div>
    )

  if (step === 'idle')
    return (
      <div className="flex items-center gap-2">
        <Input type="email" value={email ?? ''} disabled readOnly className="bg-muted flex-1" />
        <Button variant="outline" onClick={() => setStep('enter')}>
          Change email
        </Button>
      </div>
    )

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="New email"
          value={newEmail}
          onChange={e => setNewEmail(e.target.value)}
        />
        <Button onClick={handleRequest} disabled={!newEmail.trim() || changeEmail.isRequestPending}>
          {changeEmail.isRequestPending ? 'Sending…' : 'Send code'}
        </Button>
        <Button variant="ghost" onClick={() => setStep('idle')}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
