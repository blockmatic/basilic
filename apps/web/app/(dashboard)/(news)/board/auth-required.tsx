"use client";

import { buttonVariants } from "@repo/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@repo/ui/components/empty";
import { cn } from "@repo/ui/lib/utils";
import Link from "next/link";

export function AuthRequired() {
  return (
    <Empty
      data-testid="auth-required"
      className="bg-card ring-foreground/10 max-w-md rounded-xl border border-solid p-8 ring-1"
    >
      <EmptyHeader>
        <EmptyTitle className="font-heading text-lg font-semibold">
          Sign in to continue
        </EmptyTitle>
        <EmptyDescription>
          This action requires access to your account.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link
          href="/auth/login"
          data-testid="auth-required-sign-in"
          className={cn(buttonVariants(), "min-h-11")}
        >
          Sign in
        </Link>
      </EmptyContent>
    </Empty>
  );
}
