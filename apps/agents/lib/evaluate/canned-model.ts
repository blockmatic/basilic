import { MockLanguageModelV4, simulateReadableStream } from 'ai/test'
import type { SetViewInput } from './view-config.js'

const emptyUsage = {
  inputTokens: { total: 0, noCache: 0, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 0, text: 0, reasoning: 0 },
}
const emptyWarnings: [] = []

const toolFinish = { unified: 'tool-calls' as const, raw: undefined }
const stopFinish = { unified: 'stop' as const, raw: undefined }

export function setViewLanguageModel({ input }: { input: SetViewInput }) {
  const toolCall = {
    type: 'tool-call' as const,
    toolCallId: 'set_view_canned',
    toolName: 'set_view',
    input: JSON.stringify(input),
  }
  return new MockLanguageModelV4({
    provider: 'basilic-canned',
    modelId: 'set-view',
    doGenerate: {
      content: [toolCall],
      finishReason: toolFinish,
      usage: emptyUsage,
      warnings: emptyWarnings,
    },
    doStream: {
      stream: simulateReadableStream({
        chunks: [toolCall, { type: 'finish', finishReason: toolFinish, usage: emptyUsage }],
      }),
    },
  })
}

export function finishLanguageModel() {
  return new MockLanguageModelV4({
    provider: 'basilic-canned',
    modelId: 'set-view-done',
    doGenerate: {
      content: [{ type: 'text', text: '' }],
      finishReason: stopFinish,
      usage: emptyUsage,
      warnings: emptyWarnings,
    },
    doStream: {
      stream: simulateReadableStream({
        chunks: [
          { type: 'text-start', id: 't' },
          { type: 'text-end', id: 't' },
          { type: 'finish', finishReason: stopFinish, usage: emptyUsage },
        ],
      }),
    },
  })
}
