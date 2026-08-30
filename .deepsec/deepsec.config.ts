import { defineConfig } from "deepsec/config";
import { generatedMatchersPlugin } from "./generated-matchers.js";

export default defineConfig({
  ai: { mode: "gateway", provider: "vercel" },
  defaultAgent: "codex",
  defaultModel: "gpt-5.6-sol",
  defaultThinkingLevel: "medium",
  projects: [
    {
      id: "basilic",
      root: "..",
      githubUrl: "https://github.com/blockmatic/basilic/blob/main",
      priorityPaths: [
        "apps/api",
        "apps/web",
        "apps/mobile",
        "packages/core",
        "packages/react",
      ],
    },
    // <deepsec:projects-insert-above>
  ],
  plugins: [generatedMatchersPlugin],
});
