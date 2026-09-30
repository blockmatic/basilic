import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";

import "./global.css";
import { Geist_Mono, Inter, Poppins } from "next/font/google";
import type { ReactNode } from "react";

import { env } from "@/lib/env";

const inter = Inter({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["500", "600", "700"],
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const siteTitle = "Basilic · API-first foundation for agentic products";
const siteDescription =
  "Define the product API once. Web, CLI, generated clients, and durable agents operate against it. Generative UI: Jev, json-render, shadcn/Base UI.";

export const metadata: Metadata = {
  description: siteDescription,
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  openGraph: {
    description: siteDescription,
    title: siteTitle,
    type: "website",
  },
  title: {
    default: siteTitle,
    template: "%s | Basilic",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} ${fontMono.variable} font-sans`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <RootProvider
          theme={{ defaultTheme: "dark" }}
          search={{ options: { api: "/api/search" } }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
