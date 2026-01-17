# Skill: solidity-development

## Scope

- Solidity 0.8.24 smart contract development with Foundry
- Design patterns for secure contract architecture
- Testing strategies with Foundry (unit, fuzz, invariant)
- Gas optimization techniques
- OpenZeppelin Contracts integration

Does NOT cover:
- Frontend integration (see `web3-frontend` skill)
- EVM internals (see `ethereum-development` skill)
- Security auditing (see `smart-contract-security` skill)
- Solana development (see `solana-dev` skill)

## Principles

- Use Solidity 0.8.24
- Use Foundry for development, testing, and deployment
- Follow CEI pattern (Checks-Effects-Interactions) for all state changes
- Use custom errors instead of require strings for gas efficiency
- Use OpenZeppelin Contracts for battle-tested implementations (via remappings)
- Write comprehensive tests: unit, fuzz, and invariant tests
- Optimize for gas: storage packing, calldata over memory, unchecked math where safe

## Constraints

- MUST use Solidity 0.8.24
- MUST use Foundry for testing (not Hardhat)
- MUST follow CEI pattern for external calls (prevents reentrancy)
- SHOULD use OpenZeppelin Contracts via remappings (`@openzeppelin/=lib/openzeppelin-contracts/`)
- SHOULD use custom errors instead of require strings (gas efficient)
- SHOULD write fuzz tests for functions with numeric inputs
- AVOID storage reads in loops (cache in memory first)
- AVOID contract size > 24KB (split into libraries if needed)

## Foundry Configuration

- Solidity: 0.8.24
- Optimizer: Enabled (200 runs)
- Fuzz tests: 256 runs
- Invariant tests: 256 runs

## Patterns

### CEI Pattern (Checks-Effects-Interactions)

Always update state before external calls:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SecureVault {
    mapping(address => uint256) public balances;

    error InsufficientBalance();
    error TransferFailed();

    function withdraw(uint256 amount) external {
        // 1. CHECKS
        if (balances[msg.sender] < amount) revert InsufficientBalance();

        // 2. EFFECTS (update state first)
        balances[msg.sender] -= amount;

        // 3. INTERACTIONS (external call last)
        (bool ok,) = msg.sender.call{value: amount}("");
        if (!ok) revert TransferFailed();
    }
}
```

### Foundry Test Pattern

Use Foundry's testing framework:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/TestToken.sol";

contract TestTokenTest is Test {
    TestToken token;
    address alice = makeAddr("alice");

    function setUp() public {
        token = new TestToken("Test", "TEST", 18);
    }

    function test_Mint() public {
        token.mint(alice, 1000);
        assertEq(token.balanceOf(alice), 1000);
    }

    function testFuzz_Mint(uint256 amount) public {
        amount = bound(amount, 1, type(uint128).max);
        token.mint(alice, amount);
        assertEq(token.balanceOf(alice), amount);
    }
}
```

### Custom Errors Pattern

Use custom errors for gas efficiency:

```solidity
error InsufficientBalance(uint256 requested, uint256 available);
error Unauthorized(address caller);

function withdraw(uint256 amount) external {
    if (balances[msg.sender] < amount) {
        revert InsufficientBalance(amount, balances[msg.sender]);
    }
    // ...
}
```

## Trade-offs

- **Custom errors vs require strings**: Custom errors save ~200 gas per revert but require error definitions. Use custom errors for production contracts.
- **Storage vs memory**: Storage reads cost 2100 gas, memory reads cost 3 gas. Cache storage values in memory when used multiple times.
- **Calldata vs memory**: Use `calldata` for read-only parameters (saves ~3 gas per byte). Use `memory` only when modification is needed.

## Interactions

- Uses `ethereum-development` for EVM internals understanding
- Uses `smart-contract-security` for security patterns and auditing
- Uses OpenZeppelin Contracts for standard implementations

## External Resources

- [Foundry Book](https://book.getfoundry.sh/) - Complete Foundry documentation
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts) - Standard contract implementations
