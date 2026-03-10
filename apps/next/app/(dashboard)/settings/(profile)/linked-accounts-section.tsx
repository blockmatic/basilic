'use client'

import { useOAuthLink, useOAuthUnlink, useUser } from '@repo/react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@repo/ui/components/alert-dialog'
import { Button } from '@repo/ui/components/button'
import { useSetState } from 'ahooks'
import { useCallback } from 'react'
import { toast } from 'sonner'

const providerLabels: Record<string, string> = {
  github: 'GitHub',
  facebook: 'Facebook',
  twitter: 'X (Twitter)',
  google: 'Google',
}

export function LinkedAccountsSection() {
  const { data } = useUser()
  const unlinkMutation = useOAuthUnlink()
  const [confirmUnlink, setConfirmUnlink] = useSetState<{ providerId: string | null }>({
    providerId: null,
  })

  const linkedProviderIds = new Set(
    (data?.user as { linkedAccounts?: { providerId: string }[] } | undefined)?.linkedAccounts?.map(
      a => a.providerId,
    ) ?? [],
  )

  const handleUnlink = useCallback(
    async (providerId: string) => {
      try {
        await unlinkMutation.mutateAsync(providerId as 'github' | 'facebook' | 'twitter' | 'google')
        toast.success(`${providerLabels[providerId] ?? providerId} unlinked`)
        setConfirmUnlink({ providerId: null })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to unlink'
        const code =
          err && typeof err === 'object' && 'body' in err
            ? (err as { body?: { code?: string } }).body?.code
            : undefined
        if (code === 'LAST_SIGN_IN_METHOD')
          toast.error('Cannot unlink your last sign-in method. Add another first.')
        else toast.error(msg)
      }
    },
    [unlinkMutation, setConfirmUnlink],
  )

  const providerIds = Object.keys(providerLabels) as (keyof typeof providerLabels)[]

  return (
    <section className="space-y-4 border-b pb-6">
      <div>
        <h2 className="text-lg font-heading font-semibold">Linked accounts</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Connect OAuth providers to sign in with them. You can unlink at any time.
        </p>
      </div>
      <div className="space-y-3">
        {providerIds.map(providerId => {
          const isLinked = linkedProviderIds.has(providerId)
          const label = providerLabels[providerId] ?? providerId
          return (
            <div
              key={providerId}
              className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3"
            >
              <span className="font-medium">{label}</span>
              {isLinked ? (
                <UnlinkButton
                  providerId={providerId}
                  label={label}
                  onUnlink={handleUnlink}
                  isPending={unlinkMutation.isPending}
                  onOpenChange={open => setConfirmUnlink({ providerId: open ? providerId : null })}
                  isOpen={confirmUnlink.providerId === providerId}
                />
              ) : (
                <LinkProviderButton providerId={providerId} label={label} />
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function UnlinkButton({
  providerId,
  label,
  onUnlink,
  isPending,
  onOpenChange,
  isOpen,
}: {
  providerId: string
  label: string
  onUnlink: (id: string) => void
  isPending: boolean
  onOpenChange: (open: boolean) => void
  isOpen: boolean
}) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          Unlink
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unlink {label}?</AlertDialogTitle>
          <AlertDialogDescription>
            You will no longer be able to sign in with {label}. Make sure you have another sign-in
            method.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => onUnlink(providerId)} disabled={isPending}>
            {isPending ? 'Unlinking…' : 'Unlink'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const linkableProviders = ['github', 'facebook', 'twitter'] as const

function LinkProviderButton({ providerId, label }: { providerId: string; label: string }) {
  const canLink = linkableProviders.includes(providerId as (typeof linkableProviders)[number])
  const linkMutation = useOAuthLink(
    canLink ? (providerId as (typeof linkableProviders)[number]) : 'github',
  )

  const handleLink = useCallback(() => {
    if (!canLink) return
    linkMutation.mutateAsync(undefined).catch(() => {
      toast.error(`Failed to start ${label} link`)
    })
  }, [canLink, linkMutation, label])

  if (!canLink)
    return (
      <Button variant="outline" size="sm" disabled>
        Coming soon
      </Button>
    )

  return (
    <Button variant="outline" size="sm" onClick={handleLink} disabled={linkMutation.isPending}>
      {linkMutation.isPending ? 'Redirecting…' : 'Link'}
    </Button>
  )
}
