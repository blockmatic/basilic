# Skill: smart-contract-security

## Scope

- Common vulnerability patterns and prevention
- Security auditing methodology
- Foundry-based security testing (fuzz, invariant)
- Static analysis tools (Slither, Mythril)
- Incident response procedures

Does NOT cover:
- General Solidity development (see `solidity-development` skill)
- EVM internals (see `ethereum-development` skill)
- Frontend security (see general security practices)

## Principles

- Follow CEI pattern (Checks-Effects-Interactions) for all external calls
- Use Foundry for fuzz testing and invariant testing
- Validate all inputs (zero address, bounds, overflow)
- Use access control modifiers on admin functions
- Check oracle staleness and price deviation
- Write comprehensive security tests before deployment

## Constraints

- MUST follow CEI pattern for external calls (prevents reentrancy)
- MUST validate inputs (zero address checks, bounds checking)
- MUST use access control on admin functions
- SHOULD write fuzz tests for functions with numeric inputs
- SHOULD write invariant tests for system-wide properties
- SHOULD use Foundry's security testing features for fuzz and invariant testing
- AVOID trusting external calls without validation
- AVOID using `block.timestamp` for critical logic (miners can manipulate)

## Patterns

### Reentrancy Prevention (CEI Pattern)

Always update state before external calls:

```solidity
// VULNERABLE
function withdraw(uint256 amount) external {
    (bool ok,) = msg.sender.call{value: amount}("");
    require(ok);
    balances[msg.sender] -= amount;  // After call - vulnerable!
}

// FIXED: CEI Pattern
function withdraw(uint256 amount) external {
    // 1. CHECKS
    if (balances[msg.sender] < amount) revert InsufficientBalance();
    
    // 2. EFFECTS (update state first)
    balances[msg.sender] -= amount;
    
    // 3. INTERACTIONS (external call last)
    (bool ok,) = msg.sender.call{value: amount}("");
    if (!ok) revert TransferFailed();
}
```

### Access Control Pattern

Always protect admin functions:

```solidity
// VULNERABLE
function setAdmin(address newAdmin) external {
    admin = newAdmin;  // Anyone can call!
}

// FIXED
modifier onlyOwner() {
    if (msg.sender != owner) revert Unauthorized();
    _;
}

function setAdmin(address newAdmin) external onlyOwner {
    admin = newAdmin;
}
```

### Foundry Fuzz Test Pattern

Test with random inputs:

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

### Foundry Invariant Test Pattern

Test system-wide properties:

```solidity
function invariant_BalancesMatchTotalSupply() public {
    uint256 sum = 0;
    for (uint i = 0; i < actors.length; i++) {
        sum += token.balanceOf(actors[i]);
    }
    assertEq(token.totalSupply(), sum);
}
```

## Common Vulnerabilities

### Critical: Reentrancy
- **Issue**: State updated after external call
- **Prevention**: CEI pattern, update state before external calls

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
- Fuzz testing: `forge test --fuzz`
- Invariant testing: `invariant_*` functions
- Gas snapshots: `forge snapshot`
- Coverage: `forge coverage`

### Static Analysis
- **Slither**: Fast vulnerability detection
- **Mythril**: Symbolic execution
- **Semgrep**: Custom security rules

## Interactions

- Uses `solidity-development` for contract development patterns
- Uses `ethereum-development` for EVM internals understanding
- Uses Foundry for fuzz and invariant testing

## External Resources

- [Foundry Book - Fuzz Testing](https://book.getfoundry.sh/forge/fuzz-testing)
- [EEA Security Guidelines](https://entethalliance.org/technical-specifications/) - Enterprise Ethereum Alliance security standards
- [SCSVS](https://github.com/Consensys/smart-contract-verification-standard) - Smart Contract Security Verification Standard

## Historical References

- [SWC Registry](https://swcregistry.io/) - Common weakness enumeration (not actively maintained since ~2020, retained for historical context only)
