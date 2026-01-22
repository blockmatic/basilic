# @repo/email

Email template library built with React Email.

## Overview

Pre-configured email templates using React Email components. Templates are fully typed.

## Usage

```tsx
import { WelcomeEmail } from '@repo/email/emails/welcome'
import { render } from '@repo/email/render'

// render() is server-only - must be used in API routes, Server Components, or Server Actions
// It converts React components to HTML strings and must not be used in client components
const html = await render(<WelcomeEmail fullName="John Doe" />)
```

## Dependency Strategy

This package follows the **Template Library** pattern:

- **Bundled Dependencies**: Template dependencies are bundled (`date-fns`, `@react-email/components`, etc.)
- **Peer Dependencies**: Framework dependencies only (`react`) - consumers control React version
- **Rationale**: Simpler developer experience - install `@repo/email` and it works. Version consistency across all apps using email templates.
