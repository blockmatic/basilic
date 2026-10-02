// This file is auto-generated. Do not edit manually.

import type { Options } from './gen/index'
import type {
  AccountApikeysCreateData,
  AccountApikeysCreateResponse,
  AccountApikeysListData,
  AccountApikeysListResponse,
  AccountApikeysRevokeData,
  AccountApikeysRevokeResponse,
  AccountEmailChangeRequestData,
  AccountEmailChangeRequestResponse,
  AccountEmailChangeVerifyData,
  AccountEmailChangeVerifyResponse,
  AccountLinkEmailRequestData,
  AccountLinkEmailRequestResponse,
  AccountLinkEmailVerifyData,
  AccountLinkEmailVerifyResponse,
  AccountLinkOauthUnlinkData,
  AccountLinkOauthUnlinkResponse,
  AccountLinkPasskeyDeleteData,
  AccountLinkPasskeyDeleteResponse,
  AccountLinkPasskeyFinishData,
  AccountLinkPasskeyFinishResponse,
  AccountLinkPasskeyStartData,
  AccountLinkPasskeyStartResponse,
  AccountLinkTotpSetupData,
  AccountLinkTotpSetupResponse,
  AccountLinkTotpUnlinkData,
  AccountLinkTotpUnlinkResponse,
  AccountLinkTotpVerifyData,
  AccountLinkTotpVerifyResponse,
  AccountPasskeysListData,
  AccountPasskeysListResponse,
  AccountProfileUpdateData,
  AccountProfileUpdateResponse,
  AuthPasskeyExchangeData,
  AuthPasskeyExchangeResponse,
  AuthPasskeyResolveUserData,
  AuthPasskeyResolveUserResponse,
  AuthPasskeyStartData,
  AuthPasskeyStartResponse,
  AuthPasskeyVerifyData,
  AuthPasskeyVerifyResponse,
  AuthSessionsDeleteData,
  AuthSessionsDeleteResponse,
  AuthSessionsListData,
  AuthSessionsListResponse,
  AuthSessionsRevokeData,
  AuthSessionsRevokeResponse,
  CreateAgentTokenData,
  CreateAgentTokenResponse,
  GenerateData,
  GenerateResponse,
  GetAgentByIdData,
  GetAgentByIdResponse,
  GetUserData,
  GetUserResponse,
  HealthCheckData,
  HealthCheckResponse,
  ListAgentsData,
  ListAgentsResponse,
  LogoutData,
  LogoutResponse,
  MagiclinkRequestData,
  MagiclinkRequestResponse,
  MagiclinkVerifyData,
  MagiclinkVerifyResponse,
  OauthFacebookAuthorizeUrlData,
  OauthFacebookAuthorizeUrlResponse,
  OauthFacebookExchangeData,
  OauthFacebookExchangeResponse,
  OauthFacebookLinkAuthorizeUrlData,
  OauthFacebookLinkAuthorizeUrlResponse,
  OauthGithubAuthorizeUrlData,
  OauthGithubAuthorizeUrlResponse,
  OauthGithubExchangeData,
  OauthGithubExchangeResponse,
  OauthGithubLinkAuthorizeUrlData,
  OauthGithubLinkAuthorizeUrlResponse,
  OauthGoogleAuthorizeUrlData,
  OauthGoogleAuthorizeUrlResponse,
  OauthGoogleExchangeData,
  OauthGoogleExchangeResponse,
  OauthGoogleLinkAuthorizeUrlData,
  OauthGoogleLinkAuthorizeUrlResponse,
  OauthGoogleVerifyIdTokenData,
  OauthGoogleVerifyIdTokenResponse,
  OauthProvidersData,
  OauthProvidersResponse,
  OauthTwitterAuthorizeUrlData,
  OauthTwitterAuthorizeUrlResponse,
  OauthTwitterExchangeData,
  OauthTwitterExchangeResponse,
  OauthTwitterLinkAuthorizeUrlData,
  OauthTwitterLinkAuthorizeUrlResponse,
  RefreshData,
  RefreshResponse,
  ValidateTokensData,
  ValidateTokensResponse,
} from './gen/types.gen'

export type CoreApiClient = {
  healthCheck: (opts?: Options<HealthCheckData>) => Promise<HealthCheckResponse>;
  account: {
    apikeys: {
      create: (opts: Options<AccountApikeysCreateData>) => Promise<AccountApikeysCreateResponse>;
      list: (opts?: Options<AccountApikeysListData>) => Promise<AccountApikeysListResponse>;
      id: (opts: Options<AccountApikeysRevokeData>) => Promise<AccountApikeysRevokeResponse>
    };
    email: {
      change: {
        request: (opts: Options<AccountEmailChangeRequestData>) => Promise<AccountEmailChangeRequestResponse>;
        verify: (opts: Options<AccountEmailChangeVerifyData>) => Promise<AccountEmailChangeVerifyResponse>
      }
    };
    link: {
      email: {
        request: (opts: Options<AccountLinkEmailRequestData>) => Promise<AccountLinkEmailRequestResponse>;
        verify: (opts: Options<AccountLinkEmailVerifyData>) => Promise<AccountLinkEmailVerifyResponse>
      };
      oauth: {
        providerId: (opts: Options<AccountLinkOauthUnlinkData>) => Promise<AccountLinkOauthUnlinkResponse>
      };
      passkey: {
        id: (opts: Options<AccountLinkPasskeyDeleteData>) => Promise<AccountLinkPasskeyDeleteResponse>;
        finish: (opts: Options<AccountLinkPasskeyFinishData>) => Promise<AccountLinkPasskeyFinishResponse>;
        start: (opts?: Options<AccountLinkPasskeyStartData>) => Promise<AccountLinkPasskeyStartResponse>
      };
      totp: {
        setup: (opts?: Options<AccountLinkTotpSetupData>) => Promise<AccountLinkTotpSetupResponse>;
        unlink: (opts?: Options<AccountLinkTotpUnlinkData>) => Promise<AccountLinkTotpUnlinkResponse>;
        verify: (opts: Options<AccountLinkTotpVerifyData>) => Promise<AccountLinkTotpVerifyResponse>
      }
    };
    passkeys: (opts?: Options<AccountPasskeysListData>) => Promise<AccountPasskeysListResponse>;
    profile: (opts: Options<AccountProfileUpdateData>) => Promise<AccountProfileUpdateResponse>
  };
  agents: {
    agentId: {
      id: (opts: Options<GetAgentByIdData>) => Promise<GetAgentByIdResponse>;
      token: (opts: Options<CreateAgentTokenData>) => Promise<CreateAgentTokenResponse>
    }
  };
  listAgents: (opts?: Options<ListAgentsData>) => Promise<ListAgentsResponse>;
  ai: {
    generate: (opts: Options<GenerateData>) => Promise<GenerateResponse>
  };
  auth: {
    magiclink: {
      request: (opts: Options<MagiclinkRequestData>) => Promise<MagiclinkRequestResponse>;
      verify: (opts: Options<MagiclinkVerifyData>) => Promise<MagiclinkVerifyResponse>
    };
    oauth: {
      providers: (opts?: Options<OauthProvidersData>) => Promise<OauthProvidersResponse>;
      facebook: {
        authorizeUrl: (opts?: Options<OauthFacebookAuthorizeUrlData>) => Promise<OauthFacebookAuthorizeUrlResponse>;
        exchange: (opts: Options<OauthFacebookExchangeData>) => Promise<OauthFacebookExchangeResponse>;
        linkAuthorizeUrl: (opts?: Options<OauthFacebookLinkAuthorizeUrlData>) => Promise<OauthFacebookLinkAuthorizeUrlResponse>
      };
      github: {
        authorizeUrl: (opts?: Options<OauthGithubAuthorizeUrlData>) => Promise<OauthGithubAuthorizeUrlResponse>;
        exchange: (opts: Options<OauthGithubExchangeData>) => Promise<OauthGithubExchangeResponse>;
        linkAuthorizeUrl: (opts?: Options<OauthGithubLinkAuthorizeUrlData>) => Promise<OauthGithubLinkAuthorizeUrlResponse>
      };
      google: {
        authorizeUrl: (opts?: Options<OauthGoogleAuthorizeUrlData>) => Promise<OauthGoogleAuthorizeUrlResponse>;
        exchange: (opts: Options<OauthGoogleExchangeData>) => Promise<OauthGoogleExchangeResponse>;
        linkAuthorizeUrl: (opts?: Options<OauthGoogleLinkAuthorizeUrlData>) => Promise<OauthGoogleLinkAuthorizeUrlResponse>;
        verifyIdToken: (opts: Options<OauthGoogleVerifyIdTokenData>) => Promise<OauthGoogleVerifyIdTokenResponse>
      };
      twitter: {
        authorizeUrl: (opts?: Options<OauthTwitterAuthorizeUrlData>) => Promise<OauthTwitterAuthorizeUrlResponse>;
        exchange: (opts: Options<OauthTwitterExchangeData>) => Promise<OauthTwitterExchangeResponse>;
        linkAuthorizeUrl: (opts?: Options<OauthTwitterLinkAuthorizeUrlData>) => Promise<OauthTwitterLinkAuthorizeUrlResponse>
      }
    };
    passkey: {
      exchange: (opts: Options<AuthPasskeyExchangeData>) => Promise<AuthPasskeyExchangeResponse>;
      resolveUser: (opts: Options<AuthPasskeyResolveUserData>) => Promise<AuthPasskeyResolveUserResponse>;
      start: (opts?: Options<AuthPasskeyStartData>) => Promise<AuthPasskeyStartResponse>;
      verify: (opts: Options<AuthPasskeyVerifyData>) => Promise<AuthPasskeyVerifyResponse>
    };
    session: {
      logout: (opts?: Options<LogoutData>) => Promise<LogoutResponse>;
      refresh: (opts: Options<RefreshData>) => Promise<RefreshResponse>;
      user: (opts?: Options<GetUserData>) => Promise<GetUserResponse>;
      validateTokens: (opts: Options<ValidateTokensData>) => Promise<ValidateTokensResponse>
    };
    sessions: {
      id: (opts: Options<AuthSessionsDeleteData>) => Promise<AuthSessionsDeleteResponse>;
      list: (opts?: Options<AuthSessionsListData>) => Promise<AuthSessionsListResponse>;
      revoke: (opts: Options<AuthSessionsRevokeData>) => Promise<AuthSessionsRevokeResponse>
    }
  }
}
