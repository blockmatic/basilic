import type { EveMessage } from "eve/react";
import { describe, expect, it } from "vitest";

import { lastAssistantText, latestView } from "./messages";

const setView = ({
  output,
  state = "output-available",
  toolCallId,
}: {
  output: unknown;
  state?: string;
  toolCallId: string;
}) =>
  ({
    input: {},
    output,
    state,
    toolCallId,
    toolName: "set_view",
    type: "dynamic-tool",
  }) as unknown as EveMessage["parts"][number];

const assistant = ({ id, parts }: { id: string; parts: EveMessage["parts"] }) =>
  ({ id, parts, role: "assistant" }) as EveMessage;

describe("eve messages", () => {
  it("returns the newest committed set_view", () => {
    const messages = [
      assistant({
        id: "a",
        parts: [
          setView({
            output: { q: "status", surface: "status", version: 1 },
            toolCallId: "c1",
          }),
        ],
      }),
      assistant({
        id: "b",
        parts: [
          setView({
            output: { q: "me", surface: "account", version: 1 },
            toolCallId: "c2",
          }),
          setView({
            output: undefined,
            state: "input-available",
            toolCallId: "c3",
          }),
        ],
      }),
    ];
    expect(latestView({ messages })).toEqual({
      callId: "c2",
      view: { q: "me", surface: "account", version: 1 },
    });
  });

  it("ignores invalid view output", () => {
    const messages = [
      assistant({
        id: "a",
        parts: [setView({ output: { surface: "admin" }, toolCallId: "c1" })],
      }),
    ];
    expect(latestView({ messages })).toBeNull();
  });

  it("reads the last assistant text", () => {
    const messages = [
      assistant({
        id: "a",
        parts: [{ text: "first", type: "text" }] as EveMessage["parts"],
      }),
      assistant({
        id: "b",
        parts: [{ text: "Healthy.", type: "text" }] as EveMessage["parts"],
      }),
    ];
    expect(lastAssistantText({ messages })).toBe("Healthy.");
  });
});
