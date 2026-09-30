import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: false,
  entry: [
    "src/index.ts",
    "src/async/index.ts",
    "src/logger/client.ts",
    "src/logger/server.ts",
    "src/logger/types.ts",
    "src/logger/pino-options.ts",
    "src/debug/index.ts",
    "src/data/index.ts",
    "src/view-config.ts",
  ],
  format: ["esm"],
  outDir: "dist",
  sourcemap: true,
});
