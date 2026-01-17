# Web3 Rules

This directory contains Cursor rules for Web3/blockchain development patterns and best practices.

## Rule Hierarchy

The web3 rules follow a hierarchical structure:

```
multichain.mdc (coordination)
  ├─ viem.mdc (EVM-specific)
  ├─ solana.mdc (Solana-specific)
  ├─ cosmos.mdc (Cosmos-specific)
  └─ wagmi.mdc (React hooks for EVM)
      └─ References viem.mdc for address validation

solidity.mdc (Smart contract development)
  └─ Standalone (Foundry/Solidity patterns)
```

## Version Reference

All rules reference actual project versions from package.json files:

- **Wagmi**: v3.x (latest v3.3.2) - React hooks for Ethereum
- **Viem**: v2.44.4 (from `packages/utils/package.json`) - EVM address validation and transaction utilities
- **@solana/web3.js**: v1.98.4 (from `contracts/solana/package.json`) - Solana address validation
- **Anchor**: v0.32.1 (from `contracts/solana/package.json`) - Solana program framework
- **Solidity**: v0.8.24 (from `contracts/evm/foundry.toml`) - Smart contract language

## Rule Descriptions

### [wagmi.mdc](./wagmi.mdc)
React hooks for Ethereum wallet integration using Wagmi v3. Handles wallet connection states, contract interactions, and custom hook patterns.

**Related**: References [viem.mdc](./viem.mdc) for address validation patterns.

### [viem.mdc](./viem.mdc)
Viem v2.44.4 integration patterns for EVM chains. Address validation (`getAddress`), transaction handling, and performance optimization.

**Related**: Referenced by [wagmi.mdc](./wagmi.mdc) and [multichain.mdc](./multichain.mdc).

### [solana.mdc](./solana.mdc)
Solana address validation using `@solana/web3.js` v1.98.4 and Anchor v0.32.1. Transaction handling, PublicKey validation, and Anchor setup.

**Related**: Referenced by [multichain.mdc](./multichain.mdc).

### [cosmos.mdc](./cosmos.mdc)
Cosmos address validation using Bech32 encoding. Chain-specific prefix validation and transaction patterns.

**Related**: Referenced by [multichain.mdc](./multichain.mdc).

### [multichain.mdc](./multichain.mdc)
Coordination rule for multichain address validation. Delegates to chain-specific rules (`viem.mdc`, `solana.mdc`, `cosmos.mdc`) for implementation details.

**Related**: References all chain-specific rules.

### [solidity.mdc](./solidity.mdc)
Solidity v0.8.24 development standards with Foundry. Contract structure, gas optimization, test token patterns, and Foundry setup.

**Standalone**: No direct dependencies on other web3 rules.

## Package References

Rules reference actual monorepo packages:

- `@repo/utils/web3` - Chain type utilities (`ChainType`, `getChainType`, `getChainMetadata`)
- `@repo/contracts-evm` - EVM contracts package (Solidity)
- `@repo/contracts-solana` - Solana contracts package (Anchor)

## Setup Scripts

- `pnpm setup:evm` - Install Foundry for EVM contract development
- `pnpm setup:solana` - Install Anchor for Solana program development

## Cross-References

Rules include cross-references to related rules:
- `wagmi.mdc` → `viem.mdc` (address validation)
- `wagmi.mdc` → `multichain.mdc` (multichain coordination)
- `viem.mdc` → `wagmi.mdc` (React hooks)
- `viem.mdc` → `multichain.mdc` (multichain coordination)
- `solana.mdc` → `multichain.mdc` (multichain coordination)
- `cosmos.mdc` → `multichain.mdc` (multichain coordination)
- `multichain.mdc` → all chain-specific rules

## Usage

Rules are automatically applied based on file glob patterns:
- `wagmi.mdc`, `viem.mdc`, `solana.mdc`, `cosmos.mdc`, `multichain.mdc`: `*.tsx, *.ts`
- `solidity.mdc`: `**/contracts/**/*.sol, *.sol`

Rules can also be referenced manually using `@` syntax in Cursor.
