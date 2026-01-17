# Skill: ethereum-development

## Scope

- EVM internals and execution environment understanding
- Gas optimization techniques for Solidity contracts
- Transaction mechanics (EIP-1559, legacy, access lists)
- Client interactions using viem v2
- RPC methods and state queries
- Network-specific patterns (Arbitrum Sepolia for testing)

Does NOT cover:
- Frontend wallet integration (see `web3-frontend` skill)
- Solidity contract development (see `solidity-development` skill)
- Security auditing (see `smart-contract-security` skill)

## Principles

- Use viem v2 for client interactions and transaction building
- Understand EVM execution model: stack, memory, storage, opcodes
- Optimize gas usage: storage packing, calldata over memory, custom errors
- Use EIP-1559 transactions for predictable fee structure
- Cache storage reads in memory when used multiple times
- Use Foundry Cast for CLI interactions and debugging

## Constraints

- MUST use viem v2 for client interactions
- MUST validate addresses with `getAddress()` from viem (never cast directly)
- SHOULD use EIP-1559 transactions (type 2) for predictable fees
- SHOULD cache storage reads in memory when used in loops
- SHOULD use `calldata` for read-only function parameters
- AVOID storage reads in loops (cache first)
- AVOID relying on SSTORE refunds (EIP-3529 removed them)

## Patterns

### Storage Slot Reading Pattern

Read contract storage using viem v2:

```typescript
import { createPublicClient, http, keccak256, encodePacked } from 'viem'
import { arbitrumSepolia } from 'viem/chains'

const client = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(),
})

// Read mapping value: balances[address]
async function getBalance(contract: `0x${string}`, user: `0x${string}`) {
  const slot = keccak256(encodePacked(['address', 'uint256'], [user, 0n]))
  return await client.getStorageAt({ address: contract, slot })
}
```

### EIP-1559 Transaction Pattern

Use EIP-1559 for predictable fee structure:

```typescript
import { createWalletClient, http, parseEther, parseGwei } from 'viem'
import { arbitrumSepolia } from 'viem/chains'

const client = createWalletClient({
  chain: arbitrumSepolia,
  transport: http(),
})

const hash = await client.sendTransaction({
  to: '0x...',
  value: parseEther('0.1'),
  type: 'eip1559',
  maxFeePerGas: parseGwei('30'),
  maxPriorityFeePerGas: parseGwei('2'),
})
```

### Gas Optimization Pattern

Pack storage efficiently:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Optimized {
    // Pack into single slot (32 bytes)
    struct User {
        uint128 balance;    // 16 bytes
        uint64 lastUpdate;  // 8 bytes
        uint32 nonce;       // 4 bytes
        bool active;        // 1 byte
        // 3 bytes padding
    }

    mapping(address => User) public users;
}
```

## Trade-offs

- **Storage packing**: Saves ~20k gas per slot but requires careful type selection. Use when multiple small values fit in one slot.
- **Calldata vs memory**: `calldata` saves ~3 gas per byte but is read-only. Use `calldata` for read-only parameters.
- **Custom errors**: Save ~200+ gas per revert but require error definitions. Use custom errors for production contracts.
- **EIP-1559 vs legacy**: EIP-1559 provides predictable fees but requires base fee estimation. Use EIP-1559 for all new transactions.

## Interactions

- Uses `solidity-development` for contract development patterns
- Complements `web3-frontend` for frontend integration
- Uses Arbitrum Sepolia testnet for contract deployments

## Network Context

- **Testing**: Arbitrum Sepolia (Chain ID: 421614) - used for contract deployments
- **RPC**: `https://sepolia-rollup.arbitrum.io/rpc`
- **Test tokens**: Deployed on Arbitrum Sepolia

## External Resources

- [Viem Documentation](https://viem.sh/) - Complete viem v2 API reference
- [Foundry Book](https://book.getfoundry.sh/) - Cast CLI commands
