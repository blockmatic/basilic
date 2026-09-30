export function skipIfNoLanguageModel({
  skip,
}: {
  skip: (reason: string) => void;
}) {
  /* eslint-disable no-restricted-properties -- eval skipIf must not load createEnv */
  if (
    process.env.RUN_JEV_TESTS === "1" &&
    (process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN)
  ) {
    return false;
  }
  /* eslint-enable no-restricted-properties */
  skip("Jev live tests disabled; set RUN_JEV_TESTS=1");
  return true;
}

export const marketsTools = [
  "get_markets",
  "get_asset",
  "get_candles",
  "get_global",
  "get_quote",
  "get_trending",
  "search_assets",
  "watch_asset",
  "unwatch_asset",
  "set_view",
] as const;
