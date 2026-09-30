import { randomUUID } from "node:crypto";

import { isValidRequestId } from "@repo/utils/logger/types";

interface HeaderReader {
  get: (name: string) => string | null;
}

export function resolveRequestId(headers?: HeaderReader): string {
  const incoming = headers?.get("x-request-id");
  if (incoming && isValidRequestId(incoming)) {
    return incoming;
  }
  return randomUUID();
}
