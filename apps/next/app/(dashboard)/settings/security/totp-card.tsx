'use client'

import { ApiError } from '@repo/core'
import { useTotpSetup, useTotpUnlink, useTotpVerify, useUser } from '@repo/react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@repo/ui/components/alert-dialog'
import { Button } from '@repo/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@repo/ui/components/input-otp'
import { Skeleton } from '@repo/ui/components/skeleton'
import { useState } from 'react'
import { toast } from 'sonner'

export function TotpCard() {
  const { data, isLoading } = useUser()
  const setupMutation = useTotpSetup()
  const verifyMutation = useTotpVerify()
  const unlinkMutation = useTotpUnlink()

  const [code, setCode] = useState('')
  const [setupData, setSetupData] = useState<{
    qrCodeDataUrl: string
    manualEntryKey: string
  } | null>(null)
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false)

  const totpEnabled = data?.user?.totpEnabled ?? false

  async function handleSetup() {
    try {
      const res = await setupMutation.mutateAsync()
      setSetupData({
        qrCodeDataUrl: res.qrCodeDataUrl,
        manualEntryKey: res.manualEntryKey,
      })
    } catch {
      toast.error('Failed to start setup')
    }
  }

  async function handleVerify() {
    if (!code || code.length !== 6) return
    try {
      await verifyMutation.mutateAsync({ code })
      toast.success('Authenticator enabled')
      setSetupData(null)
      setCode('')
    } catch (err) {
      if (
        err instanceof ApiError &&
        err.body &&
        typeof err.body === 'object' &&
        'code' in err.body
      ) {
        const apiCode = (err.body as { code: string }).code
        toast.error(
          apiCode === 'INVALID_CODE' ? 'Invalid code. Try again.' : 'Setup expired. Start again.',
        )
      } else {
        toast.error('Verification failed')
      }
    }
  }

  async function handleUnlinkConfirm() {
    try {
      await unlinkMutation.mutateAsync()
      toast.success('Authenticator removed')
      setShowUnlinkConfirm(false)
    } catch {
      toast.error('Failed to remove authenticator')
    }
  }

  function handleCancelSetup() {
    setSetupData(null)
    setCode('')
  }

  if (isLoading)
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )

  if (totpEnabled && !setupData)
    return (
      <>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-heading font-semibold">Authenticator app</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Use an authenticator app to generate one-time codes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm font-medium">Authenticator enabled</p>
            <Button
              variant="destructive"
              onClick={() => setShowUnlinkConfirm(true)}
              disabled={unlinkMutation.isPending}
            >
              {unlinkMutation.isPending ? 'Removing…' : 'Remove authenticator'}
            </Button>
          </CardContent>
        </Card>

        <AlertDialog open={showUnlinkConfirm} onOpenChange={setShowUnlinkConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove authenticator</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove your authenticator app. You can add it again later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={async () => {
                  await handleUnlinkConfirm()
                }}
                disabled={unlinkMutation.isPending}
              >
                {unlinkMutation.isPending ? 'Removing…' : 'Remove'}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-heading font-semibold">Authenticator app</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Use an authenticator app to generate one-time codes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!setupData ? (
          <Button onClick={handleSetup} disabled={setupMutation.isPending}>
            {setupMutation.isPending ? 'Starting…' : 'Enable authenticator'}
          </Button>
        ) : (
          <>
            <div className="space-y-2">
              <p className="text-sm font-medium">Scan QR code</p>
              <div className="flex size-40 items-center justify-center overflow-hidden rounded-lg border bg-muted md:size-48">
                {/* eslint-disable-next-line @next/next/no-img-element -- QR data URL, not optimizable by next/image */}
                <img
                  src={setupData.qrCodeDataUrl}
                  alt="Scan with authenticator app"
                  className="size-full object-contain"
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Or enter key manually</p>
              <p className="font-mono text-muted-foreground text-sm">{setupData.manualEntryKey}</p>
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
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={handleCancelSetup}
                disabled={verifyMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleVerify}
                disabled={code.length !== 6 || verifyMutation.isPending}
              >
                {verifyMutation.isPending ? 'Verifying…' : 'Verify'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
