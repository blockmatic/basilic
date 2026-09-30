import { buttonVariants } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import Link from "next/link";

import { CommandPanel } from "@/components/landing/command-panel";
import { LandingSection } from "@/components/landing/section";

export function Hero() {
  return (
    <LandingSection hero>
      <h1 className="font-heading text-foreground text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl md:leading-[1.1]">
        API-first foundation
        <br />
        for agentic products
      </h1>
      <p className="text-muted-foreground mt-5 max-w-xl text-base text-pretty md:mt-6 md:text-lg">
        Define the product API once. Web, CLI, generated clients, and durable
        agents operate against it. Generative UI uses Jev, json-render, and
        shadcn/Base UI.
      </p>
      <div className="mt-10 md:mt-12">
        <CommandPanel />
      </div>
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground max-w-xl text-sm text-pretty">
          Then <code className="text-foreground font-mono">pnpm db:start</code>{" "}
          and <code className="text-foreground font-mono">pnpm dev</code>.{" "}
          <code className="text-foreground font-mono">create-basilic</code> is
          not on npm <code className="text-foreground font-mono">latest</code>{" "}
          yet.
        </p>
        <Link
          href="/docs/development"
          className={cn(
            buttonVariants({ size: "lg" }),
            "min-h-11 w-full sm:w-auto"
          )}
        >
          Getting Started
        </Link>
      </div>
    </LandingSection>
  );
}
