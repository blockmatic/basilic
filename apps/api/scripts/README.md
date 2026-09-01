# API Scripts

Development scripts for the API application.

## Overview

These scripts support the API development workflow. The API uses Fastify routes as the source of truth, and these scripts help generate the OpenAPI specification from route implementations.

## Scripts

### `generate-openapi.ts`

Generates the OpenAPI specification from Fastify route definitions.

**Purpose**: Maintains the OpenAPI spec (`openapi/openapi.json`) by extracting route metadata, schemas, and documentation from Fastify plugins.

**Usage**:
```bash
pnpm generate:openapi
```

**What it does**:
- Scans Fastify route definitions in `src/routes/`
- Extracts route metadata (paths, methods, schemas)
- Generates OpenAPI 3.x specification
- Writes to `openapi/openapi.json`

**When to run**:
- After adding or modifying API routes
- Before committing route changes
- As part of CI/CD to verify spec consistency

This script ensures the OpenAPI spec stays in sync with route implementations, enabling type-safe client generation via hey-api in `@repo/core`. `@repo/react` hooks are handwritten on top of `@repo/core` — they are not generated from the OpenAPI spec.

## Related Documentation

- **[Deployment Guide](@apps/docu/content/docs/deployment/index.mdx)** - Deployment options and strategies
- **[API Architecture](@apps/docu/content/docs/architecture/api.mdx)** - Fastify, TypeBox, OpenAPI, `@repo/core`
- **[OpenAPI generation](@apps/docu/content/docs/development/openapi-generation.mdx)** - Spec from routes, hey-api clients
