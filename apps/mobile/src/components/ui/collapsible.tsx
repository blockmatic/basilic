import { SymbolView } from "expo-symbols";
import type { PropsWithChildren } from "react";
import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export function Collapsible({
  children,
  title,
}: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();

  return (
    <ThemedView>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        style={({ pressed }) => [
          styles.heading,
          pressed && styles.pressedHeading,
        ]}
        onPress={() => setIsOpen((value) => !value)}
      >
        <ThemedView type="backgroundElement" style={styles.button}>
          <SymbolView
            name={{
              android: "chevron_right",
              ios: "chevron.right",
              web: "chevron_right",
            }}
            size={14}
            weight="bold"
            tintColor={theme.text}
            style={{ transform: [{ rotate: isOpen ? "-90deg" : "90deg" }] }}
          />
        </ThemedView>

        <ThemedText type="small">{title}</ThemedText>
      </Pressable>
      {isOpen && (
        <Animated.View entering={FadeIn.duration(200)}>
          <ThemedView type="backgroundElement" style={styles.content}>
            {children}
          </ThemedView>
        </Animated.View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 12,
    height: Spacing.four,
    justifyContent: "center",
    width: Spacing.four,
  },
  content: {
    borderRadius: Spacing.three,
    marginLeft: Spacing.four,
    marginTop: Spacing.three,
    padding: Spacing.four,
  },
  heading: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.two,
  },
  pressedHeading: {
    opacity: 0.7,
  },
});
