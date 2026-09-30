"use client";

import { createClient } from "@repo/core";
import { ApiProvider } from "@repo/react";
import { Toaster } from "@repo/ui/components/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  getAuthToken,
  getRefreshToken,
  refreshSessionViaNext,
} from "lib/auth/auth-client";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useState } from "react";
import type { ReactNode } from "react";
import { WagmiProvider } from "wagmi";

import { env } from "@/lib/env";
import { wagmiConfig } from "@/lib/wallet";

export const coreClient = createClient({
  baseUrl: env.NEXT_PUBLIC_API_URL,
  getAuthToken,
  getRefreshToken,
  onTokensRefreshed: async () => {},
  refreshTokens: refreshSessionViaNext,
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <ApiProvider client={coreClient}>
          <NuqsAdapter>
            <NextThemesProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
              enableColorScheme
            >
              {children}
              <Toaster richColors position="top-right" />
            </NextThemesProvider>
          </NuqsAdapter>
        </ApiProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
