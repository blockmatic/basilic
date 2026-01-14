# API Scripts

Development scripts for the API application.

## Overview

These scripts support the API development workflow in a contract-first architecture. The API uses OpenAPI specifications as the source of truth, and these scripts help maintain consistency between route implementations and the OpenAPI spec.

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

This script ensures the OpenAPI spec stays in sync with route implementations, enabling type-safe client generation via hey-api in `@basilic/core` and `@basilic/react`.

## Related Documentation

- **[API README](../README.md)** - General API documentation and setup
- **[Deployment Guide](https://basilic-docs.vercel.app/docs/guides/deployment)** - Deployment options and strategies
- **[Backend Stack](https://basilic-docs.vercel.app/docs/architecture/backend-stack)** - Technology choices and architecture
- **[Contract-First APIs](https://basilic-docs.vercel.app/docs/contracts)** - OpenAPI and hey-api pattern
- **[Root Scripts](../../../scripts/README.md)** - Publishing and security scripts for the monorepo
