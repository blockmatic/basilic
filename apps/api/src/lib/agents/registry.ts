import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";

import { env } from "../env.js";

export const publicAgentIds = ["operator", "ask"] as const;
export type PublicAgentId = (typeof publicAgentIds)[number];

export const AgentRecordSchema = Type.Object({
  auth: Type.Union([Type.Literal("optional"), Type.Literal("required")]),
  capabilities: Type.Array(Type.String()),
  delegatesTo: Type.Optional(Type.Array(Type.String())),
  description: Type.String(),
  docs: Type.String(),
  endpoint: Type.String({ minLength: 1 }),
  id: Type.Union([Type.Literal("operator"), Type.Literal("ask")]),
  inputMode: Type.Literal("text"),
  name: Type.String(),
  outputMode: Type.Union([Type.Literal("genui"), Type.Literal("conversation")]),
  streaming: Type.Boolean(),
  transport: Type.Literal("eve"),
  version: Type.String(),
  visibility: Type.Literal("public"),
});

export type AgentRecord = Static<typeof AgentRecordSchema>;

const publicAgents = [
  {
    capabilities: ["status", "account"],
    delegatesTo: ["system", "account"],
    description:
      "Orchestrates application requests. Delegates status to the system specialist and the signed-in account to the account specialist, then commits a Web GenUI view.",
    id: "operator",
    name: "Operator",
    outputMode: "genui",
  },
  {
    capabilities: ["conversation"],
    description:
      "Answers in conversation about the application. No tools, no account data, and no view changes.",
    id: "ask",
    name: "Ask",
    outputMode: "conversation",
  },
] satisfies Pick<
  AgentRecord,
  "capabilities" | "delegatesTo" | "description" | "id" | "name" | "outputMode"
>[];

function trimSlash({ url }: { url: string }): string {
  return url.replace(/\/$/, "");
}

export function agentCatalog(): AgentRecord[] {
  const origin = trimSlash({ url: env.EVE_AGENTS_URL });
  const docs = `${trimSlash({ url: env.DOCS_SITE_URL })}/docs/architecture/agents`;
  return publicAgents.map((agent) => ({
    ...agent,
    auth: "optional",
    docs,
    endpoint: `${origin}/eve/${agent.id}`,
    inputMode: "text",
    streaming: true,
    transport: "eve",
    version: "1",
    visibility: "public",
  }));
}

export function agentById({
  agentId,
}: {
  agentId: string;
}): AgentRecord | null {
  return agentCatalog().find((row) => row.id === agentId) ?? null;
}
