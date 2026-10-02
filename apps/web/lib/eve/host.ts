"use client";

import { coreClient } from "@/app/providers";

export const publicAgentIds = ["operator", "ask"] as const;
export type PublicAgentId = (typeof publicAgentIds)[number];

export async function listAgentEndpoint({
  id,
}: {
  id: PublicAgentId;
}): Promise<string> {
  const agents = await coreClient.listAgents();
  const agent = agents.find((row) => row.id === id);
  if (!agent?.endpoint) throw new Error(`${id} agent is not advertised`);
  return agent.endpoint;
}
