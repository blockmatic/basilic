import { describe, expect, it } from 'vitest'
import { catalogWallets, mergeWalletRows, searchWalletRows, sortWalletRows } from './registry'

describe('wallet registry', () => {
  it('merges Phantom EIP-155 and Solana detections into one row', () => {
    const rows = mergeWalletRows({
      catalog: catalogWallets,
      detected: [
        {
          id: 'phantom-evm',
          name: 'Phantom',
          namespaces: ['eip155'],
          rdns: 'app.phantom',
          connectKind: 'injected',
        },
        {
          id: 'phantom-sol',
          name: 'Phantom',
          namespaces: ['solana'],
          rdns: 'app.phantom',
          connectKind: 'standard',
        },
      ],
      recentIds: [],
      hasWalletConnectProjectId: false,
    })
    const phantom = rows.filter(row => row.rdns === 'app.phantom')
    expect(phantom).toHaveLength(1)
    expect(phantom[0]?.namespaces).toEqual(['eip155', 'solana'])
    expect(phantom[0]?.connectKind).toBe('standard')
    expect(phantom[0]?.installed).toBe(true)
  })

  it('hides WalletConnect-only rows when project id is unset', () => {
    const hidden = mergeWalletRows({
      catalog: catalogWallets,
      detected: [],
      recentIds: [],
      hasWalletConnectProjectId: false,
    })
    expect(hidden.some(row => row.id === 'walletconnect')).toBe(false)

    const shown = mergeWalletRows({
      catalog: catalogWallets,
      detected: [],
      recentIds: [],
      hasWalletConnectProjectId: true,
    })
    expect(shown.some(row => row.id === 'walletconnect')).toBe(true)
  })

  it('sorts installed then recent then name', () => {
    const rows = sortWalletRows(
      mergeWalletRows({
        catalog: catalogWallets,
        detected: [
          {
            id: 'okx',
            name: 'OKX Wallet',
            namespaces: ['eip155'],
            rdns: 'com.okex.wallet',
            connectKind: 'injected',
          },
        ],
        recentIds: ['metamask'],
        hasWalletConnectProjectId: false,
      }),
    )
    expect(rows[0]?.id).toBe('okx')
    const recentIndex = rows.findIndex(row => row.id === 'metamask')
    const rainbowIndex = rows.findIndex(row => row.id === 'rainbow')
    expect(recentIndex).toBeGreaterThan(-1)
    expect(recentIndex).toBeLessThan(rainbowIndex)
  })

  it('filters by name search', () => {
    const rows = mergeWalletRows({
      catalog: catalogWallets,
      detected: [],
      recentIds: [],
      hasWalletConnectProjectId: true,
    })
    expect(searchWalletRows({ rows, query: 'phan' }).map(row => row.id)).toEqual(['phantom'])
    expect(searchWalletRows({ rows, query: 'zzz' })).toEqual([])
  })
})
