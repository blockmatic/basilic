---
name: wagmi-v3
description: Wagmi v3 wallet and contract hooks for React/Next.js. Use when connecting wallets, reading/writing contracts, or handling transaction state.
---

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

## Assumptions

- Wagmi v3.3.2+
- viem v2.44.4
- React 18+ or Next.js 14+
- TypeScript v5+ with strict mode
- TanStack Query v5+ (peer dependency of wagmi)
- WalletConnect v2+ (optional, for WalletConnect connector)

## Principles

- Use Wagmi v3.x hooks for wallet state (`useAccount`, `useWriteContract`, `useReadContract`, `useWaitForTransactionReceipt`, `useSimulateContract`)
- Use viem v2 for address validation (`getAddress`) and transaction utilities (`parseEther`, `parseGwei`)
- Create custom hooks wrapping wagmi for contract-specific interactions
- Handle connection states explicitly: disconnected, connecting, connected, reconnecting
- Validate addresses with `getAddress()` from viem before use (never cast directly as `Address`)
- Use generated contract ABIs and types from OpenAPI specs
- Use TanStack Query (via wagmi) for caching and refetching contract data
- Simulate contracts before writing to validate and estimate gas
- Use conditional queries with `enabled` flags to prevent unnecessary fetches
- Handle SSR properly with cookie storage for persistent wallet state

## Constraints

### MUST

- Use Wagmi v3.x (not v1 or v2) - v1/v2 patterns are incompatible
- Validate addresses with `getAddress()` from viem - never cast strings directly
- Handle SSR properly in Next.js (use `dynamic` with `ssr: false` for wallet components)

### SHOULD

- Create custom hooks for contract interactions
- Simulate contracts before writing (`useSimulateContract`)
- Use conditional queries with `enabled` flags
- Use cookie storage for SSR persistence
- Handle all connection states explicitly

### AVOID

- Wrapping generated hooks from OpenAPI clients unless necessary for abstraction
- Exposing private keys or sensitive wallet data in components
- Skipping address validation

## Interactions

- Uses generated contract ABIs/types from OpenAPI specs
- Complements [fastify](../fastify-v5/SKILL.md) for API development

Patterns and code samples: [PATTERNS.md](PATTERNS.md).
