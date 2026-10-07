"use client";

import { useEveAgent } from "eve/react";
import { useState } from "react";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
} from "@/components/assistant/conversation";
import { EnhancePromptButton } from "@/components/assistant/enhance-prompt";
import { Message, MessageContent } from "@/components/assistant/message";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/assistant/prompt-input";
import { eveAccessToken } from "@/lib/eve/headers";
import { messageText } from "@/lib/eve/messages";
import { useAgentEndpoint } from "@/lib/eve/use-agent-endpoint";

function AskSession({ host }: { host: string | undefined }) {
  const [draft, setDraft] = useState("");
  const [enhanceError, setEnhanceError] = useState<string | null>(null);
  const agent = useEveAgent({ auth: { bearer: eveAccessToken }, host });
  const { messages } = agent.data;
  const status = agent.status === "resuming" ? "submitted" : agent.status;
  const isBusy = status === "submitted" || status === "streaming";

  return (
    <div className="flex h-[calc(100dvh-8rem)] min-h-0 flex-col gap-3 md:h-[calc(100dvh-9rem)]">
      <Conversation>
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState>
              Ask anything. This surface has no tools and no specialists.
            </ConversationEmptyState>
          ) : null}
          {messages.map((message) => (
            <Message
              data-testid="chat-message"
              from={message.role}
              key={message.id}
            >
              <MessageContent>{messageText({ message })}</MessageContent>
            </Message>
          ))}
        </ConversationContent>
      </Conversation>
      {(enhanceError ?? agent.error?.message) ? (
        <p className="text-destructive text-sm" data-testid="chat-error">
          {enhanceError ?? agent.error?.message}
        </p>
      ) : null}
      <PromptInput
        className="flex items-end gap-1"
        onSubmit={() => {
          const message = draft.trim();
          if (!host || !message) return;
          setDraft("");
          void agent.send(message);
        }}
      >
        <PromptInputTextarea
          aria-label="Message"
          data-testid="chat-input"
          onChange={(event) => {
            setEnhanceError(null);
            setDraft(event.target.value);
          }}
          placeholder="Ask a question"
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
        <PromptInputSubmit
          disabled={!host || !draft.trim() || isBusy}
          onStop={() => void agent.cancel()}
          status={status}
        />
      </PromptInput>
    </div>
  );
}

export function AskPage() {
  const endpoint = useAgentEndpoint({ id: "ask" });
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
      {endpoint.error ? (
        <p className="text-destructive text-sm">{endpoint.error.message}</p>
      ) : null}
      <AskSession host={endpoint.data} key={endpoint.data ?? "pending"} />
    </div>
  );
}
