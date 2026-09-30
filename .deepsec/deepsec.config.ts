import { defineConfig } from "deepsec/config";

import { generatedMatchersPlugin } from "./generated-matchers.js";

export default defineConfig({
  ai: { mode: "gateway", provider: "vercel" },
  defaultAgent: "pi",
  defaultModel: "xai/grok-4.6",
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
