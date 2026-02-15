'use client'

import { useLinkEmail, useLinkWallet, useUser, useWallet } from '@repo/react'
import { Button } from '@repo/ui/components/button'
import { Input } from '@repo/ui/components/input'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useChainId } from 'wagmi'
import { useVerifyLinkEmailToken } from '@/hooks/use-verify-link-email-token'
import { updateAuthTokens } from '@/lib/auth-client'
import { formatWalletShort } from '@/lib/format-wallet'
import { SignOutButton } from './sign-out-button'

function DashboardSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </section>
  )
}

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
  const signMessage = activeAdapter?.signMessage
  const {
    linkWallet,
    isPending: isLinkWalletPending,
    error: linkWalletError,
  } = useLinkWallet({
    chain: activeAdapter?.chain ?? 'eip155',
    address: activeAdapter?.address,
    signMessage:
      signMessage ??
      (async () => {
        throw new Error('signMessage not available')
      }),
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
      await updateAuthTokens({ token, refreshToken })
      router.replace('/dashboard')
    },
  })

  useVerifyLinkEmailToken(tokenParam, isReady, verifyFromToken)

  const handleRequestLinkEmail = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    requestLink({ email, callbackUrl: `${origin}/dashboard` })
  }

  const hasWalletConnected = !!evmAdapter?.address || !!solanaAdapter?.address
  const connectedAddress = (evmAdapter ?? solanaAdapter)?.address?.toLowerCase()
  const canLinkWallet =
    hasWalletConnected &&
    !!connectedAddress &&
    !!signMessage &&
    !linkedWallets.some(w => w.address.toLowerCase() === connectedAddress)

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <SignOutButton />
        </div>

        <DashboardSection title="Account">
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Email:</span> {user.email ?? 'Not linked'}
            </p>
            {sessionWallet && (
              <p>
                <span className="text-muted-foreground">Session wallet:</span>{' '}
                {formatWalletShort(sessionWallet)}
              </p>
            )}
            {linkedWallets.length > 0 && (
              <p>
                <span className="text-muted-foreground">Linked wallets:</span>{' '}
                {linkedWallets.map(formatWalletShort).join(', ')}
              </p>
            )}
          </div>
        </DashboardSection>

        <DashboardSection title="Link wallet">
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
        </DashboardSection>

        <DashboardSection title="Link email">
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
        </DashboardSection>
      </div>
    </div>
  )
}
