# Skill: web3-frontend

## Scope

- React/Next.js wallet integration with Wagmi v3 for EVM chains
- Contract interactions using viem v2 for address validation and transaction building
- Transaction state management and error handling
- Custom hooks wrapping wagmi for contract-specific interactions

Does NOT cover:
- Solana frontend development (see `solana-dev` skill)
- Backend RPC interactions (see `ethereum-development` skill)
- Smart contract development (see `solidity-development` skill)

## Principles

- Use Wagmi v3.x (latest v3.3.2) hooks for wallet state (`useAccount`, `useWriteContract`, `useReadContract`, `useWaitForTransactionReceipt`)
- Use viem v2.44.4 for address validation (`getAddress`) and transaction utilities (`parseEther`, `parseGwei`)
- Create custom hooks wrapping wagmi for contract-specific interactions
- Handle connection states explicitly: disconnected, connecting, connected, reconnecting
- Validate addresses with `getAddress()` from viem before use (never cast directly as `Address`)
- Use generated contract ABIs and types from OpenAPI specs
- Use TanStack Query (via wagmi) for caching and refetching contract data

## Constraints

- MUST use Wagmi v3.x (not v1 or v2) - v1/v2 patterns are incompatible
- MUST validate addresses with `getAddress()` from viem - never cast strings directly
- SHOULD create custom hooks for contract interactions (see Custom Contract Hook Pattern below)
- SHOULD handle SSR properly in Next.js (use `dynamic` with `ssr: false` for wallet components)
- AVOID wrapping generated hooks from OpenAPI clients unless necessary for abstraction
- AVOID exposing private keys or sensitive wallet data in components

## Interactions

- Complements `solana-dev` for Solana frontend work
- Uses `ethereum-development` for EVM internals understanding
- Uses generated contract ABIs/types from OpenAPI specs

## Patterns

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

## Trade-offs

- **Custom hooks vs direct wagmi hooks**: Custom hooks provide abstraction and type safety but add indirection. Use custom hooks for contract-specific logic, direct hooks for simple wallet state.
- **Address validation**: Always validate with `getAddress()` even if address comes from wagmi - provides runtime safety and checksum correction.
- **SSR handling**: Client-side only rendering (`ssr: false`) prevents hydration errors but may cause layout shift. Consider skeleton loading states.

