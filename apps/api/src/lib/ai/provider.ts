import { createAnthropic } from "@ai-sdk/anthropic";
import type { LanguageModel } from "ai";

import { env } from "../env.js";

export const defaultAnthropicModel = "claude-haiku-4-5";
/** Explicit Sonnet tier when callers request `sonnet` (not the default — Haiku is cheaper). */
export const upgradeSonnetAnthropicModel = "claude-sonnet-4-6";

/** Legacy Vercel AI Gateway slugs — still accepted on `POST /ai/generate`. */
export const defaultGatewayModel = "anthropic/claude-haiku-4.5";
export const upgradeSonnetGatewayModel = "anthropic/claude-sonnet-4.6";

export const defaultProvider: ResolvedProvider = "anthropic";

export type ResolvedProvider = "anthropic";

function anthropicApiKey() {
  return env.ANTHROPIC_API_KEY;
}

export function getResolvedProvider(): ResolvedProvider | null {
  return anthropicApiKey() ? defaultProvider : null;
}

const modelAliases: Record<string, string> = {
  haiku: defaultAnthropicModel,
  sonnet: upgradeSonnetAnthropicModel,
  [defaultGatewayModel]: defaultAnthropicModel,
  [upgradeSonnetGatewayModel]: upgradeSonnetAnthropicModel,
};

function resolveModelParam({
  modelParam,
  runtimeDefault,
  defaultAliases,
  aliases,
  defaultModelOverride,
}: {
  modelParam?: string;
  runtimeDefault: string;
  defaultAliases: string[];
  aliases: Record<string, string>;
  defaultModelOverride?: string;
}): string {
  const defaultModel =
    defaultModelOverride ?? env.AI_DEFAULT_MODEL ?? runtimeDefault;
  const m =
    (modelParam?.trim().length ?? 0) > 0 ? modelParam?.trim() : undefined;
  const useDefault =
    m === undefined ||
    defaultAliases.includes(m) ||
    m === defaultModel ||
    m === runtimeDefault;
  const effective = useDefault ? defaultModel : (m ?? defaultModel);
  return aliases[effective] ?? effective;
}

export function resolveGatewayModel(
  modelParam?: string,
  opts?: { defaultModel?: string }
): string {
  return resolveModelParam({
    aliases: modelAliases,
    defaultAliases: ["default", "haiku"],
    defaultModelOverride: opts?.defaultModel,
    modelParam,
    runtimeDefault: defaultAnthropicModel,
  });
}

function requestModelAllowlist(): Set<string> {
  return new Set([
    "default",
    ...(env.AI_DEFAULT_MODEL ? [env.AI_DEFAULT_MODEL] : []),
    "haiku",
    "sonnet",
    defaultAnthropicModel,
    upgradeSonnetAnthropicModel,
    defaultGatewayModel,
    upgradeSonnetGatewayModel,
    ...Object.keys(modelAliases),
  ]);
}

export function isAllowedRequestModel({
  model,
}: {
  model?: string;
  provider?: ResolvedProvider | null;
}): boolean {
  const trimmed = model?.trim();
  if (!trimmed) {
    return true;
  }
  return requestModelAllowlist().has(trimmed);
}

export function getProvider(
  _provider: ResolvedProvider,
  modelParam?: string
): LanguageModel {
  const apiKey = anthropicApiKey();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY required for Anthropic language models");
  }
  const anthropic = createAnthropic({ apiKey });
  return anthropic.languageModel(resolveGatewayModel(modelParam));
}
