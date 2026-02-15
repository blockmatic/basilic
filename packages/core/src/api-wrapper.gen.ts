// This file is auto-generated. Do not edit manually.

import * as gen from './gen/index'

export const api = {
healthCheck: gen.healthCheck,
ai: {
  chat: gen.chat,
},
auth: {
  magiclink: {
    request: gen.magiclinkRequest,
    verify: gen.magiclinkVerify,
  },
  session: {
    logout: gen.logout,
    refresh: gen.refresh,
    user: gen.getUser,
  },
  web3: {
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
test: {
  authed: gen.testAuthed,
  magicLink: {
    last: gen.getLastMagicLinkToken,
  },
},
}
