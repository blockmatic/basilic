# @basilic/contracts

ts-rest contracts and Zod schemas defining the API boundary.

## Overview

Contract-first API definitions using ts-rest and Zod. All API request/response shapes are defined here with runtime validation.

## Usage

```ts
import { appContract } from '@basilic/contracts'
```

Contracts define:
- HTTP routes (method, path, params)
- Request/response schemas (Zod)
- OpenAPI metadata (tags, summaries)

## Architecture

This package is the **HTTP boundary** between frontend and backend:

- ✅ Zod schemas for validation
- ✅ ts-rest routers
- ✅ May import domain types from `@basilic/types`
- ❌ No React or server framework code

See [Contract-First APIs](https://basilic-docs.vercel.app/docs/contracts) for the full pattern.
