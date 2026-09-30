import "@/global.css";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useEffect } from "react";
import { Platform, useColorScheme, View } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";
import { registerReturnLink } from "@/lib/linking";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  useEffect(() => {
    const link = registerReturnLink({ onUrl: () => undefined });
    return () => link.remove();
  }, []);
  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <View className={isDark ? "dark" : undefined} style={{ flex: 1 }}>
        {Platform.OS !== "web" && <AnimatedSplashOverlay />}
        <AppTabs />
      </View>
    </ThemeProvider>
  );
}
