export type OnchainConfig = {
  alchemyApiKey?: string
}

type OnchainConfigState = {
  config: OnchainConfig | null
}

function state(): OnchainConfigState {
  const g = globalThis as { __basilicOnchainConfig?: OnchainConfigState }
  g.__basilicOnchainConfig ??= { config: null }
  return g.__basilicOnchainConfig
}

export function configureOnchain({ alchemyApiKey }: { alchemyApiKey?: string } = {}): void {
  state().config = { alchemyApiKey }
}

export function getOnchainConfig(): OnchainConfig {
  const { config } = state()
  if (!config) throw new Error('configureOnchain() must be called before using onchain')
  return config
}

export function resetOnchainConfig(): void {
  state().config = null
}
