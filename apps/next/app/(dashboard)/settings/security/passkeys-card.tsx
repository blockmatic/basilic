'use client'

import {
  usePasskeyRegister,
  usePasskeyRemove,
  usePasskeysList,
  useWebAuthnAvailable,
} from '@repo/react'
import { Alert, AlertDescription } from '@repo/ui/components/alert'
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
import { Skeleton } from '@repo/ui/components/skeleton'
import { Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString()
  } catch {
    return iso
  }
}

const webauthnUnavailableMessage =
  'Passkeys require a secure connection (HTTPS) and a modern browser. Try accessing this page over HTTPS or updating your browser.'

export function PasskeysCard() {
  const webauthnAvailable = useWebAuthnAvailable()
  const { data, isLoading, isError, error } = usePasskeysList()
  const registerMutation = usePasskeyRegister()
  const removeMutation = usePasskeyRemove()

  const [removeId, setRemoveId] = useState<string | null>(null)

  async function handleAddPasskey() {
    try {
      await registerMutation.mutateAsync()
      toast.success('Passkey added')
    } catch (err) {
      const isAbort = err instanceof Error && err.name === 'NotAllowedError'
      if (isAbort) toast.info('Registration cancelled')
      else toast.error('Failed to add passkey')
    }
  }

  async function handleRemoveConfirm() {
    if (!removeId) return false
    try {
      await removeMutation.mutateAsync({ id: removeId })
      toast.success('Passkey removed')
      setRemoveId(null)
      return true
    } catch {
      toast.error('Failed to remove passkey')
      return false
    }
  }

  if (isLoading)
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-72" />
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
          <p className="text-destructive text-sm">{error?.message ?? 'Failed to load passkeys'}</p>
        </CardContent>
      </Card>
    )

  const passkeys = data?.passkeys ?? []

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-heading font-semibold">Passkeys</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Sign in securely with a passkey. No passwords to remember.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!webauthnAvailable && (
            <Alert>
              <AlertDescription>{webauthnUnavailableMessage}</AlertDescription>
            </Alert>
          )}
          {passkeys.length === 0 ? (
            <div className="space-y-4 py-8">
              <p className="text-muted-foreground text-sm">No passkeys configured.</p>
              <Button
                variant="outline"
                onClick={handleAddPasskey}
                disabled={registerMutation.isPending || !webauthnAvailable}
              >
                {registerMutation.isPending ? 'Adding…' : 'Add passkey'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleAddPasskey}
                  disabled={registerMutation.isPending || !webauthnAvailable}
                >
                  {registerMutation.isPending ? 'Adding…' : 'Add passkey'}
                </Button>
              </div>
              <ul className="space-y-3">
                {passkeys.map(pk => (
                  <li
                    key={pk.id}
                    className="flex min-h-[44px] items-center justify-between gap-4 rounded-lg border p-3"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="font-medium truncate">{pk.name}</p>
                      <p className="text-muted-foreground text-sm">
                        Added {formatDate(pk.createdAt)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${pk.name}`}
                      onClick={() => setRemoveId(pk.id)}
                    >
                      <Trash2Icon />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!removeId} onOpenChange={open => !open && setRemoveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove passkey</AlertDialogTitle>
            <AlertDialogDescription>
              This passkey will no longer work for signing in. You can add a new one anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={async () => {
                const ok = await handleRemoveConfirm()
                if (ok) setRemoveId(null)
              }}
              disabled={removeMutation.isPending}
            >
              {removeMutation.isPending ? 'Removing…' : 'Remove'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
