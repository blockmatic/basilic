import '@/global.css'

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useColorScheme, View } from 'react-native'

import { AnimatedSplashOverlay } from '@/components/animated-icon'
import AppTabs from '@/components/app-tabs'

export default function TabLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <View className={isDark ? 'dark' : undefined} style={{ flex: 1 }}>
        <AnimatedSplashOverlay />
        <AppTabs />
      </View>
    </ThemeProvider>
  )
}
