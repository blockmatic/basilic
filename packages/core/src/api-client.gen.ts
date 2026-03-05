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
  AccountLinkWalletUnlinkData,
  AccountLinkWalletUnlinkResponse,
  AccountLinkWalletVerifyData,
  AccountLinkWalletVerifyResponse,
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
  OauthGithubAuthorizeData,
  OauthGithubAuthorizeUrlData,
  OauthGithubAuthorizeUrlResponse,
  OauthGithubExchangeData,
  OauthGithubExchangeResponse,
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
      wallet: {
        id: (opts: Options<AccountLinkWalletUnlinkData>) => Promise<AccountLinkWalletUnlinkResponse>;
        verify: (opts: Options<AccountLinkWalletVerifyData>) => Promise<AccountLinkWalletVerifyResponse>
      }
    }
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
      github: {
        authorizeUrl: (opts?: Options<OauthGithubAuthorizeUrlData>) => Promise<OauthGithubAuthorizeUrlResponse>;
        authorize: (opts?: Options<OauthGithubAuthorizeData>) => Promise<unknown>;
        exchange: (opts: Options<OauthGithubExchangeData>) => Promise<OauthGithubExchangeResponse>
      }
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
