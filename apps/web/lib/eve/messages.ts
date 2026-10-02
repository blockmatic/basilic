import { parseViewConfig, type ViewConfig } from "@repo/utils/view-config";
import type { EveMessage } from "eve/react";

export function messageText({ message }: { message: EveMessage }): string {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");
}

export function lastAssistantText({
  messages,
}: {
  messages: readonly EveMessage[];
}): string {
  const last = messages.findLast((message) => message.role === "assistant");
  return last ? messageText({ message: last }) : "";
}

/** The newest committed `set_view` output, keyed by its tool call so callers apply it once. */
export function latestView({
  messages,
}: {
  messages: readonly EveMessage[];
}): { callId: string; view: ViewConfig } | null {
  for (const message of messages.toReversed())
    for (const part of message.parts.toReversed()) {
      if (
        part.type !== "dynamic-tool" ||
        part.toolName !== "set_view" ||
        part.state !== "output-available" ||
        part.partial
      )
        continue;
      const view = parseViewConfig({ value: part.output });
      if (view) return { callId: part.toolCallId, view };
    }
  return null;
}
