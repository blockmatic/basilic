'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog'
import { Input } from '@repo/ui/components/input'
import { ScrollArea } from '@repo/ui/components/scroll-area'
import type { WalletRow } from '@/lib/wallet'
import { useWalletAuth } from './use-wallet-auth'
import { WalletGlyph } from './wallet-icon'

export function WalletModal({
  open,
  onOpenChange,
  mode,
  onError,
  onLinked,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'login' | 'link'
  onError: (error: unknown) => void
  onLinked?: () => void
}) {
  const { rows, query, setQuery, authenticate, isPending } = useWalletAuth({ mode })

  async function handleSelect(row: WalletRow) {
    try {
      await authenticate({ row })
      onOpenChange(false)
      onLinked?.()
    } catch (error) {
      onOpenChange(false)
      onError(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-4 sm:max-w-md" data-testid="wallet-modal">
        <DialogHeader>
          <DialogTitle>Connect a wallet</DialogTitle>
          <DialogDescription>
            {mode === 'login'
              ? 'Use a wallet already linked to your Basilic account.'
              : 'Sign a message to link this wallet to your account.'}
          </DialogDescription>
        </DialogHeader>
        <Input
          value={query}
          onChange={event => setQuery(event.currentTarget.value)}
          placeholder="Search wallets"
          aria-label="Search wallets"
          data-testid="wallet-search"
        />
        <ScrollArea className="h-72">
          <ul className="flex flex-col gap-1 pr-2">
            {rows.length === 0 ? (
              <li className="text-muted-foreground px-2 py-6 text-center text-sm">
                No wallets match that search.
              </li>
            ) : (
              rows.map(row => (
                <li key={row.id}>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleSelect(row)}
                    className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                    data-testid={`wallet-row-${row.id}`}
                  >
                    <WalletGlyph icon={row.icon} className="size-8 shrink-0" />
                    <span className="flex-1 font-medium">{row.name}</span>
                    {row.installed ? (
                      <span className="text-muted-foreground text-xs">Installed</span>
                    ) : null}
                  </button>
                </li>
              ))
            )}
          </ul>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
