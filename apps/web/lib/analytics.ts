/** Same literals as `signInMethod` on sessions. Do not widen to `string`. */
export type SignInMethod =
  | 'magic_link'
  | 'oauth_google'
  | 'oauth_github'
  | 'oauth_facebook'
  | 'oauth_twitter'
  | 'passkey'
  | 'web3_eip155'
  | 'web3_solana'

export type ProductEvent =
  | { name: 'auth_succeeded'; method: SignInMethod }
  | { name: 'auth_failed'; method: SignInMethod; errorCode: string }
  | {
      name: 'assistant_turn'
      outcome: 'completed' | 'stopped' | 'error'
      accountRender: boolean
    }

/** Instrumented, not collected — no analytics sink. */
export function capture(_event: ProductEvent): void {}
