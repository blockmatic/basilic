# `@repo/eslint-config`

Shared ESLint configuration for the workspace. Provides consistent linting rules across all packages and apps in the monorepo.

## Hybrid Biome + ESLint Architecture

This monorepo uses a **hybrid linting architecture** where Biome and ESLint have distinct, non-overlapping responsibilities:

### Biome Responsibilities (Primary)
- **Formatting**: All code formatting (indentation, quotes, semicolons, etc.)
- **Import Organization**: Import sorting and organization
- **Unused Variables/Imports**: Detection and removal of unused code
- **Style Rules**: Code style preferences (no-var, prefer-const, etc.)
- **React JSX Best Practices**: Basic JSX linting
- **Basic A11y**: Accessibility rules for JSX

### ESLint Responsibilities (Correctness Only)
- **TypeScript Correctness**: Basic TypeScript rules (non-type-aware for speed)
- **React/React Hooks Rules**: React-specific correctness rules
- **Next.js Rules**: Next.js framework-specific rules
- **Import Boundary Enforcement**: Architecture rules (e.g., `import/no-default-export`)
- **Turbo Monorepo Rules**: Monorepo-aware linting

### Running Linters

```bash
# Run both linters (recommended for CI)
pnpm lint

# Run Biome only (formatting + style)
pnpm lint:biome
pnpm lint:biome:fix  # Auto-fix

# Run ESLint only (correctness)
pnpm lint:eslint
pnpm lint:eslint:fix  # Auto-fix

# Fix all issues
pnpm lint:fix

# Format code only (Biome)
pnpm format
```

### When to Disable Rules

- **Biome**: Use `// biome-ignore lint/ruleName: reason`
- **ESLint**: Use `// eslint-disable-next-line rule-name`

**Important**: All formatting rules are disabled in ESLint configs. Biome owns formatting completely.

## Available Configurations

### Base Configuration (`@repo/eslint-config/base`)

Base ESLint configuration for Node.js projects (e.g., Elysia backend, infrastructure code).

**Usage:**

```js
// eslint.config.js
import baseConfig from '@repo/eslint-config/base'

export default [...baseConfig]
```

**Includes:**

- TypeScript ESLint parser and plugin
- ESLint recommended rules
- Biome integration (disabled checks Biome handles for faster execution)
- Turbo plugin for monorepo support

### Next.js Configuration (`@repo/eslint-config/next-js`)

ESLint configuration for Next.js applications.

**Usage:**

```js
// eslint.config.js
import nextConfig from '@repo/eslint-config/next-js'

export default [...nextConfig]
```

**Includes:**

- All base configuration
- Next.js specific rules
- React and React Hooks plugins
- TypeScript support

### React Internal Configuration (`@repo/eslint-config/react-internal`)

ESLint configuration for React libraries and internal packages.

**Usage:**

```js
// eslint.config.js
import reactConfig from '@repo/eslint-config/react-internal'

export default [...reactConfig]
```

**Includes:**

- All base configuration
- React and React Hooks plugins
- TypeScript support
- Optimized for library development

## Installation

This package is part of the monorepo and is automatically available to all packages and apps. No separate installation needed.

## Features

- **TypeScript Support**: Basic TypeScript linting (non-type-aware for speed)
- **Biome Integration**: ESLint configured to disable all formatting rules (Biome handles formatting)
- **React Support**: React and React Hooks linting rules
- **Next.js Support**: Next.js specific linting rules
- **Turbo Support**: Monorepo-aware linting with Turbo plugin
- **Modern ESLint**: Uses ESLint 9+ flat config format
- **Speed Optimized**: Correctness-only rules - formatting handled by Biome for maximum speed
- **Clear Separation**: Biome handles formatting/style, ESLint handles correctness/architecture

## Type Safety Model: Zod-First Validation Strategy

This project uses a **Zod-first validation strategy** instead of relying on TypeScript ESLint's "unsafe" rules for type safety. The following TypeScript ESLint rules are intentionally disabled globally:

- `@typescript-eslint/no-unsafe-assignment`
- `@typescript-eslint/no-unsafe-call`
- `@typescript-eslint/no-unsafe-member-access`
- `@typescript-eslint/no-unsafe-return`
- `@typescript-eslint/no-unsafe-argument`

### Why These Rules Are Disabled

These rules are disabled because:

1. **AI-Assisted Development**: They are incompatible with AI-assisted development workflows and generate excessive noise around unavoidable `any` types that occur when working with external APIs, libraries, and frameworks.

2. **Runtime Validation Over Static Analysis**: Our safety model is based on **runtime validation** (Zod schemas), not static ESLint rules. We validate data at runtime boundaries where it enters our system, ensuring type safety through actual data validation rather than type assertions.

3. **Reduced Noise**: These rules create false positives and require numerous inline disables, cluttering code without providing meaningful safety guarantees.

### Our Type Safety Approach

Instead of relying on ESLint's unsafe rules, we enforce type safety through:

1. **Zod Schema Validation**: All external or untrusted data must be validated using Zod (or equivalent schemas) before being used. This includes:
   - API responses
   - Database reads
   - Webhook payloads
   - RPC calls
   - AI/LLM responses
   - User input
   - Environment variables

2. **Fully Typed Interfaces**: All internal modules should export fully typed interfaces, DTOs, or schemas to maintain strong type guarantees. Consumers can rely on type inference from these well-defined boundaries.

3. **Data Boundary Validation**: Data boundaries (where external data enters the system) must be validated at the edges using Zod schemas. Once validated, data flows through the system with full type safety.

4. **Type Inference**: We prefer type inference over explicit type annotations in consumer code. Functions define return types; consumers infer types from function return values.

### Example: Proper Validation Pattern

```typescript
// ✅ Good: Validate at the boundary
import { z } from 'zod'
import { fetchWithTimeout } from '@repo/lib'

const apiResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
})

async function fetchUser(id: string) {
  const response = await fetchWithTimeout({
    url: `/api/users/${id}`,
    options: { method: 'GET' },
  })
  const data = await response.json() // Returns unknown
  const validated = apiResponseSchema.parse(data) // Runtime validation
  return validated // Fully typed, safe to use
}

// ✅ Good: Consumer infers type
const user = await fetchUser('123') // Type: { id: string; name: string }
```

### Guidelines for Contributors

- **Never add inline `eslint-disable` comments** for unsafe rules - they are disabled globally
- **Always validate external data** with Zod schemas at data boundaries
- **Export typed interfaces** from internal modules for type safety
- **Trust type inference** - let TypeScript infer types from validated data and function return types
- **Validate, don't assert** - Use Zod's `.parse()` or `.safeParse()` instead of type assertions
- **Use utility libraries**: Always leverage `@repo/lib` (error handling, delays, fetch with timeout), `zod` (validation), and `lodash` (array/object operations, type checking) instead of custom implementations

For more details, see:

- [TypeScript Rules](../../.cursor/rules/base/typescript.mdc) - Type safety patterns and guidelines
- [CONTRIBUTING.md](../../CONTRIBUTING.md) - Project contribution guidelines

## Plugins Included

- `@typescript-eslint/eslint-plugin` - TypeScript-specific rules
- `@typescript-eslint/parser` - TypeScript parser
- `eslint-plugin-react` - React-specific rules
- `eslint-plugin-react-hooks` - React Hooks rules
- `eslint-plugin-turbo` - Turbo monorepo rules
- `eslint-plugin-only-warn` - Converts errors to warnings
- Biome integration - Disabled checks that Biome handles (formatting-focused rules)

## Usage Examples

### Elysia Backend

```js
// apps/vencura/eslint.config.mjs
import { config } from '@repo/eslint-config/base'

export default config
```

**Package.json scripts:**
```json
{
  "scripts": {
    "lint:eslint": "eslint .",
    "lint:eslint:fix": "eslint . --fix"
  }
}
```

### Next.js App

```js
// apps/docu/eslint.config.mjs
import { nextJsConfig } from '@repo/eslint-config/next-js'

export default nextJsConfig
```

**Package.json scripts:**
```json
{
  "scripts": {
    "lint:eslint": "eslint .",
    "lint:eslint:fix": "eslint . --fix"
  }
}
```

### React Library

```js
// packages/ui/eslint.config.js
import { config } from '@repo/eslint-config/react-internal'

export default config
```

**Package.json scripts:**
```json
{
  "scripts": {
    "lint:eslint": "eslint . --max-warnings 0",
    "lint:eslint:fix": "eslint . --fix --max-warnings 0"
  }
}
```

## Troubleshooting

### ESLint and Biome Conflict

If you see formatting-related ESLint errors, ensure:
1. All formatting rules are disabled in ESLint (they are by default)
2. Run `pnpm lint:biome:fix` to fix formatting issues
3. ESLint should only report correctness issues

### Type-Aware Linting

This config uses **basic TypeScript rules** (non-type-aware) for speed. Type-aware linting requires `parserOptions.project` and is slower. If you need type-aware rules, enable them in your local config.

### Import Boundary Errors

The `import/no-default-export` rule enforces named exports except for:
- Next.js pages (`**/app/**/page.tsx`, `**/app/**/layout.tsx`)
- Config files (`**/*.config.{js,mjs,ts}`)

If you need to allow default exports elsewhere, override the rule in your local config.

## License

PROPRIETARY
