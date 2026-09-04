'use client'

import { useRevokeSession, useSessionsList } from '@repo/react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@repo/ui/components/alert-dialog'
import { Badge } from '@repo/ui/components/badge'
import { Button } from '@repo/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card'
import { Skeleton } from '@repo/ui/components/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table'
import { Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

function methodLabel(method: string | null) {
  if (method === 'magic_link') return 'Email code'
  if (method === 'oauth_google') return 'Google'
  if (method === 'oauth_github') return 'GitHub'
  if (method === 'oauth_facebook') return 'Facebook'
  if (method === 'oauth_twitter') return 'X'
  if (method === 'passkey') return 'Passkey'
  if (method === 'web3_eip155') return 'Wallet (Ethereum)'
  if (method === 'web3_solana') return 'Wallet (Solana)'
  return method ?? '—'
}

function asText(value: unknown) {
  return typeof value === 'string' ? value : null
}

function formatSignedIn(iso: string) {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return iso
  const deltaSec = Math.round((Date.now() - then) / 1000)
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  const abs = Math.abs(deltaSec)
  if (abs < 60) return rtf.format(-deltaSec, 'second')
  if (abs < 3600) return rtf.format(-Math.round(deltaSec / 60), 'minute')
  if (abs < 86400) return rtf.format(-Math.round(deltaSec / 3600), 'hour')
  return rtf.format(-Math.round(deltaSec / 86400), 'day')
}

export function SessionsCard() {
  const { data, isLoading, isError, error } = useSessionsList()
  const revokeMutation = useRevokeSession()
  const [revokeTarget, setRevokeTarget] = useState<{ id: string; isCurrent: boolean } | null>(null)

  async function handleRevokeConfirm(): Promise<boolean> {
    if (!revokeTarget) return false
    try {
      await revokeMutation.mutateAsync({ id: revokeTarget.id })
      toast.success('Session signed out')
      if (revokeTarget.isCurrent) window.location.href = '/auth/logout'
      return true
    } catch {
      toast.error('Failed to sign out of that device')
      return false
    }
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

  if (isError)
    return (
      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <p className="text-destructive text-sm">{error?.message ?? 'Failed to load sessions'}</p>
        </CardContent>
      </Card>
    )

  const rows = data?.sessions ?? []

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>
            Devices signed in to your account. Sign out of any session you do not recognize.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-muted-foreground text-sm">No active sessions.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Signed in</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(row => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        <span>{asText(row.deviceLabel) ?? 'Unknown device'}</span>
                        {row.isCurrent ? <Badge variant="secondary">Current</Badge> : null}
                      </div>
                    </TableCell>
                    <TableCell>{methodLabel(asText(row.signInMethod))}</TableCell>
                    <TableCell>{asText(row.location) ?? '—'}</TableCell>
                    <TableCell>{formatSignedIn(String(row.createdAt))}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={
                          row.isCurrent
                            ? 'Sign out of current session'
                            : `Sign out of ${row.deviceLabel ?? 'device'}`
                        }
                        onClick={() => setRevokeTarget({ id: row.id, isCurrent: row.isCurrent })}
                      >
                        <Trash2Icon />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!revokeTarget} onOpenChange={open => !open && setRevokeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {revokeTarget?.isCurrent ? 'Sign out of this device?' : 'Sign out of this session?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {revokeTarget?.isCurrent
                ? 'You will need to sign in again to use this browser.'
                : 'That device will be signed out immediately.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={async () => {
                const ok = await handleRevokeConfirm()
                if (ok) setRevokeTarget(null)
              }}
              disabled={revokeMutation.isPending}
            >
              {revokeMutation.isPending ? 'Signing out…' : 'Sign out'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
