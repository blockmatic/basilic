import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    fileParallelism: false,
    globals: true,
    include: ["lib/**/*.test.ts", "agents/**/*.test.ts"],
    maxWorkers: 1,
    setupFiles: ["./vitest.setup.ts"],
  },
});
