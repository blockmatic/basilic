import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    fileParallelism: false,
    globals: true,
    include: ["src/**/*.{test,spec}.ts"],
    maxWorkers: 1,
  },
});
