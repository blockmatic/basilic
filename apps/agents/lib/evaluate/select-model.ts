import { isAccountAsk, userIdFromAuth } from "../account-scope.js";
import { getProvider } from "../provider.js";
import {
  accountRequiredLanguageModel,
  finishLanguageModel,
} from "./canned-model.js";

interface ModelMessage {
  role?: string;
  content?: unknown;
}

function textOf({ content }: { content: unknown }) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((part) => {
      if (typeof part !== "object" || part === null || !("text" in part))
        return "";
      return String((part as { text: unknown }).text);
    })
    .join("\n");
}

function partsOf({ content }: { content: unknown }) {
  return Array.isArray(content) ? content : [];
}

export function lastUserPrompt({ messages }: { messages: ModelMessage[] }) {
  const texts = messages
    .filter((message) => message.role === "user")
    .map((message) => textOf({ content: message.content }));
  return texts.at(-1) ?? "";
}

function hasToolCall({
  messages,
  toolName,
}: {
  messages: ModelMessage[];
  toolName: string;
}) {
  return messages.some((message) =>
    partsOf({ content: message.content }).some((part) => {
      if (typeof part !== "object" || part === null) return false;
      const record = part as { toolName?: unknown };
      return record.toolName === toolName;
    })
  );
}

export function hasAccountRequiredCall({
  messages,
}: {
  messages: ModelMessage[];
}) {
  return hasToolCall({ messages, toolName: "account_required" });
}

interface CommandAuthCtx {
  session?: {
    auth?: {
      current?: { principalId?: string; principalType?: string } | null;
    };
  };
}

export async function selectCommandLanguageModel({
  messages,
  ctx = {},
}: {
  messages: ModelMessage[];
  ctx?: CommandAuthCtx;
}) {
  if (
    hasAccountRequiredCall({ messages }) ||
    hasToolCall({ messages, toolName: "set_view" })
  ) {
    return { model: finishLanguageModel(), modelContextWindowTokens: 8_192 };
  }
  const prompt = lastUserPrompt({ messages });
  const signedIn = Boolean(userIdFromAuth({ ctx }));
  if (!signedIn && isAccountAsk({ prompt })) {
    return {
      model: accountRequiredLanguageModel(),
      modelContextWindowTokens: 8_192,
    };
  }
  const model = getProvider();
  if (!model) throw new Error("operator language model is not configured");
  return { model, modelContextWindowTokens: 200_000 };
}
