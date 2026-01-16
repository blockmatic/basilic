# @repo/utils package

Shared utility library for common operations across the Basilic monorepo. Follows Linux philosophy: small, focused utilities that compose well.

## Key Principles

1. **Small, Focused Utilities**: Each utility does one thing well
2. **Composable**: Utilities can be combined to solve complex problems
3. **Minimal Dependencies**: Uses peer dependencies - consumers provide zod, viem, and lodash-es
4. **Consistent Patterns**: Multi-parameter utilities use RORO pattern; single-parameter utilities use direct parameters
5. **Type-Safe**: Full TypeScript support with proper types

## Subpath Exports

This package uses subpath exports - import directly from the specific module you need:

```typescript
import { delay } from '@repo/utils/async'
import { getChainMetadata } from '@repo/utils/web3'
```

**Note**: Error handling utilities have been moved to `@repo/error`. Use platform-specific imports:
- `import { getErrorMessage, captureError } from '@repo/error/node'` for Node.js/Fastify
- `import { getErrorMessage, captureError } from '@repo/error/nextjs'` for Next.js
- `import { getErrorMessage, captureError } from '@repo/error/browser'` for browser frameworks

**Important**: Do not import from `@repo/utils` directly. Always use subpath imports.

Runtime exports resolve to `dist/`, so make sure `pnpm --filter @repo/utils build` runs before production usage.
Logger types are shared across client/server and resolve via the client signature.

## Utilities

### Async Utilities (`@repo/utils/async`)

#### `delay`

Delays execution for the specified number of milliseconds.

```typescript
import { delay } from '@repo/utils/async'

await delay(1000) // Wait 1 second
```

#### `fetchWithTimeout`

Fetches a resource with a timeout using native AbortController.

```typescript
import { fetchWithTimeout } from '@repo/utils/async'

const response = await fetchWithTimeout({
  url: 'https://api.example.com/data',
  options: { headers: { Authorization: 'Bearer token' } },
  timeoutMs: 5000,
})
```

### Web3 Utilities (`@repo/utils/web3`)

#### `getChainMetadata`

Get chain metadata from chain ID or Dynamic network ID.

```typescript
import { getChainMetadata } from '@repo/utils/web3'

const metadata = getChainMetadata(1) // Ethereum Mainnet
// Returns: { chainType: 'evm', chainId: 1, name: 'Ethereum Mainnet', ... }
```

#### `getChainType`

Get chain type from chain ID or Dynamic network ID.

```typescript
import { getChainType } from '@repo/utils/web3'

const chainType = getChainType(1) // Returns: 'evm'
```

#### `getDynamicNetworkId`

Get Dynamic network ID from chain ID.

```typescript
import { getDynamicNetworkId } from '@repo/utils/web3'

const networkId = getDynamicNetworkId(1) // Returns: '1'
```

#### `isSupportedChain`

Check if chain is supported.

```typescript
import { isSupportedChain } from '@repo/utils/web3'

if (isSupportedChain(chainId)) {
  // Chain is supported
}
```

#### `chainTypeSchema`

Zod schema for validating chain types.

```typescript
import { chainTypeSchema } from '@repo/utils/web3'

const result = chainTypeSchema.parse('evm') // Validates chain type
```

#### `ChainType`

TypeScript type for chain types.

```typescript
import type { ChainType } from '@repo/utils/web3'

const chainType: ChainType = 'evm'
```

## Usage

This package is part of the monorepo and is automatically available to all apps. No separate installation needed.

Import utilities using subpath exports:

```typescript
import { delay, fetchWithTimeout } from '@repo/utils/async'
import { getChainMetadata, getChainType, ChainType, chainTypeSchema } from '@repo/utils/web3'
```

**Error Handling**: Error utilities have been moved to `@repo/error`. Import from `@repo/error` instead:
```typescript
import { getErrorMessage, captureError } from '@repo/error/node' // or '/nextjs', '/browser'
```

## Peer Dependencies

This package requires the following peer dependencies (provided by consumers):

- `zod` - For validation schemas and error handling
- `viem` - For EVM chain types and utilities
- `lodash-es` - For utility functions (imported per-function)

## Best Practices

### Error Handling

- Error handling utilities have been moved to `@repo/error`
- Use `getErrorMessage` and `captureError` from `@repo/error` for error handling
- Use lodash-es utilities (`isPlainObject`, `isEmpty`) for type checking instead of manual checks

### Fetch Calls

- Always use `fetchWithTimeout` for external API calls
- Use appropriate timeout values based on expected response time
- Default timeout is 5000ms, adjust as needed

### Web3 Utilities

- Use `getChainMetadata` to get full chain information
- Use `getChainType` for simple chain type checks
- Use `isSupportedChain` to validate chain support before operations
- Use `chainTypeSchema` for runtime validation of chain types