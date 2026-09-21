'use client'

import { useStateValue } from '@json-render/react'
import type { WalletNft, WalletState } from '@/lib/wallet'

export function NftGrid({ props }: { props: { hidden: boolean } }) {
  const wallet = useStateValue<WalletState>('/wallet')
  if (props.hidden) return null
  if (!wallet?.address)
    return <p className="text-muted-foreground text-sm">Link an Ethereum wallet in Settings.</p>
  if (wallet.error) return <p className="text-destructive text-sm">{wallet.error}</p>
  const nfts = wallet.nfts ?? []
  if (!nfts.length) return <p className="text-muted-foreground text-sm">No NFTs.</p>
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {nfts.map((nft: WalletNft) => (
        <li key={`${nft.network}-${nft.contractAddress}-${nft.tokenId}`} className="min-w-0">
          {nft.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- NFT thumbs are Alchemy cached URLs
            <img
              src={nft.imageUrl}
              alt=""
              width={160}
              height={160}
              className="aspect-square w-full rounded-lg object-cover"
            />
          ) : (
            <div className="bg-muted aspect-square rounded-lg" />
          )}
          <p className="mt-1 truncate text-sm font-medium">{nft.name ?? `#${nft.tokenId}`}</p>
        </li>
      ))}
    </ul>
  )
}
