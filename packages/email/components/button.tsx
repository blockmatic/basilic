import { Button as ReactEmailButton } from "@react-email/components";
import type React from "react";

import {
  emailTheme,
  getEmailInlineStyles,
  getEmailThemeClasses,
} from "./theme.js";

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "solid";
  className?: string;
}

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonProps) {
  const themeClasses = getEmailThemeClasses();
  const lightStyles = getEmailInlineStyles("light");

  const baseClasses =
    "box-border text-[14px] font-medium no-underline text-center px-6 py-3 border border-solid";

  if (variant === "solid") {
    return (
      <ReactEmailButton
        className={`${baseClasses} ${className}`}
        href={href}
        style={{
          backgroundColor: emailTheme.light.foreground,
          color: emailTheme.light.background,
          borderColor: emailTheme.light.foreground,
        }}
      >
        {children}
      </ReactEmailButton>
    );
  }

  const variantClasses =
    variant === "primary"
      ? themeClasses.button
      : "border-gray-300 text-gray-600";
  const buttonStyle =
    variant === "primary"
      ? {
          backgroundColor: "transparent",
          borderColor: lightStyles.button.borderColor,
          color: lightStyles.button.color,
        }
      : {
          backgroundColor: "transparent",
          borderColor: "#d1d5db",
          color: "#6b7280",
        };

  return (
    <ReactEmailButton
      className={`${baseClasses} ${variantClasses} ${className}`}
      href={href}
      style={buttonStyle}
    >
      {children}
    </ReactEmailButton>
  );
}
