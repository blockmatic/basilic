---
name: AI SDK v6 UI
description: |
  Build React chat interfaces with Vercel AI SDK v5/v6. Agent integration, tool approval, auto-submit.
  
  Use when: implementing AI SDK v5/v6 chat UIs or troubleshooting "useChat failed to parse stream", "useChat no response", or "stale body values" errors.
---

# Skill: ai-sdk-ui

## Scope

- Applies to: React chat interfaces with Vercel AI SDK v5/v6, streaming UI patterns, tool approval workflows, agent integration
- Does NOT cover: Backend AI implementation (see [ai-sdk-core](@cursor/skills/ai-sdk-core-v6/SKILL.md)), Generative UI/RSC

## Assumptions

- AI SDK v5.0.99+ (stable) or v6.0.0-beta.108+ (beta)
- React 18+ (React 19 supported)
- Next.js 14+ (13.4+ works)
- `@ai-sdk/react` package

## Principles

- Use `useChat` for chat interfaces with streaming
- Use `useCompletion` for text completion (non-chat)
- Use `useObject` for structured data generation
- Use `useAssistant` for OpenAI-compatible assistant APIs
- Use streaming for better UX (show tokens as they arrive)
- Handle tool approval workflows with `addToolApprovalResponse` (v6)
- Use controlled mode for dynamic body values (avoid stale values)
- Use `toDataStreamResponse()` in App Router, `pipeDataStreamToResponse()` in Pages Router

## Constraints

### MUST

- Use streaming responses (`toDataStreamResponse()` or `pipeDataStreamToResponse()`)
- Use controlled mode when body values change (`sendMessage` with `data` instead of `body` option)
- Handle loading states (`isLoading`) and errors (`error`)

### SHOULD

- Use `stop` function to allow users to cancel generation
- Auto-scroll to latest message during streaming
- Show loading indicators during generation
- Use `InferAgentUIMessage` (v6) for type-safe agent integration

### AVOID

- Using `body` option with dynamic values (causes stale values)
- Non-streaming responses (poor UX)
- Infinite loops in `useEffect` (only depend on `messages`, not callbacks)
- Mixing v5 and v6 APIs without migration

## Interactions

- Uses [ai-sdk-core](@cursor/skills/ai-sdk-core-v6/SKILL.md) for backend implementation
- Works with [nextjs](@cursor/skills/nextjs-v16/SKILL.md) App Router and Pages Router
- Uses Zod for schema validation (see [typescript](@cursor/skills/typescript-v5/SKILL.md))

## Patterns

### Basic Chat

```tsx
import { useChat } from '@ai-sdk/react'

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  })

  return (
    <form onSubmit={handleSubmit}>
      <input value={input} onChange={handleInputChange} />
      <button disabled={isLoading}>Send</button>
    </form>
  )
}
```

### Tool Approval (v6)

```tsx
import { useChat } from '@ai-sdk/react'

const { messages, addToolApprovalResponse } = useChat({
  api: '/api/chat',
})

// Handle approval
addToolApprovalResponse({
  toolCallId: 'id',
  approved: true,
})
```

See [Templates](templates/) and [Next.js Integration](references/nextjs-integration.md) for detailed examples.

## References

- [Next.js Integration](references/nextjs-integration.md) - App Router and Pages Router patterns
- [Streaming Patterns](references/streaming-patterns.md) - UI streaming best practices
- [Top UI Errors](references/top-ui-errors.md) - Common error solutions

## Resources

- [AI SDK UI Docs](https://ai-sdk.dev/docs/ai-sdk-ui/overview)
- [useChat Hook](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot)
- [Troubleshooting](https://ai-sdk.dev/docs/troubleshooting)
