"use server";

import { logger } from "@repo/utils/logger/server";

import { getUserInfo } from "@/lib/auth/auth-utils";
import { env } from "@/lib/env";

import { runComposeBoardSpec } from "./compose-run";
import type { ComposeBoardResult } from "./compose-run";
import { accountFromUser, parseViewConfig } from "./view-config";
import type { ViewConfig } from "./view-config";

export async function composeBoardSpec({
  prompt,
  view,
}: {
  prompt: string;
  view: ViewConfig;
}): Promise<ComposeBoardResult> {
  const parsed = parseViewConfig({ value: view });
  if (!parsed) {
    return { skip: true, reason: "unavailable" };
  }
  try {
    return await runComposeBoardSpec({
      account: accountFromUser({ user: await getUserInfo() }),
      apiKey: env.AI_GATEWAY_API_KEY,
      caption: parsed.title,
      model: env.JEV_MODEL,
      prompt,
      view: parsed,
    });
  } catch (error) {
    logger.error({ err: error }, "composeBoardSpec failed");
    return { reason: "unavailable", skip: true };
  }
}
