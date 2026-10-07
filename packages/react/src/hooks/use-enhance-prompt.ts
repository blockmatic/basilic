"use client";

import type { EnhanceData } from "@repo/core";
import { useMutation } from "@tanstack/react-query";

import { useReactApiConfig } from "../context";

export function useEnhancePrompt() {
  const { client, queryClientDefaults } = useReactApiConfig();

  return useMutation({
    mutationFn: (body: EnhanceData["body"]) =>
      client.ai.enhance({
        body,
        throwOnError: true,
      }),
    ...queryClientDefaults,
  });
}
