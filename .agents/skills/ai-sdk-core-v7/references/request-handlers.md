# Request handlers (AI SDK v7)

Grep the installed `ai` package before copying names. Source: https://ai-sdk.dev/docs/migration-guides/migration-guide-7-0.md

## Tool loop on generateText / streamText

```ts
import { generateText, isStepCount, streamText, tool } from 'ai'
import { z } from 'zod'

const tools = {
  lookup: tool({
    description: 'Look up a record',
    inputSchema: z.object({ id: z.string() }),
    execute: async ({ id }) => ({ id }),
  }),
}

await generateText({
  model,
  instructions: 'Be concise.',
  messages,
  tools,
  stopWhen: isStepCount(5),
})

const result = streamText({
  model,
  instructions: 'Be concise.',
  messages,
  tools,
  stopWhen: isStepCount(5),
})
```

Durable multi-turn agents use `ToolLoopAgent`, not this pattern.

## UI message SSE

```ts
import { createUIMessageStreamResponse, toUIMessageStream } from 'ai'

const result = streamText({ model, messages, abortSignal })
const response = createUIMessageStreamResponse({
  stream: toUIMessageStream({ stream: result.stream }),
})
```

If the installed helper still accepts `consumeSseStream`, pass `consumeStream` from `'ai'` (needed so the tool loop keeps running when the HTTP consumer is Fastify/`reply.send`).

Fastify: copy `response` headers and status onto `reply.raw`, then `reply.send(response.body)`. Prefer that over `pipeUIMessageStreamToResponse({ response: reply.raw })` unless hijack-free piping is verified.

## System messages

v7 rejects `{ role: 'system' }` inside `messages` / `prompt` unless `allowSystemInMessages: true`. That flag is only for trusted, server-owned histories. For chat APIs, reject client system roles (400) and set `instructions` on the server.
