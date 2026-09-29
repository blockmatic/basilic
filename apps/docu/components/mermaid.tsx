"use client";

import { useTheme } from "next-themes";
import { use, useEffect, useId, useState } from "react";

function cachePromise<T>(
  key: string,
  setPromise: () => Promise<T>
): Promise<T> {
  const cached = (cache as Map<string, Promise<unknown>>).get(key);
  if (cached) {
    return cached as Promise<T>;
  }
  const promise = setPromise();
  (cache as Map<string, Promise<unknown>>).set(key, promise);
  return promise;
}

const cache = new Map<string, Promise<unknown>>();

export function Mermaid({ chart }: { chart: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);
  if (!mounted) {
    return null;
  }
  return <MermaidContent chart={chart} />;
}

function MermaidContent({ chart }: { chart: string }) {
  const id = useId();
  const { resolvedTheme } = useTheme();
  const { default: mermaid } = use(
    cachePromise("mermaid", () => import("mermaid"))
  );

  mermaid.initialize({
    fontFamily: "inherit",
    securityLevel: "loose",
    startOnLoad: false,
    theme: resolvedTheme === "dark" ? "dark" : "default",
    themeCSS: "margin: 1.5rem auto 0;",
  });

  const { svg, bindFunctions } = use(
    cachePromise(`${chart}-${resolvedTheme ?? "light"}`, () =>
      mermaid.render(id, chart.replaceAll("\\n", "\n"))
    )
  );

  return (
    <div
      ref={(container) => {
        if (container) {
          bindFunctions?.(container);
        }
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
