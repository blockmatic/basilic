/**
 * Canonical install list for `pnpm setup:skills`. Each entry is one `skills add` invocation.
 * Slugs verified with `pnpm dlx skills@latest add <source> --list`.
 */
export const skillInstallGroups = [
  {
    skills: ["workflow"],
    source: "blockmatic/basilic-skills",
  },
  {
    skills: [
      "emil-design-eng",
      "animate",
      "animate-expo",
      "review-animations",
      "improve-animations",
      "find-animation-opportunities",
      "animation-vocabulary",
      "apple-design",
      "pick-ui-library",
      "ask-sonner",
    ],
    source: "emilkowalski/skills",
  },
  {
    skills: ["nextjs", "nuqs", "vitest", "emilkowal-animations", "playwright"],
    source: "pproenca/dot-skills",
  },
  {
    skills: [
      "eas-workflows",
      "eas-app-stores",
      "eas-update",
      "expo-dev-client",
      "expo-router",
      "expo-upgrade",
      "expo-dom",
      "expo-native-ui",
    ],
    source: "expo/skills",
  },
  {
    skills: [
      "vercel-composition-patterns",
      "vercel-react-best-practices",
      "web-design-guidelines",
    ],
    source: "vercel-labs/agent-skills",
  },
  {
    skills: ["viem-integration"],
    source: "uniswap/uniswap-ai",
  },
  {
    skills: ["nodejs-keccak256"],
    source: "affaan-m/ecc",
  },
  {
    skills: ["react-email"],
    source: "resend/react-email",
  },
  {
    skills: ["typesafe-ai"],
    source: "typesafe-ai/skills",
  },
  {
    skills: ["eve", "technical-writing"],
    source: "vercel/eve",
  },
  {
    skills: ["core", "react"],
    source: "vercel-labs/json-render",
  },
  {
    skills: ["alchemy-api"],
    source: "alchemyplatform/skills",
  },
  {
    skills: ["ai-sdk"],
    source: "vercel/ai",
  },
  {
    skills: ["shadcn"],
    source: "shadcn/ui",
  },
];

export const allowedGithubCatalogs = [
  ...new Set(skillInstallGroups.map((group) => group.source)),
];
