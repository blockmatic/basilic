// This file is auto-generated. Do not edit manually.

export const operationMeta = {
  "healthCheck": {
    "bodyParams": [],
    "description": "Readiness: process is up and the database answers SELECT 1",
    "pathParams": [],
    "summary": "Returns server health status"
  },
  "accountApikeysCreate": {
    "bodyParams": [
      {
        "name": "name"
      }
    ],
    "description": "Create API key (shown once)",
    "pathParams": [],
    "summary": "Create API key"
  },
  "accountApikeysList": {
    "bodyParams": [],
    "description": "List API keys for authenticated user",
    "pathParams": [],
    "summary": "List API keys"
  },
  "accountApikeysRevoke": {
    "bodyParams": [],
    "description": "Revoke API key",
    "pathParams": [
      {
        "name": "id"
      }
    ],
    "summary": "Revoke API key"
  },
  "accountEmailChangeRequest": {
    "bodyParams": [
      {
        "name": "callbackUrl"
      },
      {
        "name": "email"
      }
    ],
    "description": "Request change of email for authenticated user",
    "pathParams": [],
    "summary": "Change email request"
  },
  "accountEmailChangeVerify": {
    "bodyParams": [
      {
        "name": "email"
      },
      {
        "name": "token"
      },
      {
        "name": "verificationId"
      }
    ],
    "description": "Verify change email token (6-digit code) and update user email",
    "pathParams": [],
    "summary": "Change email verify"
  },
  "accountLinkEmailRequest": {
    "bodyParams": [
      {
        "name": "callbackUrl"
      },
      {
        "name": "email"
      }
    ],
    "description": "Request email to link to authenticated user",
    "pathParams": [],
    "summary": "Link email request"
  },
  "accountLinkEmailVerify": {
    "bodyParams": [
      {
        "name": "token"
      }
    ],
    "description": "Verify link email token and update user email",
    "pathParams": [],
    "summary": "Link email verify"
  },
  "accountLinkOauthUnlink": {
    "bodyParams": [],
    "description": "Unlink OAuth provider from authenticated user",
    "pathParams": [
      {
        "name": "providerId"
      }
    ],
    "summary": "OAuth unlink"
  },
  "accountLinkPasskeyDelete": {
    "bodyParams": [],
    "description": "Remove passkey by id",
    "pathParams": [
      {
        "name": "id"
      }
    ],
    "summary": "Remove passkey"
  },
  "accountLinkPasskeyFinish": {
    "bodyParams": [
      {
        "name": "credential"
      },
      {
        "name": "name"
      }
    ],
    "description": "Finish passkey registration, verify and store credential",
    "pathParams": [],
    "summary": "Passkey registration finish"
  },
  "accountLinkPasskeyStart": {
    "bodyParams": [],
    "description": "Start passkey registration, returns options for startRegistration",
    "pathParams": [],
    "summary": "Passkey registration start"
  },
  "accountLinkTotpSetup": {
    "bodyParams": [],
    "description": "Start TOTP setup, returns QR and manual key",
    "pathParams": [],
    "summary": "TOTP setup"
  },
  "accountLinkTotpUnlink": {
    "bodyParams": [],
    "description": "Remove TOTP authenticator",
    "pathParams": [],
    "summary": "TOTP unlink"
  },
  "accountLinkTotpVerify": {
    "bodyParams": [
      {
        "name": "code"
      }
    ],
    "description": "Verify TOTP code and persist authenticator",
    "pathParams": [],
    "summary": "TOTP verify"
  },
  "accountPasskeysList": {
    "bodyParams": [],
    "description": "List passkeys for authenticated user",
    "pathParams": [],
    "summary": "List passkeys"
  },
  "accountProfileUpdate": {
    "bodyParams": [
      {
        "name": "name"
      },
      {
        "name": "username"
      }
    ],
    "description": "Update profile (name, username)",
    "pathParams": [],
    "summary": "Update profile"
  },
  "getAgentById": {
    "bodyParams": [],
    "description": "Get one public eve agent by id. Session required. An API key satisfies Fastify session auth.",
    "pathParams": [
      {
        "name": "agentId"
      }
    ],
    "summary": "Get agent"
  },
  "createAgentToken": {
    "bodyParams": [],
    "description": "Exchange an access JWT or API key for a short-lived eve bearer bound to one public agent. The token has typ=agent, the agent audience, and no refresh token. Open the eve session and attach its stream before it expires. eve rejects a raw bask_ key.",
    "pathParams": [
      {
        "name": "agentId"
      }
    ],
    "summary": "Create agent token"
  },
  "listAgents": {
    "bodyParams": [],
    "description": "List public eve agents. No auth. Endpoints are absolute eve origins. A bask_ key is not an eve access JWT.",
    "pathParams": [],
    "summary": "List agents"
  },
  "enhance": {
    "bodyParams": [
      {
        "name": "prompt"
      }
    ],
    "description": "Rewrite a draft prompt: fix typos and speech-to-text errors, clarify thin drafts. Uses Anthropic via ANTHROPIC_API_KEY. Returns JSON only.",
    "pathParams": [],
    "summary": "Enhance prompt draft"
  },
  "generate": {
    "bodyParams": [
      {
        "name": "model"
      },
      {
        "name": "prompt"
      },
      {
        "name": "stream"
      },
      {
        "name": "temperature"
      }
    ],
    "description": "Generate text from a single prompt (CLI, scripts, pipelines). Uses Anthropic via ANTHROPIC_API_KEY. Returns SSE (text/event-stream) when streaming.",
    "pathParams": [],
    "summary": "Generate text from prompt"
  }
} as const

export const commandSpecs = [
  {
    "operationId": "healthCheck",
    "path": [
      "health-check"
    ]
  },
  {
    "operationId": "accountApikeysCreate",
    "path": [
      "account",
      "apikeys",
      "create"
    ]
  },
  {
    "operationId": "accountApikeysList",
    "path": [
      "account",
      "apikeys",
      "list"
    ]
  },
  {
    "operationId": "accountApikeysRevoke",
    "path": [
      "account",
      "apikeys",
      "id"
    ]
  },
  {
    "operationId": "accountEmailChangeRequest",
    "path": [
      "account",
      "email",
      "change",
      "request"
    ]
  },
  {
    "operationId": "accountEmailChangeVerify",
    "path": [
      "account",
      "email",
      "change",
      "verify"
    ]
  },
  {
    "operationId": "accountLinkEmailRequest",
    "path": [
      "account",
      "link",
      "email",
      "request"
    ]
  },
  {
    "operationId": "accountLinkEmailVerify",
    "path": [
      "account",
      "link",
      "email",
      "verify"
    ]
  },
  {
    "operationId": "accountLinkOauthUnlink",
    "path": [
      "account",
      "link",
      "oauth",
      "provider-id"
    ]
  },
  {
    "operationId": "accountLinkPasskeyDelete",
    "path": [
      "account",
      "link",
      "passkey",
      "id"
    ]
  },
  {
    "operationId": "accountLinkPasskeyFinish",
    "path": [
      "account",
      "link",
      "passkey",
      "finish"
    ]
  },
  {
    "operationId": "accountLinkPasskeyStart",
    "path": [
      "account",
      "link",
      "passkey",
      "start"
    ]
  },
  {
    "operationId": "accountLinkTotpSetup",
    "path": [
      "account",
      "link",
      "totp",
      "setup"
    ]
  },
  {
    "operationId": "accountLinkTotpUnlink",
    "path": [
      "account",
      "link",
      "totp",
      "unlink"
    ]
  },
  {
    "operationId": "accountLinkTotpVerify",
    "path": [
      "account",
      "link",
      "totp",
      "verify"
    ]
  },
  {
    "operationId": "accountPasskeysList",
    "path": [
      "account",
      "passkeys"
    ]
  },
  {
    "operationId": "accountProfileUpdate",
    "path": [
      "account",
      "profile"
    ]
  },
  {
    "operationId": "getAgentById",
    "path": [
      "agents",
      "agent-id",
      "id"
    ]
  },
  {
    "operationId": "createAgentToken",
    "path": [
      "agents",
      "agent-id",
      "token"
    ]
  },
  {
    "operationId": "listAgents",
    "path": [
      "list-agents"
    ]
  },
  {
    "operationId": "enhance",
    "path": [
      "ai",
      "enhance"
    ]
  },
  {
    "operationId": "generate",
    "path": [
      "ai",
      "generate"
    ]
  }
] as const
