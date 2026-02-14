import { killPort } from './kill-port'

async function globalSetup() {
  if (process.env.PLAYWRIGHT_REUSE_SERVER === 'true') return
  await Promise.all([killPort(3000), killPort(3001)])
}

// Playwright requires default export for globalSetup
// eslint-disable-next-line import/no-default-export
export default globalSetup
