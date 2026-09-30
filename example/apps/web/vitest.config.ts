import { resolve } from "node:path";

import { defineConfig } from "vitest/config";

const configDir = import.meta.dirname;

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(configDir),
    },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
