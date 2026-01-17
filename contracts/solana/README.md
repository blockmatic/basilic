# Solana Contracts

This directory contains Solana programs built with Anchor framework for testing and faucet purposes.

## Overview

**Anchor** is a framework for Solana's Sealevel runtime providing several developer tools for writing smart contracts. It provides:

- **IDL Generation**: Automatic TypeScript/JavaScript client generation
- **Testing Utilities**: Built-in testing framework with local validator
- **Deployment Tooling**: Easy deployment to different networks
- **Type Safety**: Rust-based programs with strong typing

## Project Structure

```
solana/
├── programs/              # Solana program source files
│   └── test-token/
│       ├── src/
│       │   └── lib.rs     # TestToken program
│       └── Cargo.toml
├── tests/                 # TypeScript test files
│   └── test-token.ts
├── scripts/               # Deployment scripts
│   └── deploy.ts
├── Anchor.toml            # Anchor configuration
├── Cargo.toml             # Workspace Cargo configuration
└── package.json           # Package scripts
```

## Programs

### TestToken

A test SPL Token program designed for testing and faucet purposes. Key features:

- **Open Minting**: Anyone can mint tokens using the program-derived address (PDA) - perfect for faucets
- **Open Burning**: Anyone can burn tokens from accounts they own - useful for testing
- **SPL Token Compatible**: Uses Anchor SPL token library for standard token operations
- **Events**: Emits `MintEvent` and `BurnEvent` for tracking
- **PDA Authority**: Uses a program-derived address as mint authority that anyone can derive

**Important**: This program is intentionally open for testing. Do not deploy to mainnet without proper access controls.

## Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) (latest)
- [Anchor](https://www.anchor-lang.com/docs/installation) (latest)
- Node.js >= 22
- pnpm (package manager)

## Installation

Install dependencies:

```bash
# From monorepo root
pnpm install
```

Install Anchor (if not already installed):

```bash
avm install latest
avm use latest
```

## Usage

### Build

Build the program:

```bash
anchor build
# or from monorepo root
pnpm --filter @repo/contracts-solana build
```

This will:

- Compile the Rust program
- Generate the IDL (Interface Definition Language)
- Generate TypeScript types

### Test

Run tests with local validator:

```bash
anchor test
# or from monorepo root
pnpm --filter @repo/contracts-solana test
```

Run tests without starting local validator (requires running `solana-test-validator` separately):

```bash
pnpm --filter @repo/contracts-solana test:local
```

### Deploy

Deploy to localnet:

```bash
anchor deploy
# or from monorepo root
pnpm --filter @repo/contracts-solana deploy:local
```

Deploy to devnet:

```bash
anchor deploy --provider.cluster devnet
# or from monorepo root
pnpm --filter @repo/contracts-solana deploy:devnet
```

Deploy to testnet:

```bash
anchor deploy --provider.cluster testnet
# or from monorepo root
pnpm --filter @repo/contracts-solana deploy:testnet
```

### Run Deployment Script

Deploy using the custom script:

```bash
ts-node scripts/deploy.ts
```

With custom cluster:

```bash
CLUSTER=devnet ts-node scripts/deploy.ts
```

## Configuration

Anchor configuration is in `Anchor.toml`:

- Program ID: `testToken111111111111111111111111111111111`
- Cluster: Configurable (localnet, devnet, testnet)
- Test validator: Includes SPL Token programs

## Testing

The test suite includes:

- Basic mint/burn functionality
- Open access control verification (anyone can mint)
- Multiple users minting independently
- Edge cases (zero amounts)
- Decimals verification

## Program Details

### Mint Authority

The program uses a Program-Derived Address (PDA) as the mint authority:

```rust
let [mint_authority, bump] = Pubkey::find_program_address(
    &[b"mint"],
    program_id
);
```

Anyone can derive this PDA and use it to mint tokens, making it perfect for faucet functionality.

### Instructions

- `mint_tokens`: Mints tokens to any account (open to anyone)
- `burn_tokens`: Burns tokens from an account (requires account ownership)

## Development Workflow

1. **Start local validator** (optional, Anchor test does this automatically):

   ```bash
   solana-test-validator
   ```

2. **Build program**:

   ```bash
   anchor build
   ```

3. **Run tests**:

   ```bash
   anchor test
   ```

4. **Deploy**:
   ```bash
   anchor deploy
   ```

## Documentation

- [Anchor Documentation](https://www.anchor-lang.com/docs)
- [Solana Documentation](https://docs.solana.com/)
- [SPL Token Documentation](https://spl.solana.com/token)
- [Anchor SPL Documentation](https://docs.rs/anchor-spl/latest/anchor_spl/)

## License

MIT
