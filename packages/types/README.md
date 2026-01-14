# @basilic/types

Pure TypeScript domain types with no runtime dependencies.

## Overview

Domain models and shared types. No Zod, no ts-rest, no runtime code—pure TypeScript types only.

## Usage

```ts
import type { User, UserId } from '@basilic/types'
```

## Architecture

- ✅ Pure TypeScript `type`/`interface`
- ❌ No runtime dependencies
- ❌ No validation schemas
- ❌ No API boundary code

Domain types live here. API shapes (DTOs) are derived from Zod schemas in `@basilic/contracts`.

See [Package Conventions](https://basilic-docs.vercel.app/docs/architecture/package-conventions#1-packages-types) for type organization patterns.
