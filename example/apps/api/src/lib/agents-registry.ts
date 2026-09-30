import { Type } from "@sinclair/typebox";

export const agentIds = ["command", "chat"] as const;
export type AgentId = (typeof agentIds)[number];

export const AgentRecordSchema = Type.Object({
  capabilities: Type.Array(Type.String()),
  endpoint: Type.String({ minLength: 1 }),
  features: Type.Array(Type.String()),
  id: Type.Union([Type.Literal("command"), Type.Literal("chat")]),
  name: Type.String(),
  presentation: Type.String(),
  transport: Type.Literal("eve"),
});

export function agentCatalog({
  commandUrl,
  chatUrl,
}: {
  commandUrl: string;
  chatUrl: string;
}): {
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
      capabilities: ["markets", "watches"],
      endpoint: commandUrl.replace(/\/$/, ""),
      features: ["tools"],
      id: "command",
      name: "Commands",
      presentation: "commands",
      transport: "eve",
    },
    {
      capabilities: ["watches-read"],
      endpoint: chatUrl.replace(/\/$/, ""),
      features: ["transcript"],
      id: "chat",
      name: "Chat",
      presentation: "chat",
      transport: "eve",
    },
  ];
}

export function agentById({
  agentId,
  commandUrl,
  chatUrl,
}: {
  agentId: string;
  commandUrl: string;
  chatUrl: string;
}) {
  return (
    agentCatalog({ chatUrl, commandUrl }).find((row) => row.id === agentId) ??
    null
  );
}
