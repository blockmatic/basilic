# @repo/notif

Notification service library for sending notifications across different channels.

## Overview

Provides a unified notification service with support for email notifications and activity creation. Includes type-safe notification schemas and service implementations.

## Exports

- `createNotifications` - Factory function to create notification service (preferred)
- `Notifications` - Class-based service (backward compatibility)
- Notification types and schemas - Type-safe notification payloads
- Notification utilities - Helper functions for notification management

## Usage

### Factory Function (Preferred)

```ts
import { createNotifications } from '@repo/notif'

const notifications = createNotifications()

await notifications.create('login_notification', {
  users: [
    {
      id: 'user-uuid',
      full_name: 'John Doe',
      email: 'john@example.com',
      team_id: 'team-uuid',
    },
  ],
  timestamp: new Date().toISOString(),
  ipAddress: '192.168.1.1',
  location: 'San Francisco, CA',
  device: 'Chrome on Windows',
  userAgent: 'Mozilla/5.0...',
})
```

### Class-Based API (Backward Compatibility)

```ts
import { Notifications } from '@repo/notif'

const service = new Notifications()

await service.create('login_notification', {
  users: [
    {
      id: 'user-uuid',
      full_name: 'John Doe',
      email: 'john@example.com',
      team_id: 'team-uuid',
    },
  ],
  timestamp: new Date().toISOString(),
  ipAddress: '192.168.1.1',
  location: 'San Francisco, CA',
  device: 'Chrome on Windows',
  userAgent: 'Mozilla/5.0...',
})
```

## Available Notification Types

### `login_notification`

Notifies users about login events.

```ts
await notifications.create('login_notification', {
  users: [/* UserData[] */],
  timestamp: new Date().toISOString(),
  ipAddress: '192.168.1.1',
  location: 'San Francisco, CA',
  device: 'Chrome on Windows',
  userAgent: 'Mozilla/5.0...',
})
```

### `transactions_created`

Notifies users about new transactions.

```ts
await notifications.create('transactions_created', {
  users: [/* UserData[] */],
  transactions: [
    {
      id: 'tx-uuid',
      amount: '100.00',
      currency: 'USD',
      status: 'completed',
      // ... other transaction fields
    },
  ],
})
```

## Notification Options

Control email sending and other options:

```ts
await notifications.create('login_notification', {
  // ... notification payload
}, {
  sendEmail: true, // Send emails (default: false)
  priority: 1, // Email priority (Resend feature)
  from: 'custom@example.com', // Override sender
  replyTo: 'support@example.com', // Override reply-to
})
```

## Notification Result

The `create` method returns a result with statistics:

```ts
const result = await notifications.create('login_notification', { /* ... */ })

// result.type - Notification type that was created
// result.activities - Number of activities created
// result.emails.sent - Number of emails successfully sent
// result.emails.skipped - Number of emails skipped
// result.emails.failed - Number of emails that failed
```

## Notification Utilities

### Get All Notification Types

```ts
import { getAllNotificationTypes } from '@repo/notif'

const types = getAllNotificationTypes()
// Returns array of all notification type definitions
```

### Get User Settings Notification Types

```ts
import { getUserSettingsNotificationTypes } from '@repo/notif'

const settingsTypes = getUserSettingsNotificationTypes()
// Returns notification types that should appear in user settings
```

### Get Notification Type by String

```ts
import { getNotificationTypeByType } from '@repo/notif'

const type = getNotificationTypeByType('login_notification')
// Returns notification type definition or undefined
```

### Check if Type Should Show in Settings

```ts
import { shouldShowInSettings } from '@repo/notif'

if (shouldShowInSettings('login_notification')) {
  // Show in user settings UI
}
```

## Exported Types and Schemas

### Types

```ts
import type {
  NotificationHandler,
  UserData,
  EmailInput,
  NotificationOptions,
  NotificationResult,
  TeamContext,
} from '@repo/notif'
```

### Schemas

```ts
import {
  loginNotificationSchema,
  transactionsCreatedSchema,
  userSchema,
  transactionSchema,
  invoiceSchema,
} from '@repo/notif'
```

Use schemas for runtime validation:

```ts
import { loginNotificationSchema } from '@repo/notif'

const result = loginNotificationSchema.parse(payload)
// Validates and returns typed payload
```

## Error Handling

Notifications throw errors on validation failures or service errors:

```ts
try {
  await notifications.create('login_notification', invalidPayload)
} catch (error) {
  if (error instanceof z.ZodError) {
    // Validation error - payload doesn't match schema
    console.error('Validation errors:', error.errors)
  } else {
    // Service error (email sending failure, etc.)
    console.error('Notification error:', error)
  }
}
```

## Scripts

- `pnpm --filter @repo/notif build` - Build package
- `pnpm --filter @repo/notif checktypes` - Type-check

## Dependency Strategy

This package follows the **Service Library** pattern:

- **Bundled Dependencies**: Tightly-coupled dependencies (`zod` for schemas, `nanoid`, `resend`)
- **Peer Dependencies**: Configuration/environment dependencies (`@t3-oss/env-core`) - environment setup is consumer's responsibility
- **Rationale**: Internal schemas should be bundled for simplicity. Environment configuration is consumer's responsibility. Service implementation is self-contained.
