# `@repo/typescript-config`

Shared TypeScript configuration for the workspace. Provides consistent TypeScript compiler settings across all packages and apps in the monorepo.

## Available Configurations

### Base Configuration (`base.json`)

Base TypeScript configuration that all other configs extend. Suitable for Node.js projects.

**Features:**

- Strict type checking enabled
- ES2022 target
- Node.js module resolution
- Declaration files generation
- No unchecked indexed access
- Enhanced type safety via `@total-typescript/ts-reset` (see [ts-reset Integration](#ts-reset-integration))

**Usage:**

```json
// tsconfig.json
{
  "extends": "@repo/typescript-config/base"
}
```

### Next.js Configuration (`nextjs.json`)

TypeScript configuration for Next.js applications. Extends the base configuration.

**Features:**

- All base configuration features
- Next.js plugin support
- ESNext modules
- Bundler module resolution
- JSX preserve mode
- No emit (Next.js handles compilation)

**Usage:**

```json
// tsconfig.json
{
  "extends": "@repo/typescript-config/nextjs"
}
```

### React Library Configuration (`react-library.json`)

TypeScript configuration for React component libraries. Extends the base configuration.

**Features:**

- All base configuration features
- React JSX support
- Declaration files for library distribution

**Usage:**

```json
// tsconfig.json
{
  "extends": "@repo/typescript-config/react-library"
}
```

## Installation

This package is part of the monorepo and is automatically available to all packages and apps. No separate installation needed.

## Configuration Details

### Base Configuration Options

- **Target**: ES2022
- **Module**: ESNext
- **Module Resolution**: Bundler
- **Strict Mode**: Enabled
- **Lib**: ES2022, DOM, DOM.Iterable
- **Declaration**: Enabled (for library packages)
- **No Unchecked Indexed Access**: Enabled (safer array/object access)

**Note:** Some infrastructure tooling (e.g., Pulumi) or framework-specific tooling (e.g., Anchor/Solana) may intentionally use CommonJS and Node resolution. These are acceptable exceptions.

### Next.js Specific Options

- **Module**: ESNext
- **Module Resolution**: Bundler
- **JSX**: Preserve (Next.js handles transformation)
- **No Emit**: Enabled (Next.js handles compilation)
- **Allow JS**: Enabled (for gradual migration)

### React Library Specific Options

- **JSX**: react-jsx (automatic JSX runtime)
- **Declaration**: Enabled (inherited from base)

## ts-reset Integration

This package integrates `@total-typescript/ts-reset` to enhance TypeScript's built-in type safety. The `reset.d.ts` file is automatically included via the base configuration, ensuring all packages that extend `base.json` benefit from improved types.

### Benefits

- **`JSON.parse()` returns `unknown`**: Forces explicit validation of parsed JSON data, preventing unsafe `any` types
- **`fetch().json()` returns `unknown`**: Ensures API responses are validated before use
- **Improved `.filter(Boolean)` typing**: Correctly filters out falsy values (`undefined`, `null`, `false`, `0`, `NaN`, `""`)
- **Better `.includes()` on `as const` arrays**: Less strict type checking for array includes operations

### Usage

Since `JSON.parse()` and `response.json()` now return `unknown`, you must validate the data before use. This aligns perfectly with the monorepo's use of Zod for validation:

```typescript
// ✅ Good: Validate with Zod, use @repo/lib utilities
import { fetchWithTimeout, parseJsonWithSchema } from '@repo/lib'
import { z } from 'zod'

const response = await fetchWithTimeout({
  url: '/api/data',
  options: { method: 'GET' },
})
const validated = parseJsonWithSchema({
  jsonString: await response.text(),
  schema: mySchema,
}) // Type-safe after validation

// ✅ Good: Type assertion for test utilities
const data = (await response.json()) as Record<string, unknown>

// ❌ Bad: Using without validation
const data = await response.json()
const value = data.someProperty // TypeScript error: Property 'someProperty' does not exist on type 'unknown'
```

**Important**: Since TypeScript replaces (rather than merges) `include` arrays when extending configs, packages that override the `include` array must explicitly add `reset.d.ts` to their include list. For example:

```json
{
  "extends": "@repo/typescript-config/base.json",
  "include": ["src", "../../packages/typescript-config/reset.d.ts"]
}
```

Packages that don't override `include` will automatically get `reset.d.ts` from the base config.

## Usage Examples

### Elysia Backend

```json
// apps/vencura/tsconfig.json
{
  "extends": "@repo/typescript-config/base",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Next.js App

```json
// apps/next/tsconfig.json
{
  "extends": "@repo/typescript-config/nextjs",
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### React Library

```json
// packages/ui/tsconfig.json
{
  "extends": "@repo/typescript-config/react-library",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## License

PROPRIETARY
