import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const configDir = import.meta.dirname;

export default defineConfig({
  resolve: {
    alias: {
      "@repo/utils": resolve(configDir, "../utils/src"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.{test,spec}.ts"],
    server: {
      deps: {
        inline: [/@repo\/utils/],
      },
    },
  },
});
