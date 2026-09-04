import { capture } from './analytics'

// Valid combinations compile.
capture({ name: 'auth_succeeded', method: 'magic_link' })
capture({ name: 'auth_failed', method: 'oauth_google', errorCode: 'oauth_failed_google' })
capture({ name: 'assistant_turn', outcome: 'completed', accountRender: true })

// @ts-expect-error invalid property on auth_succeeded
capture({ name: 'auth_succeeded', method: 'magic_link', errorCode: 'x' })

// @ts-expect-error unknown event name
capture({ name: 'auth_method_selected', method: 'magic_link' })

// @ts-expect-error assistant props on auth event
capture({ name: 'auth_failed', method: 'passkey', errorCode: 'x', accountRender: true })
