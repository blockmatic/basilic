import { Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const baseTabBarHeight = Platform.select({ ios: 50, android: 80 }) ?? 0

/**
 * Returns bottom inset values for screens in a tab layout.
 * - full: safe area bottom + tab bar height (use when managing insets manually)
 * - tabBarOnly: tab bar height only (use inside SafeAreaView)
 *
 * Note: Expo Router NativeTabs handles content insets automatically. Use this hook
 * only when you need manual control (e.g. disableAutomaticContentInsets on Tabs).
 */
export function useBottomTabInset() {
  const insets = useSafeAreaInsets()
  return {
    full: insets.bottom + baseTabBarHeight,
    tabBarOnly: baseTabBarHeight,
  }
}
