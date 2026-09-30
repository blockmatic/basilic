"use client";

import { usePathname } from "next/navigation";

export const pageTitles: Record<string, string> = {
  "/": "Home",
  "/settings": "Profile",
  "/settings/security": "Passkeys",
  "/settings/security/apikeys": "API keys",
  "/settings/security/passkeys": "Passkeys",
  "/settings/security/totp": "Authenticator",
};

export function PageTitle(): React.JSX.Element | null {
  const pathname = usePathname();
  const title = pageTitles[pathname];
  if (!title) {
    return null;
  }
  return (
    <h1 className="font-heading truncate text-lg font-semibold md:text-xl">
      {title}
    </h1>
  );
}
