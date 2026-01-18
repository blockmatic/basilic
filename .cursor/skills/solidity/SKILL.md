# Skill: solidity-development

## Scope

- Solidity 0.8.24 smart contract development with Foundry
- EVM internals and execution environment understanding
- Security patterns and vulnerability prevention
- Gas optimization techniques
- Testing strategies with Foundry (unit, fuzz, invariant)
- Client interactions using viem v2
- OpenZeppelin Contracts integration

Does NOT cover:
- Frontend wallet integration (see `web3-frontend` skill)
- Solana development (see `solana` skill)

## Principles

- Use Solidity 0.8.24 + Foundry for all development
- Follow CEI pattern (Checks-Effects-Interactions) for all state changes
- Use custom errors instead of require strings for gas efficiency
- Security-first mindset: validate inputs, use access control, prevent reentrancy
- Comprehensive testing: unit, fuzz, and invariant tests
- Optimize for gas: storage packing, calldata over memory, cache storage reads
- Understand EVM execution model: stack, memory, storage, opcodes
- Use viem v2 for client interactions and transaction building
- Use OpenZeppelin Contracts for battle-tested implementations

## Constraints

- MUST use Solidity 0.8.24
- MUST use Foundry for testing and deployment (not Hardhat or other tools)
- MUST follow CEI pattern for external calls (prevents reentrancy)
- MUST validate inputs (zero address checks, bounds checking)
- MUST use access control on admin functions
- MUST use viem v2 for client interactions
- MUST validate addresses with `getAddress()` from viem (never cast directly)
- SHOULD use OpenZeppelin Contracts via remappings (`@openzeppelin/=lib/openzeppelin-contracts/`)
- SHOULD use custom errors instead of require strings (gas efficient)
- SHOULD use EIP-1559 transactions (type 2) for predictable fees
- SHOULD write fuzz tests for functions with numeric inputs
- SHOULD write invariant tests for system-wide properties
- SHOULD cache storage reads in memory when used in loops
- SHOULD use `calldata` for read-only function parameters
- SHOULD use `unchecked` blocks for safe math operations (loop counters, bounded increments)
- AVOID storage reads in loops (cache first)
- AVOID unnecessary overflow checks when overflow is impossible
- AVOID contract size > 24KB (split into libraries if needed)
- AVOID relying on SSTORE refunds (EIP-3529 removed them)
- AVOID trusting external calls without validation
- AVOID using `block.timestamp` for critical logic (miners can manipulate)

## Foundry Configuration

- Solidity: 0.8.24
- Optimizer: Enabled (200 runs)
- Fuzz tests: 256 runs
- Invariant tests: 256 runs

## Patterns

### Contract Development

#### CEI Pattern (Checks-Effects-Interactions)

Always update state before external calls to prevent reentrancy:

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

#### Custom Errors Pattern

Use custom errors for gas efficiency:

```solidity
error InsufficientBalance(uint256 requested, uint256 available);
error Unauthorized(address caller);
error TransferFailed();

function withdraw(uint256 amount) external {
    if (balances[msg.sender] < amount) {
        revert InsufficientBalance(amount, balances[msg.sender]);
    }
    // ...
}
```

#### OpenZeppelin Integration

Use OpenZeppelin Contracts via remappings in `foundry.toml`:

```toml
[profile.default]
remappings = [
    "@openzeppelin/=lib/openzeppelin-contracts/",
]
```

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor() ERC20("MyToken", "MTK") {}
}
```

### Gas Optimization

#### Storage Packing Pattern

Pack storage efficiently to save gas:

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

#### Calldata vs Memory Pattern

Use `calldata` for read-only parameters:

```solidity
// ✅ Good: calldata for read-only
function processData(bytes calldata data) external {
    // data is read-only, saves ~3 gas per byte
}

// ❌ Bad: memory for read-only
function processData(bytes memory data) external {
    // Unnecessary copy to memory
}
```

#### Cache Storage Reads Pattern

Cache storage reads in memory when used multiple times:

```solidity
// ✅ Good: cache storage read
function processUser(address user) external {
    uint256 balance = balances[user]; // Cache once
    if (balance > 0) {
        // Use cached value multiple times
        process(balance);
        update(balance);
    }
}

// ❌ Bad: multiple storage reads
function processUser(address user) external {
    if (balances[user] > 0) {
        process(balances[user]); // Storage read #1
        update(balances[user]); // Storage read #2
    }
}
```

#### Unchecked Math Pattern

Use `unchecked` blocks for math operations where overflow/underflow is impossible:

```solidity
// ✅ Good: unchecked for safe operations
function increment(uint256 x) external pure returns (uint256) {
    unchecked {
        return x + 1; // Safe: can't overflow uint256
    }
}

// ✅ Good: loop counter increment
function processBatch(uint256[] calldata items) external {
    for (uint256 i = 0; i < items.length;) {
        process(items[i]);
        unchecked {
            ++i; // Safe: loop bound prevents overflow
        }
    }
}

// ❌ Bad: unnecessary checked math
function increment(uint256 x) external pure returns (uint256) {
    return x + 1; // Unnecessary: Solidity 0.8+ checks by default
}
```

### Security

#### Reentrancy Prevention

Always follow CEI pattern (see Contract Development section above). For additional protection, use reentrancy guards when needed:

```solidity
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Vault is ReentrancyGuard {
    function withdraw(uint256 amount) external nonReentrant {
        // CEI pattern + reentrancy guard for extra protection
    }
}
```

#### Access Control Pattern

Always protect admin functions:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SecureContract {
    address public owner;

    error Unauthorized();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    function setAdmin(address newAdmin) external onlyOwner {
        owner = newAdmin;
    }
}
```

#### Input Validation Pattern

Validate all inputs before processing:

```solidity
error ZeroAddress();
error InvalidAmount();
error OutOfBounds(uint256 value, uint256 max);

function transfer(address to, uint256 amount) external {
    // Zero address check
    if (to == address(0)) revert ZeroAddress();
    
    // Bounds check
    if (amount == 0) revert InvalidAmount();
    if (amount > balances[msg.sender]) revert InsufficientBalance();
    
    // Process transfer
    balances[msg.sender] -= amount;
    balances[to] += amount;
}
```

### Testing

#### Foundry Test Setup

Use Foundry's testing framework:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/TestToken.sol";

contract TestTokenTest is Test {
    TestToken token;
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    function setUp() public {
        token = new TestToken("Test", "TEST", 18);
    }

    function test_Mint() public {
        token.mint(alice, 1000);
        assertEq(token.balanceOf(alice), 1000);
    }
}
```

#### Fuzz Testing Pattern

Test with random inputs to find edge cases:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";

contract SecurityTest is Test {
    Vault vault;

    function setUp() public {
        vault = new Vault();
    }

    function testFuzz_Withdraw(uint256 amount) public {
        // Bound input to reasonable range
        amount = bound(amount, 1, type(uint128).max);
        
        vm.deal(address(this), amount);
        vault.deposit{value: amount}();
        
        uint256 before = address(this).balance;
        vault.withdraw(amount);
        uint256 after = address(this).balance;
        
        assertEq(after, before + amount);
    }
}
```

#### Invariant Testing Pattern

Test system-wide properties that should always hold:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";

contract TokenInvariantTest is Test {
    Token token;
    address[] actors;

    function setUp() public {
        token = new Token();
        // Setup actors...
    }

    function invariant_BalancesMatchTotalSupply() public {
        uint256 sum = 0;
        for (uint i = 0; i < actors.length; i++) {
            sum += token.balanceOf(actors[i]);
        }
        assertEq(token.totalSupply(), sum);
    }
}
```

### EVM Internals

#### Storage Slot Reading Pattern

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

#### EIP-1559 Transaction Pattern

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

## Common Vulnerabilities

### Critical: Reentrancy
- **Issue**: State updated after external call
- **Prevention**: CEI pattern, update state before external calls, use reentrancy guards when needed

### High: Missing Access Control
- **Issue**: Admin functions callable by anyone
- **Prevention**: Use modifiers (`onlyOwner`, `onlyRole`)

### High: Unchecked Return Values
- **Issue**: External calls fail silently
- **Prevention**: Check return values, use SafeERC20 for tokens

### Medium: Precision Loss
- **Issue**: Division before multiplication loses precision
- **Prevention**: Multiply first, then divide

### Medium: Oracle Manipulation
- **Issue**: Flash loan attacks on spot prices
- **Prevention**: Use TWAP, check staleness, use multiple oracles

## Security Checklist

- [ ] CEI pattern on all external calls
- [ ] Access control on admin functions
- [ ] Input validation (zero address, bounds)
- [ ] Reentrancy guards where needed
- [ ] Event emission for state changes
- [ ] Custom errors for gas efficiency
- [ ] Fuzz tests for numeric inputs
- [ ] Invariant tests for system properties
- [ ] Oracle staleness checks (if using oracles)
- [ ] Slippage protection (if using DEX)

## Tools

### Foundry (Primary)
- **Testing**: `forge test`
- **Fuzz testing**: `forge test --fuzz`
- **Invariant testing**: `invariant_*` functions
- **Gas snapshots**: `forge snapshot`
- **Coverage**: `forge coverage`
- **Cast CLI**: `cast` for debugging and interactions

### Static Analysis
- **Slither**: Fast vulnerability detection
- **Mythril**: Symbolic execution
- **Semgrep**: Custom security rules

### Client Library
- **viem v2**: Type-safe Ethereum client for TypeScript/JavaScript

## Network Context

- **Testing**: Arbitrum Sepolia (Chain ID: 421614) - used for contract deployments
- **RPC**: `https://sepolia-rollup.arbitrum.io/rpc`
- **Test tokens**: Deployed on Arbitrum Sepolia

## Trade-offs

- **Storage packing**: Saves ~20k gas per slot but requires careful type selection. Use when multiple small values fit in one slot.
- **Calldata vs memory**: `calldata` saves ~3 gas per byte but is read-only. Use `calldata` for read-only parameters.
- **Custom errors vs require strings**: Custom errors save ~200+ gas per revert but require error definitions. Use custom errors for production contracts.
- **Storage vs memory**: Storage reads cost 2100 gas, memory reads cost 3 gas. Cache storage values in memory when used multiple times.
- **Unchecked math**: Saves ~20-40 gas per operation but requires ensuring overflow is impossible. Use for loop counters and safe math operations.
- **EIP-1559 vs legacy**: EIP-1559 provides predictable fees but requires base fee estimation. Use EIP-1559 for all new transactions.

## Interactions

- Complements `web3-frontend` for frontend integration
- Uses OpenZeppelin Contracts for standard implementations

## External Resources

- [Foundry Book](https://book.getfoundry.sh/) - Complete Foundry documentation
- [Foundry Book - Fuzz Testing](https://book.getfoundry.sh/forge/fuzz-testing) - Fuzz testing guide
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts) - Standard contract implementations
- [Viem Documentation](https://viem.sh/) - Complete viem v2 API reference
- [EEA Security Guidelines](https://entethalliance.org/technical-specifications/) - Enterprise Ethereum Alliance security standards
- [SCSVS](https://github.com/Consensys/smart-contract-verification-standard) - Smart Contract Security Verification Standard

## Historical References

- [SWC Registry](https://swcregistry.io/) - Common weakness enumeration (not actively maintained since ~2020, retained for historical context only)
