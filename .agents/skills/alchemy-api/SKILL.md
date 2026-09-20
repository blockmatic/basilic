---
name: alchemy-api
description: Wire Alchemy Data APIs into server application code with an API key. Use for Portfolio HTTP snapshots, Address Activity webhooks, auth, and compute-unit limits. Not for Alchemy MCP, x402, or gas sponsorship.
license: MIT
compatibility: Requires network access and `$ALCHEMY_API_KEY` environment variable. Works across Claude.ai, Claude Code, Cursor, Codex, and API.
metadata:
  author: alchemyplatform
  version: "2.0"
---
# Alchemy API (with API Key)

Reference and integration guide for wiring Alchemy APIs into application code using a standard API key. This file alone is enough to ship a basic integration; the `references/` directory contains deeper coverage of vendored surfaces.

## Scope

- Applies to: keyed Alchemy HTTP from application servers (Portfolio, optional Address Activity webhook)
- Does NOT cover: hosted Alchemy MCP, x402/MPP gateways, Account Kit gas manager, mainnet send/swap

## Assumptions

- Server env holds `ALCHEMY_API_KEY` (never `EXPO_PUBLIC_` / Next public env)
- Free-tier compute units and rate limits apply; cache snapshots instead of per-ask RPC

## Principles

- Prefer Portfolio HTTP for wallet reads; persist a snapshot, then serve from the database
- Optional Address Activity webhook invalidates that snapshot; do not poll wallets on a 5-minute cron

## Constraints

### MUST

- Keep the key on the API host; skip the feature when the key is unset
- Read vendored `references/` before inventing Portfolio request shapes

### AVOID

- Alchemy MCP as a product surface
- `agentic-gateway` / x402 as the default path when a dashboard key exists
- Gas Manager, bundler, or execution APIs unless the task explicitly asks for them

## Interactions

- Complements [fastify-v5](../fastify-v5/SKILL.md), [viem-v2](../viem-v2/SKILL.md)
- This copy vendors Portfolio, webhook, and ops references only — not the upstream 90-file map

## When to use this skill

Use `alchemy-api` when **all** of the following are true:

- The user is wiring Alchemy into **application code** (server, backend, dApp, worker, script) that runs **outside** the current agent session
- They have, or are willing to create, an Alchemy API key (free at [dashboard.alchemy.com](https://dashboard.alchemy.com/))

This is the **preferred app-integration path** for normal server/backend usage.

## When the key is missing

Skip the Alchemy feature and keep the rest of the app working. Do not install `alchemy-mcp` or `agentic-gateway`. Do not write keys into committed example env files. Put the key in the app's local env using the repo's existing env conventions.

## Mandatory preflight gate

Before writing application code or making any network call:

1. Confirm the user is building **application code** (not asking the agent to run a live dashboard query).
2. Read the host app's env module / `.env.*.example` for the Alchemy key name (often `ALCHEMY_API_KEY`).
3. If the key is unset, skip live Alchemy calls and keep the snapshot/cache path optional.

You MUST NOT call any keyless or public fallback (including `.../v2/demo`) unless the user explicitly asks for that endpoint. No public RPC endpoints (publicnode, llamarpc, cloudflare-eth, etc.) as a fallback.

## Summary

A self-contained guide for AI agents integrating Alchemy APIs using an API key. This file alone should be enough to ship a basic integration. Use the reference files for depth, edge cases, and advanced workflows.

Developers can always create a free API key at [https://dashboard.alchemy.com/](https://dashboard.alchemy.com/).

## Do this first

1. Confirm app-integration scope (see [Mandatory preflight gate](#mandatory-preflight-gate)).
2. Choose the right product using the [Endpoint selector](#endpoint-selector-top-tasks) below.
3. Use the [Base URLs + auth](#base-urls--auth-cheat-sheet) table for the correct endpoint and headers.
4. Copy a [Quickstart example](#one-file-quickstart-copypaste) and test against a testnet first.

## Base URLs + auth (cheat sheet)
| Product | Base URL | Auth | Notes |
| --- | --- | --- | --- |
| Ethereum RPC (HTTPS) | `https://eth-mainnet.g.alchemy.com/v2/$ALCHEMY_API_KEY` | API key in URL | Standard EVM reads and writes. |
| Ethereum RPC (WSS) | `wss://eth-mainnet.g.alchemy.com/v2/$ALCHEMY_API_KEY` | API key in URL | Subscriptions and realtime. |
| Base RPC (HTTPS) | `https://base-mainnet.g.alchemy.com/v2/$ALCHEMY_API_KEY` | API key in URL | EVM L2. |
| Base RPC (WSS) | `wss://base-mainnet.g.alchemy.com/v2/$ALCHEMY_API_KEY` | API key in URL | Subscriptions and realtime. |
| Arbitrum RPC (HTTPS) | `https://arb-mainnet.g.alchemy.com/v2/$ALCHEMY_API_KEY` | API key in URL | EVM L2. |
| Arbitrum RPC (WSS) | `wss://arb-mainnet.g.alchemy.com/v2/$ALCHEMY_API_KEY` | API key in URL | Subscriptions and realtime. |
| BNB RPC (HTTPS) | `https://bnb-mainnet.g.alchemy.com/v2/$ALCHEMY_API_KEY` | API key in URL | EVM L1. |
| BNB RPC (WSS) | `wss://bnb-mainnet.g.alchemy.com/v2/$ALCHEMY_API_KEY` | API key in URL | Subscriptions and realtime. |
| Solana RPC (HTTPS) | `https://solana-mainnet.g.alchemy.com/v2/$ALCHEMY_API_KEY` | API key in URL | Solana JSON-RPC. |
| Solana Yellowstone gRPC | `https://solana-mainnet.g.alchemy.com` | `X-Token: $ALCHEMY_API_KEY` | gRPC streaming (Yellowstone). |
| Sui gRPC | `sui-mainnet.g.alchemy.com:443` | `Authorization: Bearer $ALCHEMY_API_KEY` | Sui gRPC API (objects, txs, balances, streaming). |
| NFT API | `https://<network>.g.alchemy.com/nft/v3/$ALCHEMY_API_KEY` | API key in URL | NFT ownership and metadata. |
| Prices API | `https://api.g.alchemy.com/prices/v1/$ALCHEMY_API_KEY` | API key in URL | Prices by symbol or address. |
| Portfolio API | `https://api.g.alchemy.com/data/v1/$ALCHEMY_API_KEY` | API key in URL | Multi-chain wallet views. |
| Notify API | `https://dashboard.alchemy.com/api` | `X-Alchemy-Token: <ALCHEMY_NOTIFY_AUTH_TOKEN>` | Generate token in dashboard. |

## Endpoint selector (vendored)

| You need | Use this | File |
| --- | --- | --- |
| Portfolio (multi-chain) | `POST /assets/*/by-address` | `references/data-portfolio-apis.md` |
| Portfolio recipe | copy/paste | `references/recipes-get-portfolio.md` |
| Data API overview | Portfolio vs other Data APIs | `references/data-overview.md` |
| Address Activity webhook | Notify | `references/webhooks-address-activity.md` |
| Webhook overview | types and auth | `references/webhooks-overview.md` |
| Auth / keys | API key placement | `references/operational-auth-and-keys.md` |
| Rate limits / CU | Free-tier budgets | `references/operational-rate-limits-and-compute-units.md` |

## One-file quickstart (copy/paste)

> **No API key?** Skip live Alchemy calls. Do not switch to x402 or a demo key.

### EVM JSON-RPC (read)
```bash
curl -s https://eth-mainnet.g.alchemy.com/v2/$ALCHEMY_API_KEY \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"eth_blockNumber","params":[]}'
```

### Token balances
```bash
curl -s https://eth-mainnet.g.alchemy.com/v2/$ALCHEMY_API_KEY \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"alchemy_getTokenBalances","params":["0x00000000219ab540356cbb839cbe05303d7705fa"]}'
```

### Transfer history
```bash
curl -s https://eth-mainnet.g.alchemy.com/v2/$ALCHEMY_API_KEY \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"alchemy_getAssetTransfers","params":[{"fromBlock":"0x0","toBlock":"latest","toAddress":"0x00000000219ab540356cbb839cbe05303d7705fa","category":["erc20"],"withMetadata":true,"maxCount":"0x3e8"}]}'
```

### NFT ownership
```bash
curl -s "https://eth-mainnet.g.alchemy.com/nft/v3/$ALCHEMY_API_KEY/getNFTsForOwner?owner=0x00000000219ab540356cbb839cbe05303d7705fa"
```

### Prices (spot)
```bash
curl -s "https://api.g.alchemy.com/prices/v1/$ALCHEMY_API_KEY/tokens/by-symbol?symbols=ETH&symbols=USDC"
```

### Prices (historical)
```bash
curl -s -X POST "https://api.g.alchemy.com/prices/v1/$ALCHEMY_API_KEY/tokens/historical" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"ETH","startTime":"2024-01-01T00:00:00Z","endTime":"2024-01-02T00:00:00Z"}'
```

### Create Notify webhook
```bash
curl -s -X POST "https://dashboard.alchemy.com/api/create-webhook" \
  -H "Content-Type: application/json" \
  -H "X-Alchemy-Token: $ALCHEMY_NOTIFY_AUTH_TOKEN" \
  -d '{"network":"ETH_MAINNET","webhook_type":"ADDRESS_ACTIVITY","webhook_url":"https://example.com/webhook","addresses":["0x00000000219ab540356cbb839cbe05303d7705fa"]}'
```

### Verify webhook signature (Node)
```ts
import crypto from "crypto";

export function verify(rawBody: string, signature: string, secret: string) {
  const hmac = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature));
}
```

## Network naming rules
- Data APIs and JSON-RPC use lowercase network enums like `eth-mainnet`.
- Notify API uses uppercase enums like `ETH_MAINNET`.

## Pagination + limits (cheat sheet)
| Endpoint | Limit | Notes |
| --- | --- | --- |
| `alchemy_getTokenBalances` | `maxCount` <= 100 | Use `pageKey` for pagination. |
| `alchemy_getAssetTransfers` | `maxCount` default `0x3e8` | Use `pageKey` for pagination. |
| Portfolio token balances | 3 address/network pairs, 20 networks total | `pageKey` supported. |
| Portfolio NFTs | 2 address/network pairs, 15 networks each | `pageKey` supported. |
| Prices by address | 25 addresses, 3 networks | POST body `addresses[]`. |
| Transactions history (beta) | 1 address/network pair, 2 networks | ETH and BASE mainnets only. |

## Common token addresses
| Token | Chain | Address |
| --- | --- | --- |
| ETH | ethereum | `0x0000000000000000000000000000000000000000` |
| WETH | ethereum | `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2` |
| USDC | ethereum | `0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eB48` |
| USDC | base | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |

## Failure modes + retries
- HTTP `429` means rate limit. Use exponential backoff with jitter.
- JSON-RPC errors come in `error` fields even with HTTP 200.
- Use `pageKey` to resume pagination after failures.
- De-dupe websocket events on reconnect.

## Skill map

Vendored references in this copy:

- `references/data-overview.md`
- `references/data-portfolio-apis.md`
- `references/recipes-get-portfolio.md`
- `references/webhooks-overview.md`
- `references/webhooks-address-activity.md`
- `references/operational-auth-and-keys.md`
- `references/operational-rate-limits-and-compute-units.md`

## Handing off to other skills

This copy stays on keyed app HTTP. Do not install `alchemy-mcp` or `agentic-gateway` for default product work. Live dashboard queries stay in the Alchemy UI.

## Troubleshooting

### API key not working
- Verify `$ALCHEMY_API_KEY` is set: `echo $ALCHEMY_API_KEY`
- Confirm the key is valid at [dashboard.alchemy.com](https://dashboard.alchemy.com/)
- Check if allowlists restrict the key to specific IPs/domains (see `references/operational-allowlists.md`)

### HTTP 429 (rate limited)
- Use exponential backoff with jitter before retrying
- Check your compute unit budget in the Alchemy dashboard
- See `references/operational-rate-limits-and-compute-units.md` for limits per plan

### Wrong network slug
- Data APIs and JSON-RPC use lowercase: `eth-mainnet`, `base-mainnet`
- Notify API uses uppercase: `ETH_MAINNET`, `BASE_MAINNET`
- See `references/operational-supported-networks.md` for the full list

### JSON-RPC error with HTTP 200
- Alchemy returns JSON-RPC errors inside the `error` field even with a 200 status code
- Always check `response.error` in addition to HTTP status

## Official links
- [Developer docs](https://www.alchemy.com/docs)
- [Get Started guide](https://www.alchemy.com/docs/get-started)
- [Create a free API key](https://dashboard.alchemy.com/)
