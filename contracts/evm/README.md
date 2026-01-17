# EVM Contracts

This directory contains EVM smart contracts built with Foundry for testing and faucet purposes.

## Overview

**Foundry** is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools)
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network
- **Chisel**: Fast, utilitarian, and verbose solidity REPL

## Project Structure

```
evm/
├── src/              # Contract source files
│   └── TestToken.sol # Test token contract
├── test/             # Test files
│   └── TestToken.t.sol
├── script/            # Deployment scripts
│   └── TestToken.s.sol
├── lib/              # Dependencies (OpenZeppelin, forge-std)
├── foundry.toml      # Foundry configuration
└── package.json      # Package scripts
```

## Deployed Contracts

All tokens are deployed on **Arbitrum Sepolia** (Chain ID: 421614):

| Token                | Symbol | Address                                                                                                                        | Block Explorer                                                                             |
| -------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Dynamic Arcade Token | DNMC   | [`0x4F28D4eD49E20d064C9052E7Ff4Fd12878aBA09F`](https://sepolia.arbiscan.io/address/0x4F28D4eD49E20d064C9052E7Ff4Fd12878aBA09F) | [Arbiscan](https://sepolia.arbiscan.io/address/0x4F28D4eD49E20d064C9052E7Ff4Fd12878aBA09F) |
| Mocked USDC          | USDC   | [`0x6a2fE04d877439a44938D38709698d524BCF5c40`](https://sepolia.arbiscan.io/address/0x6a2fE04d877439a44938D38709698d524BCF5c40) | [Arbiscan](https://sepolia.arbiscan.io/address/0x6a2fE04d877439a44938D38709698d524BCF5c40) |
| Mocked USDT          | USDT   | [`0x5f036f0B6948d4593364f975b81caBB3206aD994`](https://sepolia.arbiscan.io/address/0x5f036f0B6948d4593364f975b81caBB3206aD994) | [Arbiscan](https://sepolia.arbiscan.io/address/0x5f036f0B6948d4593364f975b81caBB3206aD994) |

## Contracts

### TestToken

A test ERC20 token contract designed for testing and faucet purposes. Key features:

- **Open Minting**: Anyone can mint tokens (no access control) - perfect for faucets
- **Open Burning**: Anyone can burn tokens (no access control) - useful for testing
- **Configurable Decimals**: Supports any decimal value (typically 6, 8, or 18)
- **Events**: Emits `Mint` and `Burn` events for tracking
- **OpenZeppelin Based**: Built on battle-tested OpenZeppelin ERC20 implementation

**Important**: This contract is intentionally open for testing. Do not deploy to mainnet without proper access controls.

### DNMC (Dynamic Arcade Token)

The Dynamic Arcade Token is deployed using the `TestToken` contract with the following configuration:

- **Name**: Dynamic Arcade Token
- **Symbol**: DNMC
- **Decimals**: 18 (standard for utility tokens)
- **Open Minting**: Enabled for testing and faucet purposes
- **Network**: Arbitrum Sepolia (Chain ID: 421614)
- **Contract Address**: [`0x4F28D4eD49E20d064C9052E7Ff4Fd12878aBA09F`](https://sepolia.arbiscan.io/address/0x4F28D4eD49E20d064C9052E7Ff4Fd12878aBA09F)
- **Block Explorer**: [View on Arbiscan](https://sepolia.arbiscan.io/address/0x4F28D4eD49E20d064C9052E7Ff4Fd12878aBA09F)

### USDC (Mocked)

A mocked USD Coin token for testing purposes. Deployed using the `TestToken` contract:

- **Name**: USD Coin
- **Symbol**: USDC
- **Decimals**: 6 (standard for USDC)
- **Open Minting**: Enabled for testing and faucet purposes
- **Network**: Arbitrum Sepolia (Chain ID: 421614)
- **Contract Address**: [`0x6a2fE04d877439a44938D38709698d524BCF5c40`](https://sepolia.arbiscan.io/address/0x6a2fE04d877439a44938D38709698d524BCF5c40)
- **Block Explorer**: [View on Arbiscan](https://sepolia.arbiscan.io/address/0x6a2fE04d877439a44938D38709698d524BCF5c40)

**Note**: This is a test/mock token, not the real USDC token.

### USDT (Mocked)

A mocked Tether USD token for testing purposes. Deployed using the `TestToken` contract:

- **Name**: Tether USD
- **Symbol**: USDT
- **Decimals**: 6 (standard for USDT on most chains)
- **Open Minting**: Enabled for testing and faucet purposes
- **Network**: Arbitrum Sepolia (Chain ID: 421614)
- **Contract Address**: [`0x5f036f0B6948d4593364f975b81caBB3206aD994`](https://sepolia.arbiscan.io/address/0x5f036f0B6948d4593364f975b81caBB3206aD994)
- **Block Explorer**: [View on Arbiscan](https://sepolia.arbiscan.io/address/0x5f036f0B6948d4593364f975b81caBB3206aD994)

**Note**: This is a test/mock token, not the real USDT token.

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) installed
- Rust (for Foundry)
- Node.js >= 20 (for monorepo scripts)

## Installation

Install Foundry dependencies:

```bash
forge install
```

This will install OpenZeppelin Contracts and other dependencies. The `lib/` directory is gitignored to ensure dependencies remain pristine and are installed via Foundry's dependency management.

### Update Dependencies

To update Foundry dependencies (e.g., OpenZeppelin Contracts):

```bash
forge update
# or from monorepo root
pnpm --filter @repo/contracts-evm deps:update
```

**Important**: The `lib/` directory should never be manually edited. All dependencies are managed through Foundry's dependency system. The directory is excluded from formatting via `foundry.toml` and `.prettierignore`.

## Usage

### Build

```bash
forge build
# or from monorepo root
pnpm --filter @repo/contracts-evm build
```

### Test

```bash
forge test
# or from monorepo root
pnpm --filter @repo/contracts-evm test
```

Run with verbosity:

```bash
forge test -vvv
```

### Format

```bash
forge fmt
```

### Gas Snapshots

```bash
forge snapshot
```

### Local Development

Start a local Anvil node:

```bash
anvil
# or
pnpm --filter @repo/contracts-evm deploy:anvil
```

## Testing Strategy

Contracts use Foundry's testing framework for unit and integration tests. Test tokens are deployed on Arbitrum Sepolia testnet for integration testing.

### Environment Setup

Create a `.env` file in the `contracts/evm/` directory (copy from `.env.sample`):

```bash
cp .env.sample .env
```

Edit `.env` with your values:

```env
PRIVATE_KEY=your_private_key_here
RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
```

### Deploy

Deploy TestToken to a local network:

```bash
forge script script/TestToken.s.sol:TestTokenScript \
  --rpc-url http://localhost:8545 \
  --broadcast \
  --private-key <your_private_key>
```

Deploy with custom parameters:

```bash
TOKEN_NAME="My Token" \
TOKEN_SYMBOL="MTK" \
TOKEN_MINTER=<address> \
TOKEN_DECIMALS=18 \
forge script script/TestToken.s.sol:TestTokenScript \
  --rpc-url <rpc_url> \
  --broadcast \
  --private-key <your_private_key>
```

#### Deploy DNMC Token

Deploy DNMC (Dynamic Arcade Token) to Arbitrum Sepolia:

```bash
# Using package.json script (requires .env file, from monorepo root)
pnpm --filter @repo/contracts-evm deploy:dnmc

# Or using forge directly
forge script script/DNMC.s.sol:DNMCScript \
  --rpc-url $RPC_URL \
  --broadcast \
  --private-key $PRIVATE_KEY
```

#### Deploy Mocked USDC Token

Deploy mocked USDC token to Arbitrum Sepolia:

```bash
# Using package.json script (requires .env file, from monorepo root)
pnpm --filter @repo/contracts-evm deploy:usdc

# Or using forge directly
forge script script/USDC.s.sol:USDCScript \
  --rpc-url $RPC_URL \
  --broadcast \
  --private-key $PRIVATE_KEY
```

#### Deploy Mocked USDT Token

Deploy mocked USDT token to Arbitrum Sepolia:

```bash
# Using package.json script (requires .env file, from monorepo root)
pnpm --filter @repo/contracts-evm deploy:usdt

# Or using forge directly
forge script script/USDT.s.sol:USDTScript \
  --rpc-url $RPC_URL \
  --broadcast \
  --private-key $PRIVATE_KEY
```

#### Deploy to Different Networks

To deploy to a different network, override the `RPC_URL` environment variable:

```bash
# Deploy to Base Sepolia
RPC_URL=https://sepolia.base.org pnpm --filter @repo/contracts-evm deploy:usdc

# Deploy to local Anvil
RPC_URL=http://localhost:8545 pnpm --filter @repo/contracts-evm deploy:dnmc
```

### Cast

Interact with deployed contracts:

```bash
cast <subcommand>
```

#### Example: Mint Tokens

Mint tokens using Cast with the deployed contracts:

```bash
# Mint 1000 USDC (6 decimals) to an address
cast send 0x6a2fE04d877439a44938D38709698d524BCF5c40 "mint(address,uint256)" <RECIPIENT_ADDRESS> 1000000000 \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY

# Mint 1000 USDT (6 decimals) to an address
cast send 0x5f036f0B6948d4593364f975b81caBB3206aD994 "mint(address,uint256)" <RECIPIENT_ADDRESS> 1000000000 \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY

# Mint 100 DNMC (18 decimals) to an address
cast send 0x4F28D4eD49E20d064C9052E7Ff4Fd12878aBA09F "mint(address,uint256)" <RECIPIENT_ADDRESS> 100000000000000000000 \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY
```

#### Example: Check Balance

Check token balance:

```bash
# Check USDC balance
cast call 0x6a2fE04d877439a44938D38709698d524BCF5c40 "balanceOf(address)" <ADDRESS> --rpc-url $RPC_URL

# Check USDT balance
cast call 0x5f036f0B6948d4593364f975b81caBB3206aD994 "balanceOf(address)" <ADDRESS> --rpc-url $RPC_URL

# Check DNMC balance
cast call 0x4F28D4eD49E20d064C9052E7Ff4Fd12878aBA09F "balanceOf(address)" <ADDRESS> --rpc-url $RPC_URL
```

#### Example: Check Token Info

Get token name, symbol, and decimals:

```bash
# USDC token info
cast call 0x6a2fE04d877439a44938D38709698d524BCF5c40 "name()" --rpc-url $RPC_URL
cast call 0x6a2fE04d877439a44938D38709698d524BCF5c40 "symbol()" --rpc-url $RPC_URL
cast call 0x6a2fE04d877439a44938D38709698d524BCF5c40 "decimals()" --rpc-url $RPC_URL

# USDT token info
cast call 0x5f036f0B6948d4593364f975b81caBB3206aD994 "name()" --rpc-url $RPC_URL
cast call 0x5f036f0B6948d4593364f975b81caBB3206aD994 "symbol()" --rpc-url $RPC_URL
cast call 0x5f036f0B6948d4593364f975b81caBB3206aD994 "decimals()" --rpc-url $RPC_URL

# DNMC token info
cast call 0x4F28D4eD49E20d064C9052E7Ff4Fd12878aBA09F "name()" --rpc-url $RPC_URL
cast call 0x4F28D4eD49E20d064C9052E7Ff4Fd12878aBA09F "symbol()" --rpc-url $RPC_URL
cast call 0x4F28D4eD49E20d064C9052E7Ff4Fd12878aBA09F "decimals()" --rpc-url $RPC_URL
```

## Configuration

Foundry configuration is in `foundry.toml`:

- Solidity version: `0.8.24`
- Optimizer: Enabled (200 runs)
- Fuzz tests: 256 runs
- Remappings: OpenZeppelin contracts

## Testing

The test suite includes:

- Basic mint/burn functionality
- Open access control verification (anyone can mint/burn)
- Multiple users minting independently
- Edge cases (zero amounts)
- Fuzz testing for mint/burn amounts
- Event emission verification
- Decimals with different values

## Documentation

- [Foundry Book](https://book.getfoundry.sh/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Solidity Documentation](https://docs.soliditylang.org/)

## License

MIT
