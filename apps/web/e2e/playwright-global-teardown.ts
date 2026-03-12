async function globalTeardown() {
  // No port killing — URLs may be Vercel deployments or reused servers
}

// Playwright requires default export for globalTeardown
// eslint-disable-next-line import/no-default-export
export default globalTeardown
