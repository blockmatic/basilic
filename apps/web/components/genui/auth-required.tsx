import { buttonVariants } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import Link from "next/link";

export function AuthRequired() {
  return (
    <div
      className="bg-card max-w-md space-y-3 rounded-xl border p-6"
      data-testid="auth-required"
    >
      <h2 className="font-heading text-lg font-semibold">
        Sign in to continue
      </h2>
      <p className="text-muted-foreground text-sm">
        This action requires access to your account.
      </p>
      <Link
        className={cn(buttonVariants(), "inline-flex min-h-11")}
        data-testid="auth-required-sign-in"
        href="/auth/login"
      >
        Sign in
      </Link>
    </div>
  );
}
