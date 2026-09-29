"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

const AccountRequiredContext = createContext<{
  prompted: boolean;
  setPrompted: (prompted: boolean) => void;
}>({ prompted: false, setPrompted: () => {} });

export function AccountRequiredProvider({ children }: { children: ReactNode }) {
  const [prompted, setPrompted] = useState(false);
  return (
    <AccountRequiredContext.Provider value={{ prompted, setPrompted }}>
      {children}
    </AccountRequiredContext.Provider>
  );
}

export function useAccountRequiredPrompt() {
  return useContext(AccountRequiredContext);
}
