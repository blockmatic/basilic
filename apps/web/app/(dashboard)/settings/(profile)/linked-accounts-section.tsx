'use client'

import {
  useOAuthLink,
  useOAuthProviders,
  useOAuthUnlink,
  useUnlinkWallet,
  useUser,
} from '@repo/react'
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
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { WalletModal } from '@/components/wallet/wallet-modal'
import { getApiErrorCode } from '@/lib/auth/api-error'
import { getAuthErrorMessage } from '@/lib/auth/auth-error-messages'

const providerLabels: Record<string, string> = {
  github: 'GitHub',
  facebook: 'Facebook',
  twitter: 'X (Twitter)',
  google: 'Google',
}

export function LinkedAccountsSection() {
  const { data } = useUser()
  const {
    github: githubEnabled,
    googleHasRedirectConfig: googleEnabled,
    facebook: facebookEnabled,
    twitter: twitterEnabled,
  } = useOAuthProviders()
  const unlinkMutation = useOAuthUnlink()
  const unlinkWalletMutation = useUnlinkWallet()
  const [walletModalOpen, setWalletModalOpen] = useState(false)
  const [confirmUnlink, setConfirmUnlink] = useSetState<{ providerId: string | null }>({
    providerId: null,
  })
  const [confirmUnlinkWallet, setConfirmUnlinkWallet] = useSetState<{ id: string | null }>({
    id: null,
  })

  const linkedProviderIds = new Set(
    (data?.user as { linkedAccounts?: { providerId: string }[] } | undefined)?.linkedAccounts?.map(
      a => a.providerId,
    ) ?? [],
  )
  const linkedWallets =
    (data?.user as { linkedWallets?: { id: string; chain: string; address: string }[] } | undefined)
      ?.linkedWallets ?? []
  const hasEmail = Boolean(data?.user?.email)
  const providerIds = Object.keys(providerLabels) as (keyof typeof providerLabels)[]

  const handleUnlink = useCallback(
    async (providerId: string) => {
      try {
        await unlinkMutation.mutateAsync(providerId as 'github' | 'facebook' | 'twitter' | 'google')
        toast.success(`${providerLabels[providerId] ?? providerId} unlinked`)
        setConfirmUnlink({ providerId: null })
      } catch (err) {
        const code = getApiErrorCode(err)
        if (code === 'LAST_SIGN_IN_METHOD')
          toast.error('Cannot unlink your last sign-in method. Add another first.')
        else toast.error(err instanceof Error ? err.message : 'Failed to unlink')
      }
    },
    [unlinkMutation, setConfirmUnlink],
  )

  const handleUnlinkWallet = useCallback(
    async (id: string) => {
      try {
        await unlinkWalletMutation.mutateAsync({ id })
        toast.success('Wallet unlinked')
        setConfirmUnlinkWallet({ id: null })
      } catch (err) {
        const code = getApiErrorCode(err)
        if (code === 'LAST_SIGN_IN_METHOD')
          toast.error('Cannot unlink your last sign-in method. Add another first.')
        else toast.error(err instanceof Error ? err.message : 'Failed to unlink wallet')
      }
    },
    [unlinkWalletMutation, setConfirmUnlinkWallet],
  )

  return (
    <section className="space-y-4 border-b pb-6">
      <div>
        <h2 className="text-lg font-heading font-semibold">Linked accounts</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Connect OAuth providers and wallets to sign in with them. Link a wallet only after you
          have an email on the account.
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
                <LinkProviderButton
                  providerId={providerId}
                  label={label}
                  providersEnabled={{
                    github: githubEnabled,
                    google: googleEnabled,
                    facebook: facebookEnabled,
                    twitter: twitterEnabled,
                  }}
                />
              )}
            </div>
          )
        })}
        {linkedWallets.map(wallet => (
          <div
            key={wallet.id}
            className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3"
          >
            <div>
              <span className="font-medium">
                {wallet.chain === 'solana' ? 'Solana' : 'Ethereum'} wallet
              </span>
              <p className="text-muted-foreground font-mono text-xs">
                {wallet.address.slice(0, 6)}…{wallet.address.slice(-4)}
              </p>
            </div>
            <AlertDialog
              open={confirmUnlinkWallet.id === wallet.id}
              onOpenChange={open => setConfirmUnlinkWallet({ id: open ? wallet.id : null })}
            >
              <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>
                Unlink
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Unlink wallet?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will no longer be able to sign in with this wallet. Keep another sign-in
                    method.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleUnlinkWallet(wallet.id)}
                    disabled={unlinkWalletMutation.isPending}
                  >
                    {unlinkWalletMutation.isPending ? 'Unlinking…' : 'Unlink'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
        <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
          <span className="font-medium">Link wallet</span>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasEmail}
            onClick={() => setWalletModalOpen(true)}
          >
            {hasEmail ? 'Link' : 'Add email first'}
          </Button>
        </div>
      </div>
      <WalletModal
        open={walletModalOpen}
        onOpenChange={setWalletModalOpen}
        mode="link"
        onLinked={() => toast.success('Wallet linked')}
        onError={error => {
          const code = getApiErrorCode(error)
          if (code === 'EMAIL_REQUIRED') toast.error(getAuthErrorMessage('wallet_email_required'))
          else if (code === 'WALLET_ALREADY_LINKED')
            toast.error('This wallet is already linked to another account')
          else toast.error(error instanceof Error ? error.message : 'Failed to link wallet')
        }}
      />
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
      <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>
        Unlink
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

const linkProviderIds = ['github', 'google', 'facebook', 'twitter'] as const

function LinkProviderButton({
  providerId,
  label,
  providersEnabled,
}: {
  providerId: string
  label: string
  providersEnabled: { github: boolean; google: boolean; facebook: boolean; twitter: boolean }
}) {
  const canLink =
    linkProviderIds.includes(providerId as (typeof linkProviderIds)[number]) &&
    (providersEnabled[providerId as keyof typeof providersEnabled] ?? false)
  const linkMutation = useOAuthLink(
    canLink ? (providerId as (typeof linkProviderIds)[number]) : 'github',
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
