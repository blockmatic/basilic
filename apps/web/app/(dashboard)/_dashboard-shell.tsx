"use client";

import { ScrollArea } from "@repo/ui/components/scroll-area";
import { ApiHealthBadge } from "components/shared/api-health-badge";
import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";

import { AccountMenu } from "./account-menu";
import { PageTitle } from "./page-title";

export function DashboardShell({
  children,
}: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden">
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4 md:gap-4 md:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-4">
          <Link
            href="/"
            className="font-heading flex shrink-0 items-center gap-2 font-medium"
          >
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd />
            </div>
            Basilic
          </Link>
          <PageTitle />
        </div>
        <div className="flex min-h-11 items-center gap-3 md:gap-4">
          <ApiHealthBadge />
          <AccountMenu />
        </div>
      </header>
      <ScrollArea
        className="min-h-0 min-w-0 flex-1"
        style={{ height: "calc(100dvh - 3.5rem)" }}
      >
        <main className="block p-4 md:p-6">{children}</main>
      </ScrollArea>
    </div>
  );
}
