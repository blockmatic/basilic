import * as Linking from "expo-linking";

export function registerReturnLink({
  onUrl,
}: {
  onUrl: ({ url }: { url: string }) => void;
}) {
  const subscription = Linking.addEventListener("url", ({ url }) => {
    onUrl({ url });
  });
  return { remove: () => subscription.remove() };
}
