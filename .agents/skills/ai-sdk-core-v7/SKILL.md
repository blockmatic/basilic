---
name: ai-sdk-core-v7
description: Build backend AI with Vercel AI SDK v7 — generateText, streamText, ToolLoopAgent, tools. Use when implementing AI SDK v7 or troubleshooting AI errors. Never write AI SDK from memory.
---

# Skill: ai-sdk-core

## Scope

- Applies to: Backend AI with Vercel AI SDK v7 (`ai` package)
- Does NOT cover: React chat UIs (see [ai-sdk-ui](../ai-sdk-ui-v7/SKILL.md))

## Assumptions

- Folder major tracks the installed `ai` package in `package.json`, not a skill-file revision
- Node.js 22+, ESM; Zod 4 for `inputSchema`
- **Never write AI SDK from memory.** Grep `node_modules/ai/docs/` and `node_modules/ai/src/` for the installed version. Else https://ai-sdk.dev/docs (append `.md`) or https://ai-sdk.dev/api/search-docs?q=
- v6 leftovers: https://ai-sdk.dev/docs/migration-guides/migration-guide-7-0

## Principles

- `generateText` / `streamText` for request handlers and one-shot API routes; `instructions` for system-style prompt
- `ToolLoopAgent` + `generate()` / `stream()` for durable agents — not hand-rolled loops, not `new Agent()`
- New streaming UI: `createUIMessageStreamResponse` + `toUIMessageStream({ stream: result.stream })` from `'ai'`
- Existing `result.toUIMessageStreamResponse()` still works in v7 (deprecated). Do not rewrite working handlers unless asked
- Tool results must be JSON-serializable (no `Date`)

## Constraints

### MUST

- Read bundled docs before writing calls
- `convertToModelMessages` when the client sends UI messages

### AVOID

- `toDataStreamResponse` / `pipeDataStreamToResponse`
- Guessing model IDs

## Interactions

- Complements [ai-sdk-ui](../ai-sdk-ui-v7/SKILL.md), [fastify](../fastify-v5/SKILL.md), [next](../next-v16/SKILL.md)
- Upstream: [vercel/ai use-ai-sdk](https://github.com/vercel/ai/blob/main/skills/use-ai-sdk/SKILL.md)

## Templates

- [generate-text-basic.ts](templates/generate-text-basic.ts)
- [stream-text-chat.ts](templates/stream-text-chat.ts)
- [agent-with-tools.ts](templates/agent-with-tools.ts)
