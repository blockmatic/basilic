# Solidity Development Patterns

## Design Patterns

### CEI Pattern (Checks-Effects-Interactions)

**Purpose**: Prevent reentrancy attacks by updating state before external calls.

**Vulnerable Pattern:**
```solidity
// ❌ VULNERABLE: State updated after external call
function withdraw(uint256 amount) external {
    (bool ok,) = msg.sender.call{value: amount}("");
    require(ok);
    balances[msg.sender] -= amount;  // After call - vulnerable!
}
```

**Secure Pattern:**
```solidity
// ✅ SECURE: State updated before external call
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

**When to use:**
- All functions that make external calls
- Functions that transfer tokens or ETH
- Functions that call other contracts

**Trade-offs:**
- Slightly more complex code structure
- Essential for security
- No gas cost difference

### Access Control Pattern

**Purpose**: Restrict function access to authorized addresses.

**Vulnerable Pattern:**
```solidity
// ❌ VULNERABLE: No access control
contract AdminContract {
    address public admin;
    
    function setAdmin(address newAdmin) external {
        admin = newAdmin;  // Anyone can call!
    }
}
```

**Secure Pattern:**
```solidity
// ✅ SECURE: Access control modifier
contract AdminContract {
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

**OpenZeppelin Pattern:**
```solidity
import "@openzeppelin/contracts/access/Ownable.sol";

contract AdminContract is Ownable {
    function setAdmin(address newAdmin) external onlyOwner {
        _transferOwnership(newAdmin);
    }
}
```

**When to use:**
- Admin functions
- Configuration functions
- Privileged operations

### Input Validation Pattern

**Purpose**: Validate all inputs before processing.

**Vulnerable Pattern:**
```solidity
// ❌ VULNERABLE: No validation
function transfer(address to, uint256 amount) external {
    balances[msg.sender] -= amount;
    balances[to] += amount;  // Could be zero address!
}
```

**Secure Pattern:**
```solidity
// ✅ SECURE: Comprehensive validation
error ZeroAddress();
error InvalidAmount();
error InsufficientBalance(uint256 requested, uint256 available);

function transfer(address to, uint256 amount) external {
    // Zero address check
    if (to == address(0)) revert ZeroAddress();
    
    // Amount validation
    if (amount == 0) revert InvalidAmount();
    
    // Balance check
    if (balances[msg.sender] < amount) {
        revert InsufficientBalance(amount, balances[msg.sender]);
    }
    
    // Process transfer
    balances[msg.sender] -= amount;
    balances[to] += amount;
}
```

**When to use:**
- All public/external functions
- Functions accepting addresses
- Functions accepting numeric inputs
- Functions accepting arrays

### Storage Packing Pattern

**Purpose**: Optimize gas by packing multiple variables into single storage slot.

**Inefficient Pattern:**
```solidity
// ❌ INEFFICIENT: Uses 3 storage slots
contract Inefficient {
    uint256 public balance;      // Slot 0
    uint64 public lastUpdate;    // Slot 1
    bool public active;          // Slot 2
}
```

**Optimized Pattern:**
```solidity
// ✅ OPTIMIZED: Uses 1 storage slot
contract Optimized {
    struct User {
        uint128 balance;    // 16 bytes
        uint64 lastUpdate;  // 8 bytes
        uint32 nonce;       // 4 bytes
        bool active;        // 1 byte
        // 3 bytes padding
        // Total: 32 bytes = 1 slot
    }
    
    mapping(address => User) public users;
}
```

**When to use:**
- Multiple small variables that fit in one slot
- Structs with small fields
- State variables accessed together

**Trade-offs:**
- Saves ~20k gas per slot
- Requires careful type selection
- May complicate code structure

### Calldata vs Memory Pattern

**Purpose**: Save gas by using calldata for read-only parameters.

**Inefficient Pattern:**
```solidity
// ❌ INEFFICIENT: Unnecessary memory copy
function processData(bytes memory data) external {
    // data is copied to memory even though it's read-only
    process(data);
}
```

**Optimized Pattern:**
```solidity
// ✅ OPTIMIZED: Use calldata for read-only
function processData(bytes calldata data) external {
    // data stays in calldata, no copy
    process(data);
}

// Use memory only when modification needed
function modifyData(bytes memory data) external {
    data[0] = 0x00;  // Can modify memory
    process(data);
}
```

**When to use:**
- Read-only function parameters
- Large arrays or bytes
- External function parameters

**Trade-offs:**
- Saves ~3 gas per byte
- Calldata is read-only
- Memory allows modification

### Cache Storage Reads Pattern

**Purpose**: Reduce gas by caching storage reads in memory.

**Inefficient Pattern:**
```solidity
// ❌ INEFFICIENT: Multiple storage reads
function processUser(address user) external {
    if (balances[user] > 0) {           // Storage read #1 (2100 gas)
        process(balances[user]);        // Storage read #2 (2100 gas)
        update(balances[user]);         // Storage read #3 (2100 gas)
    }
}
```

**Optimized Pattern:**
```solidity
// ✅ OPTIMIZED: Cache storage read
function processUser(address user) external {
    uint256 balance = balances[user];   // Storage read #1 (2100 gas)
    if (balance > 0) {
        process(balance);               // Memory read (3 gas)
        update(balance);                 // Memory read (3 gas)
        balances[user] = balance;       // Storage write (if needed)
    }
}
```

**When to use:**
- Storage reads used multiple times
- Storage reads in loops
- Complex calculations using storage values

**Trade-offs:**
- Saves ~2100 gas per avoided storage read
- Requires temporary variable
- Must update storage if value changes

### Custom Errors Pattern

**Purpose**: Save gas compared to require strings.

**Inefficient Pattern:**
```solidity
// ❌ INEFFICIENT: String-based errors
function withdraw(uint256 amount) external {
    require(balances[msg.sender] >= amount, "Insufficient balance");
    require(amount > 0, "Amount must be greater than zero");
}
```

**Optimized Pattern:**
```solidity
// ✅ OPTIMIZED: Custom errors
error InsufficientBalance(uint256 requested, uint256 available);
error InvalidAmount();

function withdraw(uint256 amount) external {
    if (amount == 0) revert InvalidAmount();
    if (balances[msg.sender] < amount) {
        revert InsufficientBalance(amount, balances[msg.sender]);
    }
}
```

**When to use:**
- All revert conditions
- Production contracts
- Gas-optimized code

**Trade-offs:**
- Saves ~200+ gas per revert
- Requires error definitions
- Better error information

### Unchecked Math Pattern

**Purpose**: Save gas by skipping overflow checks when safe.

**Inefficient Pattern:**
```solidity
// ❌ INEFFICIENT: Unnecessary overflow checks
function increment(uint256 x) external pure returns (uint256) {
    return x + 1; // Solidity 0.8+ checks overflow by default
}

function processBatch(uint256[] calldata items) external {
    for (uint256 i = 0; i < items.length; i++) {
        process(items[i]); // i++ has overflow check
    }
}
```

**Optimized Pattern:**
```solidity
// ✅ OPTIMIZED: Unchecked for safe operations
function increment(uint256 x) external pure returns (uint256) {
    unchecked {
        return x + 1; // Safe: can't overflow uint256
    }
}

function processBatch(uint256[] calldata items) external {
    for (uint256 i = 0; i < items.length;) {
        process(items[i]);
        unchecked {
            ++i; // Safe: loop bound prevents overflow
        }
    }
}
```

**When to use:**
- Loop counter increments (when bound prevents overflow)
- Math operations where overflow is impossible
- After explicit bounds checking

**Trade-offs:**
- Saves ~20-40 gas per operation
- Must ensure overflow is impossible
- Can introduce bugs if used incorrectly

## Anti-Patterns to Avoid

### ❌ Don't: Update State After External Calls

```solidity
// BAD: Vulnerable to reentrancy
function withdraw(uint256 amount) external {
    (bool ok,) = msg.sender.call{value: amount}("");
    require(ok);
    balances[msg.sender] -= amount;  // After call!
}
```

### ✅ Do: Update State Before External Calls

```solidity
// GOOD: CEI pattern
function withdraw(uint256 amount) external {
    if (balances[msg.sender] < amount) revert InsufficientBalance();
    balances[msg.sender] -= amount;  // Before call!
    (bool ok,) = msg.sender.call{value: amount}("");
    if (!ok) revert TransferFailed();
}
```

### ❌ Don't: Skip Input Validation

```solidity
// BAD: No validation
function transfer(address to, uint256 amount) external {
    balances[msg.sender] -= amount;
    balances[to] += amount;
}
```

### ✅ Do: Validate All Inputs

```solidity
// GOOD: Comprehensive validation
function transfer(address to, uint256 amount) external {
    if (to == address(0)) revert ZeroAddress();
    if (amount == 0) revert InvalidAmount();
    if (balances[msg.sender] < amount) revert InsufficientBalance();
    balances[msg.sender] -= amount;
    balances[to] += amount;
}
```

### ❌ Don't: Read Storage in Loops

```solidity
// BAD: Expensive storage reads
function processUsers(address[] calldata users) external {
    for (uint i = 0; i < users.length; i++) {
        process(balances[users[i]]);  // Storage read in loop!
    }
}
```

### ✅ Do: Cache Storage Reads

```solidity
// GOOD: Cache storage read
function processUsers(address[] calldata users) external {
    for (uint i = 0; i < users.length; i++) {
        uint256 balance = balances[users[i]];  // Cache once
        process(balance);  // Use cached value
    }
}
```

### ❌ Don't: Use Memory for Read-Only Parameters

```solidity
// BAD: Unnecessary memory copy
function processData(bytes memory data) external {
    // data is read-only but copied to memory
}
```

### ✅ Do: Use Calldata for Read-Only Parameters

```solidity
// GOOD: No memory copy
function processData(bytes calldata data) external {
    // data stays in calldata
}
```

### ❌ Don't: Use Require Strings

```solidity
// BAD: Expensive string storage
require(balances[msg.sender] >= amount, "Insufficient balance");
```

### ✅ Do: Use Custom Errors

```solidity
// GOOD: Gas-efficient errors
if (balances[msg.sender] < amount) revert InsufficientBalance();
```

### ❌ Don't: Skip Unchecked Blocks for Safe Math

```solidity
// BAD: Unnecessary overflow checks
for (uint256 i = 0; i < items.length; i++) {
    process(items[i]); // i++ has overflow check
}
```

### ✅ Do: Use Unchecked for Safe Operations

```solidity
// GOOD: Unchecked for loop counter
for (uint256 i = 0; i < items.length;) {
    process(items[i]);
    unchecked {
        ++i; // Safe: loop bound prevents overflow
    }
}
```

## Integration Patterns

### OpenZeppelin Integration

**ERC20 Token:**
```solidity
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    constructor() ERC20("MyToken", "MTK") Ownable(msg.sender) {}
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
```

**Access Control:**
```solidity
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MyContract is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    function adminFunction() external onlyRole(ADMIN_ROLE) {
        // Admin logic
    }
}
```

**Reentrancy Guard:**
```solidity
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Vault is ReentrancyGuard {
    function withdraw(uint256 amount) external nonReentrant {
        // CEI pattern + reentrancy guard
    }
}
```

### Oracle Integration Pattern

**Purpose**: Safely integrate price oracles with staleness checks.

```solidity
contract PriceFeed {
    uint256 public constant STALENESS_THRESHOLD = 1 hours;
    uint256 public constant MAX_PRICE_DEVIATION = 10; // 10%
    
    struct PriceData {
        uint256 price;
        uint256 timestamp;
    }
    
    PriceData public latestPrice;
    
    error StalePrice();
    error PriceDeviationTooHigh();
    
    function updatePrice(uint256 newPrice) external {
        if (block.timestamp - latestPrice.timestamp > STALENESS_THRESHOLD) {
            revert StalePrice();
        }
        
        uint256 deviation = calculateDeviation(latestPrice.price, newPrice);
        if (deviation > MAX_PRICE_DEVIATION) {
            revert PriceDeviationTooHigh();
        }
        
        latestPrice = PriceData(newPrice, block.timestamp);
    }
    
    function calculateDeviation(uint256 oldPrice, uint256 newPrice) 
        internal pure returns (uint256) 
    {
        if (oldPrice == 0) return 100;
        uint256 diff = oldPrice > newPrice 
            ? oldPrice - newPrice 
            : newPrice - oldPrice;
        return (diff * 100) / oldPrice;
    }
}
```

### Safe Token Transfer Pattern

**Purpose**: Handle token transfers safely, including non-standard tokens.

```solidity
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenHandler {
    using SafeERC20 for IERC20;
    
    error TransferFailed();
    
    function safeTransfer(address token, address to, uint256 amount) internal {
        IERC20(token).safeTransfer(to, amount);
    }
    
    function safeTransferFrom(
        address token,
        address from,
        address to,
        uint256 amount
    ) internal {
        IERC20(token).safeTransferFrom(from, to, amount);
    }
}
```

## Testing Patterns

### Foundry Test Setup Pattern

```solidity
import "forge-std/Test.sol";

contract MyContractTest is Test {
    MyContract contract;
    address owner = makeAddr("owner");
    address user = makeAddr("user");
    
    function setUp() public {
        vm.prank(owner);
        contract = new MyContract();
    }
    
    function test_BasicFunctionality() public {
        // Test implementation
    }
}
```

### Fuzz Test Pattern

```solidity
function testFuzz_Transfer(uint256 amount) public {
    // Bound input to valid range
    amount = bound(amount, 1, type(uint128).max);
    
    // Setup
    token.mint(address(this), amount);
    
    // Execute
    token.transfer(user, amount);
    
    // Assert
    assertEq(token.balanceOf(user), amount);
}
```

### Invariant Test Pattern

```solidity
function invariant_TotalSupplyMatchesBalances() public {
    uint256 sum = 0;
    for (uint i = 0; i < actors.length; i++) {
        sum += token.balanceOf(actors[i]);
    }
    assertEq(token.totalSupply(), sum);
}
```

## Related Resources

- [SKILL.md](../SKILL.md) - Complete skill specification
- [GUIDE.md](./GUIDE.md) - Development workflow and best practices
- [Foundry Book](https://book.getfoundry.sh/) - Official Foundry documentation
