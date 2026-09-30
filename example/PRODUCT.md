# Coin Tracker

Public market data without login, through CoinGecko and Binance (`@repo/markets`) and `apps/api/src/routes/coins`. Commands call explicit tools and `set_view`: markets, asset, quote, trending, search, candles, global, watches, and signed-in wallet and NFT tools. Chat comments on the board (`get_account_snapshot`, `get_board_context`, `list_watches`) and does not change it.

GenUI: data table, price chart, trending table, metric tile, token table, NFT grid, user info, and auth-required states.

Wallet sign-in (`/auth/web3`), linking (`/account/link/wallet`), and holdings (`/account/wallet`) are separate from email login. An unlinked wallet does not create a user.

This workspace has no mobile app.
