"use client";

import { useQuery } from "@tanstack/react-query";

import { eveHostQueryKey } from "@/lib/query-keys";

import { listAgentEndpoint, type PublicAgentId } from "./host";

export function useAgentEndpoint({ id }: { id: PublicAgentId }) {
  return useQuery({
    queryFn: () => listAgentEndpoint({ id }),
    queryKey: eveHostQueryKey({ id }),
    staleTime: Number.POSITIVE_INFINITY,
  });
}
