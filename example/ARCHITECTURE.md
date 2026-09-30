# Architecture

`apps/web` calls the API through `@repo/core`. Command and chat agents call eve tools, which use `@repo/markets`, `@repo/onchain`, and `@repo/db`. GenUI renders typed tool results. URL state lives in `view-config` and nuqs.

Schema additions (`assets*`, `coin_watches`, wallet tables) sit on the auth tables. Migrations `0000`–`0021` stay in this workspace.

Portless hosts are `tracker.localhost` and its API, agents, and email siblings. Vercel Root Directories are `example/apps/web`, `example/apps/api`, and `example/apps/agents`.

Coin Tracker env: `COINGECKO_DEMO_API_KEY`, `COINS_USE_FIXTURE`, `MARKETS_CACHE_MS`, `ALCHEMY_API_KEY`, `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`, `EVE_CHAT_URL`.
