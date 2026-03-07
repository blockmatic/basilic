// This file is auto-generated. Do not edit manually.

import * as gen from './gen/index'

export const api = {
healthCheck: gen.healthCheck,
account: {
  apikeys: {
    create: gen.accountApikeysCreate,
    list: gen.accountApikeysList,
    id: gen.accountApikeysRevoke,
  },
  link: {
    email: {
      request: gen.accountLinkEmailRequest,
      verify: gen.accountLinkEmailVerify,
    },
    passkey: {
      id: gen.accountLinkPasskeyDelete,
      finish: gen.accountLinkPasskeyFinish,
      start: gen.accountLinkPasskeyStart,
    },
    totp: {
      setup: gen.accountLinkTotpSetup,
      unlink: gen.accountLinkTotpUnlink,
      verify: gen.accountLinkTotpVerify,
    },
    wallet: {
      id: gen.accountLinkWalletUnlink,
      verify: gen.accountLinkWalletVerify,
    },
  },
  passkeys: gen.accountPasskeysList,
},
ai: {
  chat: gen.chat,
},
auth: {
  magiclink: {
    request: gen.magiclinkRequest,
    verify: gen.magiclinkVerify,
  },
  oauth: {
    github: {
      authorizeUrl: gen.oauthGithubAuthorizeUrl,
      authorize: gen.oauthGithubAuthorize,
      exchange: gen.oauthGithubExchange,
    },
  },
  passkey: {
    exchange: gen.authPasskeyExchange,
    start: gen.authPasskeyStart,
    verify: gen.authPasskeyVerify,
  },
  session: {
    logout: gen.logout,
    refresh: gen.refresh,
    user: gen.getUser,
  },
  web3: {
    exchange: gen.web3Exchange,
    nonce: gen.web3Nonce,
    eip155: {
      nonce: gen.web3Eip155Nonce,
      verify: gen.web3Eip155Verify,
    },
    solana: {
      nonce: gen.web3SolanaNonce,
      verify: gen.web3SolanaVerify,
    },
  },
},
}
