"use client";

import { ApiError } from "@repo/core";
import { useEnhancePrompt } from "@repo/react";
import { Button } from "@repo/ui/components/button";

export function EnhancePromptButton({
  draft,
  disabled,
  onEnhanced,
  onError,
}: {
  draft: string;
  disabled?: boolean;
  onEnhanced: (text: string) => void;
  onError?: (message: string) => void;
}) {
  const enhance = useEnhancePrompt();
  const trimmed = draft.trim();
  const isBusy = enhance.isPending;

  return (
    <Button
      className="min-h-11"
      data-testid="enhance-prompt"
      disabled={disabled || isBusy || !trimmed}
      onClick={() => {
        if (!trimmed || isBusy) return;
        void enhance
          .mutateAsync({ prompt: trimmed })
          .then((result) => {
            onEnhanced(result.text);
          })
          .catch((error: unknown) => {
            const message =
              error instanceof ApiError
                ? error.message
                : error instanceof Error
                  ? error.message
                  : "Enhance failed";
            onError?.(message);
          });
      }}
      type="button"
      variant="outline"
    >
      {isBusy ? "Enhancing…" : "Enhance"}
    </Button>
  );
}
