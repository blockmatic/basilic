# Web3 (`@repo/utils/web3`)

Chain metadata, chain type, and RPC helpers for EVM and Solana. Uses a single registry keyed by chain ID.

**Peer dependencies:** `lodash-es`, `viem`, `zod`.

## API

### Chain metadata

- **getChainMetadata(chainId)** — Full metadata for a chain (EVM number or Solana cluster string). Returns `undefined` if unsupported.
- **getChainType(chainId)** — `'evm' | 'solana' | ...` or `undefined`.
- **isSupportedChain(chainId)** — Whether the chain is in the registry.

```ts
import { getChainMetadata, getChainType, isSupportedChain } from '@repo/utils/web3'

getChainMetadata(1)           // Ethereum Mainnet
getChainType(1)               // 'evm'
getChainMetadata('mainnet-beta')  // Solana Mainnet
isSupportedChain(chainId)     // boolean
```

### Types and schema

- **ChainMetadata** — `chainType`, `chainId`, `name`, `viemChain?`, `defaultRpcUrl?`.
- **ChainType** — Inferred from schema.
- **chainTypeSchema** — Zod enum for chain types (e.g. `'evm'`, `'solana'`).

### Alchemy / RPC

- **getAlchemyRpcUrl(chainId, apiKey)** — Alchemy RPC URL or `undefined` if not supported.
- **getRpcEndpoint(chainId, alchemyApiKey?)** — Prefers Alchemy when key given; else default RPC. Throws if no endpoint.
- **isAlchemySupported(chainId)** — Whether Alchemy supports the chain.

```ts
import { getRpcEndpoint, getAlchemyRpcUrl } from '@repo/utils/web3'

const rpc = getRpcEndpoint(1, process.env.ALCHEMY_API_KEY)
const alchemyUrl = getAlchemyRpcUrl(1, apiKey)
```

**Optional:** `zod-validation-error` for richer Zod error messages.
