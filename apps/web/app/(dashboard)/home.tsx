"use client";

import { JSONUIProvider, Renderer } from "@json-render/react";
import { useHealthCheck, useUser } from "@repo/react";
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";

import { AuthRequired } from "@/components/genui/auth-required";
import { CommandComposer } from "@/components/genui/command-composer";
import { commandRegistry } from "@/components/genui/registry";
import { Welcome } from "@/components/welcome";
import { commandSurfaces } from "@/lib/command-url";
import { useAgentEndpoint } from "@/lib/eve/use-agent-endpoint";
import { accountSpec, statusSpec } from "@/lib/genui/spec";

const parsers = {
  q: parseAsString.withDefault(""),
  surface: parseAsStringLiteral(commandSurfaces),
};

export function HomePage() {
  const [view, setView] = useQueryStates(parsers);
  const endpoint = useAgentEndpoint({ id: "operator" });
  const health = useHealthCheck();
  const user = useUser();
  const status = {
    database: Boolean(health.data?.dbReady),
    name: "Basilic",
    ok: Boolean(health.data?.ok),
  };
  const account = user.data?.user;
  const isAccount = view.surface === "account";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Welcome name="Basilic" />
      <CommandComposer
        host={endpoint.data}
        initialDraft={view.q}
        onView={(next) => void setView(next)}
      />
      {endpoint.error ? (
        <p className="text-destructive text-sm">{endpoint.error.message}</p>
      ) : null}
      <JSONUIProvider registry={commandRegistry}>
        {view.surface === "status" ? (
          <Renderer registry={commandRegistry} spec={statusSpec({ status })} />
        ) : null}
        {isAccount && account ? (
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
        ) : null}
      </JSONUIProvider>
      {isAccount && !user.isPending && !account ? <AuthRequired /> : null}
    </div>
  );
}
