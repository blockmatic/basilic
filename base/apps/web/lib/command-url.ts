export const commandSurfaces = ["status", "account"] as const;
export type CommandSurface = (typeof commandSurfaces)[number];

export function commandFromPrompt({ q }: { q: string }): {
  q: string;
  surface: CommandSurface;
} {
  const text = q.trim().toLowerCase();
  const surface: CommandSurface =
    /\b(account|who am i|whoami)\b/.test(text) ||
    /\bmy (account|email|name|profile)\b/.test(text)
      ? "account"
      : "status";
  return { q: q.trim(), surface };
}

export function commandSearch({
  q,
  surface,
}: {
  q: string;
  surface: CommandSurface;
}): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  params.set("surface", surface);
  return params.toString();
}

export function parseCommandSearch({ search }: { search: string }): {
  q: string;
  surface: CommandSurface | null;
} {
  const params = new URLSearchParams(search);
  const surface = params.get("surface");
  return {
    q: params.get("q") ?? "",
    surface: surface === "status" || surface === "account" ? surface : null,
  };
}
