import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  entry: ["src/cli.ts"],
  format: ["esm"],
  noExternal: ["@repo/core"],
  outDir: "dist",
  sourcemap: true,
  target: "node20",
});
