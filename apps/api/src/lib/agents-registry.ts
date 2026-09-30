import { Type } from "@sinclair/typebox";

export const agentIds = ["command"] as const;
export type AgentId = (typeof agentIds)[number];

export const AgentRecordSchema = Type.Object({
  capabilities: Type.Array(Type.String()),
  endpoint: Type.String({ minLength: 1 }),
  features: Type.Array(Type.String()),
  id: Type.Literal("command"),
  name: Type.String(),
  presentation: Type.String(),
  transport: Type.Literal("eve"),
});

export function agentCatalog({ commandUrl }: { commandUrl: string }): {
  id: AgentId;
  name: string;
  endpoint: string;
  transport: "eve";
  presentation: string;
  capabilities: string[];
  features: string[];
}[] {
  return [
    {
      capabilities: ["status", "account"],
      endpoint: commandUrl.replace(/\/$/, ""),
      features: ["tools"],
      id: "command",
      name: "Commands",
      presentation: "commands",
      transport: "eve",
    },
  ];
}

export function agentById({
  agentId,
  commandUrl,
}: {
  agentId: string;
  commandUrl: string;
}) {
  return agentCatalog({ commandUrl }).find((row) => row.id === agentId) ?? null;
}
