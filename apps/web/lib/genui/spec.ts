import type { Spec } from "@json-render/core";

export interface ApplicationStatus {
  database: boolean;
  name: string;
  ok: boolean;
}

export interface AccountCard {
  email: string | null;
  image: string | null;
  name: string | null;
}

export function statusSpec({ status }: { status: ApplicationStatus }): Spec {
  return {
    elements: {
      status: {
        children: [],
        props: {
          database: status.database,
          name: status.name,
          ok: status.ok,
        },
        type: "StatusCard",
      },
    },
    root: "status",
  };
}

export function accountSpec({ account }: { account: AccountCard }): Spec {
  return {
    elements: {
      account: {
        children: [],
        props: {
          email: account.email,
          image: account.image,
          name: account.name,
        },
        type: "UserInfo",
      },
    },
    root: "account",
  };
}
