# Mobile App (Expo)

Expo app for Android, iOS, and Web. Part of the basilic monorepo.

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
|----------|---------|
| Local | `pnpm --filter @repo/mobile start` |
| Remote + Cursor (port forwarding) | `pnpm --filter @repo/mobile start:localhost` |
| Remote + no forwarding / physical device | `pnpm --filter @repo/mobile start:tunnel` |

See [Dev Environments](https://basilic-docs.vercel.app/docs/development/dev-environments) for ports (8081, 19000, 19001), tunneling, and troubleshooting.

## Styling (Tailwind + NativeWind)

The app uses **Tailwind CSS v4** via **NativeWind v5** + **react-native-css**. Use the `className` prop on React Native primitives:

```tsx
import { View, Text } from 'react-native'

export function MyScreen() {
  return (
    <View className="flex-1 p-4 gap-4">
      <Text className="text-xl font-bold text-blue-600">Hello Tailwind!</Text>
    </View>
  )
}
```

Global styles live in `src/global.css`. Use StyleSheet for complex cases. See `.cursor/rules/frontend/expo.mdc` and `@.agents/skills/expo-tailwind-setup-v55`.

## API / Environment

Configure `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` for API reachability (see `.env.defaults.example`). When Fastify runs on a remote VPC and Cursor forwards port 3001, use `EXPO_PUBLIC_API_URL=http://localhost:3001` so the simulator hits the tunneled API.

## EAS Builds & PR Preview

CI builds Android preview via EAS. **EXPO_TOKEN** required in GitHub Secrets. Reviewers install the baseline APK once, then scan QR codes on PRs to load OTA updates. See [Mobile CI/CD](https://basilic-docs.vercel.app/docs/deployment/mobile-cicd) for setup and reviewer bootstrap.

## Scripts

| Script | Command | Use |
|--------|---------|-----|
| `start` | `expo start` | Local dev, default LAN |
| `start:localhost` | `expo start --localhost` | Remote + port forwarding |
| `start:tunnel` | `expo start --tunnel` | Remote without forwarding, physical device |
| `checktypes` | `tsc --noEmit` | Type-check |
| `lint` | Biome + ESLint | Lint |
| `lint:fix` | — | Auto-fix lint |
| `test:e2e` | `maestro test .maestro/flows/home.yml` | Maestro E2E (app on emulator/simulator) |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Unable to resolve module" / red box | Run `pnpm install` at repo root; restart Metro with `pnpm start -c` (clear cache). |
| Simulator can't connect to Metro (remote) | Use `start:localhost` when Cursor forwards ports; or `start:tunnel` if not. |
| "Network response timed out" | Check `EXPO_PUBLIC_API_URL`; ensure API host is reachable from simulator. |
| iOS Simulator not found | Open Xcode Simulator first: `open -a Simulator`. |
| Android emulator not found | Start an AVD from Android Studio; run `adb devices`. |

## Related

- [Dev Environments](https://basilic-docs.vercel.app/docs/development/dev-environments)
- [Mobile CI/CD](https://basilic-docs.vercel.app/docs/deployment/mobile-cicd) — EAS builds, PR OTA previews
- [Expo documentation](https://docs.expo.dev/)
