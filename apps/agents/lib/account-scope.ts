export function normalizeAsk({ prompt }: { prompt: string }) {
  return prompt
    .trim()
    .toLowerCase()
    .replaceAll(/[?!.,]+$/g, "")
    .trim();
}

export function isAccountAsk({ prompt }: { prompt: string }) {
  const text = normalizeAsk({ prompt });
  if (!text) return false;
  return (
    /^who\s+am\s+i$/.test(text) ||
    text === "whoami" ||
    /^who\s+i\s+am$/.test(text) ||
    /^(?:what(?:'s| is)\s+)?my\s+(?:name|email|username|profile|account)$/.test(
      text
    ) ||
    /^show\s+my\s+account$/.test(text) ||
    /^signed in as$/.test(text)
  );
}

export function userIdFromAuth({
  ctx,
}: {
  ctx: {
    session?: {
      auth?: {
        current?: { principalId?: string; principalType?: string } | null;
      };
    };
  };
}) {
  const current = ctx.session?.auth?.current;
  if (current?.principalType !== "user" || !current.principalId) return null;
  return current.principalId;
}
