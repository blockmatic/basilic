import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  ignorePatterns: [
    ...(ultracite.ignorePatterns ?? []),
    "apps/api/openapi/**",
    "packages/core/src/gen/**",
    "packages/cli/src/gen/**",
  ],
});
