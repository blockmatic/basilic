---
name: AI SDK v6 UI
description: |
  Build React chat interfaces with Vercel AI SDK v5/v6. Agent integration, tool approval, auto-submit.
  
  Use when: implementing AI SDK v5/v6 chat UIs or troubleshooting "useChat failed to parse stream", "useChat no response", or "stale body values" errors.
---

# AI SDK UI - Frontend React Hooks

Frontend React hooks for AI-powered user interfaces with Vercel AI SDK v5/v6.

**Version**: AI SDK v5.0.99 (Stable) / v6.0.0-beta.108 (Beta)
**Framework**: React 18+, Next.js 14+
**Last Updated**: 2025-11-22

---

## AI SDK 6 Beta (November 2025)

**Status:** Beta (stable release planned end of 2025)
**Latest:** ai@6.0.0-beta.108 (Nov 22, 2025)
**Migration:** Minimal breaking changes from v5 → v6

### New UI Features in v6 Beta

**1. Agent Integration**
Type-safe messaging with agents using `InferAgentUIMessage<typeof agent>`:

```tsx
import { useChat } from '@ai-sdk/react'
import type { InferAgentUIMessage } from 'ai'
import { myAgent } from './agent'

export default function AgentChat() {
  const { messages, sendMessage } = useChat<InferAgentUIMessage<typeof myAgent>>({
    api: '/api/chat',
  })
  // messages are now type-checked against agent schema
}
```

**2. Tool Approval Workflows (Human-in-the-Loop)**
Request user confirmation before executing tools:

```tsx
import { useChat } from '@ai-sdk/react'
import { useState } from 'react'

export default function ChatWithApproval() {
  const { messages, sendMessage, addToolApprovalResponse } = useChat({
    api: '/api/chat',
  })

  const handleApprove = (toolCallId: string) => {
    addToolApprovalResponse({
      toolCallId,
      approved: true,  // or false to deny
    })
  }

  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>
          {message.toolInvocations?.map(tool => (
            tool.state === 'awaiting-approval' && (
              <div key={tool.toolCallId}>
                <p>Approve tool call: {tool.toolName}?</p>
                <button onClick={() => handleApprove(tool.toolCallId)}>
                  Approve
                </button>
                <button onClick={() => addToolApprovalResponse({
                  toolCallId: tool.toolCallId,
                  approved: false,
                })}>
                  Deny
                </button>
              </div>
            )
          ))}
        </div>
      ))}
    </div>
  )
}
```

**3. Auto-Submit Capability**
Automatically continue conversation after handling approvals:

```tsx
import { useChat, lastAssistantMessageIsCompleteWithApprovalResponses } from '@ai-sdk/react'

export default function AutoSubmitChat() {
  const { messages, sendMessage } = useChat({
    api: '/api/chat',
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
    // Automatically resubmit after all approval responses provided
  })
}
```

**4. Structured Output in Chat**
Generate structured data alongside tool calling (previously only available in `useObject`):

```tsx
import { useChat } from '@ai-sdk/react'
import { z } from 'zod'

const schema = z.object({
  summary: z.string(),
  sentiment: z.enum(['positive', 'neutral', 'negative']),
})

export default function StructuredChat() {
  const { messages, sendMessage } = useChat({
    api: '/api/chat',
    // Server can now stream structured output with chat messages
  })
}
```

---


## useAssistant Hook

Interact with OpenAI-compatible assistant APIs with automatic UI state management.

**Import:**
```tsx
import { useAssistant } from '@ai-sdk/react';
```

**Basic Usage:**
```tsx
'use client';
import { useAssistant } from '@ai-sdk/react';
import { useState, FormEvent } from 'react';

export default function AssistantChat() {
  const { messages, sendMessage, isLoading, error } = useAssistant({
    api: '/api/assistant',
  });
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage({ content: input });
    setInput('');
  };

  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          <strong>{m.role}:</strong> {m.content}
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
      </form>
      {error && <div>{error.message}</div>}
    </div>
  );
}
```

**Use Cases:**
- Building OpenAI Assistant-powered UIs
- Managing assistant threads and runs
- Streaming assistant responses with UI state management
- File search and code interpreter integrations

See official docs for complete API reference: https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-assistant

---

## Top UI Errors & Solutions

See `references/top-ui-errors.md` for complete documentation. Quick reference:

### 1. useChat Failed to Parse Stream

**Error**: `SyntaxError: Unexpected token in JSON at position X`

**Cause**: API route not returning proper stream format.

**Solution**:
```typescript
// ✅ CORRECT
return result.toDataStreamResponse()

// ❌ WRONG
return new Response(result.textStream)
```

### 2. useChat No Response

**Cause**: API route not streaming correctly.

**Solution**:
```typescript
// App Router - use toDataStreamResponse()
export async function POST(req: Request) {
  const result = streamText({ /* ... */ });
  return result.toDataStreamResponse(); // ✅
}

// Pages Router - use pipeDataStreamToResponse()
export default async function handler(req, res) {
  const result = streamText({ /* ... */ });
  return result.pipeDataStreamToResponse(res); // ✅
}
```

### 3. Streaming Not Working When Deployed

**Cause**: Deployment platform buffering responses.

**Solution**: Vercel auto-detects streaming. Other platforms may need configuration.

### 4. Stale Body Values with useChat

**Cause**: `body` option captured at first render only.

**Solution**:
```typescript
// ❌ WRONG - body captured once
const { userId } = useUser();
const { messages } = useChat({
  body: { userId },  // Stale!
});

// ✅ CORRECT - use controlled mode
const { userId } = useUser();
const { messages, sendMessage } = useChat();

sendMessage({
  content: input,
  data: { userId },  // Fresh on each send
});
```

### 5. React Maximum Update Depth

**Cause**: Infinite loop in useEffect.

**Solution**:
```typescript
// ❌ WRONG
useEffect(() => {
  saveMessages(messages);
}, [messages, saveMessages]); // saveMessages triggers re-render!

// ✅ CORRECT
useEffect(() => {
  saveMessages(messages);
}, [messages]); // Only depend on messages
```

See `references/top-ui-errors.md` for 7 more common errors.

---

## Streaming Best Practices

### Performance

**Always use streaming for better UX:**
```tsx
// ✅ GOOD - Streaming (shows tokens as they arrive)
const { messages } = useChat({ api: '/api/chat' });

// ❌ BAD - Non-streaming (user waits for full response)
const response = await fetch('/api/chat', { method: 'POST' });
```

### UX Patterns

**Show loading states:**
```tsx
{isLoading && <div>AI is typing...</div>}
```

**Provide stop button:**
```tsx
{isLoading && <button onClick={stop}>Stop</button>}
```

**Auto-scroll to latest message:**
```tsx
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);
```

**Disable input while loading:**
```tsx
<input disabled={isLoading} />
```

See `references/streaming-patterns.md` for comprehensive best practices.

---

## When to Use This Skill

### Use ai-sdk-ui When:
- Building React chat interfaces
- Implementing AI completions in UI
- Streaming AI responses to frontend
- Building Next.js AI applications
- Handling chat message state
- Displaying tool calls in UI
- Managing file attachments with AI
- Migrating from v4 to v5 (UI hooks)
- Encountering useChat/useCompletion errors

### Don't Use When:
- Need backend AI functionality → Use **ai-sdk-core** instead
- Building non-React frontends (Svelte, Vue) → Check official docs
- Need Generative UI / RSC → See https://ai-sdk.dev/docs/ai-sdk-rsc
- Building native apps → Different SDK required

### Related Skills:
- **ai-sdk-core** - Backend text generation, structured output, tools, agents
- Compose both for full-stack AI applications

---

## Package Versions

**Stable (v5):**
```json
{
  "dependencies": {
    "ai": "^5.0.99",
    "@ai-sdk/react": "^1.0.0",
    "@ai-sdk/openai": "^2.0.68",
    "react": "^18.2.0",
    "zod": "^3.23.8"
  }
}
```

**Beta (v6):**
```json
{
  "dependencies": {
    "ai": "6.0.0-beta.108",
    "@ai-sdk/react": "beta",
    "@ai-sdk/openai": "beta"
  }
}
```

**Version Notes:**
- AI SDK v5.0.99 (stable, Nov 2025)
- AI SDK v6.0.0-beta.108 (beta, Nov 22, 2025) - minimal breaking changes
- React 18+ (React 19 supported)
- Next.js 14+ recommended (13.4+ works)
- Zod 3.23.8+ for schema validation

---

## Links to Official Documentation

**Core UI Hooks:**
- AI SDK UI Overview: https://ai-sdk.dev/docs/ai-sdk-ui/overview
- useChat: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot
- useCompletion: https://ai-sdk.dev/docs/ai-sdk-ui/completion
- useObject: https://ai-sdk.dev/docs/ai-sdk-ui/object-generation

**Advanced Topics (Link Only):**
- Generative UI (RSC): https://ai-sdk.dev/docs/ai-sdk-rsc/overview
- Stream Protocols: https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocols
- Message Metadata: https://ai-sdk.dev/docs/ai-sdk-ui/message-metadata

**Next.js Integration:**
- Next.js App Router: https://ai-sdk.dev/docs/getting-started/nextjs-app-router
- Next.js Pages Router: https://ai-sdk.dev/docs/getting-started/nextjs-pages-router

**Migration & Troubleshooting:**
- v4→v5 Migration: https://ai-sdk.dev/docs/migration-guides/migration-guide-5-0
- Troubleshooting: https://ai-sdk.dev/docs/troubleshooting
- Common Issues: https://ai-sdk.dev/docs/troubleshooting/common-issues

**Vercel Deployment:**
- Vercel Functions: https://vercel.com/docs/functions
- Streaming on Vercel: https://vercel.com/docs/functions/streaming

---

## Templates

This skill includes the following templates in `templates/`:

1. **use-chat-basic.tsx** - Basic chat with manual input (v5 pattern)
2. **use-chat-tools.tsx** - Chat with tool calling UI rendering
3. **use-chat-attachments.tsx** - File attachments support
4. **use-completion-basic.tsx** - Basic text completion
5. **use-object-streaming.tsx** - Streaming structured data
6. **nextjs-chat-app-router.tsx** - Next.js App Router complete example
7. **nextjs-chat-pages-router.tsx** - Next.js Pages Router complete example
8. **nextjs-api-route.ts** - API route for both App and Pages Router
9. **message-persistence.tsx** - Save/load chat history
10. **custom-message-renderer.tsx** - Custom message components with markdown
11. **package.json** - Dependencies template

## Reference Documents

See `references/` for:

- **use-chat-migration.md** - Complete v4→v5 migration guide
- **streaming-patterns.md** - UI streaming best practices
- **top-ui-errors.md** - 12 common UI errors with solutions
- **nextjs-integration.md** - Next.js setup patterns
- **links-to-official-docs.md** - Organized links to official docs

---

**Production Tested**: WordPress Auditor (https://wordpress-auditor.webfonts.workers.dev)
**Last Updated**: 2025-11-22
