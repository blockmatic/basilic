// This file is auto-generated. Do not edit manually.

export const operationMeta = {
  "healthCheck": {
    "summary": "Returns server health status",
    "description": "Readiness: process is up and the database answers SELECT 1",
    "pathParams": [],
    "bodyParams": []
  },
  "accountApikeysCreate": {
    "summary": "Create API key",
    "description": "Create API key (shown once)",
    "pathParams": [],
    "bodyParams": [
      {
        "name": "name"
      }
    ]
  },
  "accountApikeysList": {
    "summary": "List API keys",
    "description": "List API keys for authenticated user",
    "pathParams": [],
    "bodyParams": []
  },
  "accountApikeysRevoke": {
    "summary": "Revoke API key",
    "description": "Revoke API key",
    "pathParams": [
      {
        "name": "id"
      }
    ],
    "bodyParams": []
  },
  "accountEmailChangeRequest": {
    "summary": "Change email request",
    "description": "Request change of email for authenticated user",
    "pathParams": [],
    "bodyParams": [
      {
        "name": "email"
      },
      {
        "name": "callbackUrl"
      }
    ]
  },
  "accountEmailChangeVerify": {
    "summary": "Change email verify",
    "description": "Verify change email token (6-digit code) and update user email",
    "pathParams": [],
    "bodyParams": [
      {
        "name": "token"
      },
      {
        "name": "email"
      },
      {
        "name": "verificationId"
      }
    ]
  },
  "accountLinkEmailRequest": {
    "summary": "Link email request",
    "description": "Request email to link to authenticated user",
    "pathParams": [],
    "bodyParams": [
      {
        "name": "email"
      },
      {
        "name": "callbackUrl"
      }
    ]
  },
  "accountLinkEmailVerify": {
    "summary": "Link email verify",
    "description": "Verify link email token and update user email",
    "pathParams": [],
    "bodyParams": [
      {
        "name": "token"
      }
    ]
  },
  "accountLinkOauthUnlink": {
    "summary": "OAuth unlink",
    "description": "Unlink OAuth provider from authenticated user",
    "pathParams": [
      {
        "name": "providerId"
      }
    ],
    "bodyParams": []
  },
  "accountLinkPasskeyDelete": {
    "summary": "Remove passkey",
    "description": "Remove passkey by id",
    "pathParams": [
      {
        "name": "id"
      }
    ],
    "bodyParams": []
  },
  "accountLinkPasskeyFinish": {
    "summary": "Passkey registration finish",
    "description": "Finish passkey registration, verify and store credential",
    "pathParams": [],
    "bodyParams": [
      {
        "name": "credential"
      },
      {
        "name": "name"
      }
    ]
  },
  "accountLinkPasskeyStart": {
    "summary": "Passkey registration start",
    "description": "Start passkey registration, returns options for startRegistration",
    "pathParams": [],
    "bodyParams": []
  },
  "accountLinkTotpSetup": {
    "summary": "TOTP setup",
    "description": "Start TOTP setup, returns QR and manual key",
    "pathParams": [],
    "bodyParams": []
  },
  "accountLinkTotpUnlink": {
    "summary": "TOTP unlink",
    "description": "Remove TOTP authenticator",
    "pathParams": [],
    "bodyParams": []
  },
  "accountLinkTotpVerify": {
    "summary": "TOTP verify",
    "description": "Verify TOTP code and persist authenticator",
    "pathParams": [],
    "bodyParams": [
      {
        "name": "code"
      }
    ]
  },
  "accountLinkWalletUnlink": {
    "summary": "Unlink wallet",
    "description": "Unlink wallet from authenticated user",
    "pathParams": [
      {
        "name": "id"
      }
    ],
    "bodyParams": []
  },
  "accountLinkWalletVerify": {
    "summary": "Link wallet",
    "description": "Link wallet to authenticated user",
    "pathParams": [],
    "bodyParams": [
      {
        "name": "chain"
      },
      {
        "name": "message"
      },
      {
        "name": "signature"
      }
    ]
  },
  "accountPasskeysList": {
    "summary": "List passkeys",
    "description": "List passkeys for authenticated user",
    "pathParams": [],
    "bodyParams": []
  },
  "accountProfileUpdate": {
    "summary": "Update profile",
    "description": "Update profile (name, username)",
    "pathParams": [],
    "bodyParams": [
      {
        "name": "name"
      },
      {
        "name": "username"
      }
    ]
  },
  "chat": {
    "summary": "Generate AI chat response",
    "description": "Chat with AI via Anthropic, Open Router, or Ollama. Set ANTHROPIC_API_KEY, OPEN_ROUTER_API_KEY, or OLLAMA_BASE_URL. Default model configurable via AI_DEFAULT_MODEL. Supports streaming and tools.",
    "pathParams": [],
    "bodyParams": [
      {
        "name": "messages"
      },
      {
        "name": "stream"
      },
      {
        "name": "model"
      },
      {
        "name": "temperature"
      }
    ]
  },
  "generate": {
    "summary": "Generate text from prompt",
    "description": "Generate text from a single prompt (CLI, scripts, pipelines). Uses Anthropic, Open Router, or Ollama. Returns SSE (text/event-stream) when streaming.",
    "pathParams": [],
    "bodyParams": [
      {
        "name": "prompt"
      },
      {
        "name": "stream"
      },
      {
        "name": "model"
      },
      {
        "name": "temperature"
      }
    ]
  }
} as const

export const commandSpecs = [
  {
    "path": [
      "health-check"
    ],
    "operationId": "healthCheck"
  },
  {
    "path": [
      "account",
      "apikeys",
      "create"
    ],
    "operationId": "accountApikeysCreate"
  },
  {
    "path": [
      "account",
      "apikeys",
      "list"
    ],
    "operationId": "accountApikeysList"
  },
  {
    "path": [
      "account",
      "apikeys",
      "id"
    ],
    "operationId": "accountApikeysRevoke"
  },
  {
    "path": [
      "account",
      "email",
      "change",
      "request"
    ],
    "operationId": "accountEmailChangeRequest"
  },
  {
    "path": [
      "account",
      "email",
      "change",
      "verify"
    ],
    "operationId": "accountEmailChangeVerify"
  },
  {
    "path": [
      "account",
      "link",
      "email",
      "request"
    ],
    "operationId": "accountLinkEmailRequest"
  },
  {
    "path": [
      "account",
      "link",
      "email",
      "verify"
    ],
    "operationId": "accountLinkEmailVerify"
  },
  {
    "path": [
      "account",
      "link",
      "oauth",
      "provider-id"
    ],
    "operationId": "accountLinkOauthUnlink"
  },
  {
    "path": [
      "account",
      "link",
      "passkey",
      "id"
    ],
    "operationId": "accountLinkPasskeyDelete"
  },
  {
    "path": [
      "account",
      "link",
      "passkey",
      "finish"
    ],
    "operationId": "accountLinkPasskeyFinish"
  },
  {
    "path": [
      "account",
      "link",
      "passkey",
      "start"
    ],
    "operationId": "accountLinkPasskeyStart"
  },
  {
    "path": [
      "account",
      "link",
      "totp",
      "setup"
    ],
    "operationId": "accountLinkTotpSetup"
  },
  {
    "path": [
      "account",
      "link",
      "totp",
      "unlink"
    ],
    "operationId": "accountLinkTotpUnlink"
  },
  {
    "path": [
      "account",
      "link",
      "totp",
      "verify"
    ],
    "operationId": "accountLinkTotpVerify"
  },
  {
    "path": [
      "account",
      "link",
      "wallet",
      "id"
    ],
    "operationId": "accountLinkWalletUnlink"
  },
  {
    "path": [
      "account",
      "link",
      "wallet",
      "verify"
    ],
    "operationId": "accountLinkWalletVerify"
  },
  {
    "path": [
      "account",
      "passkeys"
    ],
    "operationId": "accountPasskeysList"
  },
  {
    "path": [
      "account",
      "profile"
    ],
    "operationId": "accountProfileUpdate"
  },
  {
    "path": [
      "ai",
      "chat"
    ],
    "operationId": "chat"
  },
  {
    "path": [
      "ai",
      "generate"
    ],
    "operationId": "generate"
  }
] as const
