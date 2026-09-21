'use client'

import { useStateValue } from '@json-render/react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table'
import type { WalletState, WalletToken } from '@/lib/wallet'

function formatQuote(value: number | null) {
  if (value == null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: value < 0.01 ? 6 : 2,
  }).format(value)
}

export function TokenTable({
  props,
}: {
  props: { network: 'all' | 'eth-mainnet' | 'base-mainnet' }
}) {
  const wallet = useStateValue<WalletState>('/wallet')
  const tokens = (wallet?.tokens ?? []).filter(
    (token: WalletToken) => props.network === 'all' || token.network === props.network,
  )
  if (!wallet?.address)
    return <p className="text-muted-foreground text-sm">Link an Ethereum wallet in Settings.</p>
  if (wallet.error) return <p className="text-destructive text-sm">{wallet.error}</p>
  if (!tokens.length)
    return <p className="text-muted-foreground text-sm">No tokens on this network.</p>
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Token</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right">USD</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tokens.map(token => (
          <TableRow key={`${token.network}-${token.tokenAddress ?? 'native'}`}>
            <TableCell>
              <span className="font-medium">{token.name ?? token.symbol ?? 'Token'}</span>
              <span className="text-muted-foreground ml-1 text-xs uppercase">{token.symbol}</span>
            </TableCell>
            <TableCell className="text-right tabular-nums">{token.amount}</TableCell>
            <TableCell className="text-right tabular-nums">{formatQuote(token.quoteUsd)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
