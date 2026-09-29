import { Platform, StyleSheet, Text } from "react-native";
import type { TextProps } from "react-native";

import type { ThemeColor } from "@/constants/theme";
import { Fonts } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export type ThemedTextProps = TextProps & {
  type?:
    | "default"
    | "title"
    | "small"
    | "smallBold"
    | "subtitle"
    | "link"
    | "linkPrimary"
    | "code";
  themeColor?: ThemeColor;
};

export function ThemedText({
  style,
  type = "default",
  themeColor,
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? "text"] },
        type === "default" && styles.default,
        type === "title" && styles.title,
        type === "small" && styles.small,
        type === "smallBold" && styles.smallBold,
        type === "subtitle" && styles.subtitle,
        type === "link" && styles.link,
        type === "linkPrimary" && styles.linkPrimary,
        type === "code" && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  code: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
  },
  default: {
    fontSize: 16,
    fontWeight: 500,
    lineHeight: 24,
  },
  link: {
    fontSize: 14,
    lineHeight: 30,
  },
  linkPrimary: {
    color: "#3c87f7",
    fontSize: 14,
    lineHeight: 30,
  },
  small: {
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 20,
  },
  smallBold: {
    fontSize: 14,
    fontWeight: 700,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 32,
    fontWeight: 600,
    lineHeight: 44,
  },
  title: {
    fontSize: 48,
    fontWeight: 600,
    lineHeight: 52,
  },
});
