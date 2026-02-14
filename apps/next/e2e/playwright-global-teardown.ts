import { killPort } from './kill-port'

async function globalTeardown() {
  // Kill any processes on ports 3000 (Next.js) and 3001 (Fastify) after tests complete
  await Promise.all([killPort(3000), killPort(3001)])
}

// Playwright requires default export for globalTeardown
// eslint-disable-next-line import/no-default-export
export default globalTeardown
