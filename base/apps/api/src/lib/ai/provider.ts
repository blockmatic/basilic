import type { LanguageModel } from "ai";
import { createGateway } from "ai";

import { env } from "../env.js";

export const defaultGatewayModel = "anthropic/claude-haiku-4.5";
/** Explicit Sonnet tier when callers request `sonnet` (not the default — Haiku is cheaper). */
export const upgradeSonnetGatewayModel = "anthropic/claude-sonnet-4.6";

export const defaultProvider: ResolvedProvider = "gateway";

export type ResolvedProvider = "gateway";

function gatewayToken() {
  return env.AI_GATEWAY_API_KEY ?? env.VERCEL_OIDC_TOKEN;
}

export function getResolvedProvider(): ResolvedProvider | null {
  return gatewayToken() ? defaultProvider : null;
}

const gatewayModelAliases: Record<string, string> = {
  haiku: defaultGatewayModel,
  sonnet: upgradeSonnetGatewayModel,
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
    aliases: gatewayModelAliases,
    defaultAliases: ["default", "haiku"],
    defaultModelOverride: opts?.defaultModel,
    modelParam,
    runtimeDefault: defaultGatewayModel,
  });
}

function requestModelAllowlist(): Set<string> {
  return new Set([
    "default",
    ...(env.AI_DEFAULT_MODEL ? [env.AI_DEFAULT_MODEL] : []),
    "haiku",
    "sonnet",
    defaultGatewayModel,
    upgradeSonnetGatewayModel,
    ...Object.keys(gatewayModelAliases),
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
  const apiKey = gatewayToken();
  if (!apiKey) {
    throw new Error(
      "AI_GATEWAY_API_KEY or VERCEL_OIDC_TOKEN required for AI Gateway"
    );
  }
  return createGateway({ apiKey }).languageModel(
    resolveGatewayModel(modelParam)
  );
}
