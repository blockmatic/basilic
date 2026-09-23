/**
 * Canonical install list for `pnpm setup:skills`. Each entry is one `skills add` invocation.
 * Slugs verified with `pnpm dlx skills@latest add <source> --list`.
 */
export const skillInstallGroups = [
  {
    source: 'blockmatic/basilic-skills',
    skills: ['workflow'],
  },
  {
    source: 'emilkowalski/skills',
    skills: [
      'emil-design-eng',
      'animate',
      'animate-expo',
      'review-animations',
      'improve-animations',
      'find-animation-opportunities',
      'animation-vocabulary',
      'apple-design',
      'pick-ui-library',
      'ask-sonner',
    ],
  },
  {
    source: 'pproenca/dot-skills',
    skills: ['nextjs', 'nuqs', 'vitest', 'emilkowal-animations', 'playwright'],
  },
  {
    source: 'expo/skills',
    skills: [
      'eas-workflows',
      'eas-app-stores',
      'eas-update',
      'expo-dev-client',
      'expo-router',
      'expo-upgrade',
      'expo-dom',
      'expo-native-ui',
    ],
  },
  {
    source: 'vercel-labs/agent-skills',
    skills: ['vercel-composition-patterns', 'vercel-react-best-practices', 'web-design-guidelines'],
  },
  {
    source: 'uniswap/uniswap-ai',
    skills: ['viem-integration'],
  },
  {
    source: 'affaan-m/ecc',
    skills: ['nodejs-keccak256'],
  },
  {
    source: 'resend/react-email',
    skills: ['react-email'],
  },
  {
    source: 'typesafe-ai/skills',
    skills: ['typesafe-ai'],
  },
  {
    source: 'vercel/eve',
    skills: ['eve', 'technical-writing'],
  },
  {
    source: 'vercel-labs/json-render',
    skills: ['core', 'react'],
  },
  {
    source: 'alchemyplatform/skills',
    skills: ['alchemy-api'],
  },
  {
    source: 'vercel/ai',
    skills: ['ai-sdk'],
  },
  {
    source: 'shadcn/ui',
    skills: ['shadcn'],
  },
]

export const allowedGithubCatalogs = [...new Set(skillInstallGroups.map(group => group.source))]
