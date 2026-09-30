"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useReactApiConfig } from "../../context";
import type { Web3Chain } from "../../types";

export interface UseVerifyLinkWalletParams {
  chain: Web3Chain;
  message: string;
  signature: string;
  domain: string;
}

/**
 * Minimal hook: given signed SIWE/SIWS payload, calls link wallet verify endpoint.
 * No wallet adapters, no viem, no message building.
 */
export function useVerifyLinkWallet() {
  const { client } = useReactApiConfig();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      chain,
      message,
      signature,
      domain,
    }: UseVerifyLinkWalletParams) => {
      await client.account.link.wallet.verify({
        body: { chain, domain, message, signature },
        throwOnError: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "session", "user"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "session", "jwt"] });
    },
  });
}
