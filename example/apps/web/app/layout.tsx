import { Geist_Mono, Inter, Poppins } from "next/font/google";

import "@repo/ui/styles/globals.css";
import { Providers } from "@/app/providers";
import { ErrorBoundary } from "@/components/shared/error-boundary";

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
  variable: "--font-mono",
});

export const metadata = {
  description: "Basilic web dashboard",
  title: {
    default: "Basilic",
    template: "%s | Basilic",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${poppins.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
