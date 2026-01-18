# Solidity Development Guide

## Overview

This guide provides comprehensive documentation for Solidity smart contract development using Foundry, covering setup, development workflow, testing strategies, security practices, and troubleshooting.

## Quick Start

### Prerequisites

- Foundry installed (`foundryup`)
- Solidity 0.8.24
- Basic understanding of Ethereum and smart contracts

### Project Setup

```bash
# Initialize new Foundry project
forge init my-project --no-git
cd my-project

# Install OpenZeppelin Contracts
forge install OpenZeppelin/openzeppelin-contracts

# Configure foundry.toml
```

### Basic foundry.toml Configuration

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc = "0.8.24"
optimizer = true
optimizer_runs = 200
fuzz_runs = 256
invariant_runs = 256

[profile.default.remappings]
@openzeppelin/=lib/openzeppelin-contracts/

[profile.ci]
fuzz_runs = 10000
invariant_runs = 10000
```

## Development Workflow

### 1. Write Contract

Create contracts in `src/` directory:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MyContract {
    // Implementation
}
```

### 2. Write Tests

Create tests in `test/` directory:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/MyContract.sol";

contract MyContractTest is Test {
    MyContract contract;

    function setUp() public {
        contract = new MyContract();
    }

    function test_BasicFunctionality() public {
        // Test implementation
    }
}
```

### 3. Run Tests

```bash
# Run all tests
forge test

# Run with verbosity
forge test -vvv

# Run specific test
forge test --match-test test_BasicFunctionality

# Run fuzz tests only
forge test --match-test testFuzz
```

### 4. Deploy

```bash
# Deploy to local Anvil
forge script script/Deploy.s.sol:DeployScript --rpc-url http://localhost:8545 --broadcast

# Deploy to testnet
forge script script/Deploy.s.sol:DeployScript --rpc-url $RPC_URL --broadcast --verify
```

## Testing Strategies

### Unit Tests

Use for testing individual functions and specific behaviors:

```solidity
function test_Transfer() public {
    token.transfer(alice, 100);
    assertEq(token.balanceOf(alice), 100);
}
```

**When to use:**
- Testing specific function logic
- Testing edge cases
- Testing access control
- Testing state transitions

### Fuzz Tests

Use for testing functions with numeric inputs or finding edge cases:

```solidity
function testFuzz_Transfer(uint256 amount) public {
    amount = bound(amount, 1, type(uint128).max);
    token.transfer(alice, amount);
    assertEq(token.balanceOf(alice), amount);
}
```

**When to use:**
- Functions with numeric parameters
- Finding boundary conditions
- Testing with random valid inputs
- Property-based testing

**Best practices:**
- Use `bound()` to constrain inputs to valid ranges
- Test with maximum and minimum values
- Test with zero and edge cases explicitly

### Invariant Tests

Use for testing system-wide properties that should always hold:

```solidity
function invariant_TotalSupplyMatchesBalances() public {
    uint256 sum = 0;
    for (uint i = 0; i < actors.length; i++) {
        sum += token.balanceOf(actors[i]);
    }
    assertEq(token.totalSupply(), sum);
}
```

**When to use:**
- Testing system invariants
- Testing after multiple operations
- Testing state consistency
- Testing economic properties

**Best practices:**
- Test one invariant per function
- Use descriptive names (`invariant_PropertyName`)
- Test with multiple actors and operations

## Security Audit Checklist

Before deployment, verify:

### Access Control
- [ ] All admin functions have access control modifiers
- [ ] Owner/role assignments are properly initialized
- [ ] No functions are accidentally public

### Input Validation
- [ ] Zero address checks for address parameters
- [ ] Bounds checking for numeric parameters
- [ ] Array length validation
- [ ] Overflow/underflow protection (Solidity 0.8+ handles this)

### Reentrancy Protection
- [ ] CEI pattern followed on all external calls
- [ ] Reentrancy guards where needed
- [ ] State updated before external calls

### External Calls
- [ ] Return values checked
- [ ] SafeERC20 used for token transfers
- [ ] Low-level calls validated

### Gas Optimization
- [ ] Storage packed efficiently
- [ ] Storage reads cached in loops
- [ ] Custom errors used instead of require strings
- [ ] Calldata used for read-only parameters

### Events
- [ ] Events emitted for all state changes
- [ ] Events include relevant parameters
- [ ] Events indexed appropriately

### Testing
- [ ] Unit tests for all functions
- [ ] Fuzz tests for numeric inputs
- [ ] Invariant tests for system properties
- [ ] Edge cases tested
- [ ] Access control tested

## Gas Optimization Workflow

### 1. Baseline Measurement

```bash
# Create gas snapshot
forge snapshot

# Compare snapshots
forge snapshot --diff
```

### 2. Identify Optimization Opportunities

- Storage packing: Group small variables into structs
- Cache storage reads: Store in memory when used multiple times
- Use calldata: For read-only function parameters
- Custom errors: Replace require strings
- Unchecked math: Where overflow is impossible

### 3. Measure Impact

```bash
# Run tests with gas reporting
forge test --gas-report
```

### 4. Verify Correctness

After optimization:
- Run all tests
- Run fuzz tests with more runs
- Verify invariants still hold

## Common Troubleshooting

### Compilation Errors

**Error: "Compiler run failed"**
- Check Solidity version matches `foundry.toml`
- Verify imports are correct
- Check for syntax errors

**Error: "Contract size exceeds 24KB"**
- Split contract into libraries
- Remove unused code
- Optimize storage layout

### Test Failures

**Error: "EvmError: Revert"**
- Check error messages with `-vvv` flag
- Verify test setup is correct
- Check for access control issues

**Error: "Fuzz test failing"**
- Use `-vvvv` to see failing input
- Check bounds with `bound()` function
- Verify function handles edge cases

### Deployment Issues

**Error: "Insufficient funds"**
- Check account balance
- Verify gas price settings
- Check network configuration

**Error: "Contract verification failed"**
- Verify compiler settings match deployment
- Check constructor arguments
- Verify source code matches deployed bytecode

## Foundry Commands Reference

### Testing
```bash
forge test                    # Run all tests
forge test -vvv              # Verbose output
forge test --match-test     # Run specific test
forge test --fuzz           # Run fuzz tests
forge coverage              # Generate coverage report
forge snapshot              # Create gas snapshot
```

### Building
```bash
forge build                 # Compile contracts
forge build --sizes         # Show contract sizes
```

### Deployment
```bash
forge script                # Run deployment script
forge script --broadcast    # Broadcast transaction
forge script --verify       # Verify on explorer
```

### Cast (CLI Tool)
```bash
cast send                   # Send transaction
cast call                   # Call view function
cast storage                # Read storage slot
cast code                   # Get contract code
cast balance                # Check balance
```

## Best Practices

### Code Organization
- One contract per file
- Use libraries for reusable code
- Group related functionality
- Keep contracts under 24KB

### Testing
- Test happy paths and edge cases
- Use descriptive test names
- Test access control explicitly
- Use fuzz tests for numeric inputs
- Use invariant tests for system properties

### Security
- Follow CEI pattern always
- Validate all inputs
- Use access control on admin functions
- Emit events for state changes
- Write comprehensive tests

### Gas Optimization
- Measure before optimizing
- Focus on high-frequency operations
- Don't sacrifice security for gas
- Document optimization decisions

## Integration with OpenZeppelin

### Installation

```bash
forge install OpenZeppelin/openzeppelin-contracts
```

### Usage

```solidity
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
```

### Common Patterns

**ERC20 Token:**
```solidity
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor() ERC20("MyToken", "MTK") {}
}
```

**Ownable Contract:**
```solidity
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyContract is Ownable {
    function adminFunction() external onlyOwner {
        // Admin-only logic
    }
}
```

## Network Configuration

### Local Development (Anvil)

```bash
# Start Anvil
anvil

# Deploy to Anvil
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
```

### Testnet (Arbitrum Sepolia)

```bash
# Set RPC URL
export RPC_URL=https://sepolia-rollup.arbitrum.io/rpc

# Deploy with verification
forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast --verify
```

## Related Resources

- [SKILL.md](../SKILL.md) - Complete skill specification
- [PATTERNS.md](./PATTERNS.md) - Detailed patterns and examples
- [Foundry Book](https://book.getfoundry.sh/) - Official Foundry documentation
