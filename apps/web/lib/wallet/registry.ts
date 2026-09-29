export type WalletNamespace = "eip155" | "solana";
export type WalletConnectKind =
  | "injected"
  | "walletconnect"
  | "standard"
  | "deeplink";

export interface WalletRow {
  id: string;
  name: string;
  icon: string;
  namespaces: WalletNamespace[];
  rdns?: string;
  installed: boolean;
  recent: boolean;
  connectKind: WalletConnectKind;
  wcOnly?: boolean;
  deeplink?: string;
}

export interface CatalogWallet {
  id: string;
  name: string;
  icon: string;
  namespaces: WalletNamespace[];
  rdns?: string;
  connectKind: WalletConnectKind;
  wcOnly?: boolean;
  deeplink?: string;
}

export interface DetectedWallet {
  id: string;
  name: string;
  icon?: string;
  namespaces: WalletNamespace[];
  rdns?: string;
  connectKind: WalletConnectKind;
}

export const catalogWallets: CatalogWallet[] = [
  {
    connectKind: "injected",
    icon: "metamask",
    id: "metamask",
    name: "MetaMask",
    namespaces: ["eip155"],
    rdns: "io.metamask",
  },
  {
    connectKind: "injected",
    icon: "coinbase",
    id: "coinbase",
    name: "Coinbase Wallet",
    namespaces: ["eip155"],
    rdns: "com.coinbase.wallet",
  },
  {
    connectKind: "injected",
    icon: "rainbow",
    id: "rainbow",
    name: "Rainbow",
    namespaces: ["eip155"],
    rdns: "me.rainbow",
  },
  {
    connectKind: "injected",
    icon: "rabby",
    id: "rabby",
    name: "Rabby",
    namespaces: ["eip155"],
    rdns: "io.rabby",
  },
  {
    connectKind: "injected",
    deeplink: "https://phantom.app/ul/browse/",
    icon: "phantom",
    id: "phantom",
    name: "Phantom",
    namespaces: ["eip155", "solana"],
    rdns: "app.phantom",
  },
  {
    connectKind: "injected",
    icon: "backpack",
    id: "backpack",
    name: "Backpack",
    namespaces: ["eip155", "solana"],
    rdns: "app.backpack",
  },
  {
    connectKind: "injected",
    icon: "okx",
    id: "okx",
    name: "OKX Wallet",
    namespaces: ["eip155"],
    rdns: "com.okex.wallet",
  },
  {
    connectKind: "injected",
    icon: "trust",
    id: "trust",
    name: "Trust Wallet",
    namespaces: ["eip155"],
    rdns: "com.trustwallet.app",
  },
  {
    connectKind: "injected",
    icon: "brave",
    id: "brave",
    name: "Brave Wallet",
    namespaces: ["eip155"],
    rdns: "com.brave.wallet",
  },
  {
    connectKind: "standard",
    deeplink: "https://solflare.com/ul/v1/browse/",
    icon: "solflare",
    id: "solflare",
    name: "Solflare",
    namespaces: ["solana"],
    rdns: "app.solflare",
  },
  {
    connectKind: "walletconnect",
    icon: "walletconnect",
    id: "walletconnect",
    name: "WalletConnect",
    namespaces: ["eip155"],
    wcOnly: true,
  },
];

function rowKey(row: { id: string; rdns?: string }): string {
  return row.rdns ?? row.id;
}

function uniqueNamespaces(values: WalletNamespace[]): WalletNamespace[] {
  return [...new Set(values)];
}

export function mergeWalletRows({
  catalog,
  detected,
  recentIds,
  hasWalletConnectProjectId,
}: {
  catalog: CatalogWallet[];
  detected: DetectedWallet[];
  recentIds: string[];
  hasWalletConnectProjectId: boolean;
}): WalletRow[] {
  const rows = new Map<string, WalletRow>();

  for (const item of catalog) {
    rows.set(rowKey(item), {
      ...item,
      installed: false,
      recent: recentIds.includes(item.id),
    });
  }

  for (const item of detected) {
    const existing = item.rdns
      ? [...rows.values()].find((row) => row.rdns === item.rdns)
      : rows.get(item.id);
    if (existing) {
      const merged: WalletRow = {
        ...existing,
        connectKind: item.connectKind,
        installed: true,
        namespaces: uniqueNamespaces([
          ...existing.namespaces,
          ...item.namespaces,
        ]),
        recent: recentIds.includes(existing.id) || recentIds.includes(item.id),
      };
      rows.set(rowKey(existing), merged);
      continue;
    }
    rows.set(rowKey(item), {
      connectKind: item.connectKind,
      icon: item.icon ?? item.id,
      id: item.id,
      installed: true,
      name: item.name,
      namespaces: item.namespaces,
      rdns: item.rdns,
      recent: recentIds.includes(item.id),
    });
  }

  return [...rows.values()].filter(
    (row) => row.installed || !row.wcOnly || hasWalletConnectProjectId
  );
}

export function sortWalletRows(rows: WalletRow[]): WalletRow[] {
  return [...rows].sort((a, b) => {
    if (a.installed !== b.installed) {
      return a.installed ? -1 : 1;
    }
    if (a.recent !== b.recent) {
      return a.recent ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}

export function searchWalletRows({
  rows,
  query,
}: {
  rows: WalletRow[];
  query: string;
}): WalletRow[] {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return rows;
  }
  return rows.filter((row) => row.name.toLowerCase().includes(needle));
}
