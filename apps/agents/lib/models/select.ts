import { mockModel, type MockModelResponder } from "eve/evals";

import { env } from "../env.js";
import { getProvider } from "../provider.js";

/**
 * Gateway model when credentials exist, otherwise a deterministic scripted router so
 * `eve dev` and `eve eval` run without keys. `AGENTS_MODEL` forces either path.
 */
export function selectModel({
  member,
  scripted,
}: {
  member: string;
  scripted: MockModelResponder;
}) {
  const gateway = env.AGENTS_MODEL === "scripted" ? null : getProvider();
  if (gateway) return { model: gateway, modelContextWindowTokens: 200_000 };
  if (env.AGENTS_MODEL === "gateway")
    throw new Error(
      `${member}: AGENTS_MODEL=gateway needs AI_GATEWAY_API_KEY or VERCEL_OIDC_TOKEN in apps/agents/.env`
    );
  return {
    model: mockModel({
      modelId: `${member}-scripted`,
      provider: "basilic-scripted",
      respond: scripted,
    }),
    modelContextWindowTokens: 8_192,
  };
}
