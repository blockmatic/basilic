"use client";

import { captureError } from "@repo/error/nextjs";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import type { FallbackProps } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const errorMessage = error instanceof Error ? error.message : String(error);

  return (
    <div
      role="alert"
      className="flex min-h-screen flex-col items-center justify-center p-4"
    >
      <div className="max-w-md space-y-4 text-center">
        <h2 className="font-heading text-xl font-bold md:text-2xl">
          Something went wrong
        </h2>
        <p className="text-muted-foreground">{errorMessage}</p>
        <button
          onClick={resetErrorBoundary}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
      onError={(error) => {
        captureError({
          code: "UNEXPECTED_ERROR",
          error,
          label: "App ErrorBoundary",
          tags: { runtime: "nextjs" },
        });
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
