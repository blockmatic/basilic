"use client";

import { defineRegistry } from "@json-render/react";
import { Card } from "@repo/ui/components/card";

import { commandCatalog } from "@/lib/genui/catalog";

export function StatusCard({
  props,
}: {
  props: { database: boolean; name: string; ok: boolean };
}) {
  return (
    <Card className="space-y-1 p-4" data-testid="status-card">
      <p className="font-medium">{props.name}</p>
      <p className="text-sm">
        {props.ok ? "Application is up" : "Application is down"}
      </p>
      <p className="text-muted-foreground text-sm">
        {props.database ? "Database is ready" : "Database is unavailable"}
      </p>
    </Card>
  );
}

export const { registry: commandRegistry } = defineRegistry(commandCatalog, {
  actions: {},
  components: {
    StatusCard,
    UserInfo: ({ props }) => (
      <Card className="space-y-1 p-4" data-testid="user-info-card">
        <p className="font-medium">{props.name ?? "Account"}</p>
        {props.email ? (
          <p className="text-muted-foreground text-sm">{props.email}</p>
        ) : null}
      </Card>
    ),
  },
});
