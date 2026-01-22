# @repo/notif

Notification service library for sending notifications across different channels.

## Overview

Provides a unified notification service with support for email notifications. Includes type-safe notification schemas and service implementations.

## Usage

```ts
import { NotificationService } from '@repo/notif'

const service = new NotificationService({
  email: {
    apiKey: process.env.RESEND_API_KEY,
  },
})

await service.send({
  type: 'invoice-paid',
  data: {
    invoiceId: 'inv_123',
    amount: 1000,
  },
})
```

## Dependency Strategy

This package follows the **Service Library** pattern:

- **Bundled Dependencies**: Tightly-coupled dependencies (`zod` for schemas, `nanoid`, `resend`)
- **Peer Dependencies**: Configuration/environment dependencies (`@t3-oss/env-core`) - environment setup is consumer's responsibility
- **Rationale**: Internal schemas should be bundled for simplicity. Environment configuration is consumer's responsibility. Service implementation is self-contained.
