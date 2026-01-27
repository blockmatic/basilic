# Skill: solana

## Scope

- Solana dApp UI development (React/Next.js) with framework-kit
- Wallet connection and signing flows
- Transaction building, sending, and confirmation UX
- On-chain program development with Anchor 0.32.1
- Client SDK generation from IDLs
- Local testing with Anchor test framework
- Address validation and transaction patterns

Does NOT cover:
- EVM frontend development (see wagmi skill)
- General blockchain concepts

## Assumptions

- Anchor 0.32.1 for program development
- `@solana/client` and `@solana/react-hooks` for UI development
- `@solana/kit` for client/RPC/transaction code
- `@solana/web3.js` v1.x for legacy compatibility
- React 18+ or Next.js 14+ for UI
- TypeScript v5+ with strict mode
- Node.js 18+

## Principles

- Use Solana Foundation framework-kit (`@solana/client` + `@solana/react-hooks`) for React/Next.js UI
- Use `@solana/kit` for client/RPC/transaction code
- Use Anchor 0.32.1 for program development
- Validate addresses with `PublicKey` from `@solana/web3.js`
- Use Wallet Standard for wallet discovery and connection
- Isolate `@solana/web3.js` to adapter boundaries when legacy dependencies require it
- Organize programs using standard Anchor project structure
- Use LiteSVM or Mollusk for unit tests
- Use Surfpool for integration tests against realistic cluster state

## Constraints

### MUST

- Validate addresses with `PublicKey.isOnCurve()` before use
- Use Anchor test framework for program testing
- Organize programs in `programs/` directory
- Use `@solana/web3-compat` for legacy adapter boundaries

### SHOULD

- Use `@solana/kit` types (`Address`, `Signer`) over web3.js types
- Prefer `@solana-program/*` instruction builders over hand-rolled instruction data
- Use Wallet Standard for wallet discovery/connect
- Use LiteSVM or Mollusk for unit tests (fast feedback)
- Use Surfpool for integration tests against realistic cluster state
- Contain `@solana/web3.js` types to adapter modules (don't leak across app)

### AVOID

- Letting `@solana/web3.js` types leak across entire app
- Using solana-test-validator when LiteSVM/Mollusk suffice
- Skipping address validation before use

## Patterns

### Address Validation Pattern

Always validate Solana addresses before use:

```tsx
import { PublicKey } from '@solana/web3.js'

function validateSolanaAddress(address: string): boolean {
  try {
    const publicKey = new PublicKey(address)
    return PublicKey.isOnCurve(publicKey)
  } catch {
    return false
  }
}
```

### Anchor Program Development

Use Anchor 0.32.1 for program development:

- Organize programs in `programs/` directory
- Place tests in `tests/` directory
- Create deployment scripts in `scripts/` directory
- Configure in `Anchor.toml` at project root

### Testing Pattern

Use Anchor test framework (includes local validator):

```bash
# Run tests with local validator
anchor test

# Run tests without starting validator (requires running separately)
anchor test --skip-local-validator
```

## Interactions

- Complements `web3-frontend` for EVM frontend work
- Focuses on Solana-specific development patterns

