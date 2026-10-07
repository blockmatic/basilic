"use client";

import { Button } from "@repo/ui/components/button";
import type { ViewConfig } from "@repo/utils/view-config";
import { useEveAgent } from "eve/react";
import { useEffect, useRef, useState } from "react";

import { EnhancePromptButton } from "@/components/assistant/enhance-prompt";
import { eveAccessToken } from "@/lib/eve/headers";
import { lastAssistantText, latestView } from "@/lib/eve/messages";

export function CommandComposer({
  host,
  initialDraft,
  onView,
}: {
  host: string | undefined;
  initialDraft: string;
  onView: (view: Pick<ViewConfig, "q" | "surface">) => void;
}) {
  const [draft, setDraft] = useState(initialDraft);
  const [enhanceError, setEnhanceError] = useState<string | null>(null);
  const agent = useEveAgent({ auth: { bearer: eveAccessToken }, host });
  const applied = useRef<string | null>(null);
  const isBusy = agent.status === "submitted" || agent.status === "streaming";
  const committed = latestView({ messages: agent.data.messages });
  const reply = lastAssistantText({ messages: agent.data.messages });

  useEffect(() => {
    if (!committed || applied.current === committed.callId) return;
    applied.current = committed.callId;
    onView({ q: committed.view.q, surface: committed.view.surface });
  }, [committed, onView]);

  return (
    <div className="flex flex-col gap-2">
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const message = draft.trim();
          if (!host || !message || isBusy) return;
          void agent.send(message);
        }}
      >
        <input
          aria-label="Agent"
          className="border-input bg-background min-h-11 flex-1 rounded-md border px-3"
          data-testid="command-input"
          onChange={(event) => {
            setEnhanceError(null);
            setDraft(event.target.value);
          }}
          placeholder="Show application status"
          value={draft}
        />
        <EnhancePromptButton
          disabled={!host || isBusy}
          draft={draft}
          onEnhanced={(text) => {
            setEnhanceError(null);
            setDraft(text);
          }}
          onError={setEnhanceError}
        />
        <Button className="min-h-11" disabled={!host || isBusy} type="submit">
          {isBusy ? "Sending…" : "Send"}
        </Button>
      </form>
      {reply ? (
        <p
          className="text-muted-foreground text-sm"
          data-testid="command-reply"
        >
          {reply}
        </p>
      ) : null}
      {(enhanceError ?? agent.error?.message) ? (
        <p className="text-destructive text-sm" data-testid="command-error">
          {enhanceError ?? agent.error?.message}
        </p>
      ) : null}
    </div>
  );
}
