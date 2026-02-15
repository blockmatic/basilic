'use client'

import { useLinkEmail, useLinkWallet, useUser, useWallet } from '@repo/react'
import { Button } from '@repo/ui/components/button'
import { Input } from '@repo/ui/components/input'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useChainId } from 'wagmi'
import { SignOutButton } from './sign-out-button'

type User = {
  email?: string | null
  name?: string | null
  emailVerified?: boolean | null
}

type DashboardWalletContentProps = {
  user: User
}

export function DashboardWalletContent({ user }: DashboardWalletContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tokenParam = searchParams.get('token')
  const [email, setEmail] = useState('')

  const { data: userData } = useUser()
  const sessionWallet = userData?.user?.wallet
  const linkedWallets = userData?.user?.linkedWallets ?? []

  const evmAdapter = useWallet('eip155')
  const solanaAdapter = useWallet('solana')
  const chainId = useChainId()
  const { setVisible: setSolanaModalVisible } = useWalletModal()

  const activeAdapter = evmAdapter ?? solanaAdapter
  const {
    linkWallet,
    isPending: isLinkWalletPending,
    error: linkWalletError,
  } = useLinkWallet({
    chain: activeAdapter?.chain ?? 'eip155',
    address: activeAdapter?.address,
    signMessage: activeAdapter?.signMessage ?? (async () => ({ signature: '' })),
    chainId,
  })

  const {
    requestLink,
    verifyFromToken,
    isRequestPending,
    isVerifyPending,
    error: linkEmailError,
    isReady,
  } = useLinkEmail({
    onVerifySuccess: async ({ token, refreshToken }) => {
      await fetch('/api/auth/update-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, refreshToken }),
        credentials: 'include',
      })
      router.replace('/dashboard')
    },
  })

  const verifiedToken = useRef<string | null>(null)
  useEffect(() => {
    if (tokenParam && isReady && verifiedToken.current !== tokenParam) {
      verifiedToken.current = tokenParam
      verifyFromToken({ token: tokenParam }).catch(() => {
        verifiedToken.current = null
      })
    }
  }, [tokenParam, isReady, verifyFromToken])

  const handleRequestLinkEmail = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    requestLink({ email, callbackUrl: `${origin}/dashboard` })
  }

  const hasWalletConnected = !!evmAdapter?.address || !!solanaAdapter?.address
  const connectedAddress = (evmAdapter ?? solanaAdapter)?.address?.toLowerCase()
  const canLinkWallet =
    hasWalletConnected &&
    !!connectedAddress &&
    !linkedWallets.some(w => w.address.toLowerCase() === connectedAddress)

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <SignOutButton />
        </div>

        <section className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Account</h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Email:</span> {user.email ?? 'Not linked'}
            </p>
            {sessionWallet && (
              <p>
                <span className="text-muted-foreground">Session wallet:</span> {sessionWallet.chain}
                :{sessionWallet.address.slice(0, 8)}…
              </p>
            )}
            {linkedWallets.length > 0 && (
              <p>
                <span className="text-muted-foreground">Linked wallets:</span>{' '}
                {linkedWallets.map(w => `${w.chain}:${w.address.slice(0, 8)}…`).join(', ')}
              </p>
            )}
          </div>
        </section>

        <section className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Link wallet</h2>
          {!hasWalletConnected ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSolanaModalVisible(true)}>
                Connect Solana wallet
              </Button>
              <p className="text-muted-foreground text-sm self-center">
                or connect MetaMask for EVM
              </p>
            </div>
          ) : canLinkWallet ? (
            <div className="flex flex-col gap-2">
              <Button variant="outline" disabled={isLinkWalletPending} onClick={() => linkWallet()}>
                {isLinkWalletPending ? 'Linking…' : 'Link this wallet'}
              </Button>
              {linkWalletError && (
                <p className="text-destructive text-xs">{linkWalletError.message}</p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">This wallet is already linked</p>
          )}
        </section>

        <section className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Link email</h2>
          {!user.email ? (
            <div className="flex flex-col gap-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <Button
                variant="outline"
                disabled={!isReady || isRequestPending}
                onClick={handleRequestLinkEmail}
              >
                {isRequestPending ? 'Sending…' : 'Request link email'}
              </Button>
              {isVerifyPending && <p className="text-muted-foreground text-sm">Verifying…</p>}
              {linkEmailError && (
                <p className="text-destructive text-xs">{linkEmailError.message}</p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Email already linked: {user.email}</p>
          )}
        </section>
      </div>
    </div>
  )
}
