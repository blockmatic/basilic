---
name: AI SDK v6 Core
description: |
  Build backend AI with Vercel AI SDK v5/v6. Agent abstraction, tool approval, error solutions.
  
  Use when: implementing AI SDK v5/v6 or troubleshooting AI errors.
---

# Skill: ai-sdk-core

## Scope

- Applies to: Backend AI features with Vercel AI SDK v5/v6, server-side text generation, structured outputs, AI agents with tools, multi-provider integration
- Does NOT cover: React chat UIs (see [ai-sdk-ui](@cursor/skills/ai-sdk-ui-v6/SKILL.md)), frontend hooks, embeddings, image generation

## Assumptions

- AI SDK v5.0.98+ (stable) or v6.0.0-beta.107+ (beta)
- Node.js 18+ or Cloudflare Workers
- Zod v3.23.8+ or v4.x for schema validation
- TypeScript v5+ with strict mode

## Principles

- Use `generateText` for simple text generation
- Use `generateObject` for structured outputs with Zod schemas
- Use `streamText` for streaming responses
- Use `ToolLoopAgent` (v6) for agent workflows with tool calling
- Use tool execution approval for human-in-the-loop patterns
- Use `callOptions` for dynamic runtime configuration
- Handle errors with specific error types (`AI_APICallError`, `AI_NoObjectGeneratedError`, etc.)
- Use provider abstraction (`openai`, `anthropic`, `google`) for multi-provider support

## Constraints

### MUST

- Handle `response.error` for typed error responses
- Use Zod schemas for structured output validation
- Use `onError` callback in `streamText` for error handling
- Validate API keys at startup

### SHOULD

- Use `ToolLoopAgent` (v6) for agent workflows instead of manual tool orchestration
- Implement retry logic with exponential backoff for rate limits
- Use `mode: 'json'` when available for structured outputs
- Prefer GPT-4+ for complex structured output

### AVOID

- Top-level imports in Cloudflare Workers (causes startup overhead)
- Skipping error handling for API calls
- Using `any` types (use proper error types)
- Mixing v5 and v6 APIs without migration

## Interactions

- Complements [ai-sdk-ui](@cursor/skills/ai-sdk-ui-v6/SKILL.md) for React chat interfaces
- Works with [nextjs](@cursor/skills/nextjs-v16/SKILL.md) Server Components and API routes
- Uses Zod for schema validation (see [typescript](@cursor/skills/typescript-v5/SKILL.md))

## Patterns

### Basic Text Generation

```typescript
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

const result = await generateText({
  model: openai('gpt-4'),
  prompt: 'Hello, world!',
})
```

### Structured Output

```typescript
import { generateObject } from 'ai'
import { z } from 'zod'

const result = await generateObject({
  model: openai('gpt-4'),
  schema: z.object({
    name: z.string(),
    age: z.number(),
  }),
  prompt: 'Generate a person',
})
```

### Agent with Tools (v6)

```typescript
import { ToolLoopAgent } from 'ai'
import { openai } from '@ai-sdk/openai'

const agent = new ToolLoopAgent({
  model: openai('gpt-4'),
  tools: { /* tool definitions */ },
})

const result = await agent.run({ prompt: 'Task' })
```

See [Production Patterns](references/production-patterns.md) and [Templates](templates/) for detailed examples.

## References

- [Production Patterns](references/production-patterns.md) - Deployment and optimization patterns
- [Top Errors](references/top-errors.md) - Common error solutions and troubleshooting

## Resources

- [AI SDK Docs](https://ai-sdk.dev/docs/ai-sdk-core/overview)
- [AI SDK 6 Beta](https://ai-sdk.dev/docs/announcing-ai-sdk-6-beta)
- [Error Reference](https://ai-sdk.dev/docs/reference/ai-sdk-errors)
