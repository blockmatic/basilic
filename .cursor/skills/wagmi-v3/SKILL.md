# Skill: wagmi

## Scope

- React/Next.js wallet integration with Wagmi v3 for EVM chains
- Contract interactions using viem v2 for address validation and transaction building
- Transaction state management and error handling
- Custom hooks wrapping wagmi for contract-specific interactions

Does NOT cover:
- Solana frontend development
- Backend RPC interactions
- Smart contract development

## Principles

- Use Wagmi v3.x (latest v3.3.2) hooks for wallet state (`useAccount`, `useWriteContract`, `useReadContract`, `useWaitForTransactionReceipt`, `useSimulateContract`)
- Use viem v2.44.4 for address validation (`getAddress`) and transaction utilities (`parseEther`, `parseGwei`)
- Create custom hooks wrapping wagmi for contract-specific interactions
- Handle connection states explicitly: disconnected, connecting, connected, reconnecting
- Validate addresses with `getAddress()` from viem before use (never cast directly as `Address`)
- Use generated contract ABIs and types from OpenAPI specs
- Use TanStack Query (via wagmi) for caching and refetching contract data
- Simulate contracts before writing to validate and estimate gas
- Use conditional queries with `enabled` flags to prevent unnecessary fetches
- Handle SSR properly with cookie storage for persistent wallet state

## Constraints

- MUST use Wagmi v3.x (not v1 or v2) - v1/v2 patterns are incompatible
- MUST validate addresses with `getAddress()` from viem - never cast strings directly
- SHOULD create custom hooks for contract interactions (see Custom Contract Hook Pattern below)
- SHOULD handle SSR properly in Next.js (use `dynamic` with `ssr: false` for wallet components)
- AVOID wrapping generated hooks from OpenAPI clients unless necessary for abstraction
- AVOID exposing private keys or sensitive wallet data in components

## Interactions

- Uses generated contract ABIs/types from OpenAPI specs
- Complements [fastify](@cursor/skills/fastify-v5/SKILL.md) for API development

## Patterns

### Configuration Setup Pattern

Configure wagmi with chains, transports, connectors, and storage:

```tsx
import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'
import { cookieStorage, createStorage } from 'wagmi'

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(),
    walletConnect({ projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID! }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true, // Enable SSR support
  multiInjectedProviderDiscovery: false, // Disable for better performance
})
```

**Key Configuration Options:**
- **`chains`**: Array of supported chains (import from `wagmi/chains`)
- **`connectors`**: Wallet connectors (injected, WalletConnect, Coinbase, etc.)
- **`transports`**: RPC providers per chain (use `http()` for public RPCs, or custom providers)
- **`storage`**: Use `cookieStorage` for SSR persistence, `localStorage` for client-only
- **`ssr`**: Enable SSR support for Next.js
- **`autoConnect`**: Automatically reconnect on mount (default: `true`)

**Provider Setup in Next.js:**

```tsx
'use client'

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'
import { wagmiConfig } from '@/lib/wagmi-config'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
      },
    },
  }))

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

### Custom Contract Hook Pattern

Create specialized hooks for contract interactions:

```tsx
import { useAccount, useWriteContract } from 'wagmi'
import { getAddress } from 'viem'
import type { Address } from 'viem'

export function useContractMint({ contractAddress }: { contractAddress: Address }) {
  const { address: account } = useAccount()
  const { writeContract, ...rest } = useWriteContract()

  const mint = async (amount: bigint) => {
    if (!account) throw new Error('Wallet not connected')
    
    return writeContract({
      address: getAddress(contractAddress), // Always validate
      abi: ContractAbi,
      functionName: 'mint',
      args: [amount],
    })
  }

  return { mint, ...rest }
}
```

### Address Validation Pattern

Always validate addresses before use:

```tsx
import { getAddress, type Address } from 'viem'

function validateAndUseAddress(rawAddress: string): Address {
  try {
    return getAddress(rawAddress) // Validates checksum and format
  } catch (error) {
    throw new Error('Invalid Ethereum address')
  }
}
```

### Connection State Handling

Handle all wallet connection states:

```tsx
import { useAccount } from 'wagmi'

function WalletStatus() {
  const { address, isConnected, isConnecting, isDisconnected, isReconnecting } = useAccount()

  if (isDisconnected) return <ConnectButton />
  if (isConnecting || isReconnecting) return <div>Connecting...</div>
  if (isConnected && address) return <div>Connected: {address}</div>
  
  return null
}
```

### Explicit Connection Management

Use `useConnect` and `useDisconnect` for explicit connection control:

```tsx
import { useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'

function WalletControls() {
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  const handleConnect = () => {
    const connector = connectors.find(c => c.id === 'injected')
    if (connector) connect({ connector })
  }

  return (
    <>
      <button onClick={handleConnect} disabled={isPending}>
        {isPending ? 'Connecting...' : 'Connect Wallet'}
      </button>
      <button onClick={() => disconnect()}>Disconnect</button>
    </>
  )
}
```

### Chain Switching Pattern

Handle chain switching with error handling:

```tsx
import { useSwitchChain, useAccount } from 'wagmi'
import { sepolia } from 'wagmi/chains'

function SwitchChainButton() {
  const { chain } = useAccount()
  const { switchChain, isPending, error } = useSwitchChain()

  const handleSwitch = () => {
    switchChain({ chainId: sepolia.id })
  }

  if (chain?.id === sepolia.id) {
    return <div>Already on Sepolia</div>
  }

  return (
    <>
      <button onClick={handleSwitch} disabled={isPending}>
        {isPending ? 'Switching...' : 'Switch to Sepolia'}
      </button>
      {error && <div>Error: {error.message}</div>}
    </>
  )
}
```

### Transaction Lifecycle Pattern

Complete transaction flow: simulate → write → wait → handle success/error:

```tsx
import { useSimulateContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { getAddress } from 'viem'
import type { Address } from 'viem'

function MintButton({ contractAddress, amount }: { contractAddress: Address; amount: bigint }) {
  const { address } = useAccount()

  // Step 1: Simulate transaction (gas estimation, validation)
  const { data: simulateData, error: simulateError, isLoading: isSimulating } = useSimulateContract({
    address: getAddress(contractAddress),
    abi: ContractAbi,
    functionName: 'mint',
    args: [amount],
    query: {
      enabled: !!address && amount > 0n, // Only simulate when conditions met
    },
  })

  // Step 2: Write transaction
  const { writeContract, data: hash, error: writeError, isPending: isWriting } = useWriteContract()

  // Step 3: Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash, // Only wait when hash exists
    },
  })

  const handleMint = () => {
    if (!simulateData) return
    writeContract(simulateData.request)
  }

  const isLoading = isSimulating || isWriting || isConfirming
  const error = simulateError || writeError || receiptError

  return (
    <>
      <button
        onClick={handleMint}
        disabled={!simulateData || isLoading}
      >
        {isLoading ? 'Processing...' : 'Mint'}
      </button>
      {error && <div>Error: {error.message}</div>}
      {isSuccess && <div>Mint successful!</div>}
    </>
  )
}
```

### Query Optimization Pattern

Use `enabled` flags and dependent queries to prevent unnecessary fetches:

```tsx
import { useReadContract, useAccount } from 'wagmi'
import { getAddress } from 'viem'
import type { Address } from 'viem'

function TokenBalance({ tokenAddress }: { tokenAddress: Address }) {
  const { address } = useAccount()

  // Only fetch when wallet is connected
  const { data: balance, isLoading } = useReadContract({
    address: getAddress(tokenAddress),
    abi: ERC20Abi,
    functionName: 'balanceOf',
    args: [address!],
    query: {
      enabled: !!address, // Skip query if no address
      staleTime: 30 * 1000, // Consider fresh for 30 seconds
      refetchInterval: 60 * 1000, // Refetch every minute
    },
  })

  if (!address) return <div>Connect wallet to view balance</div>
  if (isLoading) return <div>Loading...</div>
  
  return <div>Balance: {balance?.toString()}</div>
}
```

**Dependent Query Pattern:**

```tsx
function TokenAllowance({ tokenAddress, spender }: { tokenAddress: Address; spender: Address }) {
  const { address } = useAccount()

  // First query: get current allowance
  const { data: allowance, isLoading: isLoadingAllowance } = useReadContract({
    address: getAddress(tokenAddress),
    abi: ERC20Abi,
    functionName: 'allowance',
    args: [address!, getAddress(spender)],
    query: {
      enabled: !!address,
    },
  })

  // Second query: only fetch if allowance exists and is > 0
  const { data: balance } = useReadContract({
    address: getAddress(tokenAddress),
    abi: ERC20Abi,
    functionName: 'balanceOf',
    args: [address!],
    query: {
      enabled: !!address && !!allowance && allowance > 0n,
    },
  })

  return { allowance, balance, isLoadingAllowance }
}
```

### Multi-Step Flow Pattern

Handle sequential transactions (e.g., approve → execute):

```tsx
import { useReadContract, useSimulateContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { getAddress, parseUnits } from 'viem'
import type { Address } from 'viem'

function useTokenApproval({ tokenAddress, spender, amount }: { tokenAddress: Address; spender: Address; amount: string }) {
  const { address } = useAccount()
  const amountWei = parseUnits(amount, 18)

  // Step 1: Check current allowance
  const { data: allowance } = useReadContract({
    address: getAddress(tokenAddress),
    abi: ERC20Abi,
    functionName: 'allowance',
    args: [address!, getAddress(spender)],
    query: {
      enabled: !!address,
    },
  })

  const needsApproval = !allowance || allowance < amountWei

  // Step 2: Simulate approval if needed
  const { data: approveSimulate, error: approveSimulateError } = useSimulateContract({
    address: getAddress(tokenAddress),
    abi: ERC20Abi,
    functionName: 'approve',
    args: [getAddress(spender), amountWei],
    query: {
      enabled: needsApproval && !!address,
    },
  })

  // Step 3: Write approval
  const { writeContract: writeApprove, data: approveHash, isPending: isApproving } = useWriteContract()

  // Step 4: Wait for approval confirmation
  const { isLoading: isApprovalConfirming, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
    query: {
      enabled: !!approveHash,
    },
  })

  // Step 5: Execute main transaction (only after approval succeeds)
  const { data: executeSimulate, error: executeSimulateError } = useSimulateContract({
    address: getAddress(spender),
    abi: SpenderAbi,
    functionName: 'execute',
    args: [getAddress(tokenAddress), amountWei],
    query: {
      enabled: isApprovalSuccess && !!address,
    },
  })

  const { writeContract: writeExecute, data: executeHash, isPending: isExecuting } = useWriteContract()
  const { isLoading: isExecuteConfirming, isSuccess: isExecuteSuccess } = useWaitForTransactionReceipt({
    hash: executeHash,
    query: {
      enabled: !!executeHash,
    },
  })

  const handleApprove = () => {
    if (approveSimulate) writeApprove(approveSimulate.request)
  }

  const handleExecute = () => {
    if (executeSimulate) writeExecute(executeSimulate.request)
  }

  return {
    needsApproval,
    handleApprove,
    handleExecute,
    isApproving: isApproving || isApprovalConfirming,
    isExecuting: isExecuting || isExecuteConfirming,
    isApprovalSuccess,
    isExecuteSuccess,
    approveError: approveSimulateError,
    executeError: executeSimulateError,
  }
}
```

### Event Watching Pattern

Listen to contract events:

```tsx
import { useWatchContractEvent } from 'wagmi'
import { getAddress } from 'viem'
import type { Address } from 'viem'
import { useState } from 'react'

function useTokenTransferEvents({ tokenAddress }: { tokenAddress: Address }) {
  const [transfers, setTransfers] = useState<Array<{ from: Address; to: Address; value: bigint }>>([])

  useWatchContractEvent({
    address: getAddress(tokenAddress),
    abi: ERC20Abi,
    eventName: 'Transfer',
    onLogs: (logs) => {
      const newTransfers = logs.map((log) => ({
        from: log.args.from!,
        to: log.args.to!,
        value: log.args.value!,
      }))
      setTransfers((prev) => [...prev, ...newTransfers])
    },
  })

  return transfers
}
```

### Custom Viem Actions Pattern

Use client hooks for custom Viem actions:

```tsx
import { usePublicClient, useWalletClient } from 'wagmi'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getLogs, watchAsset } from 'viem/actions'
import { getAddress } from 'viem'
import type { Address } from 'viem'

function useContractLogs({ address, fromBlock }: { address: Address; fromBlock?: bigint }) {
  const publicClient = usePublicClient()

  return useQuery({
    queryKey: ['contractLogs', address, fromBlock, publicClient?.uid],
    queryFn: async () => {
      if (!publicClient) throw new Error('Public client not available')
      return getLogs(publicClient, {
        address: getAddress(address),
        fromBlock,
      })
    },
    enabled: !!publicClient && !!address,
  })
}

function useWatchAsset() {
  const walletClient = useWalletClient()

  return useMutation({
    mutationFn: async ({ address, symbol, decimals }: { address: Address; symbol: string; decimals: number }) => {
      if (!walletClient.data) throw new Error('Wallet not connected')
      return watchAsset(walletClient.data, {
        type: 'ERC20',
        options: {
          address: getAddress(address),
          symbol,
          decimals,
        },
      })
    },
  })
}
```

### Error Handling Pattern

Comprehensive error handling with user-friendly messages:

```tsx
import { useWriteContract } from 'wagmi'
import { BaseError } from 'viem'
import { captureError } from '@repo/error/nextjs'
import type { WriteContractParameters } from 'wagmi/actions'

function useContractWriteWithErrorHandling() {
  const { writeContract, error, isError } = useWriteContract()

  const handleWrite = async (request: WriteContractParameters) => {
    try {
      const hash = await writeContract(request)
      return { hash, error: null }
    } catch (err) {
      const error = err as BaseError
      
      // User-friendly error messages
      let userMessage = 'Transaction failed'
      
      if (error.shortMessage?.includes('User rejected')) {
        userMessage = 'Transaction cancelled by user'
      } else if (error.shortMessage?.includes('insufficient funds')) {
        userMessage = 'Insufficient balance for transaction'
      } else if (error.shortMessage?.includes('gas')) {
        userMessage = 'Gas estimation failed. Please try again.'
      }

      // Log to Sentry
      captureError({
        code: 'TRANSACTION_ERROR',
        error,
        label: 'Contract Write',
        data: { request },
      })

      return { hash: null, error: { message: userMessage, original: error } }
    }
  }

  return { handleWrite, error, isError }
}
```

### SSR & Next.js Integration Pattern

Proper SSR handling with cookie storage and hydration-safe patterns:

```tsx
// lib/wagmi-config.ts
import { createConfig, cookieStorage, createStorage } from 'wagmi'
import { http } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const wagmiConfig = createConfig({
  chains: [mainnet],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
  },
  storage: createStorage({
    storage: cookieStorage, // Use cookies for SSR persistence
  }),
  ssr: true,
})
```

```tsx
// components/wallet-button.tsx
'use client'

import dynamic from 'next/dynamic'

// Dynamically import wallet component with SSR disabled
const WalletButtonClient = dynamic(() => import('./wallet-button-client'), {
  ssr: false,
  loading: () => <div>Loading wallet...</div>, // Skeleton during hydration
})

export function WalletButton() {
  return <WalletButtonClient />
}
```

```tsx
// components/wallet-button-client.tsx
'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { useEffect, useState } from 'react'

export function WalletButtonClient() {
  const [mounted, setMounted] = useState(false)
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  // Ensure component is mounted before accessing wallet APIs
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div>Loading...</div> // Prevent hydration mismatch
  }

  if (isConnected && address) {
    return (
      <div>
        <div>Connected: {address}</div>
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
    )
  }

  return (
    <button
      onClick={() => {
        const connector = connectors.find((c) => c.id === 'injected')
        if (connector) connect({ connector })
      }}
    >
      Connect Wallet
    </button>
  )
}
```

## Trade-offs

- **Custom hooks vs direct wagmi hooks**: Custom hooks provide abstraction and type safety but add indirection. Use custom hooks for contract-specific logic, direct hooks for simple wallet state.
- **Address validation**: Always validate with `getAddress()` even if address comes from wagmi - provides runtime safety and checksum correction.
- **SSR handling**: Client-side only rendering (`ssr: false`) prevents hydration errors but may cause layout shift. Use cookie storage and skeleton loading states for better UX.
- **Simulation before write**: `useSimulateContract` adds an extra query but prevents failed transactions and improves UX. Always simulate before writing when possible.
- **Query optimization**: Using `enabled` flags adds complexity but prevents unnecessary network requests and improves performance.
- **Multi-step flows**: Sequential transaction handling (approve → execute) improves UX but requires careful state management and error handling at each step.
- **Event watching**: `useWatchContractEvent` provides real-time updates but can cause performance issues with high-frequency events. Consider debouncing or filtering.
- **Custom Viem actions**: Using `usePublicClient`/`useWalletClient` provides flexibility but requires manual query/mutation setup. Prefer built-in hooks when available.

