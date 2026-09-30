// This file is auto-generated. Do not edit manually.

export const operationMeta = {
  "healthCheck": {
    "bodyParams": [],
    "description": "Readiness: process is up and the database answers SELECT 1",
    "pathParams": [],
    "summary": "Returns server health status"
  },
  "accountApikeysCreate": {
    "bodyParams": [
      {
        "name": "name"
      }
    ],
    "description": "Create API key (shown once)",
    "pathParams": [],
    "summary": "Create API key"
  },
  "accountApikeysList": {
    "bodyParams": [],
    "description": "List API keys for authenticated user",
    "pathParams": [],
    "summary": "List API keys"
  },
  "accountApikeysRevoke": {
    "bodyParams": [],
    "description": "Revoke API key",
    "pathParams": [
      {
        "name": "id"
      }
    ],
    "summary": "Revoke API key"
  },
  "accountEmailChangeRequest": {
    "bodyParams": [
      {
        "name": "callbackUrl"
      },
      {
        "name": "email"
      }
    ],
    "description": "Request change of email for authenticated user",
    "pathParams": [],
    "summary": "Change email request"
  },
  "accountEmailChangeVerify": {
    "bodyParams": [
      {
        "name": "email"
      },
      {
        "name": "token"
      },
      {
        "name": "verificationId"
      }
    ],
    "description": "Verify change email token (6-digit code) and update user email",
    "pathParams": [],
    "summary": "Change email verify"
  },
  "accountLinkEmailRequest": {
    "bodyParams": [
      {
        "name": "callbackUrl"
      },
      {
        "name": "email"
      }
    ],
    "description": "Request email to link to authenticated user",
    "pathParams": [],
    "summary": "Link email request"
  },
  "accountLinkEmailVerify": {
    "bodyParams": [
      {
        "name": "token"
      }
    ],
    "description": "Verify link email token and update user email",
    "pathParams": [],
    "summary": "Link email verify"
  },
  "accountLinkOauthUnlink": {
    "bodyParams": [],
    "description": "Unlink OAuth provider from authenticated user",
    "pathParams": [
      {
        "name": "providerId"
      }
    ],
    "summary": "OAuth unlink"
  },
  "accountLinkPasskeyDelete": {
    "bodyParams": [],
    "description": "Remove passkey by id",
    "pathParams": [
      {
        "name": "id"
      }
    ],
    "summary": "Remove passkey"
  },
  "accountLinkPasskeyFinish": {
    "bodyParams": [
      {
        "name": "credential"
      },
      {
        "name": "name"
      }
    ],
    "description": "Finish passkey registration, verify and store credential",
    "pathParams": [],
    "summary": "Passkey registration finish"
  },
  "accountLinkPasskeyStart": {
    "bodyParams": [],
    "description": "Start passkey registration, returns options for startRegistration",
    "pathParams": [],
    "summary": "Passkey registration start"
  },
  "accountLinkTotpSetup": {
    "bodyParams": [],
    "description": "Start TOTP setup, returns QR and manual key",
    "pathParams": [],
    "summary": "TOTP setup"
  },
  "accountLinkTotpUnlink": {
    "bodyParams": [],
    "description": "Remove TOTP authenticator",
    "pathParams": [],
    "summary": "TOTP unlink"
  },
  "accountLinkTotpVerify": {
    "bodyParams": [
      {
        "name": "code"
      }
    ],
    "description": "Verify TOTP code and persist authenticator",
    "pathParams": [],
    "summary": "TOTP verify"
  },
  "accountLinkWalletUnlink": {
    "bodyParams": [],
    "description": "Unlink wallet from authenticated user",
    "pathParams": [
      {
        "name": "id"
      }
    ],
    "summary": "Unlink wallet"
  },
  "accountLinkWalletVerify": {
    "bodyParams": [
      {
        "name": "chain"
      },
      {
        "name": "domain"
      },
      {
        "name": "message"
      },
      {
        "name": "signature"
      }
    ],
    "description": "Link wallet to authenticated user",
    "pathParams": [],
    "summary": "Link wallet"
  },
  "accountPasskeysList": {
    "bodyParams": [],
    "description": "List passkeys for authenticated user",
    "pathParams": [],
    "summary": "List passkeys"
  },
  "accountProfileUpdate": {
    "bodyParams": [
      {
        "name": "name"
      },
      {
        "name": "username"
      }
    ],
    "description": "Update profile (name, username)",
    "pathParams": [],
    "summary": "Update profile"
  },
  "accountWalletGet": {
    "bodyParams": [],
    "description": "Live Alchemy Portfolio for the access JWT user linked eip155 address. Empty when unlinked or key unset.",
    "pathParams": [],
    "summary": "Get linked wallet holdings"
  },
  "getAgentById": {
    "bodyParams": [],
    "description": "Get one product eve agent by id (command or chat). JWT required.",
    "pathParams": [
      {
        "name": "agentId"
      }
    ],
    "summary": "Get agent"
  },
  "listAgents": {
    "bodyParams": [],
    "description": "List product eve agents (command, chat). Public host discovery. Endpoints are absolute eve origins.",
    "pathParams": [],
    "summary": "List agents"
  },
  "generate": {
    "bodyParams": [
      {
        "name": "model"
      },
      {
        "name": "prompt"
      },
      {
        "name": "stream"
      },
      {
        "name": "temperature"
      }
    ],
    "description": "Generate text from a single prompt (CLI, scripts, pipelines). Uses Vercel AI Gateway. Returns SSE (text/event-stream) when streaming.",
    "pathParams": [],
    "summary": "Generate text from prompt"
  },
  "listCoins": {
    "bodyParams": [],
    "description": "List cached CoinGecko markets joined to identity assets, optionally filtered by SearchQuery querystring. Seeds identity when the registry is empty. Vendor failure returns fixture quotes. Arrays are comma-separated (symbols=eth,sol). Public except universe=watchlist, which needs a session JWT.",
    "pathParams": [],
    "summary": "List coins"
  },
  "queryCoins": {
    "bodyParams": [
      {
        "name": "highlight"
      },
      {
        "name": "maxChangePct"
      },
      {
        "name": "maxPrice"
      },
      {
        "name": "minChangePct"
      },
      {
        "name": "minPrice"
      },
      {
        "name": "sortBy"
      },
      {
        "name": "sortDir"
      },
      {
        "name": "symbols"
      },
      {
        "name": "text"
      },
      {
        "name": "topN"
      },
      {
        "name": "universe"
      }
    ],
    "description": "Apply a SearchQuery body to the cached CoinGecko markets list. Same filters as GET /coins querystring. Watchlist uses the access JWT sub. Public except universe=watchlist. Vendor failure returns fixture quotes.",
    "pathParams": [],
    "summary": "Query coins"
  },
  "getCoinCandles": {
    "bodyParams": [],
    "description": "Public Binance klines for an identity asset id, mapped from asset_markets. Unmapped assets and vendor failure return empty fixture candles (HTTP 200). period maps to interval plus range; 7d is 1h × 7d, not a kline interval.",
    "pathParams": [
      {
        "name": "assetId"
      }
    ],
    "summary": "Get coin candles"
  },
  "getCoinGlobal": {
    "bodyParams": [],
    "description": "Cached CoinGecko global market stats (total cap, volume, BTC dominance). Vendor failure returns fixture stats (HTTP 200). Public.",
    "pathParams": [],
    "summary": "Get global market stats"
  },
  "getCoinTrending": {
    "bodyParams": [],
    "description": "Cached CoinGecko trending coins. Vendor failure returns fixture trending (HTTP 200). Public.",
    "pathParams": [],
    "summary": "Get trending coins"
  },
  "deleteCoinWatchById": {
    "bodyParams": [],
    "description": "Remove an asset id from the access JWT user watchlist. Missing rows still return 204.",
    "pathParams": [
      {
        "name": "assetId"
      }
    ],
    "summary": "Unwatch a coin"
  },
  "putCoinWatch": {
    "bodyParams": [],
    "description": "Watch an identity asset id for the access JWT user. Idempotent. Unknown asset is 404. Cap 20 is 409 WATCHLIST_FULL.",
    "pathParams": [
      {
        "name": "assetId"
      }
    ],
    "summary": "Watch a coin"
  },
  "listCoinWatches": {
    "bodyParams": [],
    "description": "List the access JWT user watchlist keyed by asset id. Empty list is []. Cap 20 is enforced on PUT.",
    "pathParams": [],
    "summary": "List coin watches"
  }
} as const

export const commandSpecs = [
  {
    "operationId": "healthCheck",
    "path": [
      "health-check"
    ]
  },
  {
    "operationId": "accountApikeysCreate",
    "path": [
      "account",
      "apikeys",
      "create"
    ]
  },
  {
    "operationId": "accountApikeysList",
    "path": [
      "account",
      "apikeys",
      "list"
    ]
  },
  {
    "operationId": "accountApikeysRevoke",
    "path": [
      "account",
      "apikeys",
      "id"
    ]
  },
  {
    "operationId": "accountEmailChangeRequest",
    "path": [
      "account",
      "email",
      "change",
      "request"
    ]
  },
  {
    "operationId": "accountEmailChangeVerify",
    "path": [
      "account",
      "email",
      "change",
      "verify"
    ]
  },
  {
    "operationId": "accountLinkEmailRequest",
    "path": [
      "account",
      "link",
      "email",
      "request"
    ]
  },
  {
    "operationId": "accountLinkEmailVerify",
    "path": [
      "account",
      "link",
      "email",
      "verify"
    ]
  },
  {
    "operationId": "accountLinkOauthUnlink",
    "path": [
      "account",
      "link",
      "oauth",
      "provider-id"
    ]
  },
  {
    "operationId": "accountLinkPasskeyDelete",
    "path": [
      "account",
      "link",
      "passkey",
      "id"
    ]
  },
  {
    "operationId": "accountLinkPasskeyFinish",
    "path": [
      "account",
      "link",
      "passkey",
      "finish"
    ]
  },
  {
    "operationId": "accountLinkPasskeyStart",
    "path": [
      "account",
      "link",
      "passkey",
      "start"
    ]
  },
  {
    "operationId": "accountLinkTotpSetup",
    "path": [
      "account",
      "link",
      "totp",
      "setup"
    ]
  },
  {
    "operationId": "accountLinkTotpUnlink",
    "path": [
      "account",
      "link",
      "totp",
      "unlink"
    ]
  },
  {
    "operationId": "accountLinkTotpVerify",
    "path": [
      "account",
      "link",
      "totp",
      "verify"
    ]
  },
  {
    "operationId": "accountLinkWalletUnlink",
    "path": [
      "account",
      "link",
      "wallet",
      "id"
    ]
  },
  {
    "operationId": "accountLinkWalletVerify",
    "path": [
      "account",
      "link",
      "wallet",
      "verify"
    ]
  },
  {
    "operationId": "accountPasskeysList",
    "path": [
      "account",
      "passkeys"
    ]
  },
  {
    "operationId": "accountProfileUpdate",
    "path": [
      "account",
      "profile"
    ]
  },
  {
    "operationId": "accountWalletGet",
    "path": [
      "account",
      "wallet"
    ]
  },
  {
    "operationId": "getAgentById",
    "path": [
      "agents",
      "agent-id"
    ]
  },
  {
    "operationId": "listAgents",
    "path": [
      "list-agents"
    ]
  },
  {
    "operationId": "generate",
    "path": [
      "ai",
      "generate"
    ]
  },
  {
    "operationId": "listCoins",
    "path": [
      "list-coins"
    ]
  },
  {
    "operationId": "queryCoins",
    "path": [
      "coins",
      "query"
    ]
  },
  {
    "operationId": "getCoinCandles",
    "path": [
      "coins",
      "asset-id",
      "candles"
    ]
  },
  {
    "operationId": "getCoinGlobal",
    "path": [
      "coins",
      "global"
    ]
  },
  {
    "operationId": "getCoinTrending",
    "path": [
      "coins",
      "trending"
    ]
  },
  {
    "operationId": "deleteCoinWatchById",
    "path": [
      "coins",
      "watches",
      "asset-id",
      "id"
    ]
  },
  {
    "operationId": "putCoinWatch",
    "path": [
      "coins",
      "watches",
      "asset-id",
      "watch"
    ]
  },
  {
    "operationId": "listCoinWatches",
    "path": [
      "coins",
      "watches",
      "watches"
    ]
  }
] as const
