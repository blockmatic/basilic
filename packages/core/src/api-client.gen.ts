// This file is auto-generated. Do not edit manually.

import type { Options } from './gen/index'
import type {
  AccountApikeysCreateData,
  AccountApikeysCreateResponse,
  AccountApikeysListData,
  AccountApikeysListResponse,
  AccountApikeysRevokeData,
  AccountApikeysRevokeResponse,
  AccountLinkEmailRequestData,
  AccountLinkEmailRequestResponse,
  AccountLinkEmailVerifyData,
  AccountLinkEmailVerifyResponse,
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
  AccountLinkWalletUnlinkData,
  AccountLinkWalletUnlinkResponse,
  AccountLinkWalletVerifyData,
  AccountLinkWalletVerifyResponse,
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
  ChatData,
  ChatResponse,
  GetUserData,
  GetUserResponse,
  HealthCheckData,
  HealthCheckResponse,
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
  OauthGithubAuthorizeData,
  OauthGithubAuthorizeUrlData,
  OauthGithubAuthorizeUrlResponse,
  OauthGithubExchangeData,
  OauthGithubExchangeResponse,
  OauthGoogleVerifyIdTokenData,
  OauthGoogleVerifyIdTokenResponse,
  OauthProvidersData,
  OauthProvidersResponse,
  OauthTwitterAuthorizeUrlData,
  OauthTwitterAuthorizeUrlResponse,
  OauthTwitterExchangeData,
  OauthTwitterExchangeResponse,
  RefreshData,
  RefreshResponse,
  Web3Eip155NonceData,
  Web3Eip155NonceResponse,
  Web3Eip155VerifyData,
  Web3Eip155VerifyResponse,
  Web3ExchangeData,
  Web3ExchangeResponse,
  Web3NonceData,
  Web3NonceResponse,
  Web3SolanaNonceData,
  Web3SolanaNonceResponse,
  Web3SolanaVerifyData,
  Web3SolanaVerifyResponse,
} from './gen/types.gen'

export type CoreApiClient = {
  healthCheck: (opts?: Options<HealthCheckData>) => Promise<HealthCheckResponse>;
  account: {
    apikeys: {
      create: (opts: Options<AccountApikeysCreateData>) => Promise<AccountApikeysCreateResponse>;
      list: (opts?: Options<AccountApikeysListData>) => Promise<AccountApikeysListResponse>;
      id: (opts: Options<AccountApikeysRevokeData>) => Promise<AccountApikeysRevokeResponse>
    };
    link: {
      email: {
        request: (opts: Options<AccountLinkEmailRequestData>) => Promise<AccountLinkEmailRequestResponse>;
        verify: (opts: Options<AccountLinkEmailVerifyData>) => Promise<AccountLinkEmailVerifyResponse>
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
      };
      wallet: {
        id: (opts: Options<AccountLinkWalletUnlinkData>) => Promise<AccountLinkWalletUnlinkResponse>;
        verify: (opts: Options<AccountLinkWalletVerifyData>) => Promise<AccountLinkWalletVerifyResponse>
      }
    };
    passkeys: (opts?: Options<AccountPasskeysListData>) => Promise<AccountPasskeysListResponse>;
    profile: (opts: Options<AccountProfileUpdateData>) => Promise<AccountProfileUpdateResponse>
  };
  ai: {
    chat: (opts: Options<ChatData>) => Promise<ChatResponse>
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
        exchange: (opts: Options<OauthFacebookExchangeData>) => Promise<OauthFacebookExchangeResponse>
      };
      github: {
        authorizeUrl: (opts?: Options<OauthGithubAuthorizeUrlData>) => Promise<OauthGithubAuthorizeUrlResponse>;
        authorize: (opts?: Options<OauthGithubAuthorizeData>) => Promise<unknown>;
        exchange: (opts: Options<OauthGithubExchangeData>) => Promise<OauthGithubExchangeResponse>
      };
      google: {
        verifyIdToken: (opts: Options<OauthGoogleVerifyIdTokenData>) => Promise<OauthGoogleVerifyIdTokenResponse>
      };
      twitter: {
        authorizeUrl: (opts?: Options<OauthTwitterAuthorizeUrlData>) => Promise<OauthTwitterAuthorizeUrlResponse>;
        exchange: (opts: Options<OauthTwitterExchangeData>) => Promise<OauthTwitterExchangeResponse>
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
      user: (opts?: Options<GetUserData>) => Promise<GetUserResponse>
    };
    web3: {
      exchange: (opts: Options<Web3ExchangeData>) => Promise<Web3ExchangeResponse>;
      nonce: (opts: Options<Web3NonceData>) => Promise<Web3NonceResponse>;
      eip155: {
        nonce: (opts: Options<Web3Eip155NonceData>) => Promise<Web3Eip155NonceResponse>;
        verify: (opts: Options<Web3Eip155VerifyData>) => Promise<Web3Eip155VerifyResponse>
      };
      solana: {
        nonce: (opts: Options<Web3SolanaNonceData>) => Promise<Web3SolanaNonceResponse>;
        verify: (opts: Options<Web3SolanaVerifyData>) => Promise<Web3SolanaVerifyResponse>
      }
    }
  }
}
