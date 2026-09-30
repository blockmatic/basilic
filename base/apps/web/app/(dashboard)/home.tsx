"use client";

import { createStateStore, Renderer, StateProvider } from "@json-render/react";
import { useHealthCheck, useUser } from "@repo/react";
import { Button } from "@repo/ui/components/button";
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { useState } from "react";

import { AuthRequired } from "@/components/genui/auth-required";
import { commandRegistry } from "@/components/genui/registry";
import { Welcome } from "@/components/welcome";
import { commandFromPrompt, commandSurfaces } from "@/lib/command-url";
import { accountSpec, statusSpec } from "@/lib/genui/spec";

const parsers = {
  q: parseAsString.withDefault(""),
  surface: parseAsStringLiteral(commandSurfaces),
};

export function HomePage() {
  const [view, setView] = useQueryStates(parsers);
  const [draft, setDraft] = useState(view.q);
  const [store] = useState(() => createStateStore({}));
  const health = useHealthCheck();
  const user = useUser();
  const status = {
    database: Boolean(health.data?.dbReady),
    name: "Basilic",
    ok: Boolean(health.data?.ok),
  };
  const account = user.data?.user;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Welcome name="Basilic" />
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const next = commandFromPrompt({ q: draft });
          void setView(next);
        }}
      >
        <input
          aria-label="Command"
          className="border-input bg-background min-h-11 flex-1 rounded-md border px-3"
          data-testid="command-input"
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Show application status"
          value={draft}
        />
        <Button type="submit">Ask</Button>
      </form>
      {view.surface === "status" ? (
        <StateProvider store={store}>
          <Renderer registry={commandRegistry} spec={statusSpec({ status })} />
        </StateProvider>
      ) : null}
      {view.surface === "account" && user.isError ? <AuthRequired /> : null}
      {view.surface === "account" && account ? (
        <StateProvider store={store}>
          <Renderer
            registry={commandRegistry}
            spec={accountSpec({
              account: {
                email: account.email,
                image: null,
                name: account.name,
              },
            })}
          />
        </StateProvider>
      ) : null}
    </div>
  );
}
