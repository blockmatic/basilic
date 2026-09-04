# @repo/email

Email template library built with React Email.

## Overview

Pre-configured email templates using React Email components. Templates are fully typed and can be rendered to HTML strings for sending via email services.

## Exports

- `@repo/email/emails/*` - Email template components
- `@repo/email/render` - Server-only render function to convert components to HTML

## Available Email Templates

### `WelcomeEmail`

Welcome email for new users.

```tsx
import { WelcomeEmail } from '@repo/email/emails/welcome'
import { render } from '@repo/email/render'

const html = await render(<WelcomeEmail fullName="John Doe" />)
```

**Props:**
- `fullName` (string, optional) - User's full name

### `LoginNotificationEmail`

Sent when a **new browser/OS fingerprint** signs in (not on every login). One CTA signs that session out.

```tsx
import { LoginNotificationEmail } from '@repo/email/emails/login-notification'
import { render } from '@repo/email/render'

const html = await render(
  <LoginNotificationEmail
    signInType="Email code"
    device="Chrome on macOS"
    ipAddress="192.168.1.1"
    timestamp={new Date().toISOString()}
    signOutUrl="https://app.example.com/auth/session/revoke?verificationId=...&token=..."
    location="San Francisco, CA"
    sessionsUrl="https://app.example.com/settings/security/sessions"
    appName="Acme"
  />
)
const text = await render(
  <LoginNotificationEmail
    signInType="Email code"
    device="Chrome on macOS"
    ipAddress="192.168.1.1"
    timestamp={new Date().toISOString()}
    signOutUrl="https://app.example.com/auth/session/revoke?verificationId=...&token=..."
  />,
  { plainText: true },
)
```

**Props:**
- `signInType` (string) - How they signed in
- `device` (string) - Browser and OS label
- `ipAddress` (string) - Client IP
- `timestamp` (string) - ISO timestamp (formatted UTC in the body)
- `signOutUrl` (string) - One-time revoke URL
- `location` (string, optional)
- `fullName` (string, optional)
- `appName` (string, optional)
- `sessionsUrl` (string, optional) - Settings sessions page

### `EmailChangedNotification`

Sent to the previous address after a successful email change.

```tsx
import { EmailChangedNotification } from '@repo/email/emails/email-changed-notification'
import { render } from '@repo/email/render'

const html = await render(
  <EmailChangedNotification
    newEmail="ada@example.com"
    sessionsUrl="https://app.example.com/settings/security/sessions"
    appName="Acme"
  />
)
```

**Props:**
- `newEmail` (string)
- `fullName` (string, optional)
- `appName` (string, optional)
- `sessionsUrl` (string, optional)

### `MagicLinkLoginEmail`

Magic link email for passwordless authentication.

```tsx
import { MagicLinkLoginEmail } from '@repo/email/emails/magic-link-login'
import { render } from '@repo/email/render'

const html = await render(
  <MagicLinkLoginEmail
    magicLink="https://app.example.com/auth/verify?token=..."
    expirationMinutes={15}
    fullName="John Doe"
  />
)
```

**Props:**
- `magicLink` (string) - Magic link URL
- `expirationMinutes` (number, optional, default: 15) - Link expiration time in minutes
- `fullName` (string, optional) - User's full name

## Usage

### Rendering Templates

The `render` function is **server-only** and must be used in:

- API routes (Next.js, Fastify, etc.)
- Server Components (Next.js)
- Server Actions (Next.js)
- Node.js scripts

**Do not use in client components or browser code.**

```tsx
import { WelcomeEmail } from '@repo/email/emails/welcome'
import { render } from '@repo/email/render'

// In API route or Server Component
const html = await render(<WelcomeEmail fullName="John Doe" />)

// Send HTML via email service
await emailService.send({
  to: 'user@example.com',
  subject: 'Welcome!',
  html,
})
```

### Development Server

Preview and develop email templates locally. Run from monorepo root: `pnpm --filter @repo/email dev` (port 3003), `pnpm --filter @repo/email build`, `pnpm --filter @repo/email start`. See Scripts below.

## Troubleshooting

### "render is not a function" or Import Errors

- Ensure you're importing `render` from `@repo/email/render`, not from React Email directly
- Verify you're using `render` in server-side code only (not in client components)

### Templates Not Rendering

- Check that all required props are provided
- Verify React is available globally (handled automatically by the render function)
- Ensure you're awaiting the `render` function (it's async)

### Type Errors

- Ensure you're importing template components from `@repo/email/emails/*`
- Check that props match the template's TypeScript interface
- Run `pnpm --filter @repo/email checktypes` to verify types

## Scripts

- `pnpm --filter @repo/email dev` - Email preview server (port 3003)
- `pnpm --filter @repo/email build` - Build templates
- `pnpm --filter @repo/email start` - Start preview server
- `pnpm --filter @repo/email checktypes` - Type-check

## Dependency Strategy

This package follows the **Template Library** pattern:

- **Bundled Dependencies**: Template dependencies are bundled (`date-fns`, `@react-email/components`, etc.)
- **Peer Dependencies**: Framework dependencies only (`react`) - consumers control React version
- **Rationale**: Simpler developer experience - install `@repo/email` and it works. Version consistency across all apps using email templates.
