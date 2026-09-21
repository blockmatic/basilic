export type WalletNamespace = 'eip155' | 'solana'
export type WalletConnectKind = 'injected' | 'walletconnect' | 'standard' | 'deeplink'

export interface WalletRow {
  id: string
  name: string
  icon: string
  namespaces: WalletNamespace[]
  rdns?: string
  installed: boolean
  recent: boolean
  connectKind: WalletConnectKind
  wcOnly?: boolean
  deeplink?: string
}

export interface CatalogWallet {
  id: string
  name: string
  icon: string
  namespaces: WalletNamespace[]
  rdns?: string
  connectKind: WalletConnectKind
  wcOnly?: boolean
  deeplink?: string
}

export interface DetectedWallet {
  id: string
  name: string
  icon?: string
  namespaces: WalletNamespace[]
  rdns?: string
  connectKind: WalletConnectKind
}

export const catalogWallets: CatalogWallet[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: 'metamask',
    namespaces: ['eip155'],
    rdns: 'io.metamask',
    connectKind: 'injected',
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: 'coinbase',
    namespaces: ['eip155'],
    rdns: 'com.coinbase.wallet',
    connectKind: 'injected',
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    icon: 'rainbow',
    namespaces: ['eip155'],
    rdns: 'me.rainbow',
    connectKind: 'injected',
  },
  {
    id: 'rabby',
    name: 'Rabby',
    icon: 'rabby',
    namespaces: ['eip155'],
    rdns: 'io.rabby',
    connectKind: 'injected',
  },
  {
    id: 'phantom',
    name: 'Phantom',
    icon: 'phantom',
    namespaces: ['eip155', 'solana'],
    rdns: 'app.phantom',
    connectKind: 'injected',
    deeplink: 'https://phantom.app/ul/browse/',
  },
  {
    id: 'backpack',
    name: 'Backpack',
    icon: 'backpack',
    namespaces: ['eip155', 'solana'],
    rdns: 'app.backpack',
    connectKind: 'injected',
  },
  {
    id: 'okx',
    name: 'OKX Wallet',
    icon: 'okx',
    namespaces: ['eip155'],
    rdns: 'com.okex.wallet',
    connectKind: 'injected',
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    icon: 'trust',
    namespaces: ['eip155'],
    rdns: 'com.trustwallet.app',
    connectKind: 'injected',
  },
  {
    id: 'brave',
    name: 'Brave Wallet',
    icon: 'brave',
    namespaces: ['eip155'],
    rdns: 'com.brave.wallet',
    connectKind: 'injected',
  },
  {
    id: 'solflare',
    name: 'Solflare',
    icon: 'solflare',
    namespaces: ['solana'],
    rdns: 'app.solflare',
    connectKind: 'standard',
    deeplink: 'https://solflare.com/ul/v1/browse/',
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: 'walletconnect',
    namespaces: ['eip155'],
    connectKind: 'walletconnect',
    wcOnly: true,
  },
]

function rowKey(row: { id: string; rdns?: string }): string {
  return row.rdns ?? row.id
}

function uniqueNamespaces(values: WalletNamespace[]): WalletNamespace[] {
  return [...new Set(values)]
}

export function mergeWalletRows({
  catalog,
  detected,
  recentIds,
  hasWalletConnectProjectId,
}: {
  catalog: CatalogWallet[]
  detected: DetectedWallet[]
  recentIds: string[]
  hasWalletConnectProjectId: boolean
}): WalletRow[] {
  const rows = new Map<string, WalletRow>()

  for (const item of catalog)
    rows.set(rowKey(item), {
      ...item,
      installed: false,
      recent: recentIds.includes(item.id),
    })

  for (const item of detected) {
    const existing = item.rdns
      ? [...rows.values()].find(row => row.rdns === item.rdns)
      : rows.get(item.id)
    if (existing) {
      const merged: WalletRow = {
        ...existing,
        installed: true,
        namespaces: uniqueNamespaces([...existing.namespaces, ...item.namespaces]),
        connectKind: item.connectKind,
        recent: recentIds.includes(existing.id) || recentIds.includes(item.id),
      }
      rows.set(rowKey(existing), merged)
      continue
    }
    rows.set(rowKey(item), {
      id: item.id,
      name: item.name,
      icon: item.icon ?? item.id,
      namespaces: item.namespaces,
      rdns: item.rdns,
      installed: true,
      recent: recentIds.includes(item.id),
      connectKind: item.connectKind,
    })
  }

  return [...rows.values()].filter(row => row.installed || !row.wcOnly || hasWalletConnectProjectId)
}

export function sortWalletRows(rows: WalletRow[]): WalletRow[] {
  return [...rows].sort((a, b) => {
    if (a.installed !== b.installed) return a.installed ? -1 : 1
    if (a.recent !== b.recent) return a.recent ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}

export function searchWalletRows({
  rows,
  query,
}: {
  rows: WalletRow[]
  query: string
}): WalletRow[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return rows
  return rows.filter(row => row.name.toLowerCase().includes(needle))
}
