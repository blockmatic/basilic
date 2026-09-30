import { parseBool } from "@repo/utils/logger/types";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("production"),
    NEXT_PUBLIC_API_URL: z.string().min(1),
    NEXT_PUBLIC_APP_URL: z.string().url().default("https://tracker.localhost"),
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_AUTH_COOKIE_NAME: z.string().default("api.session"),
    NEXT_PUBLIC_SENTRY_DSN: z.string().min(1).optional(),
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: z.string().min(1).optional(),
    // Logging configuration
    NEXT_PUBLIC_LOG_ENABLED: z
      .string()
      .optional()
      .transform((v) => (v == null ? undefined : parseBool(v, false))),
    NEXT_PUBLIC_LOG_LEVEL: z
      .enum(["debug", "info", "warn", "error", "silent"])
      .optional(),
    // Policy pages (privacy, terms)
    NEXT_PUBLIC_LEGAL_EMAIL: z.string().email().default("legal@example.com"),
  },
  emptyStringAsUndefined: true,
  runtimeEnv: {
    AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY,
    ALLOW_TEST: process.env.ALLOW_TEST,
    AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME,
    JEV_MODEL: process.env.JEV_MODEL,
    JWT_AUDIENCE: process.env.JWT_AUDIENCE,
    JWT_ISSUER: process.env.JWT_ISSUER,
    JWT_SECRET: process.env.JWT_SECRET,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL ??
      process.env.PORTLESS_URL ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : undefined),
    NEXT_PUBLIC_AUTH_COOKIE_NAME:
      process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ?? process.env.AUTH_COOKIE_NAME,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    NEXT_PUBLIC_LEGAL_EMAIL: process.env.NEXT_PUBLIC_LEGAL_EMAIL,
    NEXT_PUBLIC_LOG_ENABLED: process.env.NEXT_PUBLIC_LOG_ENABLED,
    NEXT_PUBLIC_LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL,
    NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    NODE_ENV: process.env.NODE_ENV,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT,
  },
  server: {
    AI_GATEWAY_API_KEY: z.string().min(1).optional(),
    ALLOW_TEST: z.enum(["true", "false"]).optional(),
    AUTH_COOKIE_NAME: z.string().default("api.session"),
    JEV_MODEL: z.string().min(1).default("typesafe-ai/jev"),
    JWT_AUDIENCE: z
      .string()
      .default("api.yourapp.com")
      .transform((val) => val.split(",").map((aud) => aud.trim())),
    JWT_ISSUER: z.string().default("api.yourapp.com"),
    JWT_SECRET:
      process.env.NODE_ENV === "production"
        ? z
            .string()
            .min(32)
            .refine(
              (val) => val !== "default-jwt-secret-min-32-chars-for-dev",
              "JWT_SECRET must not be the dev default in production"
            )
        : z.string().min(32).default("default-jwt-secret-min-32-chars-for-dev"),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    SENTRY_DSN: z.string().min(1).optional(),
    SENTRY_ENVIRONMENT: z.string().min(1).optional(),
  },
});
