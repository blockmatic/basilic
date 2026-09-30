import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import next from "ultracite/oxlint/next";
import react from "ultracite/oxlint/react";

const processEnvMessage =
  "Never use process.env in app code. Always import { env } from lib/env.ts";

const processEnvAllow = [
  "**/lib/env.ts",
  "**/env.ts",
  "**/load-env.ts",
  "**/logger/**/*.ts",
  "packages/error/src/core/**/*.ts",
  "**/scripts/**/*.ts",
  "**/scripts/**/*.js",
  "**/scripts/**/*.mjs",
  "**/test/**/*.ts",
  "**/test/**/*.js",
  "**/*.test.{ts,tsx}",
  "**/*.spec.{ts,tsx}",
  "**/*.e2e-spec.{ts,tsx}",
  "**/playwright-global-setup.ts",
  "**/e2e/**/*.ts",
  "packages/email/**/*.{ts,tsx}",
  "**/instrumentation.ts",
  "**/*.config.{js,mjs,ts}",
  "**/vitest.setup.{ts,js}",
  "**/vitest.global-setup.{ts,js}",
  "**/playwright.config.{ts,js}",
  "**/drizzle.config.{ts,js}",
  "**/evals/skip.ts",
  "tools/create-basilic/**",
  "packages/cli/**",
  "apps/mobile/**",
];

export default defineConfig({
  extends: [core, react, next],
  ignorePatterns: [
    ...core.ignorePatterns,
    "__dev/**",
    ".deepsec/**",
    ".agents/skills/**",
    "apps/agents/agent/**",
    "**/.eve/**",
    "**/.output/**",
    "**/.nitro/**",
    "**/src/db/migrations/meta/**",
    "**/src/migrations/meta/**",
    "**/openapi/*.json",
    "**/*.gen.ts",
    "**/*.gen.js",
    "**/src/gen/**",
    "**/.source/**",
    "**/.next/**",
    "**/dist/**",
    "tools/create-basilic/template/**",
  ],
  overrides: [
    {
      files: processEnvAllow,
      rules: {
        "no-restricted-properties": "off",
      },
    },
    {
      files: ["packages/ui/src/**/*.{ts,tsx}"],
      rules: {
        "no-restricted-imports": "off",
      },
    },
    {
      files: ["apps/web/**/*.{ts,tsx,js,jsx}"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            paths: [
              {
                name: "@repo/utils",
                message:
                  "Use subpath imports: @repo/utils/logger/server, @repo/utils/logger/client, @repo/utils/async, @repo/utils/web3, etc.",
              },
              {
                name: "@repo/ui",
                message:
                  "Use subpath imports: @repo/ui/components/*, @repo/ui/lib/utils, @repo/ui/base, etc.",
              },
              {
                name: "@repo/db",
                message:
                  "Next.js must not import @repo/db. Call Fastify via @repo/core.",
              },
              {
                name: "@repo/markets",
                message:
                  "Next.js must not import @repo/markets. Call Fastify via @repo/core.",
              },
              {
                name: "@repo/onchain",
                message:
                  "Next.js must not import @repo/onchain. Call Fastify via @repo/core.",
              },
              {
                name: "drizzle-orm",
                message:
                  "Next.js must not import drizzle-orm. Database access stays in @repo/db.",
              },
            ],
            patterns: [
              {
                group: ["@radix-ui/react-*"],
                message:
                  "Import from @repo/ui/base instead. See packages/ui/src/base/index.tsx for available exports.",
              },
              {
                group: ["@base-ui/react", "@base-ui/react/*"],
                message:
                  "Import from @repo/ui/base instead. See packages/ui/src/base/index.tsx for available exports.",
              },
              {
                group: ["@repo/db/*", "drizzle-orm/*"],
                message: "Next.js must not import @repo/db or drizzle-orm.",
              },
            ],
          },
        ],
      },
    },
    {
      files: ["apps/agents/**/*.{ts,tsx,js,jsx}"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            paths: [
              {
                name: "@repo/db/schema",
                message:
                  "Eve must not import @repo/db/schema. Use named functions.",
              },
              {
                name: "drizzle-orm",
                message:
                  "Eve must not import drizzle-orm. Database access stays in @repo/db.",
              },
              {
                name: "fastify",
                message: "Eve is a sibling process. Do not import Fastify.",
              },
            ],
            patterns: [
              {
                group: [
                  "@repo/db/schema",
                  "@repo/db/schema/*",
                  "drizzle-orm/*",
                  "fastify/*",
                  "@repo/api",
                  "@repo/api/*",
                ],
                message:
                  "Eve stays off Fastify, @repo/db/schema, and drizzle-orm.",
              },
            ],
          },
        ],
      },
    },
    {
      files: ["apps/agents/**/*.test.ts"],
      rules: {
        "no-restricted-imports": "off",
      },
    },
    {
      files: ["packages/markets/**/*.{ts,tsx,js,jsx}"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            paths: [
              {
                name: "@repo/db",
                message: "@repo/markets must not import @repo/db.",
              },
              {
                name: "fastify",
                message: "@repo/markets must not import Fastify.",
              },
              {
                name: "drizzle-orm",
                message: "@repo/markets must not import drizzle-orm.",
              },
            ],
            patterns: [
              {
                group: [
                  "@repo/db/*",
                  "fastify/*",
                  "drizzle-orm/*",
                  "@repo/api",
                  "@repo/api/*",
                ],
                message:
                  "@repo/markets stays off Fastify, @repo/db, and drizzle-orm.",
              },
            ],
          },
        ],
      },
    },
    {
      files: ["packages/onchain/**/*.{ts,tsx,js,jsx}"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            paths: [
              {
                name: "@repo/db",
                message: "@repo/onchain must not import @repo/db.",
              },
              {
                name: "@repo/markets",
                message: "@repo/onchain must not import @repo/markets.",
              },
              {
                name: "fastify",
                message: "@repo/onchain must not import Fastify.",
              },
              {
                name: "drizzle-orm",
                message: "@repo/onchain must not import drizzle-orm.",
              },
            ],
            patterns: [
              {
                group: [
                  "@repo/db/*",
                  "@repo/markets/*",
                  "fastify/*",
                  "drizzle-orm/*",
                  "@repo/api",
                  "@repo/api/*",
                ],
                message:
                  "@repo/onchain stays off Fastify, @repo/db, @repo/markets, and drizzle-orm.",
              },
            ],
          },
        ],
      },
    },
    {
      files: [
        "**/*.{test,spec,test-d,spec-d}.{ts,tsx,js,jsx}",
        "**/__tests__/**/*.{ts,tsx,js,jsx}",
      ],
      rules: {
        "no-unused-vars": "off",
        "vitest/consistent-test-filename": "off",
        "vitest/max-expects": "off",
        "vitest/no-conditional-expect": "off",
        "vitest/prefer-strict-equal": "off",
        "vitest/prefer-to-be-falsy": "off",
        "vitest/prefer-to-be-truthy": "off",
        "vitest/require-mock-type-parameters": "off",
        "vitest/require-top-level-describe": "off",
        "vitest/valid-expect": "off",
        "vitest/prefer-describe-function-title": "off",
        "vitest/prefer-import-in-mock": "off",
      },
    },
  ],
  rules: {
    "eslint/complexity": "off",
    "func-style": "off",
    "sort-keys": "off",
    curly: "off",
    eqeqeq: "off",
    "no-unused-vars": "off",
    "no-script-url": "off",
    "no-useless-return": "off",
    "no-void": "off",
    "arrow-body-style": "off",
    "class-methods-use-this": "off",
    "logical-assignment-operators": "off",
    "no-lonely-if": "off",
    "no-param-reassign": "off",
    "jsdoc/require-throws-type": "off",
    "jsdoc/require-param-description": "off",
    "jsx-a11y/label-has-associated-control": "off",
    "react/exhaustive-effect-dependencies": "off",
    "react/iframe-missing-sandbox": "off",
    "react/jsx-handler-names": "off",
    "react/no-danger": "off",
    "react/no-set-state": "off",
    "typescript/array-type": "off",
    "typescript/no-non-null-assertion": "off",
    "typescript/prefer-for-of": "off",
    "unicorn/no-useless-undefined": "off",
    "unicorn/no-immediate-mutation": "off",
    "unicorn/no-lonely-if": "off",
    "unicorn/custom-error-definition": "off",
    "unicorn/no-document-cookie": "off",
    "eslint/curly": "off",
    "eslint/eqeqeq": "off",
    "eslint/func-style": "off",
    "eslint/no-await-in-loop": "off",
    "eslint/no-empty-function": "off",
    "eslint/no-eq-null": "off",
    "eslint/no-inline-comments": "off",
    "eslint/no-negated-condition": "off",
    "eslint/no-nested-ternary": "off",
    "eslint/no-plusplus": "off",
    "eslint/no-promise-executor-return": "off",
    "eslint/no-shadow": "off",
    "eslint/no-use-before-define": "off",
    "eslint/prefer-destructuring": "off",
    "eslint/prefer-named-capture-group": "off",
    "eslint/require-await": "off",
    "eslint/require-unicode-regexp": "off",
    "eslint/sort-keys": "off",
    "import/consistent-type-specifier-style": "off",
    "import/first": "off",
    "import/no-cycle": "off",
    "import/no-mutable-exports": "off",
    "jsx-a11y/prefer-tag-over-role": "off",
    "node/global-require": "off",
    "promise/avoid-new": "off",
    "promise/param-names": "off",
    "promise/prefer-await-to-callbacks": "off",
    "promise/prefer-await-to-then": "off",
    "react/function-component-definition": "off",
    "react/jsx-no-constructed-context-values": "off",
    "unicorn/consistent-function-scoping": "off",
    "unicorn/filename-case": "off",
    "unicorn/import-style": "off",
    "unicorn/no-array-sort": "off",
    "unicorn/no-await-expression-member": "off",
    "unicorn/no-negated-condition": "off",
    "unicorn/numeric-separators-style": "off",
    "unicorn/prefer-export-from": "off",
    "unicorn/prefer-module": "off",
    "unicorn/prefer-response-static-json": "off",
    "vitest/consistent-test-filename": "off",
    "vitest/max-expects": "off",
    "vitest/prefer-strict-equal": "off",
    "vitest/prefer-to-be-falsy": "off",
    "vitest/prefer-to-be-truthy": "off",
    "vitest/require-mock-type-parameters": "off",
    "vitest/require-top-level-describe": "off",
    "vitest/valid-expect": "off",
    "vitest/prefer-describe-function-title": "off",
    "vitest/prefer-import-in-mock": "off",
    "import/no-named-as-default": "off",
    "oxc/no-async-endpoint-handlers": "off",
    "oxc/no-barrel-file": "off",
    "oxc/branches-sharing-code": "off",
    "react/button-has-type": "off",
    "react/hook-use-state": "off",
    "react/no-unstable-nested-components": "off",
    "react/set-state-in-effect": "off",
    "react/todo": "off",
    "typescript/parameter-properties": "off",
    "typescript/consistent-type-imports": "off",
    "typescript/consistent-type-definitions": "off",
    "typescript/no-dynamic-delete": "off",
    "typescript/no-extraneous-class": "off",
    "unicorn/catch-error-name": "off",
    "unicorn/no-array-for-each": "off",
    "unicorn/no-array-reduce": "off",
    "unicorn/prefer-number-coercion": "off",
    "unicorn/prefer-type-error": "off",
    "unicorn/prefer-event-target": "off",
    "unicorn/prefer-add-event-listener": "off",
    "unicorn/prefer-string-replace-all": "off",
    "unicorn/no-useless-collection-argument": "off",
    "unicorn/prefer-ternary": "off",
    "unicorn/prefer-single-call": "off",
    "unicorn/text-encoding-identifier-case": "off",
    "object-shorthand": "off",
    "func-names": "off",
    "max-classes-per-file": "off",
    "no-bitwise": "off",
    "jsx-a11y/no-noninteractive-element-interactions": "off",
    "jsx-a11y/click-events-have-key-events": "off",
    "jsx-a11y/media-has-caption": "off",
    "jsx-a11y/anchor-is-valid": "off",
    "nextjs/no-assign-module-variable": "off",
    "react/purity": "off",
    "unicorn/no-useless-fallback-in-spread": "off",
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "@repo/utils",
            message:
              "Use subpath imports: @repo/utils/logger/server, @repo/utils/logger/client, @repo/utils/async, @repo/utils/web3, etc.",
          },
          {
            name: "@repo/ui",
            message:
              "Use subpath imports: @repo/ui/components/*, @repo/ui/lib/utils, @repo/ui/base, etc.",
          },
        ],
        patterns: [
          {
            group: ["@radix-ui/react-*"],
            message:
              "Import from @repo/ui/base instead. See packages/ui/src/base/index.tsx for available exports.",
          },
          {
            group: ["@base-ui/react", "@base-ui/react/*"],
            message:
              "Import from @repo/ui/base instead. See packages/ui/src/base/index.tsx for available exports.",
          },
        ],
      },
    ],
    "no-restricted-properties": [
      "error",
      {
        object: "process",
        property: "env",
        message: processEnvMessage,
      },
    ],
  },
});
