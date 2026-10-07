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
  email: {
    change: {
      request: gen.accountEmailChangeRequest,
      verify: gen.accountEmailChangeVerify,
    },
  },
  link: {
    email: {
      request: gen.accountLinkEmailRequest,
      verify: gen.accountLinkEmailVerify,
    },
    oauth: {
      providerId: gen.accountLinkOauthUnlink,
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
  },
  passkeys: gen.accountPasskeysList,
  profile: gen.accountProfileUpdate,
},
agents: {
  agentId: {
    id: gen.getAgentById,
    token: gen.createAgentToken,
  },
},
listAgents: gen.listAgents,
ai: {
  enhance: gen.enhance,
  generate: gen.generate,
},
auth: {
  magiclink: {
    request: gen.magiclinkRequest,
    verify: gen.magiclinkVerify,
  },
  oauth: {
    providers: gen.oauthProviders,
    facebook: {
      authorizeUrl: gen.oauthFacebookAuthorizeUrl,
      exchange: gen.oauthFacebookExchange,
      linkAuthorizeUrl: gen.oauthFacebookLinkAuthorizeUrl,
    },
    github: {
      authorizeUrl: gen.oauthGithubAuthorizeUrl,
      exchange: gen.oauthGithubExchange,
      linkAuthorizeUrl: gen.oauthGithubLinkAuthorizeUrl,
    },
    google: {
      authorizeUrl: gen.oauthGoogleAuthorizeUrl,
      exchange: gen.oauthGoogleExchange,
      linkAuthorizeUrl: gen.oauthGoogleLinkAuthorizeUrl,
      verifyIdToken: gen.oauthGoogleVerifyIdToken,
    },
    twitter: {
      authorizeUrl: gen.oauthTwitterAuthorizeUrl,
      exchange: gen.oauthTwitterExchange,
      linkAuthorizeUrl: gen.oauthTwitterLinkAuthorizeUrl,
    },
  },
  passkey: {
    exchange: gen.authPasskeyExchange,
    resolveUser: gen.authPasskeyResolveUser,
    start: gen.authPasskeyStart,
    verify: gen.authPasskeyVerify,
  },
  session: {
    logout: gen.logout,
    refresh: gen.refresh,
    user: gen.getUser,
    validateTokens: gen.validateTokens,
  },
  sessions: {
    id: gen.authSessionsDelete,
    list: gen.authSessionsList,
    revoke: gen.authSessionsRevoke,
  },
},
}
