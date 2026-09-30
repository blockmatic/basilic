# Mobile App (Expo)

Expo app for Android, iOS, and Web. Magic-link sign-in stores JWTs in `expo-secure-store` and calls Fastify with `@repo/core`. `pnpm dev` does not start this app. Canonical notes: [Frontend](https://basilic-docs.vercel.app/docs/architecture/frontend).

## Prerequisites

- **iOS Simulator**: macOS with Xcode (`xcode-select --install` if needed)
- **Android Emulator**: Android Studio with an AVD
- **Expo Go** (physical device): Install from App Store / Play Store

## Expo Go vs Development Builds

Try **Expo Go** first—most apps work without a custom native build. Use a **development build** only when using custom native modules, Apple targets (widgets, app clips), or third-party native modules not in Expo Go.

## Get Started

1. Install dependencies (from repo root):

   ```bash
   pnpm install
   ```

2. Start the app:

   ```bash
   pnpm --filter @repo/mobile start
   # or: cd apps/mobile && pnpm start
   ```

   Press `i` (iOS) or `a` (Android) in the Expo CLI to open the simulator.

## Dev Environments

| Scenario | Command |
| --- | --- |
| Local | `pnpm --filter @repo/mobile start` |
| Remote + Cursor (port forwarding) | `pnpm --filter @repo/mobile start:localhost` |
| Remote + no forwarding / physical device | `pnpm --filter @repo/mobile start:tunnel` |

See [Dev Environments](https://basilic-docs.vercel.app/docs/development/dev-environments) for Portless API URLs, Metro 8081, tunneling, and troubleshooting.

## Styling (Tailwind + NativeWind)

The app uses **Tailwind CSS v4** via **NativeWind v5** + **react-native-css**. Use the `className` prop on React Native primitives:

```tsx
import { View, Text } from "react-native";

export function MyScreen() {
  return (
    <View className="flex-1 p-4 gap-4">
      <Text className="text-xl font-bold text-blue-600">Hello Tailwind!</Text>
    </View>
  );
}
```

Global styles live in `src/global.css`. Use StyleSheet for complex cases. See `.cursor/rules/frontend/expo.mdc` and `@.agents/skills/expo-native-ui`.

## Environment

| Client | `EXPO_PUBLIC_API_URL` |
| --- | --- |
| iOS simulator on Base | `https://api.basilic.localhost` |
| Generated app | `https://api.{label}.localhost` |
| Android emulator or a physical device | `pnpm --filter @repo/mobile start:tunnel`, then that tunnel origin. `.localhost` is the host machine. |

## EAS Builds & PR Preview

CI builds Android preview via EAS. **EXPO_TOKEN** required in GitHub Secrets. Reviewers install the baseline APK once, then scan QR codes on PRs to load OTA updates. See [Mobile CI/CD](https://basilic-docs.vercel.app/docs/deployment/mobile-cicd) for setup and reviewer bootstrap.

## Scripts

| Script | Command | Use |
| --- | --- | --- |
| `start` | `expo start` | Local dev, default LAN |
| `start:localhost` | `expo start --localhost` | Remote + port forwarding |
| `start:tunnel` | `expo start --tunnel` | Remote without forwarding, physical device |
| `checktypes` | `tsc --noEmit` | Type-check |
| `lint` | Ultracite | Lint |
| `lint:fix` | — | Auto-fix lint |
| `test:e2e` | `maestro test .maestro/flows/home.yml` | Maestro E2E (app on emulator/simulator) |

## Troubleshooting

| Issue | Fix |
| --- | --- |
| "Unable to resolve module" / red box | Run `pnpm install` at repo root; restart Metro with `pnpm start -c` (clear cache). |
| Simulator can't connect to Metro (remote) | Use `start:localhost` when Cursor forwards ports; or `start:tunnel` if not. |
| "Network response timed out" | The scaffold does not call the API. If you add a client, check `EXPO_PUBLIC_API_URL` and that the API host is reachable. |
| iOS Simulator not found | Open Xcode Simulator first: `open -a Simulator`. |
| Android emulator not found | Start an AVD from Android Studio; run `adb devices`. |

## Related

- [Dev Environments](https://basilic-docs.vercel.app/docs/development/dev-environments)
- [Mobile CI/CD](https://basilic-docs.vercel.app/docs/deployment/mobile-cicd) — EAS builds, PR OTA previews
- [Expo documentation](https://docs.expo.dev/)
