import type { JSONValue } from "ai";

import { isAccountScopedAsk, userIdFromAuth } from "../account-scope.js";
import { env } from "../env.js";
import { getProvider } from "../provider.js";
import { evaluateBoardTurn } from "./board-turn.js";
import {
  accountRequiredLanguageModel,
  finishLanguageModel,
  setViewLanguageModel,
} from "./canned-model.js";
import { resolveCommandTurn } from "./resolve.js";

interface ModelMessage {
  role?: string;
  content?: unknown;
}

function textOf({ content }: { content: unknown }) {
  if (typeof content === "string") {
    return content;
  }
  if (!Array.isArray(content)) {
    return "";
  }
  return content
    .map((part) => {
      if (typeof part !== "object" || part === null || !("text" in part)) {
        return "";
      }
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
  for (let i = texts.length - 1; i >= 0; i--) {
    const text = texts[i];
    if (!text) {
      continue;
    }
    try {
      const parsed = JSON.parse(text) as { boardQuery?: unknown };
      if (parsed && typeof parsed === "object" && "boardQuery" in parsed) {
        continue;
      }
    } catch {
      return text;
    }
    return text;
  }
  return texts.at(-1) ?? "";
}

export function boardQueryFromMessages({
  messages,
}: {
  messages: ModelMessage[];
}): JSONValue | undefined {
  for (const message of messages) {
    if (message.role !== "user") {
      continue;
    }
    try {
      const parsed = JSON.parse(textOf({ content: message.content })) as {
        boardQuery?: JSONValue;
      };
      if (parsed && typeof parsed === "object" && "boardQuery" in parsed) {
        return parsed.boardQuery;
      }
    } catch {
      // not JSON — keep scanning user messages
    }
  }
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
      if (typeof part !== "object" || part === null) {
        return false;
      }
      const record = part as { toolName?: unknown; type?: unknown };
      return record.toolName === toolName;
    })
  );
}

export function hasSetViewCall({ messages }: { messages: ModelMessage[] }) {
  return hasToolCall({ messages, toolName: "set_view" });
}

export function hasAccountRequiredCall({
  messages,
}: {
  messages: ModelMessage[];
}) {
  return hasToolCall({ messages, toolName: "account_required" });
}

const accountRequiredModel = {
  model: accountRequiredLanguageModel(),
  modelContextWindowTokens: 8192,
};

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
  if (hasSetViewCall({ messages }) || hasAccountRequiredCall({ messages })) {
    return { model: finishLanguageModel(), modelContextWindowTokens: 8_192 };
  }
  const prompt = lastUserPrompt({ messages });
  const signedIn = Boolean(userIdFromAuth({ ctx }));
  if (!signedIn && isAccountScopedAsk({ prompt })) {
    return accountRequiredModel;
  }
  const boardQuery = boardQueryFromMessages({ messages });
  const evaluated = await evaluateBoardTurn({ boardQuery, prompt });
  if (!("skip" in evaluated)) {
    const resolved = resolveCommandTurn({
      answers: evaluated.answers,
      boardQuery,
      cannedMinProbability: env.JEV_CANNED_MIN_PROBABILITY,
      cannedPatch: evaluated.cannedPatch as Record<string, unknown> | null,
      refuseMinProbability: env.JEV_REFUSE_MIN_PROBABILITY,
    });
    if (
      !signedIn &&
      resolved.kind === "canned" &&
      (resolved.viewConfig.surface === "account" ||
        resolved.viewConfig.query.universe === "watchlist")
    ) {
      return accountRequiredModel;
    }
    if (resolved.kind !== "tools") {
      return {
        model: setViewLanguageModel({
          input: {
            viewConfig: resolved.viewConfig,
            ...(resolved.honesty ? { honesty: resolved.honesty } : {}),
          },
        }),
        modelContextWindowTokens: 8_192,
      };
    }
  }
  const model = getProvider();
  if (!model) {
    throw new Error("command language model is not configured");
  }
  return { model, modelContextWindowTokens: 200_000 };
}
