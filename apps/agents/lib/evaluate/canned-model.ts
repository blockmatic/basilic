import { MockLanguageModelV4, simulateReadableStream } from "ai/test";

const emptyUsage = {
  inputTokens: { cacheRead: 0, cacheWrite: 0, noCache: 0, total: 0 },
  outputTokens: { reasoning: 0, text: 0, total: 0 },
};
const emptyWarnings: [] = [];

const toolFinish = { raw: undefined, unified: "tool-calls" as const };
const stopFinish = { raw: undefined, unified: "stop" as const };

export function accountRequiredLanguageModel() {
  const toolCall = {
    input: "{}",
    toolCallId: "account_required_canned",
    toolName: "account_required",
    type: "tool-call" as const,
  };
  return new MockLanguageModelV4({
    doGenerate: {
      content: [toolCall],
      finishReason: toolFinish,
      usage: emptyUsage,
      warnings: emptyWarnings,
    },
    doStream: {
      stream: simulateReadableStream({
        chunks: [
          toolCall,
          { type: "finish", finishReason: toolFinish, usage: emptyUsage },
        ],
      }),
    },
    modelId: "account-required",
    provider: "basilic-canned",
  });
}

export function finishLanguageModel() {
  return textLanguageModel({ modelId: "set-view-done", text: "" });
}

export function textLanguageModel({
  text,
  modelId = "account-reply",
}: {
  text: string;
  modelId?: string;
}) {
  return new MockLanguageModelV4({
    doGenerate: {
      content: [{ type: "text", text }],
      finishReason: stopFinish,
      usage: emptyUsage,
      warnings: emptyWarnings,
    },
    doStream: {
      stream: simulateReadableStream({
        chunks: [
          { type: "text-start", id: "t" },
          ...(text
            ? [{ type: "text-delta" as const, id: "t", delta: text }]
            : []),
          { type: "text-end", id: "t" },
          { type: "finish", finishReason: stopFinish, usage: emptyUsage },
        ],
      }),
    },
    modelId,
    provider: "basilic-canned",
  });
}
