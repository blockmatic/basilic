# Skill: defi-protocols

## Scope

- DeFi protocol development patterns (AMMs, lending, yield, oracles)
- AMM mechanics and swap calculations
- Lending protocol architecture and interest rate models
- Oracle integration and price feed security
- Flash loan patterns and protection

Does NOT cover:
- General Solidity development (see `solidity-development` skill)
- Security auditing (see `smart-contract-security` skill)
- Frontend integration (see `web3-frontend` skill)

## Principles

- Use TWAP (time-weighted average price) for manipulation-resistant pricing
- Check oracle staleness before using prices
- Enforce slippage protection on swaps
- Use overcollateralization for lending protocols
- Implement flash loan resistance where applicable
- Use utilization-based interest rate curves for lending

## Constraints

- MUST check oracle staleness before using prices (prevent stale price attacks)
- MUST enforce slippage protection on swaps (prevent sandwich attacks)
- MUST use TWAP or multiple oracles for critical pricing (prevent flash loan manipulation)
- SHOULD implement flash loan resistance for protocols handling large value
- SHOULD use overcollateralization for lending (maintain health factor > 1)
- AVOID using spot prices from DEX for critical decisions (vulnerable to manipulation)
- AVOID single oracle setups for high-value protocols (use fallbacks)

## Patterns

### AMM Swap Calculation (Constant Product)

Constant product formula: `x * y = k`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library SwapMath {
    uint256 constant FEE_NUMERATOR = 997;
    uint256 constant FEE_DENOMINATOR = 1000;

    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) internal pure returns (uint256) {
        uint256 amountInWithFee = amountIn * FEE_NUMERATOR;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = reserveIn * FEE_DENOMINATOR + amountInWithFee;
        return numerator / denominator;
    }
}
```

### Oracle Staleness Check Pattern

Always validate oracle freshness:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract PriceOracle {
    AggregatorV3Interface public immutable priceFeed;
    uint256 public constant STALENESS_THRESHOLD = 1 hours;

    error StalePrice();
    error InvalidPrice();

    function getPrice() external view returns (uint256) {
        (, int256 price,, uint256 updatedAt,) = priceFeed.latestRoundData();

        if (block.timestamp - updatedAt > STALENESS_THRESHOLD) {
            revert StalePrice();
        }
        if (price <= 0) revert InvalidPrice();

        return uint256(price);
    }
}
```

### Slippage Protection Pattern

Enforce minimum output on swaps:

```solidity
function swap(
    uint256 amountIn,
    uint256 minAmountOut
) external {
    uint256 amountOut = getAmountOut(amountIn, reserveIn, reserveOut);
    
    if (amountOut < minAmountOut) {
        revert SlippageExceeded();
    }
    
    // Execute swap
}
```

### Interest Rate Model Pattern

Utilization-based interest rates:

```solidity
function getBorrowRate(uint256 utilization) public pure returns (uint256) {
    if (utilization < OPTIMAL_UTILIZATION) {
        return BASE_RATE + (utilization * SLOPE_1) / OPTIMAL_UTILIZATION;
    } else {
        return BASE_RATE + SLOPE_1 + 
               ((utilization - OPTIMAL_UTILIZATION) * SLOPE_2) / 
               (1e18 - OPTIMAL_UTILIZATION);
    }
}
```

## Protocol Types

### AMM (Automated Market Maker)
- **Constant Product**: `x * y = k` (Uniswap V2)
- **Concentrated Liquidity**: Tick-based (Uniswap V3)
- **Stable Swaps**: Curve invariant for similar assets
- **TWAP**: Time-weighted average price for manipulation resistance

### Lending Protocols
- **Overcollateralized**: Aave/Compound model (health factor)
- **Interest Rates**: Utilization-based curves
- **Liquidation**: Automated when health factor < 1
- **Isolated Markets**: Risk segmentation

### Oracle Integration
- **Chainlink**: Decentralized oracle network
- **TWAP**: DEX-based time-weighted prices
- **Multi-oracle**: Fallback mechanisms
- **Staleness Checks**: Price freshness validation

## Trade-offs

- **TWAP vs spot price**: TWAP resists manipulation but has latency. Spot price is immediate but vulnerable to flash loans.
- **Single vs multi-oracle**: Single oracle is simpler but single point of failure. Multi-oracle provides redundancy but complexity.
- **Overcollateralization**: Higher safety but lower capital efficiency. Lower collateralization increases risk but improves efficiency.

## Security Considerations

- **Oracle manipulation**: Use TWAP or multiple oracles
- **Flash loan attacks**: Check price staleness, use TWAP
- **Sandwich attacks**: Enforce slippage protection
- **Reentrancy**: Follow CEI pattern (see `smart-contract-security`)

## Interactions

- Uses `solidity-development` for contract patterns
- Uses `smart-contract-security` for security patterns
- Uses `ethereum-development` for EVM understanding

## External Resources

- [Uniswap V2 Documentation](https://docs.uniswap.org/contracts/v2/overview)
- [Aave Documentation](https://docs.aave.com/) - Lending protocol patterns
