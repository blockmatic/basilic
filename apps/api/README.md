# Basilic API

Contract-first, type-safe REST API built with Fastify & ts-rest.

## Requirements

- **Node.js**: `>=22`
- **pnpm**: `10.28.0`

## Development

```bash
pnpm dev
```

Starts Fastify server with hot reload at [http://localhost:3000](http://localhost:3000).

## Scripts

- `pnpm dev` - Development server with hot reload
- `pnpm build` - Build TypeScript
- `pnpm start` - Production server (requires build)
- `pnpm test` - Run tests

## API Documentation

- **Scalar UI**: `/reference`
- **OpenAPI Spec**: `/reference/openapi.json`
- **Health Check**: `GET /health`

## Architecture

Contract-first architecture using ts-rest:

- **Contracts**: Defined in `@basilic/contracts` (ts-rest + Zod)
- **Routes**: Implemented in `src/routes/` (Fastify plugins)
- **Type Safety**: End-to-end from contracts to implementation

See [Backend Stack](https://basilic-docs.vercel.app/docs/architecture/backend-stack) for details.
