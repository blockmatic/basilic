export function requireApiUrl({ value }: { value?: string }) {
  const url = value?.trim() ?? "";
  if (!url) throw new Error("EXPO_PUBLIC_API_URL is required");
  return { url };
}
