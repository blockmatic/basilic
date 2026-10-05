import { createAnthropic } from "@ai-sdk/anthropic";
import type { LanguageModel } from "ai";

import { env } from "./env.js";

const defaultAnthropicModel = "claude-haiku-4-5";

export function getProvider(): LanguageModel | null {
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return null;
  }
  const anthropic = createAnthropic({ apiKey });
  return anthropic.languageModel(env.AI_DEFAULT_MODEL ?? defaultAnthropicModel);
}

export const getCommandModel = getProvider;
