export function skipIfNoLanguageModel({ skip }: { skip: (reason: string) => void }) {
  /* eslint-disable no-restricted-properties -- eval skipIf must not load createEnv */
  if (process.env.AI_GATEWAY_API_KEY) return false
  /* eslint-enable no-restricted-properties */
  skip('no chat language model')
  return true
}

export const marketsTools = [
  'get_markets',
  'get_asset',
  'get_candles',
  'get_global',
  'get_quote',
  'get_trending',
  'search_assets',
  'watch_asset',
  'unwatch_asset',
  'set_view',
] as const
